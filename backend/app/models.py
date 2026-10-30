import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from .database import Base

class UserRole(str):
    ADMIN = "System Admin"
    LEAD_INVESTIGATOR = "Lead Investigator"
    FORENSIC_PATHOLOGIST = "Forensic Pathologist"
    ODONTOLOGIST = "Forensic Odontologist"
    POLICE_OFFICER = "Police Investigating Officer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(100), default=UserRole.LEAD_INVESTIGATOR, nullable=False)
    badge_number = Column(String(100), nullable=True)
    department = Column(String(255), default="Forensic Investigation Directorate")
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    audit_logs = relationship("AuditLog", back_populates="user")


class UnidentifiedBody(Base):
    __tablename__ = "unidentified_bodies"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    recovery_date = Column(String(50), nullable=False)
    recovery_location_name = Column(String(255), nullable=False)
    recovery_lat = Column(Float, nullable=True)
    recovery_lng = Column(Float, nullable=True)
    water_body_type = Column(String(100), default="River")  # River, Canal, Lake, Reservoir, Sea, None
    water_temperature_celsius = Column(Float, default=22.0)
    
    # Immersion & Decomposition (Casper's Dictum & aquatic indicators)
    immersion_stage = Column(String(255), default="Moderate Bloating & Skin Slippage")
    estimated_pmi_min_days = Column(Integer, default=3)
    estimated_pmi_max_days = Column(Integer, default=7)
    
    # Biological Profile
    biological_sex = Column(String(50), default="Male")  # Male, Female, Indeterminate
    estimated_age_min = Column(Integer, default=25)
    estimated_age_max = Column(Integer, default=35)
    estimated_height_min = Column(Float, default=168.0)  # in cm
    estimated_height_max = Column(Float, default=175.0)  # in cm
    blood_group = Column(String(50), default="Unknown/Hemolyzed")
    
    # Physical Identifiers & Effects
    distinguishing_marks = Column(Text, nullable=True)  # Tattoos, scars, surgical implants
    clothing_effects = Column(Text, nullable=True)      # Clothing, watch, jewelry, amulets
    
    # Forensic Evidence Data (JSON strings)
    dental_record_json = Column(Text, nullable=True)    # 32 teeth map with status
    dna_str_profile_json = Column(Text, nullable=True)  # 16-24 STR loci
    fingerprint_status = Column(String(100), default="Degraded / Epidermal Maceration")
    fingerprint_minutiae_score = Column(Float, default=0.0)
    
    condition_notes = Column(Text, nullable=True)
    status = Column(String(50), default="Open")  # Open, Potential Match Review, Confirmed Identification, Archived
    assigned_pathologist = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    matches = relationship("ForensicMatchResult", back_populates="uid_case", cascade="all, delete-orphan")


class MissingPerson(Base):
    __tablename__ = "missing_persons"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    reported_date = Column(String(50), nullable=False)
    disappearance_date = Column(String(50), nullable=False)
    last_seen_location = Column(String(255), nullable=False)
    last_seen_lat = Column(Float, nullable=True)
    last_seen_lng = Column(Float, nullable=True)
    
    # Antemortem Physical Profile
    age = Column(Integer, nullable=False)
    biological_sex = Column(String(50), nullable=False)
    height = Column(Float, nullable=False)  # in cm
    blood_group = Column(String(50), nullable=True)
    
    # Antemortem Identifiers
    distinguishing_marks = Column(Text, nullable=True)
    clothing_last_seen = Column(Text, nullable=True)
    circumstances = Column(Text, nullable=True)  # Circumstances of disappearance
    
    # Antemortem Forensic References
    dental_record_json = Column(Text, nullable=True)
    dna_str_profile_json = Column(Text, nullable=True)  # Reference or Kinship sample
    has_fingerprint_record = Column(Boolean, default=False)
    
    reporting_police_station = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)
    contact_phone = Column(String(100), nullable=True)
    status = Column(String(50), default="Active Missing")  # Active Missing, Matched, Solved, Inactive
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    matches = relationship("ForensicMatchResult", back_populates="mp_record", cascade="all, delete-orphan")


class ForensicMatchResult(Base):
    __tablename__ = "forensic_match_results"

    id = Column(Integer, primary_key=True, index=True)
    uid_id = Column(Integer, ForeignKey("unidentified_bodies.id", ondelete="CASCADE"), nullable=False)
    mp_id = Column(Integer, ForeignKey("missing_persons.id", ondelete="CASCADE"), nullable=False)
    
    overall_score = Column(Float, nullable=False)  # 0.0 - 100.0%
    confidence_level = Column(String(50), nullable=False)  # High Lead, Moderate Lead, Low Lead, Incompatible
    
    # Explainable Component Scores (0 - 100%)
    dna_score = Column(Float, nullable=False)
    dental_score = Column(Float, nullable=False)
    physical_score = Column(Float, nullable=False)
    distinctive_score = Column(Float, nullable=False)
    temporal_geo_score = Column(Float, nullable=False)
    fingerprint_score = Column(Float, nullable=True)
    
    # Dynamic weights used
    weights_used_json = Column(Text, nullable=True)
    explanation_json = Column(Text, nullable=False)  # Key match drivers, conflicts, pathology note
    
    # Review & Chain of Custody
    status = Column(String(50), default="Pending Review")  # Pending Review, Confirmed Match, Rejected, Inconclusive
    reviewed_by = Column(String(255), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    uid_case = relationship("UnidentifiedBody", back_populates="matches")
    mp_record = relationship("MissingPerson", back_populates="matches")


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(Integer, primary_key=True, index=True)
    case_type = Column(String(50), nullable=False)  # UID or MP
    case_id = Column(Integer, nullable=False)
    item_title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # DNA Profile, Dental OPG, Autopsy Photo, Personal Artifact, Fingerprint Lift
    file_path = Column(String(500), nullable=True)
    file_hash = Column(String(64), nullable=True)  # SHA-256 tamper-evident hash
    file_size_bytes = Column(Integer, default=0)
    chain_of_custody_log_json = Column(Text, nullable=True)
    uploaded_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # LOGIN, VIEW_CASE, MATCH_EXECUTION, VERIFY_MATCH, EXPORT_REPORT, UPLOAD_EVIDENCE
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(100), default="127.0.0.1")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
