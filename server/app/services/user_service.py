# app/services/user_service.py
# Purpose: Direct data access layer and service logic for User documents in MongoDB.

from datetime import datetime, timezone
from bson import ObjectId
from typing import Dict, Any, Optional
from app.database import users_collection

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a user document by their email address.
    """
    # Normalize email to lower case
    return await users_collection.find_one({"email": email.lower()})

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a user document by its MongoDB ObjectId.
    """
    try:
        return await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception as e:
        print(f"[-] Invalid ObjectId format for user_id {user_id}: {e}")
        return None

async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Inserts a new user document into the database.
    """
    # Standardize email inputs
    user_data["email"] = user_data["email"].lower()
    user_data["created_at"] = datetime.now(timezone.utc)
    user_data["provider"] = user_data.get("provider", "local")
    
    result = await users_collection.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    return user_data

async def upsert_google_user(email: str, name: str, picture: Optional[str], google_id: str) -> Dict[str, Any]:
    """
    Creates or updates a user who logs in via Google OAuth.
    If the email already exists in the system, binds the Google details,
    otherwise registers a new user with Google as the provider.
    """
    normalized_email = email.lower()
    existing_user = await get_user_by_email(normalized_email)
    
    if existing_user:
        # Update user with Google profile metadata and Google ID mapping
        update_fields = {
            "name": name,
            "google_id": google_id,
        }
        if picture:
            update_fields["picture"] = picture
            
        await users_collection.update_one(
            {"_id": existing_user["_id"]},
            {"$set": update_fields}
        )
        # Update the dict local fields to return
        existing_user.update(update_fields)
        return existing_user
    else:
        # User does not exist, insert new record with google provider and no password hash
        new_user = {
            "email": normalized_email,
            "name": name,
            "picture": picture,
            "google_id": google_id,
            "provider": "google",
            "hashed_password": None,
            "created_at": datetime.now(timezone.utc)
        }
        result = await users_collection.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return new_user
