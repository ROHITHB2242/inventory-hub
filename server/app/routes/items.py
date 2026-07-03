# app/routes/items.py
# Purpose: FastAPI router mapping item CRUD endpoints to controllers, protected by JWT auth.

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Query, status
from app.models.item import ItemResponse, ItemsListResponse, ItemCreate, ItemUpdate
from app.controllers import item_controller
from app.middleware.auth_middleware import get_current_user

# Prefix matches the implementation plan: /api/endpoints/products
router = APIRouter(prefix="/api/endpoints/products", tags=["Products"])

@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create(payload: ItemCreate, current_user: dict = Depends(get_current_user)):
    """
    Create a new product.
    """
    return await item_controller.create_product(payload, current_user)

@router.get("", response_model=ItemsListResponse)
async def list_items(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_dir: str = Query("desc", description="Sort direction (asc or desc)"),
    search: str = Query("", description="Search term filtering name, SKU, category, or description"),
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve products with pagination, sorting, and text filter query.
    """
    return await item_controller.list_products(
        current_user=current_user,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        search=search
    )

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """
    Retrieve aggregated dashboard key KPI metrics.
    """
    return await item_controller.get_stats(current_user)

@router.get("/{id}", response_model=ItemResponse)
async def get_by_id(id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieve details of a specific product.
    """
    return await item_controller.get_product(id, current_user)

@router.put("/{id}", response_model=ItemResponse)
async def update(id: str, payload: ItemUpdate, current_user: dict = Depends(get_current_user)):
    """
    Update an existing product.
    """
    return await item_controller.update_product(id, payload, current_user)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete(id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a product.
    """
    return await item_controller.delete_product(id, current_user)
