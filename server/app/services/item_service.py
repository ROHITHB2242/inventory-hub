# app/services/item_service.py
# Purpose: Service layer for implementing CRUD, search, pagination, and KPI aggregation on Products.

from datetime import datetime, timezone
from bson import ObjectId
from typing import Dict, Any, List, Tuple, Optional
from app.database import products_collection
from app.models.item import serialize_item

async def check_sku_unique(sku: str, exclude_item_id: Optional[str] = None) -> bool:
    """
    Checks if a SKU code is already taken in the database.
    Optionally excludes a specific item ID (useful when editing a product).
    """
    query = {"sku": sku.strip()}
    if exclude_item_id:
        try:
            query["_id"] = {"$ne": ObjectId(exclude_item_id)}
        except Exception:
            pass
            
    existing = await products_collection.find_one(query)
    return existing is None

async def create_item(item_data: Dict[str, Any], owner_id: str) -> Dict[str, Any]:
    """
    Inserts a new product after validating SKU uniqueness.
    """
    sku_val = item_data.get("sku", "")
    if not await check_sku_unique(sku_val):
        raise ValueError(f"SKU code '{sku_val}' is already registered to another product.")

    # Populate metadata fields
    item_doc = {
        **item_data,
        "sku": sku_val.strip(),
        "owner_id": ObjectId(owner_id),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = await products_collection.insert_one(item_doc)
    item_doc["_id"] = result.inserted_id
    return serialize_item(item_doc)

async def get_item_by_id(item_id: str, owner_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches a single product belonging to a specific owner.
    """
    try:
        doc = await products_collection.find_one({
            "_id": ObjectId(item_id),
            "owner_id": ObjectId(owner_id)
        })
        return serialize_item(doc) if doc else None
    except Exception:
        return None

async def update_item(item_id: str, owner_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates an existing product after checking SKU uniqueness and ownership.
    """
    try:
        oid = ObjectId(item_id)
        o_owner = ObjectId(owner_id)
    except Exception:
        return None

    # If SKU is being updated, check that it's unique
    if "sku" in update_data and update_data["sku"]:
        sku_val = update_data["sku"]
        if not await check_sku_unique(sku_val, item_id):
            raise ValueError(f"SKU code '{sku_val}' is already registered to another product.")
        update_data["sku"] = sku_val.strip()

    # Filter out None/empty fields to prevent overwriting with nulls
    clean_updates = {k: v for k, v in update_data.items() if v is not None}
    if not clean_updates:
        # Return without db edit if no fields changed
        return await get_item_by_id(item_id, owner_id)

    clean_updates["updated_at"] = datetime.now(timezone.utc)

    # Perform atomic update
    result = await products_collection.find_one_and_update(
        {"_id": oid, "owner_id": o_owner},
        {"$set": clean_updates},
        return_document=True
    )
    return serialize_item(result) if result else None

async def delete_item(item_id: str, owner_id: str) -> bool:
    """
    Deletes a product document by ID (verifying ownership).
    """
    try:
        result = await products_collection.delete_one({
            "_id": ObjectId(item_id),
            "owner_id": ObjectId(owner_id)
        })
        return result.deleted_count > 0
    except Exception:
        return False

async def list_items(
    owner_id: str,
    page: int = 1,
    size: int = 10,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    search: str = ""
) -> Dict[str, Any]:
    """
    Retrieves a paginated list of products matching optional text filters, isolated per user.
    """
    skip = (page - 1) * size
    query = {"owner_id": ObjectId(owner_id)}

    # Apply global text search filters
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"name": search_regex},
            {"sku": search_regex},
            {"category": search_regex},
            {"description": search_regex}
        ]

    # Map sorting direction
    direction = -1 if sort_dir.lower() == "desc" else 1

    # Execute aggregate/list query
    cursor = products_collection.find(query).sort(sort_by, direction).skip(skip).limit(size)
    docs = await cursor.to_list(length=size)
    
    # Count total matching rows
    total = await products_collection.count_documents(query)

    # Serialize items
    items = [serialize_item(doc) for doc in docs]
    
    # Calculate pages
    pages = (total + size - 1) // size if total > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

async def get_dashboard_stats(owner_id: str) -> Dict[str, Any]:
    """
    Computes dashboard analytics widgets for the current owner.
    """
    o_owner = ObjectId(owner_id)

    # 1. Base item counts
    total_items = await products_collection.count_documents({"owner_id": o_owner})
    out_of_stock = await products_collection.count_documents({"owner_id": o_owner, "quantity": 0})
    low_stock = await products_collection.count_documents({"owner_id": o_owner, "quantity": {"$gt": 0, "$lte": 5}})

    # 2. Aggregations (Total Stock Valuation)
    pipeline = [
        {"$match": {"owner_id": o_owner}},
        {"$group": {
            "_id": None,
            "total_value": {"$sum": {"$multiply": ["$price", "$quantity"]}}
        }}
    ]
    agg_result = await products_collection.aggregate(pipeline).to_list(length=1)
    total_value = agg_result[0]["total_value"] if agg_result else 0.0

    # 3. Recent activity list (Top 5 modified products)
    recent_cursor = products_collection.find({"owner_id": o_owner}).sort("updated_at", -1).limit(5)
    recent_docs = await recent_cursor.to_list(length=5)

    recent_activity = []
    for doc in recent_docs:
        recent_activity.append({
            "id": str(doc["_id"]),
            "name": doc["name"],
            "sku": doc["sku"],
            "quantity": doc["quantity"],
            "updated_at": doc["updated_at"]
        })

    return {
        "total_items": total_items,
        "out_of_stock": out_of_stock,
        "low_stock": low_stock,
        "total_value": round(total_value, 2),
        "recent_activity": recent_activity
    }
