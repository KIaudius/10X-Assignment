from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.db.database import get_db
from app.db import crud
from app.schemas.schemas import (
    Trajectory, 
    TrajectoryCreate, 
    CoverageRequest,
    Wall,
    Obstacle
)
from app.services.coverage_planner import plan_coverage, calculate_path_length

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/plan", response_model=Trajectory, status_code=status.HTTP_201_CREATED)
def plan_trajectory(
    coverage_request: CoverageRequest,
    name: str = "Coverage Path",
    db: Session = Depends(get_db)
):
    """
    Plan a coverage trajectory for a wall with optional obstacles.
    
    - **wall**: Wall dimensions (width and height in meters)
    - **obstacles**: List of obstacles on the wall (optional)
    - **robot_width**: Width of the robot in meters (default: 0.2m)
    - **overlap**: Overlap between passes as a fraction of robot width (0-1, default: 0.1)
    - **name**: Name for the trajectory (default: "Coverage Path")
    """
    try:
        # Plan the coverage path
        path = plan_coverage(coverage_request)
        
        # Calculate total distance
        total_distance = calculate_path_length(path)
        
        # Create trajectory in database
        trajectory = TrajectoryCreate(
            name=name,
            path=path,
            total_distance=total_distance
        )
        
        db_trajectory = crud.create_trajectory(
            db=db,
            trajectory=trajectory,
            wall_id=coverage_request.wall.id
        )
        
        return db_trajectory
        
    except Exception as e:
        logger.error(f"Error planning trajectory: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to plan trajectory: {str(e)}"
        )

@router.get("/wall/{wall_id}", response_model=List[Trajectory])
def get_trajectories_for_wall(
    wall_id: int = Path(..., title="The ID of the wall to get trajectories for"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all trajectories for a specific wall.
    
    - **wall_id**: ID of the wall to get trajectories for
    - **skip**: Number of items to skip (pagination)
    - **limit**: Maximum number of items to return (pagination)
    """
    # Check if wall exists
    if not crud.get_wall(db, wall_id=wall_id):
        raise HTTPException(status_code=404, detail="Wall not found")
    
    return crud.get_trajectories_by_wall(db, wall_id=wall_id, skip=skip, limit=limit)

@router.get("/{trajectory_id}", response_model=Trajectory)
def get_trajectory(
    trajectory_id: int = Path(..., title="The ID of the trajectory to get"),
    db: Session = Depends(get_db)
):
    """
    Get a specific trajectory by ID.
    
    - **trajectory_id**: ID of the trajectory to retrieve
    """
    db_trajectory = crud.get_trajectory(db, trajectory_id=trajectory_id)
    if db_trajectory is None:
        raise HTTPException(status_code=404, detail="Trajectory not found")
    return db_trajectory

@router.delete("/{trajectory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trajectory(
    trajectory_id: int = Path(..., title="The ID of the trajectory to delete"),
    db: Session = Depends(get_db)
):
    """
    Delete a trajectory.
    
    - **trajectory_id**: ID of the trajectory to delete
    """
    if not crud.delete_trajectory(db, trajectory_id=trajectory_id):
        raise HTTPException(status_code=404, detail="Trajectory not found")
    return {"message": "Trajectory deleted successfully"}
