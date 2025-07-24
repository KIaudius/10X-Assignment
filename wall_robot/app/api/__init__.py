# This file makes Python treat the directory as a package
from . import walls, obstacles, trajectories

# Import all routers to include them in the main FastAPI app
routers = [
    walls.router,
    obstacles.router,
    trajectories.router
]
