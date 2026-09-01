import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from config import settings
from database.db import init_db, get_session
from database.models import IntakeTicket, Patient
from sqlmodel import Session, select

from routers import patient, intake, documents, doctor

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api/v1
app.include_router(patient.router, prefix=settings.API_V1_STR)
app.include_router(intake.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(doctor.router, prefix=settings.API_V1_STR)

# Get Root Project Directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Mount Static Files (CSS, JS, Images)
app.mount("/assets", StaticFiles(directory=ROOT_DIR), name="assets")

@app.on_event("startup")
def on_startup():
    init_db()
    # Seed initial demo tickets for Doctor Dashboard if empty
    db = next(get_session())
    existing = db.exec(select(IntakeTicket)).first()
    if not existing:
        demo_tickets = [
            IntakeTicket(
                ticket_id="#MCA-90214",
                abha_number="82-9912-4410-1829",
                patient_name="Priya Sharma",
                patient_demographics="Female, 28 Yrs (B+ Rh+)",
                visit_reason="Acute Chest Pain & Breathing Difficulty",
                language_code="kn",
                triage_severity="CRITICAL_SOS",
                is_emergency=True,
                chief_complaints="Sudden onset sharp chest pain radiating to left arm. Shortness of breath.",
                ai_summary="• Visit Reason: Chest pain\n• Reported Symptoms: Sharp chest pain & shortness of breath\n🚨 CLINICAL TRIAGE WARNING: Patient exhibits high-risk urgent symptoms. Immediate physician attention required.",
                status="ACTIVE_QUEUE"
            ),
            IntakeTicket(
                ticket_id="#MCA-38410",
                abha_number="91-4820-1928-3746",
                patient_name="Rahul Verma",
                patient_demographics="Male, 32 Yrs (O+ Rh+)",
                visit_reason="On-going High Fever & Cold",
                language_code="hi",
                triage_severity="HIGH",
                is_emergency=False,
                chief_complaints="Body ache, fever 102F for 2 days, persistent cough.",
                ai_summary="• Visit Reason: High fever & cough\n• Reported Symptoms: 102F fever and persistent cough\n⚠️ CLINICAL NOTE: Priority intake recommended due to moderate-high symptom profile.",
                status="ACTIVE_QUEUE"
            )
        ]
        for t in demo_tickets:
            db.add(t)
        db.commit()

# Serve Patient Kiosk App
@app.get("/")
def serve_patient_app():
    index_path = os.path.join(ROOT_DIR, "index.html")
    return FileResponse(index_path)

# Serve Doctor Dashboard App
@app.get("/doctor")
def serve_doctor_dashboard():
    doctor_path = os.path.join(ROOT_DIR, "doctor.html")
    return FileResponse(doctor_path)

# Serve Style CSS
@app.get("/style.css")
def serve_css():
    css_path = os.path.join(ROOT_DIR, "style.css")
    return FileResponse(css_path)

# Serve App JS
@app.get("/app.js")
def serve_js():
    js_path = os.path.join(ROOT_DIR, "app.js")
    return FileResponse(js_path)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
