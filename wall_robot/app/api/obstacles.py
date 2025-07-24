from fastapi import APIRouter, HTTPException
from app.schemas.schemas import ObstacleCreate, ObstacleResponse, WallResponse
from typing import List
from app.db import crud

router = APIRouter()

@router.post("/", response_model=ObstacleResponse)
def add_obstacle(obstacle: ObstacleCreate):
    result = crud.create_obstacle(obstacle)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to add obstacle")
    return result

@router.get("/wall/{wall_id}", response_model=List[ObstacleResponse])
def get_obstacles_for_wall(wall_id: int):
    # Return all obstacles for the given wall_id
    return [obs for obs in crud.obstacles_db if obs.wall_id == wall_id]
