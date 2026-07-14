import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

const AgentState = Annotation.Root({
  input: Annotation,
  resumeSignals: Annotation,
  jdSignals: Annotation,
  gaps: Annotation,
  questions: Annotation,
  output: Annotation
});

const knownSkills = [
  "React",
  "Node.js",
  "Express",
  "PostgreSQL",
  "Prisma",
  "FastAPI",
  "Python",
  "Docker",
  "Redis",
  "JWT",
  "REST APIs",
  "Testing",
  "LangGraph",
  "Gemini"
];

function pickSkills(text) {
  const normalized = text.toLowerCase();
  return knownSkills.filter((skill) => normalized.includes(skill.toLowerCase().replace(".", "")) || normalized.includes(skill.toLowerCase()));
}

async function resumeParserNode(state) {
  return {
    resumeSignals: pickSkills(state.input).slice(0, 7)
  };
}

async function jdParserNode(state) {
  const skills = pickSkills(state.input);
  return {
    jdSignals: skills.length ? skills : ["REST APIs", "Testing", "Docker", "Redis"]
  };
}

async function gapAnalysisNode(state) {
  const strengths = state.resumeSignals.filter((skill) => state.jdSignals.includes(skill));
  const gaps = state.jdSignals.filter((skill) => !strengths.includes(skill));

  return {
    gaps,
    output: {
      matchScore: Math.max(48, Math.min(94, Math.round((strengths.length / Math.max(state.jdSignals.length, 1)) * 76 + 18))),
      strengths: strengths.length ? strengths : state.resumeSignals.slice(0, 4),
      missingSkills: gaps
    }
  };
}

async function questionGeneratorNode(state) {
  const targets = [...state.gaps, ...(state.output.strengths || [])].slice(0, 5);
  return {
    questions: targets.map((skill) => ({
      question: `Explain ${skill} using an example from your resume.`,
      topic: skill
    }))
  };
}

async function respondNode(state) {
  const recommendations = (state.gaps.length ? state.gaps : ["system design"]).map(
    (skill) => `Practice ${skill} with one concrete project story and one tradeoff.`
  );

  const llmSummary =
    "Core API compatibility graph completed. The production Milestone 2 path calls the FastAPI Agent Engine, where LangGraph can use Gemini when GEMINI_API_KEY is configured.";

  return {
    output: {
      ...state.output,
      recommendations,
      questions: state.questions,
      graph: "InterviewAnalysisGraph",
      agentFlow: ["Resume Parser", "JD Parser", "Skill Extraction", "Gap Analysis", "Question Generator", "Learning Planner"],
      llmSummary
    }
  };
}

const workflow = new StateGraph(AgentState)
  .addNode("resumeParser", resumeParserNode)
  .addNode("jdParser", jdParserNode)
  .addNode("gapAnalysis", gapAnalysisNode)
  .addNode("questionGenerator", questionGeneratorNode)
  .addNode("respond", respondNode)
  .addEdge(START, "resumeParser")
  .addEdge("resumeParser", "jdParser")
  .addEdge("jdParser", "gapAnalysis")
  .addEdge("gapAnalysis", "questionGenerator")
  .addEdge("questionGenerator", "respond")
  .addEdge("respond", END);

export const interviewAnalysisGraph = workflow.compile();

export async function runInterviewAnalysisGraph(input) {
  const startedAt = Date.now();
  const result = await interviewAnalysisGraph.invoke({
    input,
    resumeSignals: [],
    jdSignals: [],
    gaps: [],
    questions: [],
    output: {}
  });

  return {
    input: result.input,
    analysis: result.output.llmSummary,
    output: result.output,
    latencyMs: Date.now() - startedAt
  };
}
