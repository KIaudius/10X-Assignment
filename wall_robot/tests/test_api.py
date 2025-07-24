import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
import sys

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.db.database import Base, get_db

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the database dependency with our test database
app.dependency_overrides[get_db] = override_get_db

# Test client
client = TestClient(app)

# Test data
TEST_WALL = {"width": 5.0, "height": 5.0}
TEST_OBSTACLE = {
    "name": "Test Window",
    "x": 1.0,
    "y": 1.0,
    "width": 0.5,
    "height": 0.5,
    "obstacle_type": "window"
}

# Fixture to reset the database before each test
@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_wall(test_db):
    """Test creating a new wall"""
    response = client.post("/api/walls/", json=TEST_WALL)
    assert response.status_code == 201
    data = response.json()
    assert data["width"] == TEST_WALL["width"]
    assert data["height"] == TEST_WALL["height"]
    assert "id" in data

def test_get_wall(test_db):
    """Test retrieving a wall by ID"""
    # Create a wall
    wall_id = client.post("/api/walls/", json=TEST_WALL).json()["id"]
    
    # Retrieve it
    response = client.get(f"/api/walls/{wall_id}")
    assert response.status_code == 200
    assert response.json()["id"] == wall_id

def test_add_obstacle(test_db):
    """Test adding an obstacle to a wall"""
    # Create a wall
    wall_id = client.post("/api/walls/", json=TEST_WALL).json()["id"]
    
    # Add obstacle
    response = client.post(
        f"/api/obstacles/?wall_id={wall_id}",
        json=TEST_OBSTACLE
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == TEST_OBSTACLE["name"]
    assert data["wall_id"] == wall_id

def test_plan_trajectory(test_db):
    """Test planning a trajectory"""
    # Create a wall and obstacle
    wall = client.post("/api/walls/", json=TEST_WALL).json()
    obstacle = client.post(
        f"/api/obstacles/?wall_id={wall['id']}",
        json=TEST_OBSTACLE
    ).json()
    
    # Plan trajectory
    response = client.post(
        "/api/trajectories/plan",
        json={
            "wall": wall,
            "obstacles": [obstacle],
            "robot_width": 0.2,
            "overlap": 0.1,
            "name": "Test Path"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "path" in data
    assert len(data["path"]) > 0
    assert data["total_distance"] > 0

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
