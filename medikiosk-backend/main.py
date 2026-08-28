from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models  # noqa: F401 — registers models with Base before create_all
from app.routers import session, interview, documents, summary, dashboards
from app.config import MOCK_MODE

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediKiosk Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your Vercel URL + localhost:3000 before real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)
app.include_router(interview.router)
app.include_router(documents.router)
app.include_router(summary.router)
app.include_router(dashboards.router)


@app.get("/health")
def health():
    return {"status": "ok", "mock_mode": MOCK_MODE}
