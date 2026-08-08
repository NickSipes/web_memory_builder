from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)   # person's name
    relation = Column(String, nullable=False)   # "Son", "Granddaughter", etc.
    type = Column(String, nullable=False) # "video", "photo", or "note"
    s3_key = Column(String, nullable=True) # S3 object for video/photo
    content = Column(Text, nullable=True) # text notes only
    created_at = Column(DateTime, default=datetime.utcnow)
    approved = Column(Boolean, nullable=False, default=False) # admin confirms before it's public


class Rsvp(Base):
    __tablename__ = "rsvps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact = Column(String, nullable=False)   # email or phone
    attending = Column(Boolean, nullable=False, default=True)
    dietary = Column(String, nullable=True)    # comma-joined restrictions, e.g. "No meat,Nut allergy"
    created_at = Column(DateTime, default=datetime.utcnow)