from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import traceback

from resume_parser import parse_resume
from job_matcher import match_jobs

app = FastAPI(title="HirePath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "HirePath API"}


@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not (filename.lower().endswith(".pdf") or filename.lower().endswith(".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    try:
        content = await file.read()
        resume_data = parse_resume(content, filename)
        matches = match_jobs(resume_data)

        return {
            "resume_summary": {
                "skills": resume_data["skills"],
                "education_level": resume_data["education_level"],
                "experience_years": resume_data["experience_years"],
                "detected_titles": resume_data["detected_titles"],
            },
            "matches": matches,
            "total_matches": len(matches),
            "sources_searched": ["LinkedIn", "Indeed", "Glassdoor", "Monster", "ZipRecruiter"],
        }
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
