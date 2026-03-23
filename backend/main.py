from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Float, Boolean, Text, ForeignKey, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
import pandas as pd
import numpy as np
import os
import json
from enum import Enum
import bcrypt
import traceback
import logging
import socket

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== CONFIGURATION ====================

# Get local IP address for network access
def get_local_ip():
    try:
        # Create a socket connection to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

LOCAL_IP = get_local_ip()
HOST = "0.0.0.0"  # Listen on all network interfaces
PORT = 8000

# Create config directory if it doesn't exist
os.makedirs("config", exist_ok=True)

config_file = "config/database.json"
if not os.path.exists(config_file):
    default_config = {
        "database": {
            "username": "postgres",
            "password": "postgres",
            "host": "localhost",
            "port": "5432",
            "database": "radet_db"
        }
    }
    with open(config_file, "w") as f:
        json.dump(default_config, f, indent=4)

with open(config_file) as f:
    config = json.load(f)

db_config = config["database"]

# Database setup
try:
    DATABASE_URL = f"postgresql://{db_config['username']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        pass
    logger.info("✅ Connected to PostgreSQL database")
except Exception as e:
    logger.warning(f"⚠️ PostgreSQL connection failed: {e}")
    logger.info("✅ Falling back to SQLite database")
    DATABASE_URL = "sqlite:///./radet.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==================== FASTAPI APP ====================

app = FastAPI(
    title="RADET Validation System",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
# ==================== ENUMS ====================

class UserRole(str, Enum):
    STAFF = "staff"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"

class ValidationStatus(str, Enum):
    MATCH = "MATCH"
    MISMATCH = "MISMATCH"
    MISSING_IN_RADET = "MISSING_IN_RADET"
    MISSING_IN_CARD = "MISSING_IN_CARD"
    LOGICAL_ERROR = "LOGICAL_ERROR"
    UPDATED_RECORD = "UPDATED_RECORD"

class EventType(str, Enum):
    DRUG_PICKUP = "drug_pickup"
    VL_SAMPLE = "vl_sample"
    VL_RESULT = "vl_result"
    CLINIC_VISIT = "clinic_visit"

class CorrectionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# ==================== DATABASE MODELS ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False)
    facility = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    validations = relationship("ValidationResult", back_populates="user", foreign_keys="ValidationResult.user_id")
    requested_corrections = relationship(
        "CorrectionLog",
        foreign_keys="CorrectionLog.user_id",
        back_populates="user"
    )
    reviewed_corrections = relationship(
        "CorrectionLog",
        foreign_keys="CorrectionLog.supervisor_id",
        back_populates="supervisor"
    )

class ValidationCycle(Base):
    __tablename__ = "validation_cycles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    radet_records = relationship("RADETRecord", back_populates="cycle", cascade="all, delete-orphan")
    validations = relationship("ValidationResult", back_populates="cycle", cascade="all, delete-orphan")

class RADETRecord(Base):
    __tablename__ = "radet_records"
    
    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("validation_cycles.id", ondelete="CASCADE"), nullable=False)
    hospital_number = Column(String(100), index=True, nullable=False)
    
    # Demographics
    date_of_birth = Column(DateTime, nullable=True)
    sex = Column(String(1), nullable=True)
    
    # Clinical
    art_start_date = Column(DateTime, nullable=True)
    current_regimen = Column(String(100), nullable=True)
    
    # Latest events
    last_drug_pickup = Column(DateTime, nullable=True)
    months_of_arv_dispensed = Column(Integer, nullable=True)
    last_vl_sample_date = Column(DateTime, nullable=True)
    last_vl_result = Column(Float, nullable=True)
    last_vl_result_date = Column(DateTime, nullable=True)
    last_clinic_visit = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_on_art = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cycle = relationship("ValidationCycle", back_populates="radet_records")
    events = relationship("ClinicalEvent", back_populates="patient", cascade="all, delete-orphan")
    validations = relationship("ValidationResult", back_populates="radet_record", cascade="all, delete-orphan")
    corrections = relationship("CorrectionLog", back_populates="patient", cascade="all, delete-orphan")

