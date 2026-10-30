from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AuditLog, User
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/audit", tags=["Forensic Security & Audit Trail"])

@router.get("")
def get_audit_trail(
    action: Optional[str] = None,
    user_email: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if user_email:
        query = query.filter(AuditLog.user_email.ilike(f"%{user_email}%"))
        
    logs = query.order_by(AuditLog.id.desc()).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_email": log.user_email,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if log.timestamp else None
        }
        for log in logs
    ]
