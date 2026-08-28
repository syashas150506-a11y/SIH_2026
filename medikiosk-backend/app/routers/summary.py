from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PatientSession, InterviewTurn, UploadedDocument, ClinicalSummary
from app.schemas import SummaryOut, SummaryEditRequest
from app.services.llm_service import call_llm
from app.services.redflag_service import check_red_flags
from app.prompts.extraction_and_summary import SUMMARY_PROMPT, AYUSH_SUMMARY_PROMPT

router = APIRouter(prefix="/summary", tags=["summary"])


@router.post("/{session_id}/generate", response_model=SummaryOut)
def generate_summary(session_id: str, db: Session = Depends(get_db)):
    session = db.get(PatientSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    turns = (
        db.query(InterviewTurn)
        .filter(InterviewTurn.session_id == session_id)
        .order_by(InterviewTurn.created_at)
        .all()
    )
    documents = db.query(UploadedDocument).filter(UploadedDocument.session_id == session_id).all()

    conversation_text = "\n".join(f"{t.role}: {t.content}" for t in turns)
    docs_text = "\n".join(str(d.extracted_json) for d in documents if d.extracted_json)
    combined_input = f"INTERVIEW:\n{conversation_text}\n\nDOCUMENTS:\n{docs_text}"

    prompt = AYUSH_SUMMARY_PROMPT if session.mode == "ayush" else SUMMARY_PROMPT
    summary_json = call_llm(prompt, [], combined_input)

    red_flag, reason = check_red_flags(conversation_text)
    if session.red_flag:  # don't overwrite an already-detected red flag
        red_flag, reason = session.red_flag, session.red_flag_reason

    summary = db.query(ClinicalSummary).filter(ClinicalSummary.session_id == session_id).first()
    if not summary:
        summary = ClinicalSummary(session_id=session_id)
        db.add(summary)

    summary.summary_json = summary_json
    summary.red_flag = red_flag
    summary.red_flag_reason = reason

    session.status = "ready_for_doctor"
    session.red_flag = red_flag
    session.red_flag_reason = reason

    db.commit()
    db.refresh(summary)
    return summary


@router.patch("/{session_id}", response_model=SummaryOut)
def edit_summary(session_id: str, payload: SummaryEditRequest, db: Session = Depends(get_db)):
    summary = db.query(ClinicalSummary).filter(ClinicalSummary.session_id == session_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")

    summary.summary_json = payload.summary_json
    summary.confirmed = payload.confirmed
    db.commit()
    db.refresh(summary)
    return summary
