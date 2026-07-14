import { randomUUID } from "node:crypto";
import { runAgentEngineAnalysis } from "./agentEngine.service.js";
import { isPrismaConnectionError, prisma } from "./prisma.service.js";
import { store } from "./store.service.js";

const skillCatalog = [
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

function findSkills(text) {
  const normalized = text.toLowerCase();
  return skillCatalog.filter((skill) => normalized.includes(skill.toLowerCase().replace(".", "")) || normalized.includes(skill.toLowerCase()));
}

function fallbackSkills(text) {
  const tokens = text
    .split(/[^a-zA-Z+#.]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && token.length < 24);

  return Array.from(new Set(tokens)).slice(0, 8);
}

function buildQuestion(skill, index) {
  const prompts = [
    `Explain how you have used ${skill} in a real project.`,
    `A production issue appears in a ${skill}-heavy feature. How would you debug it?`,
    `What tradeoffs would you consider before using ${skill} for this role?`,
    `How would you test your understanding of ${skill} in a team project?`
  ];

  return {
    id: randomUUID(),
    question: prompts[index % prompts.length],
    topic: skill,
    difficulty: index > 2 ? "medium" : "easy"
  };
}

async function persistAnalysis({ userId, resumeId, jobDescription, analysis }) {
  const questions = analysis.questions.map((question, index) => ({
    id: question.id || randomUUID(),
    question: question.question,
    topic: question.topic || "General",
    difficulty: question.difficulty || (index > 2 ? "medium" : "easy")
  }));

  const session = {
    id: randomUUID(),
    userId,
    resumeId,
    jobDescription,
    matchScore: analysis.matchScore,
    strengths: analysis.strengths,
    missingSkills: analysis.missingSkills,
    recommendations: analysis.recommendations,
    createdAt: new Date().toISOString()
  };

  try {
    const persisted = await prisma.interviewSession.create({
      data: {
        id: session.id,
        userId,
        resumeId,
        jobDescription,
        matchScore: analysis.matchScore,
        status: "live",
        interviewQuestions: {
          create: questions.map((question) => ({
            id: question.id,
            question: question.question,
            topic: question.topic,
            difficulty: question.difficulty
          }))
        }
      },
      include: {
        interviewQuestions: true
      }
    });

    await prisma.learningRoadmap.createMany({
      data: analysis.recommendations.map((recommendation, index) => ({
        userId,
        sessionId: persisted.id,
        title: `Priority ${index + 1}: ${recommendation}`,
        recommendation,
        priority: index === 0 ? "high" : "medium"
      }))
    });

    return {
      sessionId: persisted.id,
      agentFlow: analysis.agentFlow,
      graph: analysis.graph || "InterviewAnalysisGraph",
      poweredBy: analysis.poweredBy || "local-fallback",
      matchScore: analysis.matchScore,
      strengths: analysis.strengths,
      missingSkills: analysis.missingSkills,
      recommendations: analysis.recommendations,
      questions: persisted.interviewQuestions.map((question) => ({
        id: question.id,
        question: question.question,
        topic: question.topic || "General",
        difficulty: question.difficulty || "easy"
      }))
    };
  } catch (error) {
    if (!isPrismaConnectionError(error)) {
      throw error;
    }
  }

  store.sessions.push(session);
  questions.forEach((question) => {
    store.questions.push({ ...question, sessionId: session.id, candidateAnswer: "", aiFeedback: "", score: null });
  });
  analysis.recommendations.forEach((recommendation, index) => {
    store.roadmaps.push({
      id: randomUUID(),
      sessionId: session.id,
      recommendation,
      priority: index === 0 ? "high" : "medium"
    });
  });

  return {
    sessionId: session.id,
    agentFlow: analysis.agentFlow,
    graph: analysis.graph || "InterviewAnalysisGraph",
    poweredBy: analysis.poweredBy || "local-fallback",
    matchScore: analysis.matchScore,
    strengths: analysis.strengths,
    missingSkills: analysis.missingSkills,
    recommendations: analysis.recommendations,
    questions
  };
}

async function localAnalyze({ userId, resumeId, jobDescription, resume }) {
  const resumeSkills = findSkills(resume.resumeText);
  const requiredSkills = findSkills(jobDescription);
  const jdSkills = requiredSkills.length ? requiredSkills : fallbackSkills(jobDescription);
  const matched = jdSkills.filter((skill) => resumeSkills.some((item) => item.toLowerCase() === skill.toLowerCase()));
  const missingSkills = jdSkills.filter((skill) => !matched.includes(skill)).slice(0, 6);
  const strengths = (matched.length ? matched : resumeSkills.slice(0, 5)).slice(0, 6);
  const matchScore = Math.max(42, Math.min(96, Math.round((matched.length / Math.max(jdSkills.length, 1)) * 70 + strengths.length * 4 + 18)));
  const questions = [...missingSkills, ...strengths].slice(0, 5).map(buildQuestion);
  const recommendations = missingSkills.length
    ? missingSkills.map((skill) => `Learn ${skill} fundamentals and prepare one project example.`)
    : ["Practice system design tradeoffs using your strongest project examples."];

  return persistAnalysis({
    userId,
    resumeId,
    jobDescription,
    analysis: {
      graph: "InterviewAnalysisGraph",
      poweredBy: "core-api-local-fallback",
      agentFlow: [
        "Resume Parser",
        "JD Parser",
        "Skill Extraction",
        "Gap Analysis",
        "Question Generator",
        "Learning Planner"
      ],
      matchScore,
      strengths,
      missingSkills,
      recommendations,
      questions
    }
  });
}

export async function analyzeInterview({ userId, resumeId, jobDescription }) {
  let resume = null;

  try {
    resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    });
  } catch (error) {
    if (!isPrismaConnectionError(error)) {
      throw error;
    }
  }

  resume = resume || store.resumes.find((item) => item.id === resumeId && item.userId === userId);

  if (!resume) {
    const error = new Error("Resume not found");
    error.statusCode = 404;
    throw error;
  }

  try {
    const agentAnalysis = await runAgentEngineAnalysis({
      resumeText: resume.resumeText,
      jobDescription
    });

    return await persistAnalysis({
      userId,
      resumeId,
      jobDescription,
      analysis: agentAnalysis
    });
  } catch (_error) {
    return await localAnalyze({ userId, resumeId, jobDescription, resume });
  }
}

export async function startInterview({ userId, sessionId }) {
  let session = null;

  try {
    session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        interviewQuestions: true
      }
    });

    if (session) {
      return {
        sessionId,
        status: "live",
        questions: session.interviewQuestions.map((question) => ({
          id: question.id,
          question: question.question,
          topic: question.topic || "General",
          difficulty: question.difficulty || "easy",
          candidateAnswer: question.candidateAnswer,
          aiFeedback: question.aiFeedback,
          score: question.score
        }))
      };
    }
  } catch (error) {
    if (!isPrismaConnectionError(error)) {
      throw error;
    }
  }

  session = store.sessions.find((item) => item.id === sessionId && item.userId === userId);

  if (!session) {
    const error = new Error("Interview session not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    sessionId,
    status: "live",
    questions: store.questions.filter((question) => question.sessionId === sessionId)
  };
}

