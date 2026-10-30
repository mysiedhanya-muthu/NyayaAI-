import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import engine, Base, SessionLocal
from .models import User
from .seed_data import seed_database
from .routers import auth_router, cases_router, match_router, evidence_router, audit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables created & seed initial synthetic forensic cases
    print("Initializing NyayaAI Forensic Database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown
    print("NyayaAI services shutting down gracefully.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Forensic Victim Identification and Missing-Person Matching Decision Support System",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router.router)
app.include_router(cases_router.router)
app.include_router(match_router.router)
app.include_router(evidence_router.router)
app.include_router(audit_router.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "NyayaAI Forensic Decision Support System",
        "engine_version": "2.4-Explainable",
        "database": "SQLite / PostgreSQL Ready"
    }
