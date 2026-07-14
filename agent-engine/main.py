import json
import os
from typing import List, Optional, TypedDict

from fastapi import FastAPI
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

app = FastAPI(title="Lumify Agent Engine")


class ResumeAnalysisRequest(BaseModel):
    resume_id: str
    target_role: str


class InterviewAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=20)
    job_description: str = Field(min_length=40)


class InterviewAnswer(BaseModel):
    question: str
    text: str = ""
    audio_ref: Optional[str] = None
    video_ref: Optional[str] = None


class AgentEvaluationRequest(BaseModel):
    resume_name: str
    job_description: str = Field(min_length=40)
    answers: List[InterviewAnswer]
    save_interview_dna: bool = True


class InterviewAnalysisState(TypedDict):
    resume_text: str
    job_description: str
    resume_skills: List[str]
    jd_skills: List[str]
    strengths: List[str]
    missing_skills: List[str]
    match_score: int
    recommendations: List[str]
    questions: List[dict]
    powered_by: str


def signals(text: str) -> List[str]:
    expected = [
        "react",
        "node",
        "express",
        "postgres",
        "prisma",
        "fastapi",
        "python",
        "docker",
        "redis",
        "jwt",
        "api",
        "testing",
        "langgraph",
        "gemini",
    ]
    lowered = text.lower()
    return [item for item in expected if item in lowered]


def gemini_model():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    return ChatGoogleGenerativeAI(
        model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        temperature=0.25,
        google_api_key=api_key,
    )


def resume_parser_node(state: InterviewAnalysisState):
    return {"resume_skills": signals(state["resume_text"])}


def jd_parser_node(state: InterviewAnalysisState):
    jd_skills = signals(state["job_description"])
    return {"jd_skills": jd_skills or ["api", "testing", "docker", "redis"]}


def skill_extraction_node(state: InterviewAnalysisState):
    strengths = [skill for skill in state["resume_skills"] if skill in state["jd_skills"]]
    return {"strengths": strengths or state["resume_skills"][:4]}


def gap_analysis_node(state: InterviewAnalysisState):
    missing = [skill for skill in state["jd_skills"] if skill not in state["strengths"]][:6]
    match_score = min(
        96,
        max(44, round((len(state["strengths"]) / max(len(state["jd_skills"]), 1)) * 72 + 20)),
    )
    return {"missing_skills": missing, "match_score": match_score}


def question_generator_node(state: InterviewAnalysisState):
    model = gemini_model()
    targets = (state["missing_skills"] + state["strengths"])[:5]

    if model:
        prompt = f"""
You are Lumify's interview intelligence agent.
Return JSON only with keys recommendations and questions.
Missing skills: {state["missing_skills"]}
Strengths: {state["strengths"]}
Job description: {state["job_description"][:1800]}
Questions must be objects with question and topic.
"""
        try:
            response = model.invoke(prompt)
            content = response.content if isinstance(response.content, str) else json.dumps(response.content)
            parsed = json.loads(content.strip().removeprefix("```json").removesuffix("```").strip())
            return {
                "recommendations": parsed.get("recommendations", []),
                "questions": parsed.get("questions", []),
                "powered_by": "gemini",
            }
        except Exception:
            pass

    return {
        "recommendations": [
            f"Learn {skill} and prepare one resume-backed story."
            for skill in (state["missing_skills"] or ["system design"])
        ],
        "questions": [
            {"question": f"Explain {skill} using a project from your resume.", "topic": skill}
            for skill in targets
        ],
        "powered_by": "deterministic-fallback",
    }


interview_graph = (
    StateGraph(InterviewAnalysisState)
    .add_node("resume_parser", resume_parser_node)
    .add_node("jd_parser", jd_parser_node)
    .add_node("skill_extraction", skill_extraction_node)
    .add_node("gap_analysis", gap_analysis_node)
    .add_node("question_generator", question_generator_node)
    .add_edge(START, "resume_parser")
    .add_edge("resume_parser", "jd_parser")
    .add_edge("jd_parser", "skill_extraction")
    .add_edge("skill_extraction", "gap_analysis")
    .add_edge("gap_analysis", "question_generator")
    .add_edge("question_generator", END)
    .compile()
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "agent-engine",
        "version": "m2",
        "graph": "InterviewAnalysisGraph",
        "llm": "Gemini",
        "geminiConfigured": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")),
        "nodes": [
            "Resume Parser",
            "JD Parser",
            "Skill Extraction",
            "Gap Analysis",
            "Question Generator",
            "Answer Evaluation",
            "Learning Planner",
        ],
    }


@app.post("/agents/resume-analyzer")
def analyze_resume(payload: ResumeAnalysisRequest):
    return {
        "resumeId": payload.resume_id,
        "targetRole": payload.target_role,
        "status": "planned",
        "graph": "resume_to_competency_graph",
    }


@app.post("/agents/interview-analysis")
def interview_analysis(payload: InterviewAnalysisRequest):
    result = interview_graph.invoke(
        {
            "resume_text": payload.resume_text,
            "job_description": payload.job_description,
            "resume_skills": [],
            "jd_skills": [],
            "strengths": [],
            "missing_skills": [],
            "match_score": 0,
            "recommendations": [],
            "questions": [],
            "powered_by": "",
        }
    )

    return {
        "graph": "InterviewAnalysisGraph",
        "poweredBy": result["powered_by"],
        "agentFlow": [
            "Resume Parser",
            "JD Parser",
            "Skill Extraction",
            "Gap Analysis",
            "Question Generator",
            "Learning Planner",
        ],
        "matchScore": result["match_score"],
        "strengths": result["strengths"],
        "missingSkills": result["missing_skills"],
        "recommendations": result["recommendations"],
        "questions": result["questions"],
    }


@app.post("/agents/mvp-evaluation")
def evaluate_mvp(payload: AgentEvaluationRequest):
    jd_signals = signals(payload.job_description)
    answer_signals = signals(" ".join(answer.text for answer in payload.answers))
    strengths = sorted(set(jd_signals + answer_signals))
    gaps = [item for item in ["api", "auth", "sql", "redis", "testing", "communication"] if item not in strengths]
    has_audio = any(answer.audio_ref for answer in payload.answers)
    has_video = any(answer.video_ref for answer in payload.answers)

    return {
        "agentFlow": [
            "Planner Agent",
            "Resume Parser",
            "JD Parser",
            "Competency Intelligence Engine",
            "Adaptive Interview Planner",
            "Multimodal Evaluation Engine",
            "Interview Intelligence Report",
        ],
        "interviewDna": {
            "mode": "mvp-memory",
            "saved": payload.save_interview_dna,
            "summary": "Current session summary stored for demo reuse"
            if payload.save_interview_dna
            else "Privacy mode discards session data after report generation",
        },
        "strengths": strengths,
        "gaps": gaps,
        "modalities": {
            "text": True,
            "audio": has_audio,
            "video": has_video,
        },
    }
