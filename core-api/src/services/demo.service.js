import { randomUUID } from "node:crypto";

const expectedSignals = ["api", "auth", "sql", "redis", "testing", "communication"];

function collectMatches(text) {
  const lower = text.toLowerCase();
  return expectedSignals.filter((signal) => lower.includes(signal));
}

export async function buildInterviewReport(payload) {
  const jdMatches = collectMatches(payload.jobDescription);
  const answerText = payload.answers.map((answer) => answer.text || "").join(" ");
  const answerMatches = collectMatches(answerText);
  const strengths = Array.from(new Set([...jdMatches, ...answerMatches])).slice(0, 5);
  const gaps = expectedSignals.filter((signal) => !strengths.includes(signal));
  const hasAudio = payload.answers.some((answer) => answer.audioRef);
  const hasVideo = payload.answers.some((answer) => answer.videoRef);
  const technicalScore = Math.min(94, 58 + strengths.length * 6);
  const communicationScore = Math.min(92, 62 + payload.answers.filter((answer) => (answer.text || "").length > 90).length * 8 + (hasAudio ? 5 : 0));
  const confidenceScore = Math.min(90, 60 + payload.answers.length * 4 + (hasVideo ? 8 : 0));

  return {
    reportId: randomUUID(),
    title: "Interview Intelligence Report",
    candidate: payload.user,
    resumeName: payload.resumeName,
    interviewDna: {
      mode: "mvp-memory",
      saved: payload.saveInterviewDna,
      summary: payload.saveInterviewDna
        ? "Current session summary stored for future personalized coaching."
        : "Privacy mode enabled. Session data should be discarded after report generation."
    },
    scores: {
      overall: Math.round((technicalScore + communicationScore + confidenceScore) / 3),
      technical: technicalScore,
      communication: communicationScore,
      confidence: confidenceScore
    },
    strengths,
    gaps,
    roadmap: [
      { week: "Week 1", task: gaps[0] ? `Learn ${gaps[0]} fundamentals` : "Strengthen API evidence" },
      { week: "Week 2", task: gaps[1] ? `Practice ${gaps[1]} questions` : "Practice system design tradeoffs" },
      { week: "Week 3", task: "Complete one full mock interview" }
    ],
    suggestedPracticeSchedule: ["Monday", "Wednesday", "Saturday"]
  };
}
