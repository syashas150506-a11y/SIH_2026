from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field
from pydantic import BaseModel

# ==========================================
# SQLModel Database Tables
# ==========================================

class Patient(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    abha_number: str = Field(index=True, unique=True)
    full_name: str
    age: int
    gender: str
    blood_group: str = "O+ Rh+"
    synced_records: str = "1 Synced Record"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class IntakeTicket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: str = Field(index=True, unique=True) # e.g. #MCA-49201
    abha_number: str
    patient_name: str
    patient_demographics: str
    visit_reason: str
    language_code: str = "kn"
    triage_severity: str = "NORMAL" # NORMAL, HIGH, CRITICAL_SOS
    is_emergency: bool = False
    chief_complaints: str = ""
    ai_summary: str = ""
    status: str = "ACTIVE_QUEUE" # ACTIVE_QUEUE, IN_CONSULTATION, COMPLETED
    doctor_notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ScannedDocument(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: str = Field(index=True)
    file_name: str
    file_path: str
    ocr_extracted_text: str = ""
    status: str = "COMPLETED" # SCANNING, COMPLETED
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


# ==========================================
# Pydantic Schemas for API Requests & Responses
# ==========================================

class ABHALookupRequest(BaseModel):
    abha_number: str

class ABHALookupResponse(BaseModel):
    is_new_patient: bool
    patient: Optional[dict] = None

class PatientRegisterRequest(BaseModel):
    full_name: str
    age: int
    gender: str
    blood_group: Optional[str] = "O+ Rh+"
    abha_number: Optional[str] = None

class TriageAnalysisRequest(BaseModel):
    abha_number: str
    visit_reason: str
    symptoms_text: str
    language_code: Optional[str] = "kn"

class TicketCreateRequest(BaseModel):
    abha_number: str
    patient_name: str
    visit_reason: str
    symptoms_text: str
    language_code: Optional[str] = "kn"
    has_scanned_docs: Optional[bool] = False
    scanned_text: Optional[str] = ""

class UpdateTicketStatusRequest(BaseModel):
    status: str
    doctor_notes: Optional[str] = ""
