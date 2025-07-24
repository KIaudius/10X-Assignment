# Autonomous Wall-Finishing Robot Control System

A web-based application for planning and visualizing coverage paths for an autonomous wall-finishing robot. The system allows users to define walls, add obstacles, and generate optimized trajectories for complete coverage.

## Features

- Interactive wall creation with custom dimensions
- Obstacle placement (windows, doors, etc.)
- Boustrophedon coverage path planning
- Real-time visualization of the robot's path
- Trajectory playback with play/pause/stop controls
- Responsive design that works on desktop and tablet devices

## Prerequisites

- Python 3.8+
- Node.js 14+ (for frontend development)
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wall_robot
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   # On Windows
   python -m venv venv
   .\\venv\\Scripts\\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the FastAPI backend:
   ```bash
   cd app
   uvicorn main:app --reload
   ```

2. The application will be available at:
   ```
   http://127.0.0.1:8000
   ```

3. For development with live reloading of frontend changes, you can use a simple HTTP server:
   ```bash
   # From the project root
   cd frontend
   python -m http.server 8001
   ```
   Then open `http://localhost:8001` in your browser.

## Project Structure

```
wall_robot/
├── app/                          # Backend application
│   ├── api/                      # API endpoints
│   │   ├── __init__.py
│   │   ├── walls.py
│   │   ├── obstacles.py
│   │   └── trajectories.py
│   ├── core/                     # Core functionality
│   │   └── __init__.py
│   ├── db/                       # Database configuration
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── crud.py
│   ├── models/                   # Database models
│   │   ├── __init__.py
│   │   └── models.py
│   ├── schemas/                  # Pydantic schemas
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   └── coverage_planner.py
│   └── main.py                   # FastAPI application entry point
├── frontend/                     # Frontend application
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api-client.js
│   │   ├── trajectory-player.js
│   │   └── wall-visualizer.js
│   ├── index.html
│   └── static/                   # Static assets
├── tests/                        # Test files
│   └── __init__.py
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

## API Documentation

Once the application is running, you can access the interactive API documentation at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Usage

1. **Create a Wall**
   - Enter the wall dimensions (width and height in meters)
   - Click "Create Wall"

2. **Add Obstacles**
   - Select obstacle type (window, door, etc.)
   - Enter dimensions or click and drag on the canvas to draw
   - Click "Add Obstacle" or release the mouse to place

3. **Plan Trajectory**
   - Set the robot width and desired overlap
   - Click "Plan Trajectory" to generate a coverage path

4. **Visualize and Playback**
   - Use the playback controls to visualize the robot's movement
   - Toggle between play, pause, and stop

## Testing

To run the tests:

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app tests/
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- FastAPI for the awesome web framework
- SQLAlchemy for ORM
- Canvas API for 2D rendering
- Boustrophedon decomposition algorithm for coverage planning
