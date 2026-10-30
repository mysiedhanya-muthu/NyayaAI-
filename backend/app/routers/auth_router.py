import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, UserRole
from ..auth import hash_password, verify_password, create_access_token, get_current_user, log_audit_event

router = APIRouter(prefix="/api/auth", tags=["Authentication & Access Control"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = UserRole.LEAD_INVESTIGATOR
    badge_number: str = ""
    department: str = "Forensic Bureau"

class PasswordResetRequest(BaseModel):
    email: str

class ResetConfirmRequest(BaseModel):
    token: str
    new_password: str

@router.post("/login")
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        log_audit_event(
            db, None, "FAILED_LOGIN_ATTEMPT",
            resource_type="USER", resource_id=creds.email,
            details=f"Failed login attempt for {creds.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your forensic authorization email and password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended by Forensic Directorate Administrator."
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "name": user.full_name})
    
    log_audit_event(
        db, user, "USER_LOGIN",
        resource_type="AUTH", resource_id=str(user.id),
        details=f"Successful authentication for {user.full_name} ({user.role})"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "badge_number": user.badge_number,
            "department": user.department,
            "is_verified": user.is_verified
        }
    }

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An officer with this email is already registered.")

    new_user = User(
        email=req.email,
        full_name=req.full_name,
        role=req.role,
        badge_number=req.badge_number,
        department=req.department,
        hashed_password=hash_password(req.password),
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_audit_event(
        db, new_user, "USER_REGISTERED",
        resource_type="USER", resource_id=str(new_user.id),
        details=f"New personnel registered: {new_user.full_name} ({new_user.role})"
    )

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "name": new_user.full_name})
    return {
        "message": "Personnel registered successfully.",
        "access_token": access_token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
            "badge_number": new_user.badge_number,
            "department": new_user.department
        }
    }

@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "badge_number": current_user.badge_number,
        "department": current_user.department,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified
    }

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Prevent user enumeration
        return {"message": "If this email is recognized in the forensic registry, a reset authorization token has been dispatched."}
    
    log_audit_event(
        db, user, "PASSWORD_RESET_REQUESTED",
        resource_type="USER", resource_id=str(user.id),
        details=f"Password reset token requested for {user.email}"
    )
    return {
        "message": "Reset authorization token dispatched to official email.",
        "demo_reset_token": f"RESET-{user.id}-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M')}"
    }

@router.post("/reset-password")
def reset_password(req: ResetConfirmRequest, db: Session = Depends(get_db)):
    if not req.token.startswith("RESET-"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    try:
        parts = req.token.split("-")
        user_id = int(parts[1])
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        user.hashed_password = hash_password(req.new_password)
        db.commit()
        log_audit_event(
            db, user, "PASSWORD_RESET_COMPLETED",
            resource_type="USER", resource_id=str(user.id),
            details=f"Password reset completed for {user.email}"
        )
        return {"message": "Password updated successfully. You may now log in with your new credentials."}
    except Exception:
        raise HTTPException(status_code=400, detail="Token verification failed.")

@router.get("/demo-accounts")
def get_demo_accounts():
    """Provides quick test credentials for client evaluations and demonstrations."""
    return [
        {
            "role": "Lead Investigator",
            "name": "Insp. Vikram Singh",
            "email": "investigator@nyaya.ai",
            "password": "Investigate@123",
            "badge": "INV-ND-8491",
            "desc": "Full permissions to register cases, run AI matching, and review cases."
        },
        {
            "role": "Forensic Pathologist",
            "name": "Dr. Ananya Roy, MD",
            "email": "pathologist@nyaya.ai",
            "password": "Forensic@123",
            "badge": "MED-FP-209",
            "desc": "Expert reviewer for autopsy evidence, DNA loci, and water immersion PMI."
        },
        {
            "role": "Forensic Odontologist",
            "name": "Dr. Suresh Kumar, MDS",
            "email": "odontologist@nyaya.ai",
            "password": "Odonto@123",
            "badge": "DEN-OD-441",
            "desc": "Specialist for 32-tooth odontogram comparison and dental radiograph audit."
        },
        {
            "role": "System Administrator",
            "name": "Devansh Nambiar",
            "email": "admin@nyaya.ai",
            "password": "Admin@123",
            "badge": "SYS-ADM-001",
            "desc": "System-wide audit trail inspection, user management, and configuration."
        }
    ]
