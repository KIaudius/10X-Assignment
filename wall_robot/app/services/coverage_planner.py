from typing import List, Tuple, Optional
import math
from app.schemas.schemas import Point2D, Rectangle, CoverageRequest

def boustrophedon_path(
    width: float,
    height: float,
    robot_width: float,
    overlap: float = 0.1,
    start_corner: str = "bottom-left",
    margin: float = 0.0
) -> List[Point2D]:
    """
    Generate a boustrophedon (lawnmower) coverage path for a rectangular area.
    
    Args:
        width: Width of the area to cover (meters)
        height: Height of the area to cover (meters)
        robot_width: Width of the robot (meters)
        overlap: Overlap between passes as a fraction of robot width (0-1)
        start_corner: Starting corner ('bottom-left', 'top-left', 'bottom-right', 'top-right')
        margin: Margin from the edges (meters)
        
    Returns:
        List of points representing the path
    """
    # Calculate the effective width after accounting for overlap
    effective_width = robot_width * (1 - overlap)
    
    # Calculate number of passes needed
    num_passes = math.ceil((width - 2 * margin) / effective_width)
    
    # Adjust the actual step size to evenly distribute the passes
    if num_passes > 1:
        step_size = (width - 2 * margin) / (num_passes - 1)
    else:
        step_size = 0
    
    path = []
    
    for i in range(num_passes):
        x = margin + i * step_size
        
        # Determine y coordinates for this pass
        y_start = margin
        y_end = height - margin
        
        # Alternate direction for each pass
        if i % 2 == 0:
            path.append(Point2D(x=x, y=y_start))
            path.append(Point2D(x=x, y=y_end))
        else:
            path.append(Point2D(x=x, y=y_end))
            path.append(Point2D(x=x, y=y_start))
    
    # Adjust path based on start corner
    if start_corner in ["top-left", "top-right"]:
        path = [Point2D(x=p.x, y=height - p.y) for p in path]
    
    if start_corner in ["top-right", "bottom-right"]:
        path = [Point2D(x=width - p.x, y=p.y) for p in path]
    
    return path

def is_point_inside_obstacle(
    point: Point2D,
    obstacle: Rectangle,
    margin: float = 0.0
) -> bool:
    """Check if a point is inside an obstacle (with optional margin)"""
    return (
        (obstacle.x - margin) <= point.x <= (obstacle.x + obstacle.width + margin) and
        (obstacle.y - margin) <= point.y <= (obstacle.y + obstacle.height + margin)
    )

def line_intersects_obstacle(
    p1: Point2D,
    p2: Point2D,
    obstacle: Rectangle,
    margin: float = 0.0
) -> bool:
    """Check if a line segment intersects with an obstacle"""
    # Expand obstacle by margin
    x_min = obstacle.x - margin
    y_min = obstacle.y - margin
    x_max = obstacle.x + obstacle.width + margin
    y_max = obstacle.y + obstacle.height + margin
    
    # Line segment endpoints
    x1, y1 = p1.x, p1.y
    x2, y2 = p2.x, p2.y
    
    # Check if either endpoint is inside the obstacle
    if (x_min <= x1 <= x_max and y_min <= y1 <= y_max) or \
       (x_min <= x2 <= x_max and y_min <= y2 <= y_max):
        return True
    
    # Check for line-rectangle intersection
    # Using separating axis theorem
    
    # Rectangle edges
    rect_edges = [
        (Point2D(x=x_min, y=y_min), Point2D(x=x_max, y=y_min)),  # bottom
        (Point2D(x=x_max, y=y_min), Point2D(x=x_max, y=y_max)),  # right
        (Point2D(x=x_max, y=y_max), Point2D(x=x_min, y=y_max)),  # top
        (Point2D(x=x_min, y=y_max), Point2D(x=x_min, y=y_min)),  # left
    ]
    
    # Line segment vector
    line_vec = Point2D(x=x2 - x1, y=y2 - y1)
    
    for edge_start, edge_end in rect_edges:
        # Edge vector
        edge_vec = Point2D(
            x=edge_end.x - edge_start.x,
            y=edge_end.y - edge_start.y
        )
        
        # Calculate cross products
        cross1 = line_vec.x * (edge_start.y - y1) - line_vec.y * (edge_start.x - x1)
        cross2 = line_vec.x * (edge_end.y - y1) - line_vec.y * (edge_end.x - x1)
        
        # If both points are on the same side of the line, no intersection
        if (cross1 > 0 and cross2 > 0) or (cross1 < 0 and cross2 < 0):
            continue
        
        # Check if the line segment intersects the infinite line through the edge
        # Using parametric equations
        denom = (y2 - y1) * (edge_end.x - edge_start.x) - \
                (x2 - x1) * (edge_end.y - edge_start.y)
        
        if denom == 0:  # Lines are parallel
            continue
            
        ua = ((x2 - x1) * (edge_start.y - y1) - (y2 - y1) * (edge_start.x - x1)) / denom
        
        if 0 <= ua <= 1:  # Intersection point is on the edge
            # Check if intersection point is within the line segment
            x_intersect = x1 + ua * (x2 - x1)
            y_intersect = y1 + ua * (y2 - y1)
            
            if (min(x1, x2) <= x_intersect <= max(x1, x2) and
                min(y1, y2) <= y_intersect <= max(y1, y2)):
                return True
    
    return False

def calculate_path_length(path: List[Point2D]) -> float:
    """Calculate the total length of a path"""
    if len(path) < 2:
        return 0.0
    
    total_length = 0.0
    for i in range(1, len(path)):
        dx = path[i].x - path[i-1].x
        dy = path[i].y - path[i-1].y
        total_length += math.sqrt(dx*dx + dy*dy)
    
    return total_length

def plan_coverage(coverage_request: CoverageRequest) -> List[Point2D]:
    """
    Plan a coverage path for a wall with obstacles.
    
    This is a simplified implementation that:
    1. Generates a boustrophedon path for the entire wall
    2. Removes segments that intersect with obstacles
    3. Connects the remaining segments
    
    Note: A more advanced implementation would use a more sophisticated algorithm
    like cellular decomposition or spanning tree coverage.
    """
    wall = coverage_request.wall
    obstacles = coverage_request.obstacles
    robot_width = coverage_request.robot_width
    overlap = coverage_request.overlap
    
    # Generate initial path
    path = boustrophedon_path(
        width=wall.width,
        height=wall.height,
        robot_width=robot_width,
        overlap=overlap,
        start_corner="bottom-left"
    )
    
    # If no obstacles, return the initial path
    if not obstacles:
        return path
    
    # Process the path to avoid obstacles
    processed_path = []
    
    for i in range(0, len(path)-1, 2):
        p1 = path[i]
        p2 = path[i+1]
        
        # Check if this segment intersects any obstacle
        intersects_obstacle = any(
            line_intersects_obstacle(p1, p2, Rectangle(
                x=obs.x,
                y=obs.y,
                width=obs.width,
                height=obs.height
            ), margin=0.1)  # Add small margin to avoid getting too close
            for obs in obstacles
        )
        
        if not intersects_obstacle:
            # Add the segment if it doesn't intersect any obstacles
            if not processed_path or processed_path[-1] != p1:
                processed_path.append(p1)
            processed_path.append(p2)
        # Else, skip this segment (simple approach - could be improved)
    
    # Clean up the path (remove duplicate points)
    if len(processed_path) > 1:
        cleaned_path = [processed_path[0]]
        for p in processed_path[1:]:
            if p != cleaned_path[-1]:
                cleaned_path.append(p)
        processed_path = cleaned_path
    
    return processed_path
