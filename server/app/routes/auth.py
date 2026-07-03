# app/routes/auth.py
# Purpose: FastAPI router mapping authentication endpoints to controllers.

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Response, Request, status
from app.models.user import UserSignUp, UserLogin, UserResponse, GoogleAuthRequest
from app.controllers import auth_controller
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserSignUp):
    """
    Register a new user account.
    """
    return await auth_controller.signup_user(payload)

@router.post("/login")
async def login(payload: UserLogin, response: Response):
    """
    Log in with email and password. Returns access token, sets HTTP-only refresh cookie.
    """
    return await auth_controller.login_user(payload, response)

@router.post("/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    """
    Log out the current user, clearing session cookies.
    """
    return await auth_controller.logout_user(response)

@router.post("/refresh")
async def refresh(request: Request):
    """
    Refresh access token using the HTTP-only refresh token cookie.
    """
    refresh_token = request.cookies.get("refresh_token")
    return await auth_controller.refresh_access_token(refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retrieve details of the currently authenticated user.
    """
    from app.models.user import serialize_user
    return serialize_user(current_user)

@router.get("/google/url")
async def get_google_url():
    """
    Retrieve Google OAuth redirect url (if Google integration is enabled).
    """
    return auth_controller.get_google_oauth_url()

@router.post("/google/callback")
async def google_callback(payload: GoogleAuthRequest, response: Response):
    """
    Callback endpoint to process Google OAuth redirection code.
    """
    return await auth_controller.google_oauth_callback(payload, response)
