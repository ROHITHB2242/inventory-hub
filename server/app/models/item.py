# app/models/item.py
# Purpose: Define data models and validation schemas for Item (Product) entities.

from datetime import datetime
from typing import Optional, List, Any, Dict
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field

class ItemCreate(BaseModel):
    """
    Schema for validating creation of a new Product.
    """
    name: str = Field(..., min_length=3, max_length=100, description="Product name (3 to 100 chars).")
    sku: str = Field(..., min_length=3, max_length=30, description="Unique stock keeping unit code.")
    category: str = Field(..., min_length=2, max_length=50, description="Product category.")
    price: float = Field(..., gt=0, description="Price must be a positive number.")
    quantity: int = Field(..., ge=0, description="Quantity must be zero or a positive integer.")
    description: Optional[str] = Field("", description="Optional details about the product.")

class ItemUpdate(BaseModel):
    """
    Schema for validating updates to an existing Product.
    Fields are optional, but validate constraints if passed.
    """
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    sku: Optional[str] = Field(None, min_length=3, max_length=30)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = Field(None)

class ItemResponse(BaseModel):
    """
    Data structure for returning a single item's details.
    """
    id: str
    owner_id: str
    name: str
    sku: str
    category: str
    price: float
    quantity: int
    description: str
    status: str  # Calculated dynamically: 'In Stock', 'Low Stock', 'Out of Stock'
    created_at: datetime
    updated_at: datetime

class ItemsListResponse(BaseModel):
    """
    Paginated API wrapper response schema.
    """
    items: List[ItemResponse]
    total: int
    page: int
    size: int
    pages: int

def serialize_item(item_doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Translates MongoDB database object to structured JSON response.
    Computes inventory stock status dynamically.
    """
    if not item_doc:
        return {}
    
    # Calculate status dynamically from stock count
    qty = int(item_doc.get("quantity", 0))
    if qty == 0:
        status = "Out of Stock"
    elif qty <= 5:
        status = "Low Stock"
    else:
        status = "In Stock"

    return {
        "id": str(item_doc["_id"]),
        "owner_id": str(item_doc["owner_id"]),
        "name": item_doc["name"],
        "sku": item_doc["sku"],
        "category": item_doc["category"],
        "price": float(item_doc["price"]),
        "quantity": qty,
        "description": item_doc.get("description", ""),
        "status": status,
        "created_at": item_doc.get("created_at"),
        "updated_at": item_doc.get("updated_at")
    }
