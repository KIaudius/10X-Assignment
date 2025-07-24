from app.schemas.schemas import WallCreate, WallResponse, ObstacleCreate, ObstacleResponse

# In-memory storage
walls_db = []
obstacles_db = []

def create_wall(wall: WallCreate) -> WallResponse:
    wall_id = len(walls_db) + 1
    wall_data = WallResponse(id=wall_id, **wall.dict())
    walls_db.append(wall_data)
    return wall_data

def get_wall(wall_id: int) -> WallResponse | None:
    for wall in walls_db:
        if wall.id == wall_id:
            return wall
    return None

def create_obstacle(obstacle: ObstacleCreate) -> ObstacleResponse:
    obstacle_id = len(obstacles_db) + 1
    obstacle_data = ObstacleResponse(id=obstacle_id, **obstacle.dict())
    obstacles_db.append(obstacle_data)
    return obstacle_data
