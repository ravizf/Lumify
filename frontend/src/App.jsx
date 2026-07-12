import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lock,
  Mic,
  Play,
  Upload,
  UserRound,
  Video
} from "lucide-react";
import "./styles.css";

const seedQuestions = [
  "Explain how your resume project proves you can build reliable APIs for this role.",
  "The JD mentions scalable backend systems. How would you add caching and rate limiting?",
  "Describe a difficult technical tradeoff you made and how you communicated it.",
  "How would you test an interview platform that accepts text, audio, and video answers?"
];

const skillKeywords = [
  "react",
  "node",
  "express",
  "postgres",
  "sql",
  "prisma",
  "python",
  "fastapi",
  "docker",
  "redis",
  "api",
  "auth",
  "testing"
];

function unique(items) {
  return Array.from(new Set(items));
}

function analyzeInputs(resumeName, jdText, answers) {
  const lowerJd = jdText.toLowerCase();
  const matchedSkills = unique(skillKeywords.filter((skill) => lowerJd.includes(skill)));
  const expected = ["api", "auth", "sql", "redis", "testing", "communication"];
  const gaps = expected.filter((skill) => !matchedSkills.includes(skill));
  const answerText = answers.map((answer) => answer.text).join(" ").toLowerCase();
  const hasAudio = answers.some((answer) => answer.audio);
  const hasVideo = answers.some((answer) => answer.video);
  const technicalScore = Math.min(94, 58 + matchedSkills.length * 4 + (answerText.includes("tradeoff") ? 8 : 0));
  const communicationScore = Math.min(92, 62 + answers.filter((answer) => answer.text.length > 90).length * 7 + (hasAudio ? 6 : 0));
  const confidenceScore = Math.min(90, 60 + (hasVideo ? 10 : 0) + answers.length * 4);

  return {
    resumeName,
    matchedSkills,
    gaps,
    strengths: matchedSkills.slice(0, 5),
    questions: seedQuestions.map((prompt, index) => ({
      id: index + 1,
      prompt,
      competency: ["Resume Evidence", "System Design", "Communication", "Quality Engineering"][index]
    })),
    scores: {
      overall: Math.round((technicalScore + communicationScore + confidenceScore) / 3),
      technical: technicalScore,
      communication: communicationScore,
      confidence: confidenceScore
    },
    roadmap: [
      { week: "Week 1", task: gaps[0] ? `Learn and document ${gaps[0]} fundamentals` : "Strengthen API design examples" },
      { week: "Week 2", task: gaps[1] ? `Practice ${gaps[1]} interview questions` : "Practice system design tradeoffs" },
      { week: "Week 3", task: "Run one full mock interview and update InterviewDNA" }
    ],
    schedule: ["Monday: 45 min skill practice", "Wednesday: 30 min question drill", "Saturday: full mock interview"]
  };
}

