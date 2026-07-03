# app/routes/admin.py
# Purpose: FastAPI router mapping database admin collections view/delete operations.

from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.database import users_collection, products_collection
from app.models.user import serialize_user
from app.models.item import serialize_item
from app.middleware.auth_middleware import get_current_user
from typing import List

router = APIRouter(prefix="/api/admin/db", tags=["Admin DB"])

@router.get("/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """
    Fetch all users in the database collection.
    """
    users = []
    cursor = users_collection.find()
    async for user in cursor:
        users.append(serialize_user(user))
    return users

@router.get("/products")
async def get_all_products(current_user: dict = Depends(get_current_user)):
    """
    Fetch all products in the database collection (no scoping to current owner).
    """
    products = []
    cursor = products_collection.find()
    async for product in cursor:
        products.append(serialize_item(product))
    return products

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a specific user document by ID.
    """
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format")
    
    result = await users_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Also delete products associated with this user
    await products_collection.delete_many({"owner_id": oid})
    
    return {"message": "User and associated products successfully deleted."}

@router.delete("/products/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a specific product document by ID.
    """
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Product ID format")
    
    result = await products_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    return {"message": "Product successfully deleted from database."}
