from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="InterviewDNA Agent Engine")


class ResumeAnalysisRequest(BaseModel):
    resume_id: str
    target_role: str


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


def signals(text: str) -> List[str]:
    expected = ["api", "auth", "sql", "redis", "testing", "communication"]
    lowered = text.lower()
    return [item for item in expected if item in lowered]


@app.get("/health")
def health():
    return {"status": "ok", "service": "agent-engine"}


@app.post("/agents/resume-analyzer")
def analyze_resume(payload: ResumeAnalysisRequest):
    return {
        "resumeId": payload.resume_id,
        "targetRole": payload.target_role,
        "status": "planned",
        "graph": "resume_to_competency_graph",
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
