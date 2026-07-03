# app/config.py
# Purpose: Environment configuration parser and validation settings.

import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# Load the local environment variables from .env
load_dotenv()

class Settings:
    # Server network settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", 8000))

    # MongoDB database connection parameters
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "dashboard_db")

    # Security configuration for JWT tokens
    JWT_SECRET: str = os.getenv("JWT_SECRET", "default_fallback_jwt_secret_key_string")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

    # Google OAuth credentials (optional login flow)
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/oauth-callback")

# Singleton instance of configuration settings to be imported by other files
settings = Settings()
