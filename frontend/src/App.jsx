import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  Loader2,
  Lock,
  LogOut,
  Play,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound
} from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const loadingStages = [
  "Uploading resume...",
  "Extracting skills...",
  "Analyzing JD...",
  "Running AI agents...",
  "Generating questions..."
];

const MIN_JOB_DESCRIPTION_LENGTH = 40;

const fallbackQuestions = [
  { id: "local-1", question: "Explain JWT authentication.", topic: "JWT", difficulty: "easy" },
  { id: "local-2", question: "How would you deploy this app with Docker?", topic: "Docker", difficulty: "medium" },
  { id: "local-3", question: "How would Redis improve an interview platform?", topic: "Redis", difficulty: "medium" }
];

function localAnalyze(resumeId, jobDescription) {
  const text = jobDescription.toLowerCase();
  const required = ["React", "Node.js", "Express", "Docker", "Redis", "JWT", "PostgreSQL"].filter((skill) =>
    text.includes(skill.toLowerCase().replace(".", "")) || text.includes(skill.toLowerCase())
  );
  const missingSkills = (required.length ? required : ["Docker", "Redis"]).slice(0, 4);

  return {
    sessionId: `local-${Date.now()}`,
    resumeId,
    agentFlow: ["Resume Parser", "JD Parser", "Skill Extraction", "Gap Analysis", "Question Generator", "Learning Planner"],
    matchScore: 86,
    strengths: ["React", "Node.js", "Express"],
    missingSkills,
    recommendations: missingSkills.map((skill) => `Learn ${skill} and prepare one project example.`),
    questions: missingSkills.map((skill, index) => ({
      id: `local-q-${index}`,
      question: `Explain ${skill} for this target role.`,
      topic: skill,
      difficulty: index > 1 ? "medium" : "easy"
    })).concat(fallbackQuestions).slice(0, 5)
  };
}

