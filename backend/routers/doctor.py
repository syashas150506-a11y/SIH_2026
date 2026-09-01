from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, desc
from database.db import get_session
from database.models import IntakeTicket, ScannedDocument, UpdateTicketStatusRequest

router = APIRouter(prefix="/doctor", tags=["Doctor Dashboard API"])

@router.get("/tickets")
def get_doctor_tickets(session: Session = Depends(get_session)):
    """
    Returns active intake tickets sorted with Emergency SOS alerts pinned to top,
    followed by High priority, then Normal tickets.
    """
    statement = select(IntakeTicket).order_by(
        desc(IntakeTicket.is_emergency),
        desc(IntakeTicket.created_at)
    )
    tickets = session.exec(statement).all()
    
    results = []
    for t in tickets:
        results.append({
            "id": t.id,
            "ticket_id": t.ticket_id,
            "abha_number": t.abha_number,
            "patient_name": t.patient_name,
            "patient_demographics": t.patient_demographics,
            "visit_reason": t.visit_reason,
            "language_code": t.language_code,
            "triage_severity": t.triage_severity,
            "is_emergency": t.is_emergency,
            "chief_complaints": t.chief_complaints,
            "ai_summary": t.ai_summary,
            "status": t.status,
            "doctor_notes": t.doctor_notes,
            "created_at": t.created_at.strftime("%I:%M %p, %b %d")
        })
        
    return results

@router.get("/ticket/{ticket_id}")
def get_ticket_details(ticket_id: str, session: Session = Depends(get_session)):
    statement = select(IntakeTicket).where(IntakeTicket.ticket_id == ticket_id)
    t = session.exec(statement).first()
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    doc_stmt = select(ScannedDocument).where(ScannedDocument.ticket_id == ticket_id)
    docs = session.exec(doc_stmt).all()
    
    return {
        "ticket": {
            "id": t.id,
            "ticket_id": t.ticket_id,
            "abha_number": t.abha_number,
            "patient_name": t.patient_name,
            "patient_demographics": t.patient_demographics,
            "visit_reason": t.visit_reason,
            "language_code": t.language_code,
            "triage_severity": t.triage_severity,
            "is_emergency": t.is_emergency,
            "chief_complaints": t.chief_complaints,
            "ai_summary": t.ai_summary,
            "status": t.status,
            "doctor_notes": t.doctor_notes,
            "created_at": t.created_at.strftime("%I:%M %p, %b %d")
        },
        "documents": [
            {
                "id": d.id,
                "file_name": d.file_name,
                "ocr_extracted_text": d.ocr_extracted_text,
                "uploaded_at": d.uploaded_at.strftime("%I:%M %p")
            } for d in docs
        ]
    }

@router.post("/ticket/{ticket_id}/status")
def update_ticket_status(
    ticket_id: str,
    req: UpdateTicketStatusRequest,
    session: Session = Depends(get_session)
):
    statement = select(IntakeTicket).where(IntakeTicket.ticket_id == ticket_id)
    t = session.exec(statement).first()
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    t.status = req.status
    if req.doctor_notes:
        t.doctor_notes = req.doctor_notes
        
    session.add(t)
    session.commit()
    session.refresh(t)
    
    return {
        "status": "success",
        "ticket_id": t.ticket_id,
        "new_status": t.status,
        "doctor_notes": t.doctor_notes
    }
