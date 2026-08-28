import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class PatientSession(Base):
    __tablename__ = "patient_sessions"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=True)
    language = Column(String, default="en")
    abha_id = Column(String, nullable=True)
    consent_given = Column(Boolean, default=False)
    mode = Column(String, default="allopathic")  # "allopathic" | "ayush"
    literacy_mode = Column(Boolean, default=False)  # simplified pictogram interview
    status = Column(String, default="identifying")
    # identifying -> interviewing -> scanning_docs -> summarizing -> ready_for_doctor -> in_consult -> done
    red_flag = Column(Boolean, default=False)
    red_flag_reason = Column(String, nullable=True)
    chief_complaint = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    turns = relationship("InterviewTurn", back_populates="session", cascade="all, delete-orphan")
    documents = relationship("UploadedDocument", back_populates="session", cascade="all, delete-orphan")
    summary = relationship("ClinicalSummary", back_populates="session", uselist=False, cascade="all, delete-orphan")


class InterviewTurn(Base):
    __tablename__ = "interview_turns"

    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("patient_sessions.id"))
    role = Column(String)  # "patient" | "ai"
    content = Column(Text)
    structured_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("PatientSession", back_populates="turns")


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("patient_sessions.id"))
    file_path = Column(String)
    raw_ocr_text = Column(Text, nullable=True)
    extracted_json = Column(JSON, nullable=True)
    document_date = Column(String, nullable=True)
    ocr_failed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("PatientSession", back_populates="documents")


class ClinicalSummary(Base):
    __tablename__ = "clinical_summaries"

    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("patient_sessions.id"), unique=True)
    summary_json = Column(JSON)
    red_flag = Column(Boolean, default=False)
    red_flag_reason = Column(String, nullable=True)
    confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("PatientSession", back_populates="summary")
