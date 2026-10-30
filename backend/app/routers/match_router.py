import json
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import UnidentifiedBody, MissingPerson, ForensicMatchResult, EvidenceItem, User
from ..auth import get_current_user, log_audit_event
from ..matching_engine import evaluate_match_pair

router = APIRouter(prefix="/api/matches", tags=["Forensic AI Matching & Explainability"])

class ReviewActionRequest(BaseModel):
    action: str  # "Confirmed Match", "Rejected Match", "Inconclusive / Request DNA Confirmation"
    review_notes: str

@router.post("/run/{uid_id}")
def run_matching_engine_for_case(uid_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    uid = db.query(UnidentifiedBody).filter(UnidentifiedBody.id == uid_id).first()
    if not uid:
        raise HTTPException(status_code=404, detail="UID case not found.")
        
    mps = db.query(MissingPerson).filter(MissingPerson.status.in_(["Active Missing", "Reported"])).all()
    if not mps:
        return {"message": "No active missing person records to evaluate against.", "matches_evaluated": 0}
        
    evaluated_results = []
    
    for mp in mps:
        res = evaluate_match_pair(uid, mp)
        
        # Check if record already exists
        existing = db.query(ForensicMatchResult).filter(
            ForensicMatchResult.uid_id == uid.id,
            ForensicMatchResult.mp_id == mp.id
        ).first()
        
        if existing:
            existing.overall_score = res["overall_score"]
            existing.confidence_level = res["confidence_level"]
            existing.dna_score = res["dna_score"]
            existing.dental_score = res["dental_score"]
            existing.physical_score = res["physical_score"]
            existing.distinctive_score = res["distinctive_score"]
            existing.temporal_geo_score = res["temporal_geo_score"]
            existing.fingerprint_score = res["fingerprint_score"]
            existing.weights_used_json = res["weights_used_json"]
            existing.explanation_json = res["explanation_json"]
            match_rec = existing
        else:
            match_rec = ForensicMatchResult(
                uid_id=uid.id,
                mp_id=mp.id,
                overall_score=res["overall_score"],
                confidence_level=res["confidence_level"],
                dna_score=res["dna_score"],
                dental_score=res["dental_score"],
                physical_score=res["physical_score"],
                distinctive_score=res["distinctive_score"],
                temporal_geo_score=res["temporal_geo_score"],
                fingerprint_score=res["fingerprint_score"],
                weights_used_json=res["weights_used_json"],
                explanation_json=res["explanation_json"],
                status="Pending Review"
            )
            db.add(match_rec)
            
        evaluated_results.append({
            "mp_id": mp.id,
            "mp_case_number": mp.case_number,
            "mp_name": mp.full_name,
            "overall_score": res["overall_score"],
            "confidence_level": res["confidence_level"]
        })
        
    # Update UID case status if high confidence lead exists
    has_high_lead = any(r["overall_score"] >= 80.0 for r in evaluated_results)
    if has_high_lead and uid.status == "Open":
        uid.status = "Potential Match Review"
        
    db.commit()
    
    log_audit_event(
        db, current_user, "MATCH_ENGINE_RUN",
        resource_type="MATCH_ENGINE", resource_id=uid.case_number,
        details=f"Evaluated {len(mps)} missing persons against {uid.case_number}. Found {sum(1 for r in evaluated_results if r['overall_score'] >= 80.0)} high leads."
    )
    
    evaluated_results.sort(key=lambda x: x["overall_score"], reverse=True)
    return {
        "case_number": uid.case_number,
        "matches_evaluated": len(mps),
        "top_matches": evaluated_results
    }

@router.get("")
def list_all_matches(
    confidence: Optional[str] = None,
    status_filter: Optional[str] = None,
    min_score: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ForensicMatchResult)
    if confidence:
        query = query.filter(ForensicMatchResult.confidence_level == confidence)
    if status_filter:
        query = query.filter(ForensicMatchResult.status == status_filter)
    if min_score:
        query = query.filter(ForensicMatchResult.overall_score >= min_score)
        
    results = query.order_by(ForensicMatchResult.overall_score.desc()).all()
    
    out = []
    for r in results:
        uid = db.query(UnidentifiedBody).filter(UnidentifiedBody.id == r.uid_id).first()
        mp = db.query(MissingPerson).filter(MissingPerson.id == r.mp_id).first()
        
        explanation = {}
        try:
            explanation = json.loads(r.explanation_json)
        except Exception:
            pass

        out.append({
            "id": r.id,
            "uid_id": r.uid_id,
            "uid_case_number": uid.case_number if uid else "Deleted",
            "uid_title": uid.title if uid else "",
            "uid_water_body": uid.water_body_type if uid else "None",
            "uid_immersion": uid.immersion_stage if uid else "",
            "mp_id": r.mp_id,
            "mp_case_number": mp.case_number if mp else "Deleted",
            "mp_name": mp.full_name if mp else "Unknown",
            "mp_age": mp.age if mp else None,
            "mp_sex": mp.biological_sex if mp else "",
            "overall_score": r.overall_score,
            "confidence_level": r.confidence_level,
            "dna_score": r.dna_score,
            "dental_score": r.dental_score,
            "physical_score": r.physical_score,
            "distinctive_score": r.distinctive_score,
            "temporal_geo_score": r.temporal_geo_score,
            "fingerprint_score": r.fingerprint_score,
            "status": r.status,
            "reviewed_by": r.reviewed_by,
            "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
            "review_notes": r.review_notes,
            "explanation_summary": explanation.get("summary", ""),
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return out

@router.get("/{match_id}")
def get_match_detail(match_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    match = db.query(ForensicMatchResult).filter(ForensicMatchResult.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match record not found.")
        
    uid = db.query(UnidentifiedBody).filter(UnidentifiedBody.id == match.uid_id).first()
    mp = db.query(MissingPerson).filter(MissingPerson.id == match.mp_id).first()
    
    explanation = json.loads(match.explanation_json) if match.explanation_json else {}
    weights = json.loads(match.weights_used_json) if match.weights_used_json else {}
    
    # Parse dental records for side-by-side odontogram
    uid_dental = json.loads(uid.dental_record_json) if uid and uid.dental_record_json else {}
    mp_dental = json.loads(mp.dental_record_json) if mp and mp.dental_record_json else {}
    
    # Parse DNA STR markers
    uid_dna = json.loads(uid.dna_str_profile_json) if uid and uid.dna_str_profile_json else {}
    mp_dna = json.loads(mp.dna_str_profile_json) if mp and mp.dna_str_profile_json else {}

    return {
        "match": {
            "id": match.id,
            "overall_score": match.overall_score,
            "confidence_level": match.confidence_level,
            "dna_score": match.dna_score,
            "dental_score": match.dental_score,
            "physical_score": match.physical_score,
            "distinctive_score": match.distinctive_score,
            "temporal_geo_score": match.temporal_geo_score,
            "fingerprint_score": match.fingerprint_score,
            "status": match.status,
            "reviewed_by": match.reviewed_by,
            "reviewed_at": match.reviewed_at.isoformat() if match.reviewed_at else None,
            "review_notes": match.review_notes,
            "weights_used": weights,
            "explanation": explanation
        },
        "uid_case": uid,
        "mp_record": mp,
        "dental_comparison": {
            "uid": uid_dental,
            "mp": mp_dental
        },
        "dna_comparison": {
            "uid": uid_dna,
            "mp": mp_dna
        }
    }

@router.post("/{match_id}/review")
def review_match(
    match_id: int,
    req: ReviewActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(ForensicMatchResult).filter(ForensicMatchResult.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match record not found.")
        
    match.status = req.action
    match.reviewed_by = f"{current_user.full_name} ({current_user.role})"
    match.reviewed_at = datetime.datetime.utcnow()
    match.review_notes = req.review_notes
    
    uid = db.query(UnidentifiedBody).filter(UnidentifiedBody.id == match.uid_id).first()
    mp = db.query(MissingPerson).filter(MissingPerson.id == match.mp_id).first()
    
    if req.action == "Confirmed Match":
        if uid:
            uid.status = "Confirmed Identification"
        if mp:
            mp.status = "Matched"
    elif req.action == "Rejected Match":
        if uid and uid.status == "Potential Match Review":
            # Check if other pending matches exist
            other_high = db.query(ForensicMatchResult).filter(
                ForensicMatchResult.uid_id == uid.id,
                ForensicMatchResult.id != match.id,
                ForensicMatchResult.overall_score >= 80.0,
                ForensicMatchResult.status != "Rejected Match"
            ).first()
            if not other_high:
                uid.status = "Under Investigation"
                
    db.commit()
    
    log_audit_event(
        db, current_user, "VERIFY_MATCH_DECISION",
        resource_type="MATCH_RECORD", resource_id=str(match.id),
        details=f"Review decision '{req.action}' submitted by {current_user.full_name}. Notes: {req.notes if hasattr(req, 'notes') else req.review_notes}"
    )

    return {
        "message": f"Match status updated to {req.action}.",
        "match_id": match.id,
        "status": match.status,
        "reviewed_by": match.reviewed_by
    }

@router.get("/{match_id}/dossier")
def generate_forensic_dossier(match_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Generates a structured forensic report dossier ready for printing or court submission.
    """
    match = db.query(ForensicMatchResult).filter(ForensicMatchResult.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match record not found.")
        
    uid = db.query(UnidentifiedBody).filter(UnidentifiedBody.id == match.uid_id).first()
    mp = db.query(MissingPerson).filter(MissingPerson.id == match.mp_id).first()
    explanation = json.loads(match.explanation_json) if match.explanation_json else {}

    log_audit_event(
        db, current_user, "EXPORT_FORENSIC_DOSSIER",
        resource_type="REPORT", resource_id=f"DOSSIER-{match.id}",
        details=f"Generated official identification dossier for {uid.case_number} vs {mp.case_number}"
    )

    return {
        "report_id": f"NYAYA-DOSSIER-{match.id:06d}",
        "generated_at": datetime.datetime.utcnow().strftime("%d-%b-%Y %H:%M UTC"),
        "authorizing_officer": {
            "name": current_user.full_name,
            "role": current_user.role,
            "badge": current_user.badge_number,
            "department": current_user.department
        },
        "legal_statutory_disclaimer": "This document is generated by the NyayaAI Forensic Decision Support System. Under statutory forensic protocols and evidence acts, algorithmic matching scores serve as investigative guidance to direct laboratory verification (STR electopherogram review, comparative odontogram charting, and judicial inquest). It does not substitute certified forensic expert deposition in a court of law.",
        "case_overview": {
            "uid_case_number": uid.case_number,
            "uid_title": uid.title,
            "recovery_date": uid.recovery_date,
            "recovery_site": uid.recovery_location_name,
            "immersion_stage": uid.immersion_stage,
            "water_body": uid.water_body_type,
            "estimated_pmi": f"{uid.estimated_pmi_min_days} to {uid.estimated_pmi_max_days} days"
        },
        "missing_person_profile": {
            "mp_case_number": mp.case_number,
            "full_name": mp.full_name,
            "disappearance_date": mp.disappearance_date,
            "last_seen": mp.last_seen_location,
            "reported_age": mp.age,
            "reported_stature": f"{mp.height} cm",
            "reporting_station": mp.reporting_police_station,
            "family_contact": f"{mp.contact_person} ({mp.contact_phone})"
        },
        "scoring_summary": {
            "overall_score": f"{match.overall_score}%",
            "confidence_level": match.confidence_level,
            "dna_score": f"{match.dna_score}%",
            "dental_score": f"{match.dental_score}%",
            "physical_score": f"{match.physical_score}%",
            "distinctive_score": f"{match.distinctive_score}%",
            "temporal_geo_score": f"{match.temporal_geo_score}%",
            "fingerprint_evaluation": f"{match.fingerprint_score}%" if match.fingerprint_score else "Maceration Bypass (Automated dynamic reweighting applied)"
        },
        "explainable_findings": explanation,
        "verification_status": {
            "status": match.status,
            "reviewed_by": match.reviewed_by or "Pending Inquest Review",
            "reviewed_at": match.reviewed_at.strftime("%d-%b-%Y %H:%M") if match.reviewed_at else "Pending",
            "review_notes": match.review_notes or "Awaiting judicial inquest sign-off"
        }
    }
