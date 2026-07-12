import React from "react";
import { createRoot } from "react-dom/client";
import { BrainCircuit, FileText, LineChart, Route } from "lucide-react";
import "./styles.css";

const stages = [
  { icon: FileText, title: "Resume + Target JD", text: "Extract skills and compare them against a real company role." },
  { icon: BrainCircuit, title: "Adaptive Planner", text: "Choose interview questions from gaps and previous memory." },
  { icon: Route, title: "Learning Roadmap", text: "Turn weak competencies into scheduled weekly practice." },
  { icon: LineChart, title: "Progress Memory", text: "Update InterviewDNA after every mock interview." }
];

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI interview preparation platform</p>
          <h1>InterviewDNA</h1>
          <p>
            An adaptive multi-agent coach that studies your resume and target
            job description, runs smarter mock interviews, and remembers every
            session to improve the next one.
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
          <small>Technical depth / Communication / Confidence / Role fit</small>
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
