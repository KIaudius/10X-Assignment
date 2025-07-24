from fastapi import APIRouter, HTTPException
from app.schemas.schemas import (
    TrajectoryCreate,
    TrajectoryResponse,
    WallResponse,
    ObstacleResponse,
    CoverageRequest,
)

from app.services import coverage_planner
from app.services.coverage_planner import calculate_path_length

router = APIRouter()

@router.post("/", response_model=TrajectoryResponse)
def plan_trajectory(request: TrajectoryResponse):
    try:
        result = coverage_planner.plan_trajectory(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/plan", response_model=TrajectoryResponse)
def plan_trajectory_plan(request: CoverageRequest):
    try:
        path = coverage_planner.plan_coverage(request)
        distance = calculate_path_length(path)
        return {"distance": distance, "points": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