class ClinicalEvent(Base):
    __tablename__ = "clinical_events"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("radet_records.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)
    event_date = Column(DateTime, nullable=False)
    value = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patient = relationship("RADETRecord", back_populates="events")

class ValidationResult(Base):
    __tablename__ = "validation_results"
    
    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("validation_cycles.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("radet_records.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    hospital_number = Column(String(100), index=True, nullable=False)
    field_name = Column(String(100), nullable=False)
    radet_value = Column(Text, nullable=True)
    care_card_value = Column(Text, nullable=True)
    status = Column(String(50), nullable=False)
    logical_error_type = Column(String(100), nullable=True)
    logical_error_description = Column(Text, nullable=True)
    validation_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cycle = relationship("ValidationCycle", back_populates="validations")
    user = relationship("User", back_populates="validations")
    radet_record = relationship("RADETRecord", back_populates="validations")

class CorrectionLog(Base):
    __tablename__ = "correction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("radet_records.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    supervisor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    hospital_number = Column(String(100), nullable=False)
    field_name = Column(String(100), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default=CorrectionStatus.PENDING, nullable=False)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patient = relationship("RADETRecord", back_populates="corrections")
    user = relationship("User", foreign_keys=[user_id], back_populates="requested_corrections")
    supervisor = relationship("User", foreign_keys=[supervisor_id], back_populates="reviewed_corrections")

class RADETUploadLog(Base):
    __tablename__ = "radet_upload_logs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    cycle_id = Column(Integer, ForeignKey("validation_cycles.id", ondelete="CASCADE"), nullable=False)
    records_added = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    upload_date = Column(DateTime, default=datetime.utcnow)

# Create tables (only if they don't exist)
Base.metadata.create_all(bind=engine)

# ==================== PYDANTIC MODELS ====================

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str
    facility: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    facility: str
    
    model_config = ConfigDict(from_attributes=True)

class CycleCreate(BaseModel):
    name: str
    description: str = ""

class CycleResponse(BaseModel):
    id: int
    name: str
    description: str
    start_date: datetime
    end_date: Optional[datetime]
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)

class CareCardData(BaseModel):
    hospital_number: str
    date_of_birth: Optional[str] = None
    sex: Optional[str] = None
    art_start_date: Optional[str] = None
    current_regimen: Optional[str] = None
    last_drug_pickup: Optional[str] = None
    months_of_arv_dispensed: Optional[int] = None
    last_vl_sample_date: Optional[str] = None
    last_vl_result: Optional[float] = None
    last_vl_result_date: Optional[str] = None
    last_clinic_visit: Optional[str] = None

class ValidationResponse(BaseModel):
    hospital_number: str
    field_name: str
    radet_value: Optional[str]
    care_card_value: Optional[str]
    status: str
    logical_error: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class CorrectionRequest(BaseModel):
    hospital_number: str
    field_name: str
    new_value: str
    reason: str

class CorrectionReview(BaseModel):
    correction_id: int
    approved: bool
    comments: Optional[str] = None

class CorrectionResponse(BaseModel):
    id: int
    hospital_number: str
    field_name: str
    old_value: Optional[str]
    new_value: str
    reason: str
    status: str
    requested_by_name: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PendingReviewItem(BaseModel):
    id: int
    field: str
    radet_value: Optional[str]
    care_card_value: Optional[str]
    status: str
    logical_error: Optional[str]

class PendingReviewResponse(BaseModel):
    hospital_number: str
    patient_name: str
    mismatches: List[PendingReviewItem]
    priority: str
    validator: Optional[str]
    validation_date: Optional[datetime]

class DashboardStatsResponse(BaseModel):
    total_clients: int
    validated_clients: int
    remaining: int
    mismatches: int
    progress_percentage: float

class StaffPerformanceResponse(BaseModel):
    user_id: int
    user_name: str
    patients_validated: int
    total_validations: int
    mismatches_found: int
    logical_errors_found: int
    accuracy_rate: float

class QualityMetricsResponse(BaseModel):
    overall_accuracy: float
    total_validations: int
    status_breakdown: Dict[str, int]
    top_error_fields: List[tuple]
    treatment_interruption_risk: int
    missing_vl_results: int
    total_patients: int
    average_months_dispensed: Optional[float]
    dispensing_patterns: Dict[str, int]

class TrendDataResponse(BaseModel):
    cycle_id: int
    cycle_name: str
    date: str
    accuracy: float
    total_validations: int

class TreatmentInterruptionResponse(BaseModel):
    hospital_number: str
    last_pickup_date: Optional[str]
    days_since_pickup: Optional[int]
    risk_level: str
    months_of_arv_dispensed: Optional[int]

class ArvDispensingPatternsResponse(BaseModel):
    dispensing_patterns: Dict[str, int]
    average_months_dispensed: float
    total_patients_with_data: int
    recommendations: Dict[str, Any]

# ==================== NEW MODELS ====================

class FailedFieldDetail(BaseModel):
    field_name: str
    status: str
    radet_value: Optional[str]
    care_card_value: Optional[str]
    logical_error: Optional[str]

class HospitalNumberValidationSummary(BaseModel):
    hospital_number: str
    total_checks: int
    passed_checks: int
    failed_checks: int
    score_percentage: float
    classification: str
    color_code: str
    failed_fields: List[FailedFieldDetail]
    validation_status: str

class HospitalNumberDetailResponse(BaseModel):
    hospital_number: str
    validations: List[Dict[str, Any]]
    summary: HospitalNumberValidationSummary
    
    model_config = ConfigDict(from_attributes=True)

class DataQualityIndexResponse(BaseModel):
    facility_name: str
    facility_code: str
    total_patients_validated: int
    total_expected_checks: int
    total_passed_checks: int
    dqi_score: float
    classification_breakdown: Dict[str, int]
    color_code: str

class FacilityRankingResponse(BaseModel):
    facilities: List[DataQualityIndexResponse]
    overall_dqi: float
    total_facilities: int

class ValidationStatusResponse(BaseModel):
    hasValidations: bool

class ExistingValidationResponse(BaseModel):
    hasValidations: bool
    careCardData: Dict[str, Any] = {}
    lastValidation: Optional[str] = None
    validator: Optional[str] = None

class TreatmentInterruptionsResponse(BaseModel):
    interruptions: List[Dict[str, Any]]
    total_at_risk: int
    threshold_days: int

# ==================== HELPER FUNCTIONS ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    if isinstance(password, str):
        password = password.encode('utf-8')
    if len(password) > 72:
        password = password[:72]
    return bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    if isinstance(password, str):
        password = password.encode('utf-8')
    if isinstance(hashed, str):
        hashed = hashed.encode('utf-8')
    return bcrypt.checkpw(password, hashed)

def parse_date(value: Any) -> Optional[datetime]:
    """Convert various date formats to datetime safely"""
    if value is None:
        return None
    
    if pd.isna(value):
        return None
    
    try:
        # Handle pandas Timestamp
        if hasattr(value, 'to_pydatetime'):
            return value.to_pydatetime()
        
        # Handle string dates
        if isinstance(value, str):
            value = value.strip()
            if not value or value.lower() in ['nan', 'nat', 'none', '']:
                return None
            
            # Try different date formats
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
                try:
                    dt = datetime.strptime(value, fmt)
                    return dt
                except ValueError:
                    continue
        
        # Handle datetime objects
        if isinstance(value, datetime):
            return value
        
        # Handle date objects
        if isinstance(value, date):
            return datetime.combine(value, datetime.min.time())
        
        # Try pandas conversion
        dt = pd.to_datetime(value, errors='coerce')
        if pd.notna(dt):
            if isinstance(dt, pd.Timestamp):
                return dt.to_pydatetime()
            return dt
            
    except Exception as e:
        logger.warning(f"Date parsing error for value {value}: {e}")
    
    return None

def normalize_string(value: Any, field_name: str = None) -> str:
    """Normalize a value to string for comparison (with regimen intelligence)"""
    
    if value is None:
        return ""
    
    if pd.isna(value):
        return ""
    
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")
    
    if isinstance(value, date):
        return value.strftime("%Y-%m-%d")
    
    if isinstance(value, (int, float)):
        return str(value)
    
    val_str = str(value).strip()
    
    if val_str.lower() in ["nan", "nat", "none", "null", ""]:
        return ""
    
    # ==================== 🔥 REGIMEN NORMALIZATION ====================
    if field_name == "current_regimen":
        val = val_str.upper().replace(" ", "")

        if val.startswith("TDF") or val.startswith("T"):
            return "TLD"

        if val.startswith("ABC"):
            return "ABC"

        if val.startswith("AZT"):
            return "AZT"

        if "LPV" in val:
            return "LPV/R"

        if "ATV" in val:
            return "ATV/R"

        return val  # fallback cleaned value
    # ================================================================

    # Remove time if string contains timestamp
    if " " in val_str and ":" in val_str:
        try:
            return val_str.split(" ")[0]
        except:
            pass
    
    return val_str


def check_logical_errors(radet_record: RADETRecord, care_card_data: CareCardData) -> List[Dict]:
    """Check for logical inconsistencies in the data"""
    errors = []
    
    # Parse dates
    dob = parse_date(care_card_data.date_of_birth)
    art_start = parse_date(care_card_data.art_start_date)
    last_pickup = parse_date(care_card_data.last_drug_pickup)
    vl_sample = parse_date(care_card_data.last_vl_sample_date)
    vl_result_date = parse_date(care_card_data.last_vl_result_date)
    
    # Rule 1: ART start date cannot be before date of birth
    if dob and art_start and art_start < dob:
        errors.append({
            "field": "art_start_date",
            "type": "LOGICAL_ERROR",
            "description": "ART start date cannot be before date of birth"
        })
    
    # Rule 2: Drug pickup cannot be before ART start
    if art_start and last_pickup and last_pickup < art_start:
        errors.append({
            "field": "last_drug_pickup",
            "type": "LOGICAL_ERROR",
            "description": "Drug pickup date cannot be before ART start date"
        })
    
    # Rule 3: Months of ARV dispensed should be reasonable (1-6 months typically)
    if care_card_data.months_of_arv_dispensed is not None:
        if care_card_data.months_of_arv_dispensed <= 0:
            errors.append({
                "field": "months_of_arv_dispensed",
                "type": "LOGICAL_ERROR",
                "description": "Months of ARV dispensed must be a positive number"
            })
        elif care_card_data.months_of_arv_dispensed > 6:
            errors.append({
                "field": "months_of_arv_dispensed",
                "type": "LOGICAL_ERROR",
                "description": "Months of ARV dispensed exceeds typical maximum (6 months)"
            })
    
    # Rule 4: VL result requires sample date
    if care_card_data.last_vl_result and not vl_sample:
        errors.append({
            "field": "last_vl_sample_date",
            "type": "LOGICAL_ERROR",
            "description": "Viral load result requires sample date"
        })
    
    # Rule 5: Result date cannot be before sample date
    if vl_sample and vl_result_date and vl_result_date < vl_sample:
        errors.append({
            "field": "last_vl_result_date",
            "type": "LOGICAL_ERROR",
            "description": "Result date cannot be before sample date"
        })
    
    # Rule 6: Patient under 15 should have pediatric indicators
    if dob:
        age = (datetime.now() - dob).days / 365.25
        if age < 15 and not care_card_data.current_regimen:
            errors.append({
                "field": "current_regimen",
                "type": "LOGICAL_ERROR",
                "description": "Pediatric patient should have regimen specified"
            })
    
    return errors

def authenticate_user(username: str, password: str, db: Session) -> Optional[User]:
    """Authenticate a user"""
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None

def get_current_user(credentials: HTTPBasicCredentials = Depends(HTTPBasic()), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    user = authenticate_user(credentials.username, credentials.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return user

def require_role(required_role: str):
    """Require a specific role for an endpoint"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role} role"
            )
        return current_user
    return role_checker

def get_validation_classification(score_percentage: float) -> tuple:
    """Returns (classification, color_code) based on score"""
    if score_percentage == 100:
        return "Perfect Match", "#10b981"  # Green
    elif score_percentage >= 80:
        return "Low Discrepancy", "#84cc16"  # Light Green
    elif score_percentage >= 60:
        return "Moderate Discrepancy", "#eab308"  # Yellow
    elif score_percentage >= 30:
        return "High Discrepancy", "#f97316"  # Orange
    else:
        return "Critical Issue", "#ef4444"  # Red

# ==================== API ROUTES ====================

@app.get("/")
async def root():
    """Root endpoint with system info"""
    return {
        "message": "RADET Validation System",
        "version": "2.0",
        "status": "running",
        "database": "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite",
        "network_access": {
            "local_url": f"http://localhost:{PORT}",
            "network_url": f"http://{LOCAL_IP}:{PORT}",
            "instructions": f"Other devices on the same network can access this app at: http://{LOCAL_IP}:{PORT}"
        },
        "timestamp": datetime.now().isoformat()
    }

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user with hashed password
    db_user = User(
        username=user.username,
        password_hash=hash_password(user.password),
        full_name=user.full_name,
        role=user.role,
        facility=user.facility
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login endpoint"""
    user = authenticate_user(credentials.username, credentials.password, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create default admin if no users exist (for first run)
    if db.query(User).count() == 0:
        admin_user = User(
            username="admin",
            password_hash=hash_password("admin"),
            full_name="System Administrator",
            role=UserRole.ADMIN,
            facility="Head Office"
        )
        db.add(admin_user)
        db.commit()
        user = admin_user
    
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "facility": user.facility
        }
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# ==================== CYCLE MANAGEMENT ENDPOINTS ====================

@app.post("/api/cycles/create")
async def create_cycle(
    cycle: CycleCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Create a new validation cycle"""
    # Deactivate other cycles
    db.query(ValidationCycle).filter(ValidationCycle.is_active == True).update({"is_active": False})
    
    new_cycle = ValidationCycle(
        name=cycle.name,
        description=cycle.description,
        is_active=True
    )
    db.add(new_cycle)
    db.commit()
    db.refresh(new_cycle)
    return {"message": "Cycle created", "cycle": new_cycle}

@app.get("/api/cycles/active")
async def get_active_cycle(db: Session = Depends(get_db)):
    """Get active validation cycle"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return {"has_active_cycle": False}
    
    total_patients = db.query(RADETRecord).filter(RADETRecord.cycle_id == cycle.id).count()
    validated_patients = db.query(ValidationResult.patient_id).filter(
        ValidationResult.cycle_id == cycle.id
    ).distinct().count()
    
    # Calculate average months dispensed for the cycle
    avg_dispensed = db.query(RADETRecord).with_entities(
        (RADETRecord.months_of_arv_dispensed).label('avg_dispensed')
    ).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.months_of_arv_dispensed.isnot(None)
    ).all()
    
    avg_dispensed_value = None
    if avg_dispensed:
        valid_months = [m[0] for m in avg_dispensed if m[0] is not None]
        if valid_months:
            avg_dispensed_value = sum(valid_months) / len(valid_months)
    
    return {
        "has_active_cycle": True,
        "id": cycle.id,
        "name": cycle.name,
        "description": cycle.description,
        "start_date": cycle.start_date.isoformat() if cycle.start_date else None,
        "stats": {
            "total_patients": total_patients,
            "validated_patients": validated_patients,
            "average_months_dispensed": round(avg_dispensed_value, 1) if avg_dispensed_value else None
        }
    }

@app.get("/api/cycles/all", response_model=List[CycleResponse])
async def get_all_cycles(db: Session = Depends(get_db)):
    """Get all validation cycles"""
    cycles = db.query(ValidationCycle).order_by(ValidationCycle.start_date.desc()).all()
    return cycles

# ==================== RADET UPLOAD ENDPOINTS ====================

@app.post("/api/radet/upload")
async def upload_radet(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Upload RADET data file (Excel or CSV)"""
    # Get active validation cycle
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active validation cycle")

    # Validate file type
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.csv')):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx) and CSV (.csv) files are allowed")

    # Read uploaded file
    try:
        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(file.file)
        else:
            df = pd.read_csv(file.file)
        
        # Clean dataframe
        df = df.replace({pd.NaT: None, pd.NA: None, np.nan: None})
        df = df.where(pd.notnull(df), None)
        
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # Standardize column names
    df.columns = [c.lower().strip().replace(" ", "_") for c in df.columns]

    # Check required columns
    if 'hospital_number' not in df.columns:
        raise HTTPException(status_code=400, detail="File must contain 'hospital_number' column")

    records_updated = 0
    records_added = 0

    for _, row in df.iterrows():
        hospital_number = str(row.get("hospital_number", "")).strip()
        if not hospital_number:
            continue

        existing = db.query(RADETRecord).filter(
            RADETRecord.cycle_id == cycle.id,
            RADETRecord.hospital_number == hospital_number
        ).first()

        # Process sex value
        sex_value = row.get("sex")
        if sex_value and isinstance(sex_value, str):
            sex_value = sex_value.strip().upper()
            if sex_value.startswith("F"):
                sex_value = "F"
            elif sex_value.startswith("M"):
                sex_value = "M"
            else:
                sex_value = None

        # Process VL result
        vl_result = row.get("last_vl_result")
        if pd.isna(vl_result):
            vl_result = None
        else:
            try:
                vl_result = float(vl_result)
            except (ValueError, TypeError):
                vl_result = None

        # Process regimen
        regimen = row.get("current_regimen")
        if regimen and isinstance(regimen, str):
            regimen = regimen.strip().upper()
        
        # Process months of ARV dispensed
        months_of_arv = row.get("months_of_arv_dispensed") or row.get("months_dispensed") or row.get("arv_months")
        if pd.isna(months_of_arv):
            months_of_arv = None
        else:
            try:
                months_of_arv = int(float(months_of_arv))
                # Ensure it's positive
                if months_of_arv <= 0:
                    months_of_arv = None
            except (ValueError, TypeError):
                months_of_arv = None

        record_data = {
            "date_of_birth": parse_date(row.get("date_of_birth")),
            "sex": sex_value,
            "art_start_date": parse_date(row.get("art_start_date")),
            "current_regimen": regimen,
            "last_drug_pickup": parse_date(row.get("last_drug_pickup")),
            "months_of_arv_dispensed": months_of_arv,
            "last_vl_sample_date": parse_date(row.get("last_vl_sample_date")),
            "last_vl_result": vl_result,
            "last_vl_result_date": parse_date(row.get("last_vl_result_date")),
            "last_clinic_visit": parse_date(row.get("last_clinic_visit")),
            "is_active": True
        }

        if existing:
            # Update existing record
            for key, value in record_data.items():
                setattr(existing, key, value)
            records_updated += 1

            # Add events safely
            if record_data["last_drug_pickup"]:
                event_date = record_data["last_drug_pickup"].date() if hasattr(record_data["last_drug_pickup"], 'date') else record_data["last_drug_pickup"]
                existing_event = db.query(ClinicalEvent).filter(
                    ClinicalEvent.patient_id == existing.id,
                    ClinicalEvent.event_type == EventType.DRUG_PICKUP,
                    ClinicalEvent.event_date == event_date
                ).first()
                if not existing_event:
                    db.add(
                        ClinicalEvent(
                            patient_id=existing.id,
                            event_type=EventType.DRUG_PICKUP,
                            event_date=event_date,
                            value=float(months_of_arv) if months_of_arv else None
                        )
                    )

            if record_data["last_vl_sample_date"]:
                event_date = record_data["last_vl_sample_date"].date() if hasattr(record_data["last_vl_sample_date"], 'date') else record_data["last_vl_sample_date"]
                existing_event = db.query(ClinicalEvent).filter(
                    ClinicalEvent.patient_id == existing.id,
                    ClinicalEvent.event_type == EventType.VL_SAMPLE,
                    ClinicalEvent.event_date == event_date
                ).first()
                if not existing_event:
                    db.add(
                        ClinicalEvent(
                            patient_id=existing.id,
                            event_type=EventType.VL_SAMPLE,
                            event_date=event_date
                        )
                    )
        else:
            # Create new patient
            record = RADETRecord(
                cycle_id=cycle.id,
                hospital_number=hospital_number,
                **record_data
            )
            db.add(record)
            db.flush()
            records_added += 1

    db.commit()

    # Log upload activity
    upload_log = RADETUploadLog(
        filename=file.filename,
        cycle_id=cycle.id,
        records_added=records_added,
        records_updated=records_updated,
        uploaded_by=current_user.id
    )
    db.add(upload_log)
    db.commit()

    return {
        "message": "RADET upload successful",
        "records_added": records_added,
        "records_updated": records_updated,
        "total_records": len(df)
    }

# ==================== CLIENT VALIDATION ENDPOINTS ====================

@app.get("/api/client/check/{hospital_number:path}")
async def check_client(
    hospital_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if client exists in current cycle"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return {"exists": False, "message": "No active cycle"}
    
    client = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.hospital_number == hospital_number,
        RADETRecord.is_active == True
    ).first()
    
    return {
        "exists": client is not None,
        "patient_id": client.id if client else None,
        "months_of_arv_dispensed": client.months_of_arv_dispensed if client else None
    }

# ==================== VALIDATION STATUS ENDPOINTS ====================

@app.get("/api/validation/status/{hospital_number}", response_model=ValidationStatusResponse)
async def check_validation_status(
    hospital_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if a patient has already been validated in the current cycle"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return ValidationStatusResponse(hasValidations=False)
    
    patient = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.hospital_number == hospital_number
    ).first()
    
    if not patient:
        return ValidationStatusResponse(hasValidations=False)
    
    existing = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id,
        ValidationResult.patient_id == patient.id
    ).first()
    
    return ValidationStatusResponse(hasValidations=existing is not None)

@app.get("/api/validation/existing/{hospital_number}", response_model=ExistingValidationResponse)
async def get_existing_validation(
    hospital_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get existing validation data for a patient"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return ExistingValidationResponse(hasValidations=False)
    
    patient = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.hospital_number == hospital_number
    ).first()
    
    if not patient:
        return ExistingValidationResponse(hasValidations=False)
    
    validations = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id,
        ValidationResult.patient_id == patient.id
    ).all()
    
    if not validations:
        return ExistingValidationResponse(hasValidations=False)
    
    # Build care card data from existing validations
    care_card_data = {}
    for v in validations:
        if v.care_card_value:
            # Handle special types
            if v.field_name in ['date_of_birth', 'art_start_date', 'last_drug_pickup', 'last_vl_sample_date', 'last_vl_result_date', 'last_clinic_visit']:
                # Keep as string for date inputs
                care_card_data[v.field_name] = v.care_card_value
            elif v.field_name in ['months_of_arv_dispensed', 'last_vl_result']:
                # Convert to appropriate number type
                try:
                    if v.field_name == 'months_of_arv_dispensed':
                        care_card_data[v.field_name] = int(float(v.care_card_value)) if v.care_card_value else None
                    else:
                        care_card_data[v.field_name] = float(v.care_card_value) if v.care_card_value else None
                except (ValueError, TypeError):
                    care_card_data[v.field_name] = v.care_card_value
            else:
                care_card_data[v.field_name] = v.care_card_value
    
    # Get validator info
    validator = None
    if validations[0].user:
        validator = validations[0].user.full_name
    
    return ExistingValidationResponse(
        hasValidations=True,
        careCardData=care_card_data,
        lastValidation=validations[0].validation_date.isoformat() if validations[0].validation_date else None,
        validator=validator
    )

@app.post("/api/validate/submit", response_model=List[ValidationResponse])
async def submit_validation(
    data: CareCardData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit validation data - updates existing records if they exist"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active validation cycle")
    
    # Get RADET record
    radet = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.hospital_number == data.hospital_number,
        RADETRecord.is_active == True
    ).first()
    
    if not radet:
        raise HTTPException(status_code=404, detail="Client not found in RADET")
    
    # Check if this patient has already been validated in this cycle
    existing_validations = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id,
        ValidationResult.patient_id == radet.id
    ).all()
    
    # If there are existing validations, we'll update them instead of creating new ones
    existing_map = {v.field_name: v for v in existing_validations}
    
    # Store SQLAlchemy models for database operations
    db_results = []
    
    # Check for logical errors first
    logical_errors = check_logical_errors(radet, data)
    
    # Compare fields including months_of_arv_dispensed
    comparisons = [
        ("date_of_birth", radet.date_of_birth, parse_date(data.date_of_birth)),
        ("sex", radet.sex, data.sex),
        ("art_start_date", radet.art_start_date, parse_date(data.art_start_date)),
        ("current_regimen", radet.current_regimen, data.current_regimen),
        ("last_drug_pickup", radet.last_drug_pickup, parse_date(data.last_drug_pickup)),
        ("months_of_arv_dispensed", radet.months_of_arv_dispensed, data.months_of_arv_dispensed),
        ("last_vl_sample_date", radet.last_vl_sample_date, parse_date(data.last_vl_sample_date)),
        ("last_vl_result", radet.last_vl_result, data.last_vl_result),
        ("last_vl_result_date", radet.last_vl_result_date, parse_date(data.last_vl_result_date)),
        ("last_clinic_visit", radet.last_clinic_visit, parse_date(data.last_clinic_visit)),
    ]
    
    for field_name, radet_val, care_val in comparisons:
        radet_str = normalize_string(radet_val, field_name)
        care_str = normalize_string(care_val, field_name)
        
        # Check if this field has a logical error
        field_error = next((e for e in logical_errors if e["field"] == field_name), None)
        
        if field_error:
            status = ValidationStatus.LOGICAL_ERROR
        elif not radet_str and not care_str:
            status = ValidationStatus.MATCH
        elif not radet_str and care_str:
            status = ValidationStatus.MISSING_IN_RADET
        elif radet_str and not care_str:
            status = ValidationStatus.MISSING_IN_CARD
        elif radet_str != care_str:
            # Check if care card value is newer (for dates)
            if care_val and radet_val and isinstance(care_val, datetime) and isinstance(radet_val, datetime):
                if care_val > radet_val:
                    status = ValidationStatus.UPDATED_RECORD
                else:
                    status = ValidationStatus.MISMATCH
            else:
                status = ValidationStatus.MISMATCH
        else:
            status = ValidationStatus.MATCH
        
        # Check if this field already has a validation record
        if field_name in existing_map:
            # Update existing SQLAlchemy record
            existing = existing_map[field_name]
            existing.user_id = current_user.id
            existing.radet_value = radet_str
            existing.care_card_value = care_str
            existing.status = status
            existing.logical_error_type = field_error["type"] if field_error else None
            existing.logical_error_description = field_error["description"] if field_error else None
            existing.validation_date = datetime.utcnow()
            db_result = existing
        else:
            # Create new SQLAlchemy validation result
            db_result = ValidationResult(
                cycle_id=cycle.id,
                patient_id=radet.id,
                user_id=current_user.id,
                hospital_number=data.hospital_number,
                field_name=field_name,
                radet_value=radet_str,
                care_card_value=care_str,
                status=status,
                logical_error_type=field_error["type"] if field_error else None,
                logical_error_description=field_error["description"] if field_error else None
            )
            db.add(db_result)
        
        db_results.append(db_result)
    
    # Commit all changes to database
    db.commit()
    
    # Create response models (Pydantic models) from SQLAlchemy models
    response_results = []
    for db_result in db_results:
        # Refresh the SQLAlchemy model to get updated timestamps
        db.refresh(db_result)
        
        # Create Pydantic response model
        response_results.append(ValidationResponse(
            hospital_number=db_result.hospital_number,
            field_name=db_result.field_name,
            radet_value=db_result.radet_value,
            care_card_value=db_result.care_card_value,
            status=db_result.status,
            logical_error=db_result.logical_error_description
        ))
    
    return response_results

# ==================== EVENT TRACKING ENDPOINTS ====================

@app.get("/api/patient/{hospital_number}/events")
async def get_patient_events(
    hospital_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get patient clinical events"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active cycle")
    
    patient = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.hospital_number == hospital_number
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    events = db.query(ClinicalEvent).filter(
        ClinicalEvent.patient_id == patient.id
    ).order_by(ClinicalEvent.event_date.desc()).all()
    
    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "event_date": e.event_date.isoformat() if e.event_date else None,
            "value": e.value,
            "notes": e.notes
        }
        for e in events
    ]

@app.post("/api/patient/{hospital_number}/events/add")
async def add_patient_event(
    hospital_number: str,
    event_type: str,
    event_date: str,
    value: Optional[float] = None,
    notes: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Add clinical event (supervisor only)"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active cycle")
    
    patient = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.hospital_number == hospital_number
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    parsed_date = parse_date(event_date)
    if not parsed_date:
        raise HTTPException(status_code=400, detail="Invalid event date")
    
    event = ClinicalEvent(
        patient_id=patient.id,
        event_type=event_type,
        event_date=parsed_date.date() if hasattr(parsed_date, 'date') else parsed_date,
        value=value,
        notes=notes
    )
    db.add(event)
    
    # Update the corresponding "last" field in patient record
    if event_type == EventType.DRUG_PICKUP:
        patient.last_drug_pickup = parsed_date
        if value:  # If value is provided, it represents months dispensed
            patient.months_of_arv_dispensed = int(value) if value else None
    elif event_type == EventType.VL_SAMPLE:
        patient.last_vl_sample_date = parsed_date
    elif event_type == EventType.VL_RESULT:
        patient.last_vl_result_date = parsed_date
        if value:
            patient.last_vl_result = value
    
    db.commit()
    return {"message": "Event added successfully"}

# ==================== SUPERVISOR REVIEW ENDPOINTS ====================

@app.get("/api/supervisor/pending-reviews")
async def get_pending_reviews(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Get pending reviews for supervisor"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return {"pending_reviews": []}
    
    # Get all mismatches that haven't been corrected
    mismatches = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id,
        ValidationResult.status.in_([ValidationStatus.MISMATCH, ValidationStatus.LOGICAL_ERROR])
    ).all()
    
    # Get user names for validators
    user_cache = {}
    
    # Group by hospital number
    reviews = {}
    for mismatch in mismatches:
        if mismatch.hospital_number not in reviews:
            # Get validator name
            validator_name = "Unknown"
            if mismatch.user_id:
                if mismatch.user_id not in user_cache:
                    user = db.query(User).filter(User.id == mismatch.user_id).first()
                    user_cache[mismatch.user_id] = user.full_name if user else "Unknown"
                validator_name = user_cache[mismatch.user_id]
            
            reviews[mismatch.hospital_number] = {
                "hospital_number": mismatch.hospital_number,
                "patient_name": f"Patient {mismatch.hospital_number}",
                "mismatches": [],
                "priority": "HIGH" if mismatch.status == ValidationStatus.LOGICAL_ERROR else "MEDIUM",
                "validator": validator_name,
                "validation_date": mismatch.validation_date.isoformat() if mismatch.validation_date else None
            }
        
        reviews[mismatch.hospital_number]["mismatches"].append({
            "id": mismatch.id,
            "field": mismatch.field_name,
            "radet_value": mismatch.radet_value,
            "care_card_value": mismatch.care_card_value,
            "status": mismatch.status,
            "logical_error": mismatch.logical_error_description
        })
    
    return {"pending_reviews": list(reviews.values())}

@app.post("/api/supervisor/request-correction")
async def request_correction(
    request: CorrectionRequest,
    current_user: User = Depends(require_role(UserRole.STAFF)),
    db: Session = Depends(get_db)
):
    """Request a correction (staff)"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active cycle")
    
    patient = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.hospital_number == request.hospital_number
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get current value
    old_value = getattr(patient, request.field_name, None)
    
    correction = CorrectionLog(
        patient_id=patient.id,
        user_id=current_user.id,
        hospital_number=request.hospital_number,
        field_name=request.field_name,
        old_value=normalize_string(old_value),
        new_value=request.new_value,
        reason=request.reason,
        status=CorrectionStatus.PENDING
    )
    db.add(correction)
    db.commit()
    
    return {"message": "Correction request submitted", "correction_id": correction.id}

@app.post("/api/supervisor/review-correction")
async def review_correction(
    review: CorrectionReview,
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Review a correction request (supervisor)"""
    correction = db.query(CorrectionLog).filter(CorrectionLog.id == review.correction_id).first()
    if not correction:
        raise HTTPException(status_code=404, detail="Correction not found")
    
    if review.approved:
        # Update the actual record
        patient = db.query(RADETRecord).filter(RADETRecord.id == correction.patient_id).first()
        if patient:
            field = correction.field_name
            if "date" in field.lower():
                setattr(patient, field, parse_date(correction.new_value))
            elif "result" in field.lower() and field.lower() != "last_vl_result_date":
                try:
                    setattr(patient, field, float(correction.new_value))
                except (ValueError, TypeError):
                    setattr(patient, field, correction.new_value)
            elif field == "months_of_arv_dispensed":
                try:
                    setattr(patient, field, int(float(correction.new_value)))
                except (ValueError, TypeError):
                    setattr(patient, field, correction.new_value)
            else:
                setattr(patient, field, correction.new_value)
        
        correction.status = CorrectionStatus.APPROVED
        correction.supervisor_id = current_user.id
        correction.approved_at = datetime.utcnow()
    else:
        correction.status = CorrectionStatus.REJECTED
        correction.supervisor_id = current_user.id
    
    db.commit()
    return {"message": f"Correction {correction.status}"}

@app.get("/api/supervisor/corrections")
async def get_correction_requests(
    status: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Get all correction requests"""
    query = db.query(CorrectionLog)
    if status:
        query = query.filter(CorrectionLog.status == status)
    
    corrections = query.order_by(CorrectionLog.created_at.desc()).all()
    
    result = []
    for c in corrections:
        user = db.query(User).filter(User.id == c.user_id).first()
        result.append({
            "id": c.id,
            "hospital_number": c.hospital_number,
            "field_name": c.field_name,
            "old_value": c.old_value,
            "new_value": c.new_value,
            "reason": c.reason,
            "status": c.status,
            "requested_by_name": user.full_name if user else "Unknown",
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    
    return {"corrections": result}

# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/api/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get main dashboard statistics"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return {
            "total_clients": 0,
            "validated_clients": 0,
            "remaining": 0,
            "mismatches": 0,
            "progress_percentage": 0
        }
    
    total_clients = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True
    ).count()
    
    validated_clients = db.query(ValidationResult.patient_id).filter(
        ValidationResult.cycle_id == cycle.id
    ).distinct().count()
    
    mismatches = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id,
        ValidationResult.status == ValidationStatus.MISMATCH
    ).count()
    
    progress = (validated_clients / total_clients * 100) if total_clients > 0 else 0
    
    return {
        "total_clients": total_clients,
        "validated_clients": validated_clients,
        "remaining": total_clients - validated_clients,
        "mismatches": mismatches,
        "progress_percentage": round(progress, 1)
    }

@app.get("/api/dashboard/staff-performance", response_model=List[StaffPerformanceResponse])
async def get_staff_performance(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Get staff performance metrics"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return []
    
    staff = db.query(User).filter(User.role == UserRole.STAFF).all()
    performance = []
    
    for user in staff:
        validations = db.query(ValidationResult).filter(
            ValidationResult.cycle_id == cycle.id,
            ValidationResult.user_id == user.id
        ).all()
        
        if validations:
            total = len(validations)
            mismatches = len([v for v in validations if v.status == ValidationStatus.MISMATCH])
            logical_errors = len([v for v in validations if v.status == ValidationStatus.LOGICAL_ERROR])
            
            patients_validated = db.query(ValidationResult.patient_id).filter(
                ValidationResult.cycle_id == cycle.id,
                ValidationResult.user_id == user.id
            ).distinct().count()
            
            accuracy = ((total - mismatches - logical_errors) / total * 100) if total > 0 else 0
            
            performance.append({
                "user_id": user.id,
                "user_name": user.full_name,
                "patients_validated": patients_validated,
                "total_validations": total,
                "mismatches_found": mismatches,
                "logical_errors_found": logical_errors,
                "accuracy_rate": round(accuracy, 1)
            })
    
    return performance

@app.get("/api/dashboard/quality-metrics", response_model=QualityMetricsResponse)
async def get_quality_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get quality metrics"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return {
            "overall_accuracy": 0,
            "total_validations": 0,
            "status_breakdown": {},
            "top_error_fields": [],
            "treatment_interruption_risk": 0,
            "missing_vl_results": 0,
            "total_patients": 0,
            "average_months_dispensed": None,
            "dispensing_patterns": {}
        }
    
    validations = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id
    ).all()
    
    total_validations = len(validations)
    if total_validations == 0:
        return {
            "overall_accuracy": 0,
            "total_validations": 0,
            "status_breakdown": {},
            "top_error_fields": [],
            "treatment_interruption_risk": 0,
            "missing_vl_results": 0,
            "total_patients": 0,
            "average_months_dispensed": None,
            "dispensing_patterns": {}
        }
    
    status_counts = {}
    field_errors = {}
    
    for v in validations:
        status_counts[v.status] = status_counts.get(v.status, 0) + 1
        if v.status in [ValidationStatus.MISMATCH, ValidationStatus.LOGICAL_ERROR]:
            field_errors[v.field_name] = field_errors.get(v.field_name, 0) + 1
    
    matches = status_counts.get(ValidationStatus.MATCH, 0)
    overall_accuracy = (matches / total_validations * 100) if total_validations > 0 else 0
    
    top_errors = sorted(field_errors.items(), key=lambda x: x[1], reverse=True)[:5]
    
    today = datetime.now()
    interruption_risk = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True,
        RADETRecord.last_drug_pickup.isnot(None),
        RADETRecord.last_drug_pickup < (today - timedelta(days=28))
    ).count()
    
    missing_vl = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True,
        RADETRecord.last_vl_result == None
    ).count()
    
    total_patients = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True
    ).count()
    
    # Calculate average months dispensed and patterns
    dispensed_data = db.query(RADETRecord.months_of_arv_dispensed).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True,
        RADETRecord.months_of_arv_dispensed.isnot(None)
    ).all()
    
    avg_dispensed = None
    dispensing_patterns = {
        "1_month": 0, "2_months": 0, "3_months": 0, 
        "4_months": 0, "5_months": 0, "6_months": 0, ">6_months": 0
    }
    
    if dispensed_data:
        valid_dispensed = [d[0] for d in dispensed_data if d[0] is not None]
        if valid_dispensed:
            avg_dispensed = sum(valid_dispensed) / len(valid_dispensed)
            
            for months in valid_dispensed:
                if months == 1:
                    dispensing_patterns["1_month"] += 1
                elif months == 2:
                    dispensing_patterns["2_months"] += 1
                elif months == 3:
                    dispensing_patterns["3_months"] += 1
                elif months == 4:
                    dispensing_patterns["4_months"] += 1
                elif months == 5:
                    dispensing_patterns["5_months"] += 1
                elif months == 6:
                    dispensing_patterns["6_months"] += 1
                elif months > 6:
                    dispensing_patterns[">6_months"] += 1
    
    return {
        "overall_accuracy": round(overall_accuracy, 1),
        "total_validations": total_validations,
        "status_breakdown": status_counts,
        "top_error_fields": top_errors,
        "treatment_interruption_risk": interruption_risk,
        "missing_vl_results": missing_vl,
        "total_patients": total_patients,
        "average_months_dispensed": round(avg_dispensed, 1) if avg_dispensed else None,
        "dispensing_patterns": dispensing_patterns
    }

