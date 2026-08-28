from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PatientSession, InterviewTurn
from app.schemas import InterviewMessageRequest, InterviewMessageResponse, InterviewTurnOut
from app.services.llm_service import call_llm
from app.prompts.interview_standard import INTERVIEW_STANDARD_PROMPT
from app.prompts.interview_simple import INTERVIEW_SIMPLE_PROMPT

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/{session_id}/message", response_model=InterviewMessageResponse)
def send_message(session_id: str, payload: InterviewMessageRequest, db: Session = Depends(get_db)):
    session = db.get(PatientSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    user_message = payload.text or str(payload.tap_data or "")

    prior_turns = (
        db.query(InterviewTurn)
        .filter(InterviewTurn.session_id == session_id)
        .order_by(InterviewTurn.created_at)
        .all()
    )
    conversation = [{"role": t.role, "content": t.content} for t in prior_turns]

    system_prompt = INTERVIEW_SIMPLE_PROMPT if session.literacy_mode else INTERVIEW_STANDARD_PROMPT
    result = call_llm(system_prompt, conversation, user_message)

    if not session.chief_complaint:
        session.chief_complaint = user_message

    db.add(InterviewTurn(session_id=session_id, role="patient", content=user_message))
    db.add(InterviewTurn(session_id=session_id, role="ai", content=result.get("ai_question", "")))

    if result.get("red_flag"):
        session.red_flag = True
        session.red_flag_reason = result.get("red_flag_reason")
        session.status = "ready_for_doctor"  # skip doc scanning, go straight to doctor/nurse
    elif result.get("is_complete"):
        session.status = "scanning_docs"

    db.commit()

    return InterviewMessageResponse(
        ai_question=result.get("ai_question", ""),
        options=result.get("options", []),
        is_complete=result.get("is_complete", False),
        red_flag=result.get("red_flag", False),
        red_flag_reason=result.get("red_flag_reason"),
    )


@router.get("/{session_id}/history", response_model=list[InterviewTurnOut])
def get_history(session_id: str, db: Session = Depends(get_db)):
    return (
        db.query(InterviewTurn)
        .filter(InterviewTurn.session_id == session_id)
        .order_by(InterviewTurn.created_at)
        .all()
    )
