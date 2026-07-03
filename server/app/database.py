# app/database.py
# Purpose: Initialize MongoDB async database client and provide collection hooks.

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Initialize the async MongoDB client using the URI from settings
client = AsyncIOMotorClient(settings.MONGODB_URI)

# Get the database instance
db = client[settings.MONGODB_DB_NAME]

# Define collections for use in repository and service layers
users_collection = db["users"]
products_collection = db["products"]

async def check_db_connection() -> bool:
    """
    Pings the MongoDB server to verify that the connection has been successfully established.
    Returns:
        bool: True if connection is alive, False otherwise.
    """
    try:
        # Execute the admin ping command (returns {ok: 1.0} if successful)
        await db.command("ping")
        return True
    except Exception as e:
        # Log the connection failure details to console
        print(f"[-] Database connection check failed: {e}")
        return False