@app.get("/api/dashboard/trends", response_model=List[TrendDataResponse])
async def get_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get accuracy trends over cycles"""
    cycles = db.query(ValidationCycle).order_by(ValidationCycle.start_date).all()
    
    trends = []
    for cycle in cycles:
        validations = db.query(ValidationResult).filter(
            ValidationResult.cycle_id == cycle.id
        ).all()
        
        if validations:
            matches = len([v for v in validations if v.status == ValidationStatus.MATCH])
            accuracy = (matches / len(validations) * 100) if validations else 0
            
            trends.append({
                "cycle_id": cycle.id,
                "cycle_name": cycle.name,
                "date": cycle.start_date.strftime("%Y-%m-%d") if cycle.start_date else "",
                "accuracy": round(accuracy, 1),
                "total_validations": len(validations)
            })
    
    return trends

# ==================== TREATMENT INTERRUPTIONS ENDPOINT ====================
@app.get("/api/analytics/treatment-interruptions", response_model=TreatmentInterruptionsResponse)
async def get_treatment_interruptions(
    days_threshold: int = 28,
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    try:
        cycle = db.query(ValidationCycle).filter(
            ValidationCycle.is_active == True
        ).first()

        if not cycle:
            raise HTTPException(status_code=400, detail="No active cycle")

        today = datetime.now()
        threshold_date = today - timedelta(days=days_threshold)

        patients = db.query(RADETRecord).filter(
            RADETRecord.cycle_id == cycle.id,
            RADETRecord.is_active == True,
            RADETRecord.last_drug_pickup.isnot(None),
            RADETRecord.last_drug_pickup < threshold_date
        ).all()

        interruptions = []

        for patient in patients:
            try:
                if not patient.last_drug_pickup:
                    continue

                # Ensure datetime
                last_pickup = patient.last_drug_pickup
                if not isinstance(last_pickup, datetime):
                    continue

                days_since_pickup = (today - last_pickup).days

                # Risk classification
                if days_since_pickup > 60:
                    risk_level = "CRITICAL"
                elif days_since_pickup > 45:
                    risk_level = "HIGH"
                elif days_since_pickup > 30:
                    risk_level = "MEDIUM"
                else:
                    risk_level = "LOW"

                interruptions.append({
                    "hospital_number": patient.hospital_number,
                    "last_pickup_date": last_pickup.strftime("%Y-%m-%d"),
                    "days_since_pickup": days_since_pickup,
                    "risk_level": risk_level,
                    "months_of_arv_dispensed": patient.months_of_arv_dispensed
                })

            except Exception as inner_error:
                logger.warning(f"Skipping patient {patient.hospital_number}: {inner_error}")
                continue

        interruptions.sort(key=lambda x: x["days_since_pickup"], reverse=True)

        return {
            "interruptions": interruptions,
            "total_at_risk": len(interruptions),
            "threshold_days": days_threshold
        }

    except Exception as e:
        logger.error(f"🔥 Treatment interruption error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
# ==================== NEW ENHANCED VALIDATION SUMMARY ENDPOINTS ====================

@app.get("/api/validation/hospital-number-summary/{hospital_number}", response_model=HospitalNumberDetailResponse)
async def get_hospital_number_validation_summary(
    hospital_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed validation summary for a specific hospital number"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active validation cycle")
    
    validations = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id,
        ValidationResult.hospital_number == hospital_number
    ).all()
    
    if not validations:
        raise HTTPException(status_code=404, detail="No validations found for this hospital number")
    
    total_checks = len(validations)
    passed_checks = len([v for v in validations if v.status == ValidationStatus.MATCH])
    failed_checks = len([v for v in validations if v.status != ValidationStatus.MATCH])
    
    score_percentage = (passed_checks / total_checks * 100) if total_checks > 0 else 0
    classification, color_code = get_validation_classification(score_percentage)
    
    failed_fields = []
    for v in validations:
        if v.status != ValidationStatus.MATCH:
            failed_fields.append(FailedFieldDetail(
                field_name=v.field_name,
                status=v.status,
                radet_value=v.radet_value,
                care_card_value=v.care_card_value,
                logical_error=v.logical_error_description
            ))
    
    validation_status = ValidationStatus.MATCH if passed_checks == total_checks else ValidationStatus.MISMATCH
    
    summary = HospitalNumberValidationSummary(
        hospital_number=hospital_number,
        total_checks=total_checks,
        passed_checks=passed_checks,
        failed_checks=failed_checks,
        score_percentage=round(score_percentage, 1),
        classification=classification,
        color_code=color_code,
        failed_fields=failed_fields,
        validation_status=validation_status
    )
    
    # Convert SQLAlchemy objects to dictionaries
    validations_dict = []
    for v in validations:
        validations_dict.append({
            "id": v.id,
            "cycle_id": v.cycle_id,
            "patient_id": v.patient_id,
            "user_id": v.user_id,
            "hospital_number": v.hospital_number,
            "field_name": v.field_name,
            "radet_value": v.radet_value,
            "care_card_value": v.care_card_value,
            "status": v.status,
            "logical_error_type": v.logical_error_type,
            "logical_error_description": v.logical_error_description,
            "validation_date": v.validation_date.isoformat() if v.validation_date else None
        })
    
    return HospitalNumberDetailResponse(
        hospital_number=hospital_number,
        validations=validations_dict,
        summary=summary
    )

@app.get("/api/dashboard/validation-summaries", response_model=List[HospitalNumberValidationSummary])
async def get_all_validation_summaries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get validation summaries for all hospital numbers (deduplicated)"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return []
    
    hospital_numbers = db.query(ValidationResult.hospital_number).filter(
        ValidationResult.cycle_id == cycle.id
    ).distinct().all()
    
    summaries = []
    for (hn,) in hospital_numbers:
        validations = db.query(ValidationResult).filter(
            ValidationResult.cycle_id == cycle.id,
            ValidationResult.hospital_number == hn
        ).all()
        
        total_checks = len(validations)
        passed_checks = len([v for v in validations if v.status == ValidationStatus.MATCH])
        score_percentage = (passed_checks / total_checks * 100) if total_checks > 0 else 0
        
        classification, color_code = get_validation_classification(score_percentage)
        
        failed_fields = []
        for v in validations:
            if v.status != ValidationStatus.MATCH:
                failed_fields.append(FailedFieldDetail(
                    field_name=v.field_name,
                    status=v.status,
                    radet_value=v.radet_value,
                    care_card_value=v.care_card_value,
                    logical_error=v.logical_error_description
                ))
        
        summaries.append(HospitalNumberValidationSummary(
            hospital_number=hn,
            total_checks=total_checks,
            passed_checks=passed_checks,
            failed_checks=total_checks - passed_checks,
            score_percentage=round(score_percentage, 1),
            classification=classification,
            color_code=color_code,
            failed_fields=failed_fields,
            validation_status=ValidationStatus.MATCH if passed_checks == total_checks else ValidationStatus.MISMATCH
        ))
    
    summaries.sort(key=lambda x: x.score_percentage, reverse=True)
    return summaries

@app.get("/api/dashboard/facility-dqi", response_model=List[DataQualityIndexResponse])
async def get_facility_data_quality_index(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Calculate Data Quality Index (DQI) for each facility"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return []
    
    facilities = db.query(User.facility).distinct().all()
    
    dqi_results = []
    for (facility_name,) in facilities:
        staff_ids = db.query(User.id).filter(User.facility == facility_name).all()
        staff_ids = [s[0] for s in staff_ids]
        
        if not staff_ids:
            continue
        
        validations = db.query(ValidationResult).filter(
            ValidationResult.cycle_id == cycle.id,
            ValidationResult.user_id.in_(staff_ids)
        ).all()
        
        if not validations:
            continue
        
        # Group by hospital number for deduplication
        hospital_validations = {}
        for v in validations:
            if v.hospital_number not in hospital_validations:
                hospital_validations[v.hospital_number] = []
            hospital_validations[v.hospital_number].append(v)
        
        total_patients = len(hospital_validations)
        total_expected_checks = 0
        total_passed_checks = 0
        classification_breakdown = {
            "Perfect Match": 0,
            "Low Discrepancy": 0,
            "Moderate Discrepancy": 0,
            "High Discrepancy": 0,
            "Critical Issue": 0
        }
        
        for hn, vals in hospital_validations.items():
            total_checks = len(vals)
            passed_checks = len([v for v in vals if v.status == ValidationStatus.MATCH])
            
            total_expected_checks += total_checks
            total_passed_checks += passed_checks
            
            score = (passed_checks / total_checks * 100) if total_checks > 0 else 0
            
            if score == 100:
                classification_breakdown["Perfect Match"] += 1
            elif score >= 80:
                classification_breakdown["Low Discrepancy"] += 1
            elif score >= 60:
                classification_breakdown["Moderate Discrepancy"] += 1
            elif score >= 30:
                classification_breakdown["High Discrepancy"] += 1
            else:
                classification_breakdown["Critical Issue"] += 1
        
        dqi_score = (total_passed_checks / total_expected_checks * 100) if total_expected_checks > 0 else 0
        
        # Determine facility color code based on DQI
        if dqi_score >= 95:
            color_code = "#10b981"
        elif dqi_score >= 85:
            color_code = "#84cc16"
        elif dqi_score >= 70:
            color_code = "#eab308"
        elif dqi_score >= 50:
            color_code = "#f97316"
        else:
            color_code = "#ef4444"
        
        dqi_results.append(DataQualityIndexResponse(
            facility_name=facility_name,
            facility_code=facility_name[:10].upper(),
            total_patients_validated=total_patients,
            total_expected_checks=total_expected_checks,
            total_passed_checks=total_passed_checks,
            dqi_score=round(dqi_score, 1),
            classification_breakdown=classification_breakdown,
            color_code=color_code
        ))
    
    dqi_results.sort(key=lambda x: x.dqi_score, reverse=True)
    return dqi_results

@app.get("/api/dashboard/facility-ranking", response_model=FacilityRankingResponse)
async def get_facility_ranking(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Get facility ranking based on DQI"""
    facilities = await get_facility_data_quality_index(current_user, db)
    
    total_dqi = sum(f.dqi_score for f in facilities)
    overall_dqi = total_dqi / len(facilities) if facilities else 0
    
    return FacilityRankingResponse(
        facilities=facilities,
        overall_dqi=round(overall_dqi, 1),
        total_facilities=len(facilities)
    )

