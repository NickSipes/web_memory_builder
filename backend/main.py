import os
import secrets
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal, engine
from models import Submission, Rsvp, BugReport
from schemas import (
    SubmissionCreate, SubmissionResponse, RsvpCreate, RsvpResponse,
    BugReportCreate, BugReportResponse,
)
import models

from pydantic import BaseModel
from s3 import generate_presigned_put, generate_presigned_get, delete_object

# Admin creds — override in prod via env. Defaults match what the family uses.
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "katienick")
security = HTTPBasic()

def require_admin(creds: HTTPBasicCredentials = Depends(security)):
    # compare_digest avoids leaking length/content via timing
    ok = (secrets.compare_digest(creds.username, ADMIN_USERNAME)
          and secrets.compare_digest(creds.password, ADMIN_PASSWORD))
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

# Create tables if they don't exist (backup to Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Local dev server + the deployed frontend (set FRONTEND_URL in prod)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", ""),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB session dependency - runs for every request, cleans up after
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/submissions", response_model=SubmissionResponse)
def create_submission(body: SubmissionCreate, db: Session = Depends(get_db)):
    record = Submission(**body.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record) # re-reads from DB to get id and created_at
    return record

def _serialize(r: Submission) -> SubmissionResponse:
    resp = SubmissionResponse.model_validate(r)
    # video/photo get a fresh signed URL; notes stay None
    if r.s3_key:
        resp.playback_url = generate_presigned_get(r.s3_key)
    return resp

@app.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(db: Session = Depends(get_db)):
    records = (db.query(Submission)
               .filter(Submission.approved.is_(True))
               .order_by(Submission.created_at.desc()).all())
    return [_serialize(r) for r in records]

@app.get("/admin/submissions", response_model=List[SubmissionResponse])
def admin_list_submissions(db: Session = Depends(get_db), _: None = Depends(require_admin)):
    # Everything, approved or not — the moderation queue
    records = db.query(Submission).order_by(Submission.created_at.desc()).all()
    return [_serialize(r) for r in records]

@app.post("/admin/submissions/{submission_id}/approve", response_model=SubmissionResponse)
def approve_submission(submission_id: int, db: Session = Depends(get_db), _: None = Depends(require_admin)):
    record = db.get(Submission, submission_id)
    if not record:
        raise HTTPException(status_code=404, detail="Submission not found")
    record.approved = True
    db.commit()
    db.refresh(record)
    return _serialize(record)

@app.delete("/admin/submissions/{submission_id}", status_code=204)
def delete_submission(submission_id: int, db: Session = Depends(get_db), _: None = Depends(require_admin)):
    # Serves both "reject" (before approval) and "delete existing" — same action.
    record = db.get(Submission, submission_id)
    if not record:
        raise HTTPException(status_code=404, detail="Submission not found")
    if record.s3_key:
        delete_object(record.s3_key)   # drop the video/photo from S3 too
    db.delete(record)
    db.commit()

class PresignedRequest(BaseModel):
    filename: str
    content_type: str = "video/webm" # default for video; callers can override

@app.post("/upload/presigned")
def get_presigned_url(body: PresignedRequest):
    """
    Client calls this before uploading. Returns a signed S3 URL
    and the key where the file will live once uploaded.
    """
    return generate_presigned_put(body.filename, body.content_type)


# --- RSVPs ----------------------------------------------------------------
def _rsvp_out(r: Rsvp) -> RsvpResponse:
    return RsvpResponse(
        id=r.id, name=r.name, contact=r.contact, attending=r.attending,
        guests=r.guests or 0,
        dietary=[d for d in (r.dietary or "").split(",") if d],
        created_at=r.created_at,
    )

@app.post("/rsvps", response_model=RsvpResponse)
def create_rsvp(body: RsvpCreate, db: Session = Depends(get_db)):
    record = Rsvp(
        name=body.name, contact=body.contact, attending=body.attending,
        guests=max(0, body.guests),
        dietary=",".join(body.dietary) or None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _rsvp_out(record)

@app.get("/admin/rsvps", response_model=List[RsvpResponse])
def admin_list_rsvps(db: Session = Depends(get_db), _: None = Depends(require_admin)):
    records = db.query(Rsvp).order_by(Rsvp.created_at.desc()).all()
    return [_rsvp_out(r) for r in records]

@app.delete("/admin/rsvps/{rsvp_id}", status_code=204)
def delete_rsvp(rsvp_id: int, db: Session = Depends(get_db), _: None = Depends(require_admin)):
    record = db.get(Rsvp, rsvp_id)
    if not record:
        raise HTTPException(status_code=404, detail="RSVP not found")
    db.delete(record)
    db.commit()


# --- Bug reports ----------------------------------------------------------
@app.post("/bug-reports", response_model=BugReportResponse)
def create_bug_report(body: BugReportCreate, db: Session = Depends(get_db)):
    record = BugReport(name=(body.name or None), description=body.description)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@app.get("/admin/bug-reports", response_model=List[BugReportResponse])
def admin_list_bug_reports(db: Session = Depends(get_db), _: None = Depends(require_admin)):
    return db.query(BugReport).order_by(BugReport.created_at.desc()).all()

@app.delete("/admin/bug-reports/{report_id}", status_code=204)
def delete_bug_report(report_id: int, db: Session = Depends(get_db), _: None = Depends(require_admin)):
    record = db.get(BugReport, report_id)
    if not record:
        raise HTTPException(status_code=404, detail="Bug report not found")
    db.delete(record)
    db.commit()