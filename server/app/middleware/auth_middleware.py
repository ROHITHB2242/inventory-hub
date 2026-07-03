# app/middleware/auth_middleware.py
# Purpose: FastAPI route protection dependency for verifying JWT tokens and fetching current user.

from fastapi import Request, HTTPException, status, Depends
from app.services.auth_service import decode_jwt_token
from app.services.user_service import get_user_by_id

async def get_current_user(request: Request) -> dict:
    """
    FastAPI dependency that extracts the JWT token from headers or cookies,
    verifies it, and returns the current authenticated user.
    """
    token = None
    
    # 1. Attempt to retrieve JWT from the Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        
    # 2. Secondary fallback: Attempt to retrieve JWT from access_token cookie
    if not token:
        token = request.cookies.get("access_token")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. Decode and validate the JWT token
    payload = decode_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 4. Enforce that this is an access token, not a refresh token
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 5. Fetch the user details using the token's subject (user ID)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is malformed.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Return user document if all validations pass
    return user
