from typing import Optional, Any
from pydantic import BaseModel


# ---- Session ----
class SessionStartRequest(BaseModel):
    name: Optional[str] = None


class SessionStartResponse(BaseModel):
    session_id: str
    status: str


class ConsentRequest(BaseModel):
    language: str = "en"
    abha_id: Optional[str] = None
    consent_given: bool
    mode: str = "allopathic"
    literacy_mode: bool = False


class SessionOut(BaseModel):
    id: str
    name: Optional[str]
    language: str
    abha_id: Optional[str]
    consent_given: bool
    mode: str
    literacy_mode: bool
    status: str
    red_flag: bool
    red_flag_reason: Optional[str]
    chief_complaint: Optional[str]

    class Config:
        from_attributes = True


# ---- Interview ----
class InterviewMessageRequest(BaseModel):
    text: Optional[str] = None
    tap_data: Optional[dict] = None


class InterviewMessageResponse(BaseModel):
    ai_question: str
    options: list[str] = []
    is_complete: bool = False
    red_flag: bool = False
    red_flag_reason: Optional[str] = None


class InterviewTurnOut(BaseModel):
    role: str
    content: str

    class Config:
        from_attributes = True


# ---- Documents ----
class DocumentOut(BaseModel):
    id: str
    file_path: str
    extracted_json: Optional[Any]
    document_date: Optional[str]
    ocr_failed: bool

    class Config:
        from_attributes = True


# ---- Summary ----
class SummaryOut(BaseModel):
    session_id: str
    summary_json: Any
    red_flag: bool
    red_flag_reason: Optional[str]
    confirmed: bool

    class Config:
        from_attributes = True


class SummaryEditRequest(BaseModel):
    summary_json: Any
    confirmed: bool = True


# ---- Dashboards ----
class QueueItemOut(BaseModel):
    session_id: str
    name: Optional[str]
    status: str
    red_flag: bool
    red_flag_reason: Optional[str]
    chief_complaint: Optional[str]

    class Config:
        from_attributes = True
