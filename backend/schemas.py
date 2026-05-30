from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel

# What the client sends in (no id, no created_at, - DB sets those)
class SubmissionCreate(BaseModel):
    name:   str
    relation: str
    type: Literal["video", "note"]
    s3_key: Optional[str] = None
    content: Optional[str] = None

# What the server sends back (includes DB-generated fields)
class SubmissionResponse(BaseModel):
    id: int
    name: str
    relation: str
    type: str
    s3_key: Optional[str]
    content: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True # tells Pydantic to read from ORM objects