# ==================== ANALYTICS ENDPOINTS ====================

@app.get("/api/analytics/arv-dispensing-patterns", response_model=ArvDispensingPatternsResponse)
async def analyze_arv_dispensing_patterns(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Analyze ARV dispensing patterns"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active cycle")
    
    patients = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True,
        RADETRecord.months_of_arv_dispensed.isnot(None)
    ).all()
    
    # Analyze dispensing patterns
    dispensing_counts = {
        "1_month": 0,
        "2_months": 0,
        "3_months": 0,
        "4_months": 0,
        "5_months": 0,
        "6_months": 0,
        ">6_months": 0
    }
    
    total_dispensed = 0
    valid_count = 0
    
    for patient in patients:
        months = patient.months_of_arv_dispensed or 0
        total_dispensed += months
        valid_count += 1
        
        if months == 1:
            dispensing_counts["1_month"] += 1
        elif months == 2:
            dispensing_counts["2_months"] += 1
        elif months == 3:
            dispensing_counts["3_months"] += 1
        elif months == 4:
            dispensing_counts["4_months"] += 1
        elif months == 5:
            dispensing_counts["5_months"] += 1
        elif months == 6:
            dispensing_counts["6_months"] += 1
        elif months > 6:
            dispensing_counts[">6_months"] += 1
    
    average_dispensed = total_dispensed / valid_count if valid_count > 0 else 0
    
    # Identify patients at risk (those who received less than 2 months)
    at_risk_patients = len([p for p in patients if p.months_of_arv_dispensed and p.months_of_arv_dispensed < 2])
    
    return {
        "dispensing_patterns": dispensing_counts,
        "average_months_dispensed": round(average_dispensed, 1),
        "total_patients_with_data": valid_count,
        "recommendations": {
            "default_dispensing": "3 months" if average_dispensed < 3 else f"{round(average_dispensed)} months",
            "adherence_risk_patients": at_risk_patients,
            "next_expected_refill": f"Most patients will need refill in {round(average_dispensed)} months",
            "supply_planning": f"Plan for {round(average_dispensed * valid_count)} months of medication total"
        }
    }

