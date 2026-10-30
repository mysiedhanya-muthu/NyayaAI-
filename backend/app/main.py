import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
    allow_origin_regex=r"https?://.*",
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

# Frontend SPA Static Serving (Single-service fullstack deployment support)
frontend_dist = os.environ.get(
    "FRONTEND_DIST",
    os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist"))
)
if not os.path.exists(frontend_dist):
    alt_dist = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "static"))
    if os.path.exists(alt_dist):
        frontend_dist = alt_dist

if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

