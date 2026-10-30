import json
import hashlib
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import EvidenceItem, User
from ..auth import get_current_user, log_audit_event

router = APIRouter(prefix="/api/evidence", tags=["Tamper-Evident Evidence Vault"])

class EvidenceCreateRequest(BaseModel):
    case_type: str  # "UID" or "MP"
    case_id: int
    item_title: str
    category: str  # "DNA Profile", "Dental OPG", "Autopsy Photo", "Personal Artifact", "Fingerprint Lift"
    file_name: Optional[str] = "forensic_exhibit.dat"
    file_content_simulated: Optional[str] = "Forensic artifact certified authentic"

class CustodyTransferRequest(BaseModel):
    transfer_to_officer: str
    purpose: str
    transfer_location: str

@router.get("")
def list_evidence(
    case_type: Optional[str] = None,
    case_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(EvidenceItem)
    if case_type:
        query = query.filter(EvidenceItem.case_type == case_type)
    if case_id:
        query = query.filter(EvidenceItem.case_id == case_id)
    if category:
        query = query.filter(EvidenceItem.category == category)
        
    items = query.order_by(EvidenceItem.id.desc()).all()
    out = []
    for item in items:
        custody_log = []
        if item.chain_of_custody_log_json:
            try:
                custody_log = json.loads(item.chain_of_custody_log_json)
            except Exception:
                pass
        out.append({
            "id": item.id,
            "case_type": item.case_type,
            "case_id": item.case_id,
            "item_title": item.item_title,
            "category": item.category,
            "file_hash": item.file_hash,
            "file_size_bytes": item.file_size_bytes,
            "chain_of_custody": custody_log,
            "uploaded_by": item.uploaded_by,
            "created_at": item.created_at.strftime("%Y-%m-%d %H:%M UTC") if item.created_at else None
        })
    return out

@router.post("")
def add_evidence_item(req: EvidenceCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    content_bytes = (req.file_content_simulated or req.item_title).encode('utf-8')
    computed_hash = hashlib.sha256(content_bytes).hexdigest()
    
    initial_custody = [
        {
            "officer": f"{current_user.full_name} ({current_user.role})",
            "action": f"Evidence logged into digital vault ({req.category})",
            "location": current_user.department,
            "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }
    ]

    item = EvidenceItem(
        case_type=req.case_type,
        case_id=req.case_id,
        item_title=req.item_title,
        category=req.category,
        file_path=f"/vault/{req.case_type}_{req.case_id}_{req.file_name}",
        file_hash=computed_hash,
        file_size_bytes=len(content_bytes) + 1024 * 45,
        chain_of_custody_log_json=json.dumps(initial_custody),
        uploaded_by=f"{current_user.full_name} ({current_user.role})"
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    log_audit_event(
        db, current_user, "UPLOAD_EVIDENCE",
        resource_type="EVIDENCE", resource_id=str(item.id),
        details=f"Uploaded evidence '{item.item_title}' for {req.case_type} #{req.case_id}. SHA-256: {computed_hash[:16]}..."
    )

    return {
        "message": "Evidence secured with SHA-256 tamper-evident digital seal.",
        "item_id": item.id,
        "file_hash": computed_hash
    }

@router.post("/{item_id}/custody")
def transfer_custody(item_id: int, req: CustodyTransferRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(EvidenceItem).filter(EvidenceItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Evidence artifact not found.")

    custody_log = []
    if item.chain_of_custody_log_json:
        try:
            custody_log = json.loads(item.chain_of_custody_log_json)
        except Exception:
            custody_log = []

    new_entry = {
        "officer": f"{current_user.full_name} -> {req.transfer_to_officer}",
        "action": f"Custody transferred for: {req.purpose}",
        "location": req.transfer_location,
        "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }
    custody_log.append(new_entry)
    item.chain_of_custody_log_json = json.dumps(custody_log)
    db.commit()

    log_audit_event(
        db, current_user, "CHAIN_OF_CUSTODY_TRANSFER",
        resource_type="EVIDENCE", resource_id=str(item.id),
        details=f"Transferred evidence #{item.id} to {req.transfer_to_officer} ({req.purpose})"
    )

    return {"message": "Custody transfer logged in immutable audit ledger.", "chain_of_custody": custody_log}