@app.get("/api/analytics/patient-refill-schedule")
async def get_patient_refill_schedule(
    days_ahead: int = 30,
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Get patients who need refills in the next X days"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active cycle")
    
    today = datetime.now()
    
    patients = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True,
        RADETRecord.last_drug_pickup.isnot(None),
        RADETRecord.months_of_arv_dispensed.isnot(None)
    ).all()
    
    refill_schedule = []
    for patient in patients:
        if patient.last_drug_pickup and patient.months_of_arv_dispensed:
            # Calculate when medication will run out
            run_out_date = patient.last_drug_pickup + timedelta(days=30 * patient.months_of_arv_dispensed)
            days_until_run_out = (run_out_date - today).days
            
            if 0 <= days_until_run_out <= days_ahead:
                refill_schedule.append({
                    "hospital_number": patient.hospital_number,
                    "last_pickup_date": patient.last_drug_pickup.strftime("%Y-%m-%d"),
                    "months_dispensed": patient.months_of_arv_dispensed,
                    "expected_run_out_date": run_out_date.strftime("%Y-%m-%d"),
                    "days_until_refill_needed": days_until_run_out,
                    "priority": "HIGH" if days_until_run_out <= 7 else "MEDIUM"
                })
    
    # Sort by days until refill needed
    refill_schedule.sort(key=lambda x: x["days_until_refill_needed"])
    
    return {
        "refill_schedule": refill_schedule,
        "total_needing_refill": len(refill_schedule),
        "time_period_days": days_ahead
    }

