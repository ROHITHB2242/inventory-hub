# app/models/user.py
# Purpose: Define data models and validation schemas for User entities.

import re
from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserSignUp(BaseModel):
    """
    Validation schema for creating a new user (SignUp request).
    """
    email: EmailStr = Field(..., description="A valid email address.")
    name: str = Field(..., min_length=2, max_length=50, description="Full name of the user (2 to 50 chars).")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long.")

    @field_validator('password')
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        """
        Validates password strength (uppercase, lowercase, digit, and special char).
        """
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one numeric digit.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character (e.g. !@#$%^&*).")
        return v

class UserLogin(BaseModel):
    """
    Validation schema for user authentication (Login request).
    """
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """
    Schema for serializing a user to be returned in API responses.
    """
    id: str
    email: str
    name: str
    provider: str  # 'local' or 'google'
    picture: Optional[str] = None
    created_at: datetime

class GoogleAuthRequest(BaseModel):
    """
    Schema validating the authorization code sent from client to server during Google OAuth login.
    """
    code: str

def serialize_user(user_doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converts MongoDB user document dictionary into API response format.
    Handles translating ObjectId to a string.
    """
    if not user_doc:
        return {}
    return {
        "id": str(user_doc["_id"]),
        "email": user_doc["email"],
        "name": user_doc["name"],
        "provider": user_doc.get("provider", "local"),
        "picture": user_doc.get("picture"),
        "created_at": user_doc.get("created_at")
    }
