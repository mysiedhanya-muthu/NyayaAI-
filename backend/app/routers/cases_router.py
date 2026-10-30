import json
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from ..database import get_db
from ..models import UnidentifiedBody, MissingPerson, ForensicMatchResult, EvidenceItem, User
from ..auth import get_current_user, log_audit_event

router = APIRouter(prefix="/api/cases", tags=["Forensic Cases Management"])

# Pydantic models for case intake
class UIDCreateRequest(BaseModel):
    title: str
    recovery_date: str
    recovery_location_name: str
    recovery_lat: Optional[float] = 28.6139
    recovery_lng: Optional[float] = 77.2090
    water_body_type: str = "River"
    water_temperature_celsius: Optional[float] = 22.0
    immersion_stage: str = "Moderate Bloating & Skin Slippage"
    estimated_pmi_min_days: int = 3
    estimated_pmi_max_days: int = 7
    biological_sex: str = "Male"
    estimated_age_min: int = 25
    estimated_age_max: int = 35
    estimated_height_min: float = 168.0
    estimated_height_max: float = 175.0
    blood_group: str = "Unknown/Hemolyzed"
    distinguishing_marks: Optional[str] = ""
    clothing_effects: Optional[str] = ""
    dental_record_json: Optional[str] = "{}"
    dna_str_profile_json: Optional[str] = "{}"
    fingerprint_status: str = "Degraded / Epidermal Maceration"
    fingerprint_minutiae_score: Optional[float] = 0.0
    condition_notes: Optional[str] = ""
    assigned_pathologist: Optional[str] = "Dr. Ananya Roy, MD"

class MPCreateRequest(BaseModel):
    full_name: str
    reported_date: str
    disappearance_date: str
    last_seen_location: str
    last_seen_lat: Optional[float] = 28.6139
    last_seen_lng: Optional[float] = 77.2090
    age: int
    biological_sex: str
    height: float
    blood_group: Optional[str] = "B+"
    distinguishing_marks: Optional[str] = ""
    clothing_last_seen: Optional[str] = ""
    circumstances: Optional[str] = ""
    dental_record_json: Optional[str] = "{}"
    dna_str_profile_json: Optional[str] = "{}"
    has_fingerprint_record: bool = False
    reporting_police_station: Optional[str] = "Central Police Station"
    contact_person: Optional[str] = ""
    contact_phone: Optional[str] = ""

@router.get("/statistics")
def get_forensic_statistics(db: Session = Depends(get_db)):
    total_uids = db.query(func.count(UnidentifiedBody.id)).scalar() or 0
    total_mps = db.query(func.count(MissingPerson.id)).scalar() or 0
    water_cases = db.query(func.count(UnidentifiedBody.id)).filter(UnidentifiedBody.water_body_type != "None").scalar() or 0
    total_matches = db.query(func.count(ForensicMatchResult.id)).scalar() or 0
    high_leads = db.query(func.count(ForensicMatchResult.id)).filter(ForensicMatchResult.overall_score >= 80.0).scalar() or 0
    confirmed_ids = db.query(func.count(ForensicMatchResult.id)).filter(ForensicMatchResult.status == "Confirmed Match").scalar() or 0
    
    # Immersion stage breakdown
    immersion_counts = {}
    uids = db.query(UnidentifiedBody.immersion_stage).all()
    for (stage,) in uids:
        stage_key = stage.split("&")[0].split(",")[0].strip() if stage else "Unknown"
        immersion_counts[stage_key] = immersion_counts.get(stage_key, 0) + 1

    return {
        "total_unidentified_deceased": total_uids,
        "total_missing_persons": total_mps,
        "water_immersion_cases": water_cases,
        "total_evaluated_matches": total_matches,
        "high_confidence_leads": high_leads,
        "confirmed_identifications": confirmed_ids,
        "immersion_distribution": immersion_counts,
        "system_status": "Online - AI Engine v2.4 Active"
    }

# ----------------- UNIDENTIFIED BODIES (UID) -----------------

