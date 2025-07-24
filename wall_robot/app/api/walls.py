from fastapi import APIRouter, HTTPException, Query
from app.schemas.schemas import WallCreate, WallResponse
from app.db import crud
from typing import List

router = APIRouter()

@router.post("/", response_model=WallResponse)
def create_wall(wall: WallCreate):
    created_wall = crud.create_wall(wall)
    if not created_wall:
        raise HTTPException(status_code=500, detail="Failed to create wall")
    return created_wall

@router.get("/{wall_id}", response_model=WallResponse)
def get_wall(wall_id: int):
    wall = crud.get_wall(wall_id)
    if not wall:
        raise HTTPException(status_code=404, detail="Wall not found")
    return wall

@router.get("/", response_model=List[WallResponse])
def list_walls(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1)):
    from app.db import crud
    all_walls = crud.walls_db
    return all_walls[skip:skip+limit]
