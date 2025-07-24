from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

# Base schemas
class Point2D(BaseModel):
    x: float = Field(..., gt=0, description="X coordinate in meters")
    y: float = Field(..., gt=0, description="Y coordinate in meters")

class Rectangle(BaseModel):
    x: float = Field(..., ge=0, description="X position in meters from bottom-left corner")
    y: float = Field(..., ge=0, description="Y position in meters from bottom-left corner")
    width: float = Field(..., gt=0, description="Width in meters")
    height: float = Field(..., gt=0, description="Height in meters")

# Wall schemas
class WallBase(BaseModel):
    width: float = Field(..., gt=0, description="Wall width in meters")
    height: float = Field(..., gt=0, description="Wall height in meters")

class WallCreate(WallBase):
    pass

class Wall(WallBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Obstacle schemas
class ObstacleBase(BaseModel):
    name: str = Field(..., max_length=100)
    x: float = Field(..., ge=0, description="X position in meters from bottom-left corner")
    y: float = Field(..., ge=0, description="Y position in meters from bottom-left corner")
    width: float = Field(..., gt=0, description="Width in meters")
    height: float = Field(..., gt=0, description="Height in meters")
    obstacle_type: str = Field(default="window", description="Type of obstacle (e.g., window, door)")

class ObstacleCreate(ObstacleBase):
    pass

class Obstacle(ObstacleBase):
    id: int
    wall_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Trajectory schemas
class TrajectoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    path: List[Point2D] = Field(..., min_items=2, description="List of [x, y] coordinates in meters")
    total_distance: float = Field(..., ge=0, description="Total distance of the trajectory in meters")

class TrajectoryCreate(TrajectoryBase):
    wall_id: int

class Trajectory(TrajectoryBase):
    id: int
    wall_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Request/Response schemas
class WallWithObstacles(Wall):
    obstacles: List[Obstacle] = []

class WallWithObstaclesAndTrajectories(WallWithObstacles):
    trajectories: List[Trajectory] = []

# Coverage planning
class CoverageRequest(BaseModel):
    wall: WallBase
    obstacles: List[ObstacleBase] = []
    robot_width: float = Field(0.2, gt=0, description="Width of the robot in meters")
    overlap: float = Field(0.1, ge=0, le=0.5, description="Overlap between passes as a fraction of robot width")

    @validator('obstacles')
    def validate_obstacles(cls, v, values):
        if 'wall' not in values:
            return v
            
        wall = values['wall']
        for obs in v:
            if obs.x + obs.width > wall.width or obs.y + obs.height > wall.height:
                raise ValueError(f"Obstacle {obs.name} is outside the wall boundaries")
        return v