@router.get("/uid")
def list_uid_cases(
    search: Optional[str] = None,
    water_only: Optional[bool] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(UnidentifiedBody)
    if search:
        query = query.filter(
            or_(
                UnidentifiedBody.case_number.ilike(f"%{search}%"),
                UnidentifiedBody.title.ilike(f"%{search}%"),
                UnidentifiedBody.recovery_location_name.ilike(f"%{search}%"),
                UnidentifiedBody.distinguishing_marks.ilike(f"%{search}%")
            )
        )
    if water_only:
        query = query.filter(UnidentifiedBody.water_body_type != "None")
    if status_filter:
        query = query.filter(UnidentifiedBody.status == status_filter)
        
    cases = query.order_by(UnidentifiedBody.id.desc()).all()
    return cases

@router.get("/uid/{case_id}")
def get_uid_case(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(UnidentifiedBody).filter(UnidentifiedBody.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Forensic UID case record not found.")
    
    # Get associated evidence
    evidence = db.query(EvidenceItem).filter(EvidenceItem.case_type == "UID", EvidenceItem.case_id == case.id).all()
    
    # Get existing evaluated matches
    matches = db.query(ForensicMatchResult).filter(ForensicMatchResult.uid_id == case.id).order_by(ForensicMatchResult.overall_score.desc()).all()
    
    formatted_matches = []
    for m in matches:
        mp = db.query(MissingPerson).filter(MissingPerson.id == m.mp_id).first()
        formatted_matches.append({
            "match_id": m.id,
            "mp_id": m.mp_id,
            "mp_case_number": mp.case_number if mp else "Unknown",
            "mp_name": mp.full_name if mp else "Unknown",
            "mp_disappearance_date": mp.disappearance_date if mp else "",
            "mp_age": mp.age if mp else None,
            "mp_sex": mp.biological_sex if mp else "",
            "overall_score": m.overall_score,
            "confidence_level": m.confidence_level,
            "status": m.status,
            "dna_score": m.dna_score,
            "dental_score": m.dental_score,
            "physical_score": m.physical_score,
            "distinctive_score": m.distinctive_score,
            "temporal_geo_score": m.temporal_geo_score
        })

    log_audit_event(
        db, current_user, "VIEW_UID_CASE",
        resource_type="UID_CASE", resource_id=case.case_number,
        details=f"Viewed case details for {case.case_number}"
    )

    return {
        "case": case,
        "evidence": evidence,
        "evaluated_matches": formatted_matches
    }

@router.post("/uid")
def create_uid_case(req: UIDCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Auto-generate case number
    year = datetime.datetime.utcnow().year
    count = db.query(func.count(UnidentifiedBody.id)).scalar() or 0
    case_num = f"UID-{year}-W{100 + count + 1}"

    new_uid = UnidentifiedBody(
        case_number=case_num,
        title=req.title,
        recovery_date=req.recovery_date,
        recovery_location_name=req.recovery_location_name,
        recovery_lat=req.recovery_lat,
        recovery_lng=req.recovery_lng,
        water_body_type=req.water_body_type,
        water_temperature_celsius=req.water_temperature_celsius,
        immersion_stage=req.immersion_stage,
        estimated_pmi_min_days=req.estimated_pmi_min_days,
        estimated_pmi_max_days=req.estimated_pmi_max_days,
        biological_sex=req.biological_sex,
        estimated_age_min=req.estimated_age_min,
        estimated_age_max=req.estimated_age_max,
        estimated_height_min=req.estimated_height_min,
        estimated_height_max=req.estimated_height_max,
        blood_group=req.blood_group,
        distinguishing_marks=req.distinguishing_marks,
        clothing_effects=req.clothing_effects,
        dental_record_json=req.dental_record_json,
        dna_str_profile_json=req.dna_str_profile_json,
        fingerprint_status=req.fingerprint_status,
        fingerprint_minutiae_score=req.fingerprint_minutiae_score,
        condition_notes=req.condition_notes,
        assigned_pathologist=req.assigned_pathologist or current_user.full_name,
        status="Open"
    )
    db.add(new_uid)
    db.commit()
    db.refresh(new_uid)

    log_audit_event(
        db, current_user, "CREATE_UID_CASE",
        resource_type="UID_CASE", resource_id=new_uid.case_number,
        details=f"Created new UID case: {new_uid.title}"
    )

    return new_uid

# ----------------- MISSING PERSONS (MP) -----------------

@router.get("/mp")
def list_mp_records(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MissingPerson)
    if search:
        query = query.filter(
            or_(
                MissingPerson.case_number.ilike(f"%{search}%"),
                MissingPerson.full_name.ilike(f"%{search}%"),
                MissingPerson.last_seen_location.ilike(f"%{search}%"),
                MissingPerson.distinguishing_marks.ilike(f"%{search}%")
            )
        )
    if status_filter:
        query = query.filter(MissingPerson.status == status_filter)
        
    records = query.order_by(MissingPerson.id.desc()).all()
    return records

@router.get("/mp/{mp_id}")
def get_mp_record(mp_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mp = db.query(MissingPerson).filter(MissingPerson.id == mp_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Missing person registry record not found.")

    evidence = db.query(EvidenceItem).filter(EvidenceItem.case_type == "MP", EvidenceItem.case_id == mp.id).all()
    
    log_audit_event(
        db, current_user, "VIEW_MP_RECORD",
        resource_type="MP_RECORD", resource_id=mp.case_number,
        details=f"Viewed missing person dossier: {mp.full_name} ({mp.case_number})"
    )

    return {
        "record": mp,
        "evidence": evidence
    }

@router.post("/mp")
def create_mp_record(req: MPCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    year = datetime.datetime.utcnow().year
    count = db.query(func.count(MissingPerson.id)).scalar() or 0
    case_num = f"MP-{year}-{100 + count + 1:04d}"

    new_mp = MissingPerson(
        case_number=case_num,
        full_name=req.full_name,
        reported_date=req.reported_date,
        disappearance_date=req.disappearance_date,
        last_seen_location=req.last_seen_location,
        last_seen_lat=req.last_seen_lat,
        last_seen_lng=req.last_seen_lng,
        age=req.age,
        biological_sex=req.biological_sex,
        height=req.height,
        blood_group=req.blood_group,
        distinguishing_marks=req.distinguishing_marks,
        clothing_last_seen=req.clothing_last_seen,
        circumstances=req.circumstances,
        dental_record_json=req.dental_record_json,
        dna_str_profile_json=req.dna_str_profile_json,
        has_fingerprint_record=req.has_fingerprint_record,
        reporting_police_station=req.reporting_police_station,
        contact_person=req.contact_person,
        contact_phone=req.contact_phone,
        status="Active Missing"
    )
    db.add(new_mp)
    db.commit()
    db.refresh(new_mp)

    log_audit_event(
        db, current_user, "CREATE_MP_RECORD",
        resource_type="MP_RECORD", resource_id=new_mp.case_number,
        details=f"Registered missing person: {new_mp.full_name}"
    )

    return new_mp