function Step({ number, label, active, done }) {
  return (
    <div className={`step ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <span>{done ? <CheckCircle2 size={14} /> : number}</span>
      {label}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function App() {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState({ name: "", email: "" });
  const [resume, setResume] = useState(null);
  const [jdText, setJdText] = useState("");
  const [answers, setAnswers] = useState(seedQuestions.map(() => ({ text: "", audio: null, video: null })));
  const [saveMemory, setSaveMemory] = useState(true);

  const analysis = useMemo(
    () => analyzeInputs(resume?.name || "Demo Resume.pdf", jdText, answers),
    [resume, jdText, answers]
  );

  const canAnalyze = resume && jdText.trim().length > 80;
  const reportReady = answers.some((answer) => answer.text.trim().length > 20 || answer.audio || answer.video);

  function updateAnswer(index, patch) {
    setAnswers((current) => current.map((answer, answerIndex) => (answerIndex === index ? { ...answer, ...patch } : answer)));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <BrainCircuit size={24} />
          <div>
            <strong>InterviewDNA</strong>
            <span>MVP demo</span>
          </div>
        </div>
        {["Login", "Resume + JD", "Analysis", "Interview", "Report"].map((label, index) => (
          <Step key={label} number={index + 1} label={label} active={step === index} done={step > index} />
        ))}
        <div className="privacy-note">
          <Lock size={16} />
          <p>InterviewDNA memory is saved only when the candidate opts in.</p>
        </div>
      </aside>

      <section className="workspace">
        {step === 0 && (
          <section className="panel hero-panel">
            <p className="eyebrow">Adaptive AI interview coach</p>
            <h1>Resume to Interview Intelligence Report</h1>
            <p>
              Demo the complete core loop: login, resume upload, target JD,
              competency analysis, adaptive interview, multimodal evaluation,
              MVP memory, roadmap, and practice schedule.
            </p>
            <div className="auth-grid">
              <label>
                Name
                <input value={user.name} onChange={(event) => setUser({ ...user, name: event.target.value })} placeholder="Ravi" />
              </label>
              <label>
                Email
                <input value={user.email} onChange={(event) => setUser({ ...user, email: event.target.value })} placeholder="ravi@example.com" />
              </label>
            </div>
            <button onClick={() => setStep(1)} disabled={!user.name || !user.email}>
              <UserRound size={16} /> Continue
            </button>
          </section>
        )}

        {step === 1 && (
          <section className="grid-two">
            <div className="panel">
              <div className="panel-title">
                <Upload size={20} />
                <h2>Upload Resume</h2>
              </div>
              <label className="dropzone">
                <FileText size={34} />
                <strong>{resume ? resume.name : "Choose PDF resume"}</strong>
                <span>PDF upload is captured for the demo parser.</span>
                <input accept=".pdf" type="file" onChange={(event) => setResume(event.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="panel">
              <div className="panel-title">
                <FileText size={20} />
                <h2>Paste Job Description</h2>
              </div>
              <textarea
                value={jdText}
                onChange={(event) => setJdText(event.target.value)}
                placeholder="Paste the target company job description here. Include skills, responsibilities, and expectations."
              />
              <button onClick={() => setStep(2)} disabled={!canAnalyze}>
                <BrainCircuit size={16} /> Run Intelligence Engine
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="grid-two">
            <div className="panel">
              <div className="panel-title">
                <BrainCircuit size={20} />
                <h2>Competency Intelligence Engine</h2>
              </div>
              <div className="chip-row">
                {analysis.strengths.length ? analysis.strengths.map((skill) => <span key={skill}>{skill}</span>) : <span>resume evidence</span>}
              </div>
              <h3>Existing strengths</h3>
              <p>{analysis.strengths.length ? analysis.strengths.join(", ") : "Resume evidence is ready for review."}</p>
              <h3>Missing competencies</h3>
              <div className="warning-list">
                {analysis.gaps.map((gap) => <span key={gap}>{gap}</span>)}
              </div>
            </div>
            <div className="panel">
              <div className="panel-title">
                <Play size={20} />
                <h2>Adaptive Interview Planner</h2>
              </div>
              {analysis.questions.map((question) => (
                <article className="question-preview" key={question.id}>
                  <span>{question.competency}</span>
                  <p>{question.prompt}</p>
                </article>
              ))}
              <button onClick={() => setStep(3)}>
                <Play size={16} /> Start AI Interview
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="panel">
            <div className="panel-title">
              <Mic size={20} />
              <h2>AI Mock Interview</h2>
            </div>
            <div className="interview-list">
              {analysis.questions.map((question, index) => (
                <article className="interview-card" key={question.id}>
                  <span>{question.competency}</span>
                  <h3>{question.prompt}</h3>
                  <textarea
                    value={answers[index].text}
                    onChange={(event) => updateAnswer(index, { text: event.target.value })}
                    placeholder="Type the candidate answer here..."
                  />
                  <div className="media-row">
                    <label>
                      <Mic size={16} /> Audio ref
                      <input accept="audio/*" type="file" onChange={(event) => updateAnswer(index, { audio: event.target.files?.[0]?.name || null })} />
                    </label>
                    <label>
                      <Video size={16} /> Video ref
                      <input accept="video/*" type="file" onChange={(event) => updateAnswer(index, { video: event.target.files?.[0]?.name || null })} />
                    </label>
                  </div>
                </article>
              ))}
            </div>
            <button onClick={() => setStep(4)} disabled={!reportReady}>
              <BarChart3 size={16} /> Generate Interview Intelligence Report
            </button>
          </section>
        )}

        {step === 4 && (
          <section className="report-grid">
            <div className="panel report-main">
              <p className="eyebrow">Interview Intelligence Report</p>
              <h2>{user.name}'s InterviewDNA</h2>
              <div className="metrics">
                <Metric label="Overall" value={`${analysis.scores.overall}%`} />
                <Metric label="Technical" value={`${analysis.scores.technical}%`} />
                <Metric label="Communication" value={`${analysis.scores.communication}%`} />
                <Metric label="Confidence" value={`${analysis.scores.confidence}%`} />
              </div>
              <h3>Multimodal Evaluation Engine</h3>
              <p>
                Text answers were evaluated for technical depth. Audio and video
                references are captured as MVP signals for speech and presence
                analysis.
              </p>
              <h3>InterviewDNA MVP Memory</h3>
              <label className="toggle">
                <input type="checkbox" checked={saveMemory} onChange={(event) => setSaveMemory(event.target.checked)} />
                Save current session summary for personalized coaching
              </label>
              <p>
                {saveMemory
                  ? "This session summary is stored for the demo. Future interviews can use it to target weak areas."
                  : "Privacy mode: interview data is processed temporarily and discarded after report generation."}
              </p>
            </div>
            <div className="panel">
              <div className="panel-title">
                <CalendarDays size={20} />
                <h2>Learning Roadmap</h2>
              </div>
              {analysis.roadmap.map((item) => (
                <article className="roadmap-item" key={item.week}>
                  <span>{item.week}</span>
                  <p>{item.task}</p>
                </article>
              ))}
              <h3>Suggested Practice Schedule</h3>
              {analysis.schedule.map((item) => <p className="schedule" key={item}>{item}</p>)}
              <button onClick={() => setStep(1)} className="secondary">Run another demo</button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
