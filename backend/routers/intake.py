import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database.db import get_session
from database.models import (
    IntakeTicket, TriageAnalysisRequest, TicketCreateRequest
)
from services.summary_service import analyze_triage_and_summary

router = APIRouter(prefix="/intake", tags=["Intake & Triage"])

@router.post("/analyze-triage")
def analyze_triage(req: TriageAnalysisRequest):
    severity, summary, is_emergency = analyze_triage_and_summary(
        visit_reason=req.visit_reason,
        symptoms_text=req.symptoms_text
    )
    
    return {
        "triage_severity": severity,
        "is_emergency": is_emergency,
        "ai_summary": summary
    }

@router.post("/create-ticket")
def create_intake_ticket(req: TicketCreateRequest, session: Session = Depends(get_session)):
    ticket_num = random.randint(10000, 99999)
    ticket_id = f"#MCA-{ticket_num}"
    
    severity, summary, is_emergency = analyze_triage_and_summary(
        visit_reason=req.visit_reason,
        symptoms_text=req.symptoms_text,
        scanned_text=req.scanned_text or ""
    )
    
    demographics = "Adult Patient"
    
    ticket = IntakeTicket(
        ticket_id=ticket_id,
        abha_number=req.abha_number,
        patient_name=req.patient_name,
        patient_demographics=demographics,
        visit_reason=req.visit_reason,
        language_code=req.language_code or "kn",
        triage_severity=severity,
        is_emergency=is_emergency,
        chief_complaints=req.symptoms_text,
        ai_summary=summary,
        status="ACTIVE_QUEUE"
    )
    
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    
    return {
        "status": "success",
        "ticket_id": ticket.ticket_id,
        "triage_severity": ticket.triage_severity,
        "is_emergency": ticket.is_emergency,
        "ai_summary": ticket.ai_summary,
        "queue_status": "Active in Doctor Consultation Queue",
        "estimated_wait_mins": 2 if is_emergency else 5,
        "timestamp": ticket.created_at.strftime("%b %d, %Y %I:%M %p")
    }
