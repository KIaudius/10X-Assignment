from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Autonomous Wall-Finishing Robot API",
    description="API for controlling and monitoring an autonomous wall-finishing robot",
    version="0.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for frontend
frontend_path = Path(__file__).parent.parent / "frontend"
app.mount("/static", StaticFiles(directory=frontend_path / "static"), name="static")

# Middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.now()
    
    # Process the request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = (datetime.now() - start_time).total_seconds()
    
    # Log request details
    logger.info(
        f"Request: {request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Process Time: {process_time:.4f}s"
    )
    
    # Add header with process time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Import and include routers
from app.api import trajectories, obstacles
app.include_router(trajectories.router, prefix="/api/trajectories", tags=["trajectories"])
app.include_router(obstacles.router, prefix="/api/obstacles", tags=["obstacles"])

# Root endpoint to serve frontend
@app.get("/")
async def read_root():
    return {"message": "Autonomous Wall-Finishing Robot API is running"}
