# app/controllers/item_controller.py
# Purpose: Controller endpoints handling CRUD actions and dashboard statistics.

# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status
from app.models.item import ItemCreate, ItemUpdate
from app.services import item_service

async def create_product(payload: ItemCreate, current_user: dict) -> dict:
    """
    Controller to handle creation of a new product item.
    """
    try:
        owner_id = str(current_user["_id"])
        new_item = await item_service.create_item(payload.model_dump(), owner_id)
        return new_item
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

async def get_product(item_id: str, current_user: dict) -> dict:
    """
    Controller to retrieve a product by ID.
    """
    owner_id = str(current_user["_id"])
    product = await item_service.get_item_by_id(item_id, owner_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you are not authorized to view it."
        )
    return product

async def update_product(item_id: str, payload: ItemUpdate, current_user: dict) -> dict:
    """
    Controller to update product details.
    """
    try:
        owner_id = str(current_user["_id"])
        # Update only fields that are provided in the payload body
        updated_item = await item_service.update_item(
            item_id=item_id,
            owner_id=owner_id,
            update_data=payload.model_dump(exclude_unset=True)
        )
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found or you are not authorized to modify it."
            )
        return updated_item
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

async def delete_product(item_id: str, current_user: dict) -> dict:
    """
    Controller to delete a product by ID.
    """
    owner_id = str(current_user["_id"])
    success = await item_service.delete_item(item_id, owner_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you are not authorized to delete it."
        )
    return {"message": "Product successfully deleted."}

async def list_products(
    current_user: dict,
    page: int = 1,
    size: int = 10,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    search: str = ""
) -> dict:
    """
    Controller to list products with filtering, sorting, and pagination.
    """
    owner_id = str(current_user["_id"])
    result = await item_service.list_items(
        owner_id=owner_id,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        search=search
    )
    return result

async def get_stats(current_user: dict) -> dict:
    """
    Controller to retrieve aggregate statistics for the dashboard.
    """
    owner_id = str(current_user["_id"])
    stats = await item_service.get_dashboard_stats(owner_id)
    return stats
