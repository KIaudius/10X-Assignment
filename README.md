# Autonomous Wall-Finishing Robot Control System

A web-based application for planning and visualizing coverage paths for an autonomous wall-finishing robot. The system allows users to define walls, add obstacles, and generate optimized trajectories for complete coverage.

## Features

- Interactive wall creation with custom dimensions
- Obstacle placement (windows, doors, etc.)
- Boustrophedon coverage path planning
- Real-time visualization of the robot's path
- Trajectory playback with play/pause/stop controls (robot animates directly on the canvas)
- Responsive design that works on desktop and tablet devices
- Full backend/frontend integration (data is persisted and all actions use the API)

## Prerequisites

- Python 3.8+
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
   .\venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the FastAPI backend (serves both API and frontend):
   ```bash
   uvicorn app.main:app --reload
   ```

2. The application will be available at:
   ```
   http://127.0.0.1:8000
   ```

- The frontend is served from `/static/` (e.g., `/static/js/app.js`).
- All static files must be present in `frontend/static/`.

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
│   ├── static/
│   │   ├── styles.css
│   │   └── js/
│   │       ├── app.js
│   │       ├── api-client.js
│   │       ├── trajectory-player.js
│   │       └── wall-visualizer.js
│   └── index.html
├── tests/                        # Test files
│   └── __init__.py
├── requirements.txt              # Python dependencies
├── .gitignore                    # Git ignore rules
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

## Troubleshooting

- **Play button is disabled:**
  - Make sure you have planned a trajectory (the trajectory must not be empty).
  - Check the browser console for errors or empty trajectory logs.
  - Ensure the backend is running and accessible at `http://127.0.0.1:8000`.

- **Static files (JS/CSS) not loading:**
  - Make sure all JS files are present in `frontend/static/js/`.
  - Restart the FastAPI server if you add or update static files.
  - Hard refresh your browser (Ctrl+Shift+R).

- **Trajectory is empty:**
  - Check your wall and robot dimensions. The robot must fit inside the wall.
  - Remove obstacles and try again.
  - See the browser console for the coverage request and backend response.

- **Other issues:**
  - Check the `.gitignore` file to ensure you are not committing unnecessary files.
  - See the logs in `app.log` for backend errors.

## Testing

To run the tests:

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app tests/
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

- Please make sure to update tests as appropriate.
- Follow the existing code style and structure.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- FastAPI for the awesome web framework
- Canvas API for 2D rendering
- Boustrophedon decomposition algorithm for coverage planning
