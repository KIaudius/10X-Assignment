from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.db import crud
from app.schemas.schemas import Wall, WallCreate, WallWithObstacles, WallWithObstaclesAndTrajectories

router = APIRouter()

@router.post("/", response_model=Wall, status_code=status.HTTP_201_CREATED)
def create_wall(wall: WallCreate, db: Session = Depends(get_db)):
    """
    Create a new wall with the given dimensions.
    
    - **width**: Width of the wall in meters (must be > 0)
    - **height**: Height of the wall in meters (must be > 0)
    """
    return crud.create_wall(db=db, wall=wall)

@router.get("/", response_model=List[Wall])
def read_walls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of walls with pagination.
    
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Maximum number of items to return (for pagination)
    """
    walls = crud.get_walls(db, skip=skip, limit=limit)
    return walls

@router.get("/{wall_id}", response_model=WallWithObstaclesAndTrajectories)
def read_wall(wall_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific wall by ID, including its obstacles and trajectories.
    
    - **wall_id**: ID of the wall to retrieve
    """
    db_wall = crud.get_wall(db, wall_id=wall_id)
    if db_wall is None:
        raise HTTPException(status_code=404, detail="Wall not found")
    
    # Get wall with its relationships
    wall_data = WallWithObstaclesAndTrajectories.from_orm(db_wall)
    wall_data.obstacles = crud.get_obstacles_by_wall(db, wall_id=wall_id)
    wall_data.trajectories = crud.get_trajectories_by_wall(db, wall_id=wall_id)
    
    return wall_data

@router.put("/{wall_id}", response_model=Wall)
def update_wall(
    wall_id: int, 
    wall_update: WallCreate, 
    db: Session = Depends(get_db)
):
    """
    Update a wall's dimensions.
    
    - **wall_id**: ID of the wall to update
    - **width**: New width in meters (must be > 0)
    - **height**: New height in meters (must be > 0)
    """
    db_wall = crud.update_wall(db, wall_id=wall_id, wall_update=wall_update)
    if db_wall is None:
        raise HTTPException(status_code=404, detail="Wall not found")
    return db_wall

@router.delete("/{wall_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wall(wall_id: int, db: Session = Depends(get_db)):
    """
    Delete a wall and all its associated obstacles and trajectories.
    
    - **wall_id**: ID of the wall to delete
    """
    if not crud.delete_wall(db, wall_id=wall_id):
        raise HTTPException(status_code=404, detail="Wall not found")
    return {"message": "Wall deleted successfully"}