@app.get("/api/analytics/duplicates")
async def detect_duplicates(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Detect potential duplicate patients"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active cycle")
    
    patients = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True
    ).all()
    
    duplicates = []
    seen = {}
    
    for p in patients:
        # Normalize hospital number (remove spaces, convert to uppercase)
        normalized = p.hospital_number.strip().upper().replace(" ", "").replace("-", "")
        if normalized in seen:
            duplicates.append({
                "original": seen[normalized],
                "duplicate": p.hospital_number,
                "confidence": 1.0
            })
        else:
            seen[normalized] = p.hospital_number
    
    return {"potential_duplicates": duplicates[:10]}

@app.get("/api/analytics/patient-summaries")
async def get_patient_summaries(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Get patient validation summaries"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        return []
    
    patients = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True
    ).all()
    
    summaries = []
    for patient in patients:
        validations = db.query(ValidationResult).filter(
            ValidationResult.patient_id == patient.id
        ).all()
        
        if validations:
            total = len(validations)
            matches = len([v for v in validations if v.status == ValidationStatus.MATCH])
            mismatches = len([v for v in validations if v.status == ValidationStatus.MISMATCH])
            logical_errors = len([v for v in validations if v.status == ValidationStatus.LOGICAL_ERROR])
            
            accuracy = (matches / total * 100) if total > 0 else 0
            
            # Determine risk level
            if accuracy >= 90:
                risk_level = "low"
            elif accuracy >= 70:
                risk_level = "medium"
            else:
                risk_level = "high"
            
            # Determine trend (simplified)
            trend = "stable"
            if len(validations) > 5:
                recent = validations[:3]
                older = validations[-3:]
                recent_accuracy = len([v for v in recent if v.status == ValidationStatus.MATCH]) / len(recent) * 100
                older_accuracy = len([v for v in older if v.status == ValidationStatus.MATCH]) / len(older) * 100
                if recent_accuracy > older_accuracy + 5:
                    trend = "up"
                elif recent_accuracy < older_accuracy - 5:
                    trend = "down"
            
            summaries.append({
                "hospital_number": patient.hospital_number,
                "total_validations": total,
                "matches": matches,
                "mismatches": mismatches,
                "logical_errors": logical_errors,
                "accuracy_rate": round(accuracy, 1),
                "last_validation": validations[0].validation_date.isoformat() if validations else None,
                "risk_level": risk_level,
                "trend": trend,
                "months_of_arv_dispensed": patient.months_of_arv_dispensed,
                "last_drug_pickup": patient.last_drug_pickup.strftime("%Y-%m-%d") if patient.last_drug_pickup else None,
                "next_refill_due": (patient.last_drug_pickup + timedelta(days=30 * patient.months_of_arv_dispensed)).strftime("%Y-%m-%d") if patient.last_drug_pickup and patient.months_of_arv_dispensed else None
            })
    
    return summaries

# ==================== EXPORT ENDPOINTS ====================

@app.get("/api/export/validation-results")
async def export_validation_results(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Export validation results"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active cycle")
    
    results = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id
    ).all()
    
    export_data = []
    for r in results:
        user = db.query(User).filter(User.id == r.user_id).first()
        
        # Get patient's months dispensed for context
        patient = db.query(RADETRecord).filter(RADETRecord.id == r.patient_id).first()
        
        export_data.append({
            "hospital_number": r.hospital_number,
            "field_name": r.field_name,
            "radet_value": r.radet_value,
            "care_card_value": r.care_card_value,
            "status": r.status,
            "validator": user.full_name if user else "Unknown",
            "validation_date": r.validation_date.strftime("%Y-%m-%d %H:%M") if r.validation_date else None,
            "logical_error": r.logical_error_description,
            "months_of_arv_dispensed": patient.months_of_arv_dispensed if patient else None
        })
    
    return {"export_data": export_data}

