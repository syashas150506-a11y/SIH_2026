from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PatientSession, ClinicalSummary
from app.schemas import QueueItemOut, SummaryOut

router = APIRouter(tags=["dashboards"])


@router.get("/nurse/queue", response_model=list[QueueItemOut])
def nurse_queue(db: Session = Depends(get_db)):
    sessions = (
        db.query(PatientSession)
        .filter(PatientSession.status != "done")
        .order_by(PatientSession.red_flag.desc(), PatientSession.created_at)
        .all()
    )
    return [
        QueueItemOut(
            session_id=s.id, name=s.name, status=s.status,
            red_flag=s.red_flag, red_flag_reason=s.red_flag_reason,
            chief_complaint=s.chief_complaint,
        )
        for s in sessions
    ]


@router.get("/doctor/queue", response_model=list[QueueItemOut])
def doctor_queue(db: Session = Depends(get_db)):
    sessions = (
        db.query(PatientSession)
        .filter(PatientSession.status == "ready_for_doctor")
        .order_by(PatientSession.red_flag.desc(), PatientSession.created_at)
        .all()
    )
    return [
        QueueItemOut(
            session_id=s.id, name=s.name, status=s.status,
            red_flag=s.red_flag, red_flag_reason=s.red_flag_reason,
            chief_complaint=s.chief_complaint,
        )
        for s in sessions
    ]


@router.get("/doctor/summary/{session_id}", response_model=SummaryOut)
def doctor_summary(session_id: str, db: Session = Depends(get_db)):
    summary = db.query(ClinicalSummary).filter(ClinicalSummary.session_id == session_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary
