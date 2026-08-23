from datetime import datetime
from typing import Optional, Literal, List
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


class RsvpCreate(BaseModel):
    name:      str
    contact:   str = ""            # email or phone — optional
    attending: bool = True
    guests:    int = 0              # additional people beyond themselves
    dietary:   List[str] = []       # selected restrictions

class RsvpResponse(BaseModel):
    id:         int
    name:       str
    contact:    str = ""
    attending:  bool
    guests:     int = 0
    dietary:    List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class BugReportCreate(BaseModel):
    name:        Optional[str] = None
    description: str

class BugReportResponse(BaseModel):
    id:          int
    name:        Optional[str] = None
    description: str
    created_at:  datetime

    class Config:
        from_attributes = True