@app.get("/api/export/correction-report")
async def export_correction_report(
    current_user: User = Depends(require_role(UserRole.SUPERVISOR)),
    db: Session = Depends(get_db)
):
    """Export correction report"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=400, detail="No active cycle")
    
    corrections = db.query(CorrectionLog).filter(
        CorrectionLog.hospital_number.in_(
            db.query(RADETRecord.hospital_number).filter(RADETRecord.cycle_id == cycle.id)
        )
    ).all()
    
    report = []
    for c in corrections:
        user = db.query(User).filter(User.id == c.user_id).first()
        supervisor = db.query(User).filter(User.id == c.supervisor_id).first() if c.supervisor_id else None
        
        # Get patient's months dispensed for context
        patient = db.query(RADETRecord).filter(RADETRecord.id == c.patient_id).first()
        
        report.append({
            "hospital_number": c.hospital_number,
            "field_name": c.field_name,
            "old_value": c.old_value,
            "new_value": c.new_value,
            "reason": c.reason,
            "requested_by": user.full_name if user else "Unknown",
            "status": c.status,
            "approved_by": supervisor.full_name if supervisor else None,
            "approved_date": c.approved_at.strftime("%Y-%m-%d %H:%M") if c.approved_at else None,
            "months_of_arv_dispensed": patient.months_of_arv_dispensed if patient else None
        })
    
    return {"correction_report": report}

# ==================== NETWORK INFO ENDPOINT ====================

@app.get("/api/network/info")
async def get_network_info():
    """Get network access information"""
    return {
        "local_access": f"http://localhost:{PORT}",
        "network_access": f"http://{LOCAL_IP}:{PORT}",
        "instructions": "Other devices on the same network can access this application using the network_access URL",
        "port": PORT,
        "host_ip": LOCAL_IP
    }

# ==================== DEBUG ENDPOINTS ====================

@app.get("/api/debug/database-status")
async def debug_database_status(db: Session = Depends(get_db)):
    """Debug endpoint to check database contents"""
    try:
        # Check users
        users_count = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # Check cycles
        cycles_count = db.query(ValidationCycle).count()
        active_cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
        active_cycle_id = active_cycle.id if active_cycle else None
        active_cycle_name = active_cycle.name if active_cycle else None
        
        # Check patients
        total_patients = db.query(RADETRecord).count()
        active_patients = db.query(RADETRecord).filter(RADETRecord.is_active == True).count()
        
        if active_cycle_id:
            cycle_patients = db.query(RADETRecord).filter(RADETRecord.cycle_id == active_cycle_id).count()
            cycle_active_patients = db.query(RADETRecord).filter(
                RADETRecord.cycle_id == active_cycle_id,
                RADETRecord.is_active == True
            ).count()
        else:
            cycle_patients = 0
            cycle_active_patients = 0
        
        # Check validations
        total_validations = db.query(ValidationResult).count()
        
        if active_cycle_id:
            cycle_validations = db.query(ValidationResult).filter(ValidationResult.cycle_id == active_cycle_id).count()
            distinct_patients_validated = db.query(ValidationResult.patient_id).filter(
                ValidationResult.cycle_id == active_cycle_id
            ).distinct().count()
        else:
            cycle_validations = 0
            distinct_patients_validated = 0
        
        # Check status breakdown
        status_breakdown = {}
        if active_cycle_id:
            statuses = db.query(ValidationResult.status, func.count()).filter(
                ValidationResult.cycle_id == active_cycle_id
            ).group_by(ValidationResult.status).all()
            status_breakdown = {status: count for status, count in statuses}
        
        # Check treatment interruptions
        today = datetime.now()
        threshold_date = today - timedelta(days=28)
        
        if active_cycle_id:
            interruptions = db.query(RADETRecord).filter(
                RADETRecord.cycle_id == active_cycle_id,
                RADETRecord.is_active == True,
                RADETRecord.last_drug_pickup.isnot(None),
                RADETRecord.last_drug_pickup < threshold_date
            ).count()
        else:
            interruptions = 0
        
        # Check missing VL
        if active_cycle_id:
            missing_vl = db.query(RADETRecord).filter(
                RADETRecord.cycle_id == active_cycle_id,
                RADETRecord.is_active == True,
                RADETRecord.last_vl_result == None
            ).count()
        else:
            missing_vl = 0
        
        # Sample data (first 5 patients)
        sample_patients = []
        patients = db.query(RADETRecord).limit(5).all()
        for p in patients:
            sample_patients.append({
                "id": p.id,
                "hospital_number": p.hospital_number,
                "cycle_id": p.cycle_id,
                "is_active": p.is_active,
                "last_drug_pickup": p.last_drug_pickup.strftime("%Y-%m-%d") if p.last_drug_pickup else None,
                "last_vl_result": p.last_vl_result
            })
        
        # Sample validations
        sample_validations = []
        validations = db.query(ValidationResult).limit(5).all()
        for v in validations:
            sample_validations.append({
                "id": v.id,
                "hospital_number": v.hospital_number,
                "cycle_id": v.cycle_id,
                "status": v.status,
                "field_name": v.field_name
            })
        
        return {
            "database_url": str(DATABASE_URL).split('@')[-1] if '@' in str(DATABASE_URL) else str(DATABASE_URL),
            "users": {
                "total": users_count,
                "active": active_users
            },
            "cycles": {
                "total": cycles_count,
                "active_cycle_id": active_cycle_id,
                "active_cycle_name": active_cycle_name,
                "has_active_cycle": active_cycle is not None
            },
            "patients": {
                "total_all_cycles": total_patients,
                "active_all_cycles": active_patients,
                "in_active_cycle": cycle_patients,
                "active_in_active_cycle": cycle_active_patients
            },
            "validations": {
                "total_all_cycles": total_validations,
                "in_active_cycle": cycle_validations,
                "distinct_patients_validated": distinct_patients_validated
            },
            "metrics": {
                "treatment_interruption_risk": interruptions,
                "missing_vl_results": missing_vl,
                "status_breakdown": status_breakdown
            },
            "sample_data": {
                "patients": sample_patients,
                "validations": sample_validations
            }
        }
    except Exception as e:
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/api/debug/check-cycle/{cycle_id}")
async def debug_check_cycle(cycle_id: int, db: Session = Depends(get_db)):
    """Check specific cycle details"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.id == cycle_id).first()
    if not cycle:
        return {"error": f"Cycle {cycle_id} not found"}
    
    patients = db.query(RADETRecord).filter(RADETRecord.cycle_id == cycle_id).count()
    active_patients = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle_id,
        RADETRecord.is_active == True
    ).count()
    
    validations = db.query(ValidationResult).filter(ValidationResult.cycle_id == cycle_id).count()
    
    return {
        "cycle": {
            "id": cycle.id,
            "name": cycle.name,
            "is_active": cycle.is_active,
            "start_date": cycle.start_date.isoformat() if cycle.start_date else None,
            "description": cycle.description
        },
        "stats": {
            "total_patients": patients,
            "active_patients": active_patients,
            "total_validations": validations
        }
    }
# ==================== ADMIN USER MANAGEMENT ENDPOINTS ====================

@app.get("/api/admin/users", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).filter(User.is_active == True).all()
    return users

