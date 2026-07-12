import React from "react";
import { createRoot } from "react-dom/client";
import { BrainCircuit, FileText, LineChart, Route } from "lucide-react";
import "./styles.css";

const stages = [
  { icon: FileText, title: "Resume Upload", text: "Parse resumes into verified skills and evidence." },
  { icon: BrainCircuit, title: "Adaptive Assessment", text: "Generate role-aware questions from competency gaps." },
  { icon: Route, title: "Learning Roadmap", text: "Turn weak signals into a weekly preparation plan." },
  { icon: LineChart, title: "Analytics", text: "Track readiness across competencies and interview sessions." }
];

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI interview preparation platform</p>
          <h1>InterviewDNA</h1>
          <p>
            A multi-agent system that analyzes a candidate's resume, measures
            competency gaps, and creates a personalized interview practice loop.
          </p>
          <div className="hero-actions">
            <button>Start Assessment</button>
            <button className="secondary">View Roadmap</button>
          </div>
        </div>
        <div className="signal-panel" aria-label="Readiness snapshot">
          <span>Readiness Score</span>
          <strong>82%</strong>
          <div className="meter"><i /></div>
          <small>Backend • DSA • Communication • System Design</small>
        </div>
      </section>
      <section className="workflow">
        {stages.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={24} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
