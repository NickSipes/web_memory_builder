from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel

class SubmissionCreate(BaseModel):
    name:     str
    relation: str
    type:     Literal["video", "photo", "note"]
    s3_key:   Optional[str] = None
    content:  Optional[str] = None

class SubmissionResponse(BaseModel):
    id:           int
    name:         str
    relation:     str
    type:         str
    s3_key:       Optional[str]
    content:      Optional[str]
    created_at:   datetime
    approved:     bool = False
    playback_url: Optional[str] = None   # generated fresh per request, never stored

    class Config:
        from_attributes = True