@app.put("/api/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Update a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if username is being changed and already exists
    if user_update.username != user.username:
        existing = db.query(User).filter(User.username == user_update.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
        user.username = user_update.username
    
    user.full_name = user_update.full_name
    user.role = user_update.role
    user.facility = user_update.facility
    
    # Update password only if provided
    if user_update.password and user_update.password.strip():
        user.password_hash = hash_password(user_update.password)
    
    db.commit()
    db.refresh(user)
    return user

@app.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    # Prevent deleting self
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete - deactivate user instead of hard delete
    user.is_active = False
    db.commit()
    
    return {"message": f"User {user.username} deactivated successfully"}

# ==================== ADMIN STATS ENDPOINTS ====================

@app.get("/api/admin/system-stats")
async def get_system_stats(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get comprehensive system statistics (admin only)"""
    
    # User stats
    total_users = db.query(User).filter(User.is_active == True).count()
    admin_users = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True).count()
    supervisor_users = db.query(User).filter(User.role == UserRole.SUPERVISOR, User.is_active == True).count()
    staff_users = db.query(User).filter(User.role == UserRole.STAFF, User.is_active == True).count()
    
    # Cycle stats
    active_cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    total_cycles = db.query(ValidationCycle).count()
    
    # Patient stats
    total_patients = db.query(RADETRecord).count()
    active_patients = db.query(RADETRecord).filter(RADETRecord.is_active == True).count()
    
    # Validation stats
    total_validations = db.query(ValidationResult).count()
    distinct_patients_validated = db.query(ValidationResult.patient_id).distinct().count()
    
    # Correction stats
    pending_corrections = db.query(CorrectionLog).filter(CorrectionLog.status == CorrectionStatus.PENDING).count()
    approved_corrections = db.query(CorrectionLog).filter(CorrectionLog.status == CorrectionStatus.APPROVED).count()
    rejected_corrections = db.query(CorrectionLog).filter(CorrectionLog.status == CorrectionStatus.REJECTED).count()
    
    # Database size (for SQLite)
    db_size = None
    if "sqlite" in DATABASE_URL:
        import os
        db_path = DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            db_size = os.path.getsize(db_path) / (1024 * 1024)  # MB
    
    return {
        "users": {
            "total": total_users,
            "admins": admin_users,
            "supervisors": supervisor_users,
            "staff": staff_users
        },
        "cycles": {
            "total": total_cycles,
            "active": active_cycle.id if active_cycle else None,
            "active_name": active_cycle.name if active_cycle else None
        },
        "patients": {
            "total": total_patients,
            "active": active_patients
        },
        "validations": {
            "total": total_validations,
            "patients_validated": distinct_patients_validated
        },
        "corrections": {
            "pending": pending_corrections,
            "approved": approved_corrections,
            "rejected": rejected_corrections
        },
        "database": {
            "type": "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite",
            "size_mb": round(db_size, 2) if db_size else None
        }
    }

# ==================== ADMIN LOGS ENDPOINTS ====================

@app.get("/api/admin/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    offset: int = 0,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get system audit logs (admin only)"""
    
    # This would require an AuditLog model to be created
    # For now, we can return validation history as audit trail
    
    query = db.query(ValidationResult).order_by(ValidationResult.validation_date.desc())
    
    if user_id:
        query = query.filter(ValidationResult.user_id == user_id)
    
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(ValidationResult.validation_date >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(ValidationResult.validation_date <= end)
    
    total = query.count()
    logs = query.offset(offset).limit(limit).all()
    
    # Format logs for display
    formatted_logs = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        formatted_logs.append({
            "id": log.id,
            "timestamp": log.validation_date.isoformat() if log.validation_date else None,
            "user_id": log.user_id,
            "username": user.username if user else "Unknown",
            "action": "VALIDATION",
            "details": f"Validated field '{log.field_name}' for patient {log.hospital_number} - Status: {log.status}",
            "hospital_number": log.hospital_number,
            "field_name": log.field_name,
            "status": log.status
        })
    
    return {
        "logs": formatted_logs,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@app.get("/api/admin/export-logs")
async def export_system_logs(
    format: str = "csv",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Export system logs (admin only)"""
    
    query = db.query(ValidationResult).order_by(ValidationResult.validation_date.desc())
    
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(ValidationResult.validation_date >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(ValidationResult.validation_date <= end)
    
    logs = query.all()
    
    export_data = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        export_data.append({
            "timestamp": log.validation_date.isoformat() if log.validation_date else None,
            "user": user.username if user else "Unknown",
            "action": "VALIDATION",
            "hospital_number": log.hospital_number,
            "field": log.field_name,
            "radet_value": log.radet_value,
            "care_card_value": log.care_card_value,
            "status": log.status,
            "logical_error": log.logical_error_description
        })
    
    return {"export_data": export_data}

# ==================== ADMIN DATA BACKUP/RESTORE ENDPOINTS ====================

@app.post("/api/admin/backup")
async def create_backup(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Create a database backup (admin only)"""
    
    backup_dir = "backups"
    os.makedirs(backup_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(backup_dir, f"backup_{timestamp}.json")
    
    try:
        # Export all data
        users = db.query(User).all()
        cycles = db.query(ValidationCycle).all()
        patients = db.query(RADETRecord).all()
        validations = db.query(ValidationResult).all()
        corrections = db.query(CorrectionLog).all()
        events = db.query(ClinicalEvent).all()
        
        backup_data = {
            "timestamp": datetime.now().isoformat(),
            "version": "2.0",
            "data": {
                "users": [{"id": u.id, "username": u.username, "full_name": u.full_name, 
                          "role": u.role, "facility": u.facility, "created_at": u.created_at.isoformat() if u.created_at else None}
                         for u in users],
                "cycles": [{"id": c.id, "name": c.name, "description": c.description,
                           "start_date": c.start_date.isoformat() if c.start_date else None,
                           "end_date": c.end_date.isoformat() if c.end_date else None,
                           "is_active": c.is_active}
                          for c in cycles],
                "patients": [{"id": p.id, "cycle_id": p.cycle_id, "hospital_number": p.hospital_number,
                             "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
                             "sex": p.sex, "art_start_date": p.art_start_date.isoformat() if p.art_start_date else None,
                             "current_regimen": p.current_regimen, "last_drug_pickup": p.last_drug_pickup.isoformat() if p.last_drug_pickup else None,
                             "months_of_arv_dispensed": p.months_of_arv_dispensed, "is_active": p.is_active}
                            for p in patients],
                "validations": [{"id": v.id, "cycle_id": v.cycle_id, "patient_id": v.patient_id,
                                "hospital_number": v.hospital_number, "field_name": v.field_name,
                                "radet_value": v.radet_value, "care_card_value": v.care_card_value,
                                "status": v.status, "validation_date": v.validation_date.isoformat() if v.validation_date else None}
                               for v in validations],
                "corrections": [{"id": c.id, "patient_id": c.patient_id, "hospital_number": c.hospital_number,
                                "field_name": c.field_name, "old_value": c.old_value, "new_value": c.new_value,
                                "reason": c.reason, "status": c.status, "created_at": c.created_at.isoformat() if c.created_at else None}
                               for c in corrections],
                "events": [{"id": e.id, "patient_id": e.patient_id, "event_type": e.event_type,
                           "event_date": e.event_date.isoformat() if e.event_date else None,
                           "value": e.value, "notes": e.notes}
                          for e in events]
            }
        }
        
        with open(backup_file, "w") as f:
            json.dump(backup_data, f, indent=2, default=str)
        
        return {
            "message": "Backup created successfully",
            "file": backup_file,
            "size_bytes": os.path.getsize(backup_file),
            "timestamp": timestamp
        }
        
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@app.get("/api/admin/backups")
async def list_backups(
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """List available backups (admin only)"""
    
    backup_dir = "backups"
    if not os.path.exists(backup_dir):
        return {"backups": []}
    
    backups = []
    for file in os.listdir(backup_dir):
        if file.startswith("backup_") and file.endswith(".json"):
            file_path = os.path.join(backup_dir, file)
            stat = os.stat(file_path)
            backups.append({
                "filename": file,
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
    
    backups.sort(key=lambda x: x["modified"], reverse=True)
    return {"backups": backups}

# ==================== SYSTEM CONFIGURATION ENDPOINTS ====================

@app.get("/api/admin/system-config")
async def get_system_config(
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Get current system configuration (admin only)"""
    
    config_file = "config/system.json"
    default_config = {
        "validation_rules": {
            "enable_logical_error_detection": True,
            "require_supervisor_approval": True,
            "auto_approve_minor_corrections": False,
            "treatment_interruption_days": 28
        },
        "security": {
            "enable_two_factor": False,
            "password_expiry_days": 90,
            "session_timeout_minutes": 30,
            "max_login_attempts": 5
        },
        "data_retention": {
            "policy": "archive_6_months",
            "archive_days": 180,
            "auto_delete_days": None
        }
    }
    
    if os.path.exists(config_file):
        with open(config_file, "r") as f:
            config = json.load(f)
            return config
    
    return default_config

@app.post("/api/admin/system-config")
async def update_system_config(
    config: Dict[str, Any],
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Update system configuration (admin only)"""
    
    config_file = "config/system.json"
    os.makedirs("config", exist_ok=True)
    
    with open(config_file, "w") as f:
        json.dump(config, f, indent=2)
    
    return {"message": "Configuration saved successfully"}

# ==================== DATABASE MAINTENANCE ENDPOINTS ====================

@app.post("/api/admin/database/cleanup")
async def cleanup_database(
    days_to_keep: int = 365,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Clean up old data (admin only)"""
    
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)
    
    # Get old cycles (completed and older than cutoff)
    old_cycles = db.query(ValidationCycle).filter(
        ValidationCycle.end_date.isnot(None),
        ValidationCycle.end_date < cutoff_date
    ).all()
    
    deleted_cycles = 0
    deleted_patients = 0
    deleted_validations = 0
    
    for cycle in old_cycles:
        # Count patients in this cycle
        patients = db.query(RADETRecord).filter(RADETRecord.cycle_id == cycle.id).count()
        validations = db.query(ValidationResult).filter(ValidationResult.cycle_id == cycle.id).count()
        
        # Delete cascade should handle related records
        db.delete(cycle)
        
        deleted_cycles += 1
        deleted_patients += patients
        deleted_validations += validations
    
    db.commit()
    
    return {
        "message": "Database cleanup completed",
        "deleted": {
            "cycles": deleted_cycles,
            "patients": deleted_patients,
            "validations": deleted_validations
        },
        "cutoff_date": cutoff_date.isoformat()
    }

@app.get("/api/debug/test-queries")
async def debug_test_queries(db: Session = Depends(get_db)):
    """Test the exact queries used by dashboard"""
    cycle = db.query(ValidationCycle).filter(ValidationCycle.is_active == True).first()
    
    results = {
        "active_cycle_exists": cycle is not None,
        "queries": {}
    }
    
    if not cycle:
        return results
    
    # Test dashboard stats query
    total_clients = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True
    ).count()
    
    validated_clients = db.query(ValidationResult.patient_id).filter(
        ValidationResult.cycle_id == cycle.id
    ).distinct().count()
    
    mismatches = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id,
        ValidationResult.status == ValidationStatus.MISMATCH
    ).count()
    
    # Test quality metrics queries
    validations = db.query(ValidationResult).filter(
        ValidationResult.cycle_id == cycle.id
    ).all()
    
    status_counts = {}
    for v in validations:
        status_counts[v.status] = status_counts.get(v.status, 0) + 1
    
    today = datetime.now()
    threshold_date = today - timedelta(days=28)
    
    interruption_risk = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True,
        RADETRecord.last_drug_pickup.isnot(None),
        RADETRecord.last_drug_pickup < threshold_date
    ).count()
    
    missing_vl = db.query(RADETRecord).filter(
        RADETRecord.cycle_id == cycle.id,
        RADETRecord.is_active == True,
        RADETRecord.last_vl_result == None
    ).count()
    
    results["queries"] = {
        "dashboard_stats": {
            "total_clients": total_clients,
            "validated_clients": validated_clients,
            "mismatches": mismatches,
            "remaining": total_clients - validated_clients
        },
        "quality_metrics": {
            "total_validations": len(validations),
            "status_breakdown": status_counts,
            "treatment_interruption_risk": interruption_risk,
            "missing_vl_results": missing_vl
        }
    }
    
    # Show sample of actual data
    if total_clients > 0:
        sample_patient = db.query(RADETRecord).filter(
            RADETRecord.cycle_id == cycle.id
        ).first()
        results["sample_patient"] = {
            "id": sample_patient.id,
            "hospital_number": sample_patient.hospital_number,
            "last_drug_pickup": sample_patient.last_drug_pickup.strftime("%Y-%m-%d") if sample_patient.last_drug_pickup else None,
            "last_vl_result": sample_patient.last_vl_result
        }
    
    if len(validations) > 0:
        sample_validation = validations[0]
        results["sample_validation"] = {
            "id": sample_validation.id,
            "hospital_number": sample_validation.hospital_number,
            "status": sample_validation.status,
            "field_name": sample_validation.field_name
        }
    
    return results

# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting RADET Validation System...")
    print("=" * 50)
    print(f"📊 Database: {DATABASE_URL}")
    print(f"🌐 Local access: http://localhost:{PORT}")
    print(f"🌍 Network access: http://{LOCAL_IP}:{PORT}")
    print(f"📝 API Documentation: http://localhost:{PORT}/docs")
    print(f"📝 Network API Docs: http://{LOCAL_IP}:{PORT}/docs")
    print("\n💡 Other devices on the same network can connect using:")
    print(f"   http://{LOCAL_IP}:{PORT}")
    print("\n⚠️  Make sure your firewall allows connections on port", PORT)
    print("=" * 50)
    print("⏳ Press Ctrl+C to stop the server")
    
    try:
        uvicorn.run(
            "main:app",
            host=HOST,
            port=PORT,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        traceback.print_exc()