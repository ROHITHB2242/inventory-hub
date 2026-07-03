# app/services/auth_service.py
# Purpose: Service utility for hashing passwords and generating/verifying JWT tokens.

# pyrefly: ignore [missing-import]
import bcrypt
# pyrefly: ignore [missing-import]
import jwt
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from app.config import settings

def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using Bcrypt with a secure salt.
    """
    salt = bcrypt.gensalt(rounds=12)
    # Encode password to bytes, generate salt, hash, and return as UTF-8 string
    hashed_bytes = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_bytes.decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies that a plain-text password matches a hashed password from the database.
    """
    try:
        # bcrypt.checkpw requires bytes as inputs
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception as e:
        print(f"[-] Password verification encountered error: {e}")
        return False

def create_jwt_token(user_id: str, expires_delta: Optional[timedelta] = None, is_refresh: bool = False) -> str:
    """
    Creates a encoded JWT token for a given user ID.
    Args:
        user_id (str): User identifier stored in the 'sub' claim.
        expires_delta (timedelta): Custom expiry time.
        is_refresh (bool): Generates a refresh token if True, else an access token.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        if is_refresh:
            expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        else:
            expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            
    payload = {
        "sub": str(user_id),
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "type": "refresh" if is_refresh else "access"
    }
    
    # Sign and encode token
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_jwt_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a signed JWT token.
    Returns:
        dict: The decoded payload if token is valid, or empty dict if invalid/expired.
    """
    try:
        decoded_payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return decoded_payload
    except jwt.ExpiredSignatureError:
        print("[-] JWT validation error: Token signature has expired.")
        return {}
    except jwt.InvalidTokenError as e:
        print(f"[-] JWT validation error: Invalid token structure: {e}")
        return {}
