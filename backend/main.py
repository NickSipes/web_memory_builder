from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal, engine
from models import Submission
from schemas import SubmissionCreate, SubmissionResponse
import models

# Create tables if they don't exist (backup to Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow the React dev server to call this API (for Phase 3)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

@app.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(db: Session = Depends(get_db)):
    return db.query(Submission).order_by(Submission.created_at.desc()).all()