async function api(path, { token, body, formData, method = "POST" } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: formData || (body ? JSON.stringify(body) : undefined)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const issue = data.issues?.[0]?.message;
    const error = new Error(issue || data.message || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function Step({ label, active, done }) {
  return (
    <div className={`step ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <span>{done ? <CheckCircle2 size={14} /> : null}</span>
      {label}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <article className="stat-card">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function App() {
  const [page, setPage] = useState("login");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [token, setToken] = useState(() => localStorage.getItem("lumify_token") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lumify_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [resume, setResume] = useState(null);
  const [resumePreview, setResumePreview] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [agentInput, setAgentInput] = useState("");
  const [agentResult, setAgentResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const activeStep = ["login", "dashboard", "upload", "analysis", "interview", "report", "profile"].indexOf(user && page === "login" ? "dashboard" : page);
  const canAnalyze = Boolean(resume) && jobDescription.trim().length >= MIN_JOB_DESCRIPTION_LENGTH;
  const answeredCount = Object.keys(evaluations).length;
  const averageInterviewScore = useMemo(() => {
    const scores = Object.values(evaluations).map((item) => item.score);
    if (!scores.length) return 0;
    return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
  }, [evaluations]);

  async function submitAuth(event) {
    event.preventDefault();
    setError("");
    setLoading(authMode === "login" ? "Signing in..." : "Creating account...");
    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/signup";
      const result = await api(path, { body: authForm });
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem("lumify_token", result.token);
      localStorage.setItem("lumify_user", JSON.stringify(result.user));
      setPage("dashboard");
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading("");
    }
  }

  function handleRequestError(requestError) {
    if (requestError.status === 401) {
      logout();
      setError("Your session expired. Please log in again.");
      return;
    }

    setError(requestError.message);
  }

  async function uploadResume(file) {
    if (!file) return;
    setError("");
    setLoading("Uploading resume...");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const result = await api("/resume/upload", { token, formData });
      setResume(result.resume);
      setResumePreview(result.preview);
    } catch (uploadError) {
      handleRequestError(uploadError);
    } finally {
      setLoading("");
    }
  }

  async function runAnalysis() {
    setError("");
    setAnalysis(null);
    try {
      for (const stage of loadingStages) {
        setLoading(stage);
        await new Promise((resolve) => setTimeout(resolve, 320));
      }
      const result = resume?.id
        ? await api("/interview/analyze", { token, body: { resumeId: resume.id, jobDescription } })
        : localAnalyze("demo-resume", jobDescription);
      setAnalysis(result);
      setPage("analysis");
    } catch (analysisError) {
      handleRequestError(analysisError);
    } finally {
      setLoading("");
    }
  }

  async function runAgentWorkflow(event) {
    event.preventDefault();
    setError("");
    setAgentResult(null);
    setLoading("Running LangGraph workflow...");

    try {
      const result = await api("/api/agent/run", {
        token,
        body: { input: agentInput }
      });
      setAgentResult(result);
    } catch (agentError) {
      handleRequestError(agentError);
    } finally {
      setLoading("");
    }
  }

  async function beginInterview() {
    if (!analysis) return;
    setError("");
    setLoading("Starting AI interview...");
    try {
      const started = analysis.sessionId.startsWith("local-")
        ? { questions: analysis.questions }
        : await api("/interview/start", { token, body: { sessionId: analysis.sessionId } });
      setAnalysis({ ...analysis, questions: started.questions });
      setPage("interview");
    } catch (startError) {
      handleRequestError(startError);
    } finally {
      setLoading("");
    }
  }

  async function evaluateQuestion(question) {
    const candidateAnswer = answers[question.id] || "";
    setError("");
    setLoading("Evaluating answer...");
    try {
      const result = analysis.sessionId.startsWith("local-")
        ? {
            score: Math.min(95, 58 + Math.round(candidateAnswer.length / 6)),
            feedback: `Good foundation. Connect the answer to ${question.topic} with one measurable project result.`,
            idealAnswer: `Define ${question.topic}, give a resume-backed example, and explain one tradeoff.`,
            confidence: 0.78
          }
        : await api("/interview/evaluate", {
            token,
            body: { sessionId: analysis.sessionId, questionId: question.id, candidateAnswer }
          });
      setEvaluations((current) => ({ ...current, [question.id]: result }));
    } catch (evaluationError) {
      handleRequestError(evaluationError);
    } finally {
      setLoading("");
    }
  }

  async function loadHistory() {
    setPage("profile");
    if (!token) return;
    try {
      const result = await api("/interview/history", { token, method: "GET" });
      setHistory(result.sessions || []);
    } catch (_historyError) {
      handleRequestError(_historyError);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("lumify_token");
    localStorage.removeItem("lumify_user");
    setResume(null);
    setAnalysis(null);
    setPage("login");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <BrainCircuit size={25} />
          <div>
            <strong>Lumify</strong>
            <span>Interview Intelligence</span>
          </div>
        </div>
        {["Login", "Dashboard", "Upload", "Analysis", "Interview", "Report", "Profile"].map((label, index) => (
          <Step key={label} label={label} active={index === activeStep} done={index < activeStep} />
        ))}
        {user && (
          <button className="nav-button" onClick={loadHistory}>
            <History size={16} /> History
          </button>
        )}
        <div className="privacy-note">
          <ShieldCheck size={16} />
          <p>JWT-protected demo routes. InterviewDNA history is persisted for this running server session.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Milestone 2 Hackathon Build</p>
            <h1>AI Interview Intelligence Platform</h1>
          </div>
          {user && (
            <div className="user-pill">
              <UserRound size={16} />
              {user.name}
              <button className="icon-button" title="Log out" onClick={logout}>
                <LogOut size={16} />
              </button>
            </div>
          )}
        </header>

        {loading && <div className="loading-strip"><Loader2 size={18} />{loading}</div>}
        {error && <div className="error-strip">{error}</div>}

        {page === "login" && !user && (
          <section className="auth-layout">
            <div className="intro-panel">
              <Sparkles size={22} />
              <h2>Resume to report in one polished demo flow.</h2>
              <p>Login, upload a PDF resume, paste a JD, run the agent engine, answer questions, and show a final Interview Intelligence Report.</p>
            </div>
            <form className="panel auth-panel" onSubmit={submitAuth}>
              <div className="segmented">
                <button type="button" className={authMode === "login" ? "selected" : ""} onClick={() => setAuthMode("login")}>Login</button>
                <button type="button" className={authMode === "signup" ? "selected" : ""} onClick={() => setAuthMode("signup")}>Register</button>
              </div>
              {authMode === "signup" && (
                <label>Name<input value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Your name" /></label>
              )}
              <label>Email<input value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@example.com" /></label>
              <label>Password<input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="At least 6 characters" /></label>
              <button type="submit"><Lock size={16} /> {authMode === "login" ? "Login" : "Create account"}</button>
            </form>
          </section>
        )}

        {(page === "dashboard" || (page === "login" && user)) && (
          <section className="dashboard">
            <div className="stats-grid">
              <Stat icon={Upload} label="Resume Uploaded" value={resume ? "Ready" : "Pending"} />
              <Stat icon={BarChart3} label="Resume Score" value={analysis ? `${analysis.matchScore}%` : "--"} />
              <Stat icon={BrainCircuit} label="Skill Match" value={analysis ? `${analysis.strengths.length} strengths` : "Not run"} />
              <Stat icon={Play} label="Start Interview" value={analysis ? "Unlocked" : "Analyze first"} />
            </div>
            <div className="panel action-panel">
              <h2>Run the core milestone workflow</h2>
              <p>Upload a resume PDF, paste a target job description, then let the LangGraph-style pipeline produce gaps, questions, and a learning plan.</p>
              <button onClick={() => setPage("upload")}><Upload size={16} /> Upload Resume</button>
            </div>
            <form className="panel action-panel" onSubmit={runAgentWorkflow}>
              <div className="panel-title"><BrainCircuit size={20} /><h2>Core API Agent Check</h2></div>
              <p>This calls the protected compatibility route from the milestone2 zip: <code>/api/agent/run</code>. The main analysis flow calls the FastAPI Agent Engine.</p>
              <textarea value={agentInput} onChange={(event) => setAgentInput(event.target.value)} placeholder="Paste a short resume/JD prompt to run through InterviewAnalysisGraph." />
              <button type="submit" disabled={agentInput.trim().length < 10}><BrainCircuit size={16} /> Run Agent</button>
              {agentResult && (
                <div className="feedback-box">
                  <strong>{agentResult.output.graph} / {agentResult.output.matchScore}%</strong>
                  <p>{agentResult.analysis}</p>
                  <div className="chip-row">{agentResult.output.missingSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </div>
              )}
            </form>
          </section>
        )}

        {page === "upload" && (
          <section className="grid-two">
            <div className="panel">
              <div className="panel-title"><FileText size={20} /><h2>Upload Resume PDF</h2></div>
              <label className="dropzone">
                <Upload size={34} />
                <strong>{resume?.fileName || "Choose PDF resume"}</strong>
                <span>Text is extracted and saved to the demo database layer.</span>
                <input accept=".pdf,application/pdf" type="file" onChange={(event) => uploadResume(event.target.files?.[0])} />
              </label>
              {resumePreview && <pre className="resume-preview">{resumePreview}</pre>}
            </div>
            <div className="panel">
              <div className="panel-title"><ClipboardList size={20} /><h2>Paste Job Description</h2></div>
              <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the target job description. Include role requirements, skills, and responsibilities." />
              <button onClick={runAnalysis} disabled={!canAnalyze}><BrainCircuit size={16} /> Analyze Resume</button>
              {!canAnalyze && (
                <p className="helper-text">
                  Upload a PDF resume and paste at least {MIN_JOB_DESCRIPTION_LENGTH} characters from the job description.
                </p>
              )}
            </div>
          </section>
        )}

        {page === "analysis" && analysis && (
          <section className="grid-two">
            <div className="panel">
              <p className="eyebrow">Skill Gap Analysis</p>
              <h2>{analysis.matchScore}% match score</h2>
              <div className="score-ring" style={{ "--score": analysis.matchScore }}>{analysis.matchScore}</div>
              <h3>Strengths</h3>
              <div className="chip-row">{analysis.strengths.map((skill) => <span key={skill}>{skill}</span>)}</div>
              <h3>Missing Skills</h3>
              <div className="warning-list">{analysis.missingSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </div>
            <div className="panel">
              <div className="panel-title"><BrainCircuit size={20} /><h2>Agent Engine Flow</h2></div>
              {analysis.poweredBy && <p className="engine-badge">Powered by {analysis.poweredBy}</p>}
              <div className="flow-list">{analysis.agentFlow.map((step) => <span key={step}>{step}</span>)}</div>
              <h3>Generated Interview Questions</h3>
              {analysis.questions.map((question) => (
                <article className="question-preview" key={question.id}><span>{question.topic}</span><p>{question.question}</p></article>
              ))}
              <button onClick={beginInterview}><Play size={16} /> Start AI Interview</button>
            </div>
          </section>
        )}

        {page === "interview" && analysis && (
          <section className="panel">
            <div className="panel-title"><Play size={20} /><h2>AI Interview</h2></div>
            <div className="interview-list">
              {analysis.questions.map((question) => (
                <article className="interview-card" key={question.id}>
                  <span>{question.topic} / {question.difficulty || "adaptive"}</span>
                  <h3>{question.question}</h3>
                  <textarea value={answers[question.id] || ""} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })} placeholder="Type the candidate answer..." />
                  <button onClick={() => evaluateQuestion(question)} disabled={(answers[question.id] || "").trim().length < 10}><BookOpenCheck size={16} /> Evaluate Answer</button>
                  {evaluations[question.id] && <div className="feedback-box"><strong>{evaluations[question.id].score}%</strong><p>{evaluations[question.id].feedback}</p></div>}
                </article>
              ))}
            </div>
            <button onClick={() => setPage("report")} disabled={!answeredCount}><BarChart3 size={16} /> View Final Report</button>
          </section>
        )}

        {page === "report" && analysis && (
          <section className="report-grid">
            <div className="panel report-main">
              <p className="eyebrow">Interview Intelligence Report</p>
              <h2>{user?.name}'s InterviewDNA</h2>
              <div className="stats-grid compact">
                <Stat icon={BarChart3} label="Overall Score" value={`${Math.round((analysis.matchScore + averageInterviewScore) / (averageInterviewScore ? 2 : 1))}%`} />
                <Stat icon={BrainCircuit} label="Skill Match" value={`${analysis.matchScore}%`} />
                <Stat icon={BookOpenCheck} label="Answer Score" value={averageInterviewScore ? `${averageInterviewScore}%` : "--"} />
              </div>
              <h3>Weaknesses</h3>
              <div className="warning-list">{analysis.missingSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
              <h3>Interview Feedback</h3>
              {Object.entries(evaluations).map(([id, item]) => <p className="feedback-line" key={id}>{item.score}% - {item.feedback}</p>)}
            </div>
            <div className="panel">
              <div className="panel-title"><BookOpenCheck size={20} /><h2>Recommended Learning</h2></div>
              {analysis.recommendations.map((item, index) => (
                <article className="roadmap-item" key={item}><span>Priority {index + 1}</span><p>{item}</p></article>
              ))}
              <h3>Next Interview Plan</h3>
              <p className="schedule">Run a focused mock interview on {analysis.missingSkills[0] || "system design"} next.</p>
              <button onClick={() => setPage("upload")} className="secondary">New Analysis</button>
            </div>
          </section>
        )}

        {page === "profile" && (
          <section className="grid-two">
            <div className="panel">
              <div className="panel-title"><UserRound size={20} /><h2>Profile API</h2></div>
              <p>{user?.name}</p>
              <p>{user?.email}</p>
            </div>
            <div className="panel">
              <div className="panel-title"><History size={20} /><h2>Interview History</h2></div>
              {history.length ? history.map((item) => (
                <article className="roadmap-item" key={item.id}><span>{new Date(item.createdAt).toLocaleString()}</span><p>{item.matchScore}% match - {item.missingSkills.join(", ") || "No gaps"}</p></article>
              )) : <p>No saved interview sessions yet.</p>}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
