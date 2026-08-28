import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from PIL import Image
import pytesseract

from app.database import get_db
from app.models import PatientSession, UploadedDocument
from app.schemas import DocumentOut
from app.services.llm_service import call_llm
from app.prompts.extraction_and_summary import EXTRACTION_PROMPT
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/documents", tags=["documents"])
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/{session_id}/upload", response_model=DocumentOut)
def upload_document(session_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    session = db.get(PatientSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    ext = os.path.splitext(file.filename)[1] or ".jpg"
    saved_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{ext}")
    with open(saved_path, "wb") as f:
        f.write(file.file.read())

    raw_text = ""
    ocr_failed = False
    try:
        image = Image.open(saved_path)
        raw_text = pytesseract.image_to_string(image).strip()
        if len(raw_text) < 5:
            ocr_failed = True
    except Exception:
        ocr_failed = True

    extracted = {}
    if not ocr_failed:
        extracted = call_llm(EXTRACTION_PROMPT, [], raw_text)

    doc = UploadedDocument(
        session_id=session_id,
        file_path=saved_path,
        raw_ocr_text=raw_text,
        extracted_json=extracted,
        document_date=extracted.get("document_date") if extracted else None,
        ocr_failed=ocr_failed,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{session_id}", response_model=list[DocumentOut])
def list_documents(session_id: str, db: Session = Depends(get_db)):
    return (
        db.query(UploadedDocument)
        .filter(UploadedDocument.session_id == session_id)
        .order_by(UploadedDocument.document_date)
        .all()
    )
