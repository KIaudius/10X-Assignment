from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas

def get_wall(db: Session, wall_id: int):
    """Get a wall by ID"""
    return db.query(models.Wall).filter(models.Wall.id == wall_id).first()

def get_walls(db: Session, skip: int = 0, limit: int = 100):
    """Get a list of walls with pagination"""
    return db.query(models.Wall).offset(skip).limit(limit).all()

def create_wall(db: Session, wall: schemas.WallCreate):
    """Create a new wall"""
    db_wall = models.Wall(**wall.dict())
    db.add(db_wall)
    db.commit()
    db.refresh(db_wall)
    return db_wall

def update_wall(db: Session, wall_id: int, wall_update: schemas.WallBase):
    """Update an existing wall"""
    db_wall = get_wall(db, wall_id)
    if not db_wall:
        return None
    
    update_data = wall_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_wall, field, value)
    
    db.add(db_wall)
    db.commit()
    db.refresh(db_wall)
    return db_wall

def delete_wall(db: Session, wall_id: int):
    """Delete a wall and all its associated obstacles and trajectories"""
    db_wall = get_wall(db, wall_id)
    if not db_wall:
        return False
    
    db.delete(db_wall)
    db.commit()
    return True

def get_obstacle(db: Session, obstacle_id: int):
    """Get an obstacle by ID"""
    return db.query(models.Obstacle).filter(models.Obstacle.id == obstacle_id).first()

def get_obstacles_by_wall(db: Session, wall_id: int):
    """Get all obstacles for a specific wall"""
    return db.query(models.Obstacle).filter(models.Obstacle.wall_id == wall_id).all()

def create_obstacle(db: Session, obstacle: schemas.ObstacleCreate, wall_id: int):
    """Create a new obstacle for a wall"""
    db_obstacle = models.Obstacle(**obstacle.dict(), wall_id=wall_id)
    db.add(db_obstacle)
    db.commit()
    db.refresh(db_obstacle)
    return db_obstacle

def delete_obstacle(db: Session, obstacle_id: int):
    """Delete an obstacle"""
    db_obstacle = get_obstacle(db, obstacle_id)
    if not db_obstacle:
        return False
    
    db.delete(db_obstacle)
    db.commit()
    return True

def get_trajectory(db: Session, trajectory_id: int):
    """Get a trajectory by ID"""
    return db.query(models.Trajectory).filter(models.Trajectory.id == trajectory_id).first()

def get_trajectories_by_wall(db: Session, wall_id: int, skip: int = 0, limit: int = 100):
    """Get all trajectories for a specific wall"""
    return db.query(models.Trajectory).filter(
        models.Trajectory.wall_id == wall_id
    ).offset(skip).limit(limit).all()

def create_trajectory(db: Session, trajectory: schemas.TrajectoryCreate, wall_id: int):
    """Create a new trajectory for a wall"""
    # Convert path to list of points
    path_data = [{"x": point.x, "y": point.y} for point in trajectory.path]
    
    db_trajectory = models.Trajectory(
        name=trajectory.name,
        wall_id=wall_id,
        path=path_data,
        total_distance=trajectory.total_distance
    )
    
    db.add(db_trajectory)
    db.commit()
    db.refresh(db_trajectory)
    return db_trajectory

def delete_trajectory(db: Session, trajectory_id: int):
    """Delete a trajectory"""
    db_trajectory = get_trajectory(db, trajectory_id)
    if not db_trajectory:
        return False
    
    db.delete(db_trajectory)
    db.commit()
    return True
