import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlmodel import Session
from database.db import get_session
from database.models import ScannedDocument

router = APIRouter(prefix="/documents", tags=["Document Scanning & OCR"])

UPLOAD_DIR = "uploaded_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    ticket_id: str = Form("#MCA-TEMP"),
    session: Session = Depends(get_session)
):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    # Simulated OCR extraction text based on filename or generic prescription text
    ocr_text = f"Scanned Report ({file.filename}): Normal vitals recorded. Blood Glucose: 105 mg/dL. SpO2: 98%."
    
    doc_record = ScannedDocument(
        ticket_id=ticket_id,
        file_name=file.filename,
        file_path=file_location,
        ocr_extracted_text=ocr_text,
        status="COMPLETED"
    )
    
    session.add(doc_record)
    session.commit()
    session.refresh(doc_record)
    
    return {
        "status": "success",
        "doc_id": doc_record.id,
        "file_name": doc_record.file_name,
        "ocr_extracted_text": doc_record.ocr_extracted_text,
        "message": "Document scanned and attached to clinical encounter."
    }
