from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import logging
from datetime import datetime
import sys

# Fix: Add root path for absolute module import
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI instance
app = FastAPI(
    title="Autonomous Wall-Finishing Robot API",
    description="API to control and visualize autonomous wall painting robot",
    version="1.0.0"
)

# Enable CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
frontend_path = BASE_DIR / "frontend"
app.mount("/static", StaticFiles(directory=frontend_path / "static"), name="static")

# Root route to serve index.html
@app.get("/", response_class=FileResponse)
async def get_index():
    return frontend_path / "index.html"

# Health check route
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Import and mount API routers
from app.api import walls, obstacles, trajectories

app.include_router(walls.router, prefix="/api/walls", tags=["walls"])
app.include_router(obstacles.router, prefix="/api/obstacles", tags=["obstacles"])
app.include_router(trajectories.router, prefix="/api/trajectories", tags=["trajectories"])
