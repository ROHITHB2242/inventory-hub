# app/controllers/auth_controller.py
# Purpose: Business logic controllers for User registration, session management, and Google OAuth.

import httpx
# pyrefly: ignore [missing-import]
from fastapi import Response, HTTPException, status
from app.config import settings
from app.models.user import UserSignUp, UserLogin, GoogleAuthRequest, serialize_user
from app.services.auth_service import hash_password, verify_password, create_jwt_token, decode_jwt_token
from app.services.user_service import get_user_by_email, create_user, get_user_by_id, upsert_google_user

async def signup_user(user_data: UserSignUp) -> dict:
    """
    Registers a new user using local email and password.
    """
    # Check if a user with the same email already exists
    existing = await get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Hash the password
    hashed = hash_password(user_data.password)

    # Insert user in DB
    new_user_doc = {
        "email": user_data.email.lower(),
        "name": user_data.name,
        "hashed_password": hashed,
        "provider": "local",
        "picture": None,
        "google_id": None
    }
    
    saved_user = await create_user(new_user_doc)
    return serialize_user(saved_user)

async def login_user(credentials: UserLogin, response: Response) -> dict:
    """
    Authenticates a user's credentials and sets the HttpOnly refresh token cookie.
    """
    user = await get_user_by_email(credentials.email)
    
    # Check if user exists and uses local provider
    if not user or user.get("provider") != "local" or not user.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password hash
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Generate Access and Refresh JWT Tokens
    user_id = str(user["_id"])
    access_token = create_jwt_token(user_id=user_id, is_refresh=False)
    refresh_token = create_jwt_token(user_id=user_id, is_refresh=True)

    # Set the refresh token in an HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )

    return {
        "access_token": access_token,
        "user": serialize_user(user)
    }

async def logout_user(response: Response) -> dict:
    """
    Clears session cookies to log out the user.
    """
    response.delete_cookie(key="refresh_token")
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out."}

async def refresh_access_token(refresh_token: str) -> dict:
    """
    Validates a refresh token and generates a new access token.
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again."
        )

    payload = decode_jwt_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please log in again."
        )

    user_id = payload.get("sub")
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User session could not be retrieved."
        )

    # Issue a new access token
    new_access_token = create_jwt_token(user_id=user_id, is_refresh=False)
    return {
        "access_token": new_access_token,
        "user": serialize_user(user)
    }

def get_google_oauth_url() -> dict:
    """
    Generates the URL to redirect the client to for Google sign-in.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return {
            "enabled": False,
            "url": ""
        }

    # Construct standard authorization code grant endpoint
    google_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    return {
        "enabled": True,
        "url": google_url
    }

async def google_oauth_callback(payload: GoogleAuthRequest, response: Response) -> dict:
    """
    Exchanges authorization code for Google user details and logs the user in.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth is not configured on this server."
        )

    # 1. Exchange code for Google Access Tokens
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": payload.code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google OAuth token exchange failed: {token_response.text}"
            )
        
        tokens = token_response.json()
        google_access_token = tokens.get("access_token")
        
        # 2. Fetch User Info from Google profile APIs
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        userinfo_headers = {"Authorization": f"Bearer {google_access_token}"}
        
        userinfo_response = await client.get(userinfo_url, headers=userinfo_headers)
        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve profile data from Google."
            )
            
        google_user = userinfo_response.json()
        
    # 3. Extract claims
    email = google_user.get("email")
    name = google_user.get("name", email.split("@")[0])
    picture = google_user.get("picture")
    google_id = google_user.get("sub")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google profile did not return a valid email address."
        )

    # 4. Save/update user document in MongoDB
    user = await upsert_google_user(
        email=email,
        name=name,
        picture=picture,
        google_id=google_id
    )

    # 5. Issue JWT tokens
    user_id = str(user["_id"])
    access_token = create_jwt_token(user_id=user_id, is_refresh=False)
    refresh_token = create_jwt_token(user_id=user_id, is_refresh=True)

    # Set refresh token in HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )

    return {
        "access_token": access_token,
        "user": serialize_user(user)
    }
