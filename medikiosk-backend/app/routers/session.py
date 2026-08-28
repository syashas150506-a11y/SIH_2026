from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PatientSession
from app.schemas import SessionStartRequest, SessionStartResponse, ConsentRequest, SessionOut

router = APIRouter(prefix="/session", tags=["session"])


@router.post("/start", response_model=SessionStartResponse)
def start_session(payload: SessionStartRequest, db: Session = Depends(get_db)):
    session = PatientSession(name=payload.name)
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionStartResponse(session_id=session.id, status=session.status)


@router.post("/{session_id}/consent", response_model=SessionOut)
def give_consent(session_id: str, payload: ConsentRequest, db: Session = Depends(get_db)):
    session = db.get(PatientSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.language = payload.language
    session.abha_id = payload.abha_id
    session.consent_given = payload.consent_given
    session.mode = payload.mode
    session.literacy_mode = payload.literacy_mode
    session.status = "interviewing" if payload.consent_given else "identifying"
    db.commit()
    db.refresh(session)
    return session
