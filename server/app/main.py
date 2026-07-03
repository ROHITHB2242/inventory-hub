# app/main.py
# Purpose: Main application bootstrap, middleware setup, and router registration.

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import check_db_connection
from app.routes import auth, items, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Asynchronous lifespan manager that checks database connectivity on startup.
    """
    print("[*] Starting up FastAPI Application...")
    db_connected = await check_db_connection()
    if db_connected:
        print("[+] MongoDB connected successfully.")
    else:
        print("[-] WARNING: MongoDB could not be reached. Ensure database is running.")
    yield
    print("[*] Shutting down FastAPI Application...")

# Initialize the app with metadata and lifecycle hooks
app = FastAPI(
    title="Full-Stack Dashboard API",
    description="Backend API services managing authentication and product inventory CRUD.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware
# Must allow the frontend domain and allow credentials for HttpOnly cookie tracking
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(items.router)
app.include_router(admin.router)

# Custom global exception handler for unhandled exceptions to return structured JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all error handler returning user-friendly messages for unexpected runtime exceptions.
    """
    print(f"[-] Unhandled exception at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again later."}
    )

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Simple heartbeat endpoint to verify API server status.
    """
    db_status = await check_db_connection()
    return {
        "status": "healthy" if db_status else "degraded",
        "database": "connected" if db_status else "disconnected"
    }
@app.get("/")
def root():
    return {"message": "Inventory Hub API is running"}
@app.head("/")
def root_head():
    return
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://inventory-hub-eight-ashen.vercel.app",
]