export async function evaluateAnswer({ userId, sessionId, questionId, candidateAnswer }) {
  let session = null;
  let question = null;

  try {
    session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });
    question = session
      ? await prisma.interviewQuestion.findFirst({
          where: {
            id: questionId,
            sessionId
          }
        })
      : null;
  } catch (error) {
    if (!isPrismaConnectionError(error)) {
      throw error;
    }
  }

  session = session || store.sessions.find((item) => item.id === sessionId && item.userId === userId);
  question = question || store.questions.find((item) => item.id === questionId && item.sessionId === sessionId);

  if (!session || !question) {
    const error = new Error("Question not found for this session");
    error.statusCode = 404;
    throw error;
  }

  const answerLength = candidateAnswer.trim().split(/\s+/).filter(Boolean).length;
  const mentionsTopic = candidateAnswer.toLowerCase().includes(question.topic.toLowerCase().split(/[ .]/)[0]);
  const score = Math.max(35, Math.min(96, 48 + Math.min(answerLength, 80) * 0.45 + (mentionsTopic ? 18 : 0)));
  const roundedScore = Math.round(score);
  const feedback = mentionsTopic
    ? `Strong answer: you connected the response to ${question.topic}. Add one concrete metric or production result to make it sharper.`
    : `Good start. Tie the answer back to ${question.topic}, then explain a project example, tradeoff, and outcome.`;

  Object.assign(question, {
    candidateAnswer,
    aiFeedback: feedback,
    score: roundedScore
  });

  if (question.sessionId) {
    try {
      await prisma.interviewQuestion.update({
        where: { id: question.id },
        data: {
          candidateAnswer,
          aiFeedback: feedback,
          score: roundedScore
        }
      });
    } catch (error) {
      if (!isPrismaConnectionError(error)) {
        throw error;
      }
    }
  }

  return {
    score: roundedScore,
    feedback,
    idealAnswer: `A strong answer defines ${question.topic}, explains when to use it, gives a resume-backed example, and names one tradeoff.`,
    confidence: mentionsTopic ? 0.86 : 0.68
  };
}

export async function interviewHistory(userId) {
  try {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      include: {
        interviewQuestions: true
      },
      orderBy: { createdAt: "desc" }
    });
    const roadmaps = await prisma.learningRoadmap.findMany({
      where: { userId }
    });

    if (sessions.length) {
      return sessions.map((session) => ({
        ...session,
        missingSkills: [],
        strengths: [],
        recommendations: roadmaps
          .filter((roadmap) => roadmap.sessionId === session.id)
          .map((roadmap) => roadmap.recommendation)
          .filter(Boolean),
        questions: session.interviewQuestions,
        roadmap: roadmaps.filter((roadmap) => roadmap.sessionId === session.id)
      }));
    }
  } catch (error) {
    if (!isPrismaConnectionError(error)) {
      throw error;
    }
  }

  return store.sessions
    .filter((session) => session.userId === userId)
    .map((session) => ({
      ...session,
      questions: store.questions.filter((question) => question.sessionId === session.id),
      roadmap: store.roadmaps.filter((roadmap) => roadmap.sessionId === session.id)
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
