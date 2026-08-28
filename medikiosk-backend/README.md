# MediKiosk Backend (FastAPI + Gemini)

## Setup
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your GEMINI_API_KEY when you have it
uvicorn main:app --reload
```

Without a GEMINI_API_KEY set, the app runs in MOCK_MODE — every LLM
call returns a realistic canned response, so the full flow works and
is demoable with zero setup. Add your key to `.env` to switch to real
Gemini calls, no code changes needed.

## Try it
Open http://127.0.0.1:8000/docs for the full interactive API.

Flow to test manually:
1. POST /session/start
2. POST /session/{id}/consent
3. POST /interview/{id}/message  (repeat until is_complete)
4. POST /documents/{id}/upload   (optional, needs tesseract installed)
5. POST /summary/{id}/generate
6. GET  /doctor/queue and /nurse/queue

## Structure
- app/models.py         — DB tables
- app/schemas.py        — request/response shapes
- app/services/         — llm_service (Gemini calls), redflag_service
- app/prompts/          — system prompts, edit these to tune behavior
- app/routers/          — session, interview, documents, summary, dashboards
