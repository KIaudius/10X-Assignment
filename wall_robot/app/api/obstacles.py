from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import crud
from app.schemas.schemas import Obstacle, ObstacleCreate, Wall

router = APIRouter()

@router.post("/", response_model=Obstacle, status_code=status.HTTP_201_CREATED)
def create_obstacle(
    obstacle: ObstacleCreate,
    wall_id: int,
    db: Session = Depends(get_db)
):
    """
    Create a new obstacle on a wall.
    
    - **wall_id**: ID of the wall to add the obstacle to
    - **name**: Name of the obstacle (e.g., "Window 1")
    - **x**: X position in meters from the bottom-left corner
    - **y**: Y position in meters from the bottom-left corner
    - **width**: Width of the obstacle in meters
    - **height**: Height of the obstacle in meters
    - **obstacle_type**: Type of obstacle (e.g., "window", "door")
    """
    # Check if wall exists
    db_wall = crud.get_wall(db, wall_id=wall_id)
    if not db_wall:
        raise HTTPException(status_code=404, detail="Wall not found")
    
    # Check if obstacle is within wall boundaries
    if (obstacle.x < 0 or obstacle.y < 0 or 
        obstacle.x + obstacle.width > db_wall.width or 
        obstacle.y + obstacle.height > db_wall.height):
        raise HTTPException(
            status_code=400, 
            detail="Obstacle must be within wall boundaries"
        )
    
    return crud.create_obstacle(db=db, obstacle=obstacle, wall_id=wall_id)

@router.get("/wall/{wall_id}", response_model=List[Obstacle])
def read_obstacles(
    wall_id: int = Path(..., title="The ID of the wall to get obstacles for"),
    db: Session = Depends(get_db)
):
    """
    Get all obstacles for a specific wall.
    
    - **wall_id**: ID of the wall to get obstacles for
    """
    # Check if wall exists
    if not crud.get_wall(db, wall_id=wall_id):
        raise HTTPException(status_code=404, detail="Wall not found")
    
    return crud.get_obstacles_by_wall(db, wall_id=wall_id)

@router.get("/{obstacle_id}", response_model=Obstacle)
def read_obstacle(
    obstacle_id: int = Path(..., title="The ID of the obstacle to get"),
    db: Session = Depends(get_db)
):
    """
    Get a specific obstacle by ID.
    
    - **obstacle_id**: ID of the obstacle to retrieve
    """
    db_obstacle = crud.get_obstacle(db, obstacle_id=obstacle_id)
    if db_obstacle is None:
        raise HTTPException(status_code=404, detail="Obstacle not found")
    return db_obstacle

@router.delete("/{obstacle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_obstacle(
    obstacle_id: int = Path(..., title="The ID of the obstacle to delete"),
    db: Session = Depends(get_db)
):
    """
    Delete an obstacle.
    
    - **obstacle_id**: ID of the obstacle to delete
    """
    if not crud.delete_obstacle(db, obstacle_id=obstacle_id):
        raise HTTPException(status_code=404, detail="Obstacle not found")
    return {"message": "Obstacle deleted successfully"}
