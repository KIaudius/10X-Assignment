from pydantic import BaseModel
from typing import List


# ---------- Wall ----------
class WallCreate(BaseModel):
    width: float
    height: float

class WallResponse(WallCreate):
    id: int


# ---------- Obstacle ----------
class ObstacleCreate(BaseModel):
    wall_id: int
    type: str
    width: float
    height: float
    x: float
    y: float

class ObstacleResponse(ObstacleCreate):
    id: int


# ---------- Trajectory ----------
class Point(BaseModel):
    x: float
    y: float

class TrajectoryCreate(BaseModel):
    wall_width: float
    wall_height: float
    robot_width: float
    overlap_percent: float
    obstacles: List[ObstacleCreate]

class TrajectoryResponse(BaseModel):
    distance: float
    points: List[Point]

# ---------- Internal Geometry Utilities ----------
class Point2D(BaseModel):
    x: float
    y: float

class Rectangle(BaseModel):
    x: float
    y: float
    width: float
    height: float

class CoverageRequest(BaseModel):
    wall: WallCreate
    obstacles: List[ObstacleCreate]
    robot_width: float
    overlap: float
