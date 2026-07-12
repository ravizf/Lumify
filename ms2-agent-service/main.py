from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="InterviewDNA MS2 AI Agent")


class ResumeAnalysisRequest(BaseModel):
    resume_id: str
    target_role: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "ms2-agent-service"}


@app.post("/agents/resume-analyzer")
def analyze_resume(payload: ResumeAnalysisRequest):
    return {
        "resumeId": payload.resume_id,
        "targetRole": payload.target_role,
        "status": "planned",
        "graph": "resume_to_competency_graph",
    }
