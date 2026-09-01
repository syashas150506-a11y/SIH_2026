import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database.db import get_session
from database.models import Patient, ABHALookupRequest, ABHALookupResponse, PatientRegisterRequest

router = APIRouter(prefix="/patient", tags=["Patient Intake & ABHA"])

# Pre-seeded mock patients for quick testing
DEMO_PATIENTS = {
    "82-9912-4410-1829": {
        "full_name": "Priya Sharma",
        "age": 28,
        "gender": "Female",
        "blood_group": "B+ Rh+",
        "synced_records": "2 Synced Encounters"
    },
    "91-4820-1928-3746": {
        "full_name": "Rahul Verma",
        "age": 32,
        "gender": "Male",
        "blood_group": "O+ Rh+",
        "synced_records": "4 Synced Records"
    }
}

@router.post("/lookup", response_model=ABHALookupResponse)
def lookup_patient(req: ABHALookupRequest, session: Session = Depends(get_session)):
    abha_clean = req.abha_number.strip()
    
    # 1. Search Database
    statement = select(Patient).where(Patient.abha_number == abha_clean)
    db_patient = session.exec(statement).first()
    
    if db_patient:
        return ABHALookupResponse(
            is_new_patient=False,
            patient={
                "abha_number": db_patient.abha_number,
                "full_name": db_patient.full_name,
                "age": db_patient.age,
                "gender": db_patient.gender,
                "blood_group": db_patient.blood_group,
                "synced_records": db_patient.synced_records
            }
        )
        
    # 2. Check Demo Records
    if abha_clean in DEMO_PATIENTS:
        demo = DEMO_PATIENTS[abha_clean]
        # Seed to DB
        new_p = Patient(
            abha_number=abha_clean,
            full_name=demo["full_name"],
            age=demo["age"],
            gender=demo["gender"],
            blood_group=demo["blood_group"],
            synced_records=demo["synced_records"]
        )
        session.add(new_p)
        session.commit()
        session.refresh(new_p)
        return ABHALookupResponse(
            is_new_patient=False,
            patient=demo | {"abha_number": abha_clean}
        )
        
    # 3. Check for special keywords like "guest" or "temp"
    if "guest" in abha_clean.lower() or "temp" in abha_clean.lower():
        is_guest = "guest" in abha_clean.lower()
        name = "Guest Patient (Walk-in)" if is_guest else "Verified Patient (Instant ABHA)"
        p_data = {
            "abha_number": abha_clean,
            "full_name": name,
            "age": 30,
            "gender": "Unspecified",
            "blood_group": "O+ Rh+",
            "synced_records": "Temporary Chart Created" if is_guest else "1 Linked Record"
        }
        return ABHALookupResponse(is_new_patient=False, patient=p_data)
        
    # Otherwise, it's a new patient!
    return ABHALookupResponse(is_new_patient=True, patient=None)


@router.post("/register")
def register_patient(req: PatientRegisterRequest, session: Session = Depends(get_session)):
    abha_num = req.abha_number
    if not abha_num:
        rand_id = random.randint(1000, 9999)
        abha_num = f"91-TEMP-{rand_id}-2026"
        
    patient = Patient(
        abha_number=abha_num,
        full_name=req.full_name,
        age=req.age,
        gender=req.gender,
        blood_group=req.blood_group or "O+ Rh+",
        synced_records="New Registered Record"
    )
    
    session.add(patient)
    session.commit()
    session.refresh(patient)
    
    return {
        "status": "success",
        "message": "Patient registered successfully",
        "patient": {
            "abha_number": patient.abha_number,
            "full_name": patient.full_name,
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "synced_records": patient.synced_records
        }
    }
