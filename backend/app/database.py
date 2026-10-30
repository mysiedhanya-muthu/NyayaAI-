import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DEFAULT_DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "forensic_nyaya.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_FILE}")

# Automatically convert legacy postgres:// schema to postgresql:// for SQLAlchemy 2.0
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
