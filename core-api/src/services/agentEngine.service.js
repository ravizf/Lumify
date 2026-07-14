import { env } from "../config/env.js";

export async function runAgentEngineAnalysis({ resumeText, jobDescription }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(`${env.agentEngineUrl}/agents/interview-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Agent Engine returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
