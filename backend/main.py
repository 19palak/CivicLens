
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os
import shutil
import uuid

from database import Base, engine, get_db
from models import User, Issue


# Create database tables
Base.metadata.create_all(bind=engine)


# Folder to store uploaded issue photos
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Create FastAPI application
app = FastAPI(
    title="CivicLens API",
    description="Community civic issue reporting platform",
    version="1.0.0"
)


# Make uploaded photos accessible through a URL
app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)


# Allow the React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://civic-lens-lyart.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# JWT configuration
SECRET_KEY = "civiclens-development-secret-change-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# HTTP Bearer authentication
oauth2_scheme = HTTPBearer(auto_error=False)


# Request models
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class IssueCreate(BaseModel):
    title: str
    location: str
    category: str
    priority: str = "Medium"


# Password functions
def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


# JWT token function
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# Get the logged-in user from their JWT token
# Automatically use a demo user instead of requiring login
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # Find an existing demo user
    user = db.query(User).filter(
        User.email == "demo@civiclens.com"
    ).first()

    # Create the demo user if it doesn't exist
    if user is None:
        user = User(
            name="CivicLens Demo",
            email="demo@civiclens.com",
            password="demo"
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    return user


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to CivicLens API",
        "status": "running"
    }


# Health check endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "CivicLens"
    }


# Signup endpoint
@app.post("/api/auth/signup")
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Account created successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


# Login endpoint
@app.post("/api/auth/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user or not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# Create a new issue report
@app.post("/api/issues")
def create_issue(
    data: IssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_issue = Issue(
        title=data.title,
        location=data.location,
        category=data.category,
        priority=data.priority,
        status="Under Review",
        user_id=current_user.id
    )

    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)

    return {
        "message": "Issue report created successfully",
        "issue": {
            "id": new_issue.id,
            "title": new_issue.title,
            "location": new_issue.location,
            "category": new_issue.category,
            "priority": new_issue.priority,
            "status": new_issue.status,
            "user_id": new_issue.user_id,
            "created_at": new_issue.created_at,
            "photo_url": new_issue.photo_url
        }
    }


# Get all saved issue reports
@app.get("/api/issues")
def get_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issues = db.query(Issue).order_by(
        Issue.id.desc()
    ).all()

    return [
        {
            "id": issue.id,
            "title": issue.title,
            "location": issue.location,
            "category": issue.category,
            "priority": issue.priority,
            "status": issue.status,
            "user_id": issue.user_id,
            "created_at": issue.created_at,
            "photo_url": issue.photo_url
        }
        for issue in issues
    ]


# Upload a photo for an issue
@app.post("/api/issues/{issue_id}/upload-photo")
def upload_issue_photo(
    issue_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find the issue
    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    # Only the user who created the issue can upload its photo
    if issue.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot upload a photo for this issue"
        )

    # Check that the uploaded file is an image
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file"
        )

    # Create a unique filename
    file_extension = os.path.splitext(
        file.filename or ""
    )[1]

    filename = f"{uuid.uuid4()}{file_extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    # Save the uploaded image
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save the photo URL in the database
    issue.photo_url = f"/uploads/{filename}"

    db.commit()
    db.refresh(issue)

    return {
        "message": "Photo uploaded successfully",
        "filename": filename,
        "photo_url": issue.photo_url
    }

# Delete an issue
@app.delete("/api/issues/{issue_id}")
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find the issue
    issue = db.query(Issue).filter(
        Issue.id == issue_id
    ).first()

    # Check if issue exists
    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    # Only the user who created the issue can delete it
    if issue.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot delete this issue"
        )

    # Delete the issue from database
    db.delete(issue)
    db.commit()

    return {
        "message": "Issue deleted successfully"
    }