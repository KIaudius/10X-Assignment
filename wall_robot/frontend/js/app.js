// Main application module
import { WallVisualizer } from './wall-visualizer.js';
import { ApiClient } from './api-client.js';
import { TrajectoryPlayer } from './trajectory-player.js';

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create instances
    const canvas = document.getElementById('wall-canvas');
    const statusMessage = document.getElementById('status-message');
    const visualizer = new WallVisualizer(canvas, statusMessage);
    const apiClient = new ApiClient();
    const trajectoryPlayer = new TrajectoryPlayer(visualizer);
    
    // Current state
    let currentWall = null;
    let obstacles = [];
    let trajectory = [];
    
    // DOM elements
    const wallWidthInput = document.getElementById('wall-width');
    const wallHeightInput = document.getElementById('wall-height');
    const robotWidthInput = document.getElementById('robot-width');
    const overlapInput = document.getElementById('overlap');
    const obstacleTypeInput = document.getElementById('obstacle-type');
    const obstacleWidthInput = document.getElementById('obstacle-width');
    const obstacleHeightInput = document.getElementById('obstacle-height');
    const trajectoryNameInput = document.getElementById('trajectory-name');
    const trajectoryDistanceSpan = document.getElementById('trajectory-distance');
    const trajectoryPointsSpan = document.getElementById('trajectory-points');
    
    // Buttons
    const createWallBtn = document.getElementById('create-wall');
    const addObstacleBtn = document.getElementById('add-obstacle');
    const clearObstaclesBtn = document.getElementById('clear-obstacles');
    const planTrajectoryBtn = document.getElementById('plan-trajectory');
    const clearTrajectoryBtn = document.getElementById('clear-trajectory');
    const playTrajectoryBtn = document.getElementById('play-trajectory');
    const pauseTrajectoryBtn = document.getElementById('pause-trajectory');
    const stopTrajectoryBtn = document.getElementById('stop-trajectory');
    
    // Event Listeners
    createWallBtn.addEventListener('click', createWall);
    addObstacleBtn.addEventListener('click', addObstacle);
    clearObstaclesBtn.addEventListener('click', clearObstacles);
    planTrajectoryBtn.addEventListener('click', planTrajectory);
    clearTrajectoryBtn.addEventListener('click', clearTrajectory);
    playTrajectoryBtn.addEventListener('click', () => trajectoryPlayer.play());
    pauseTrajectoryBtn.addEventListener('click', () => trajectoryPlayer.pause());
    stopTrajectoryBtn.addEventListener('click', () => trajectoryPlayer.stop());
    
    // Handle canvas clicks for adding obstacles
    let isAddingObstacle = false;
    let obstacleStartPoint = null;
    
    canvas.addEventListener('mousedown', (e) => {
        if (!currentWall) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / visualizer.scale;
        const y = (e.clientY - rect.top) / visualizer.scale;
        
        // Start drawing obstacle
        isAddingObstacle = true;
        obstacleStartPoint = { x, y };
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isAddingObstacle || !obstacleStartPoint) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / visualizer.scale;
        const y = (e.clientY - rect.top) / visualizer.scale;
        
        // Update preview
        visualizer.drawWallAndObstacles(currentWall, obstacles, { 
            x: obstacleStartPoint.x, 
            y: obstacleStartPoint.y,
            width: x - obstacleStartPoint.x,
            height: y - obstacleStartPoint.y,
            type: 'preview'
        });
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (!isAddingObstacle || !obstacleStartPoint) {
            isAddingObstacle = false;
            obstacleStartPoint = null;
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const endX = (e.clientX - rect.left) / visualizer.scale;
        const endY = (e.clientY - rect.top) / visualizer.scale;
        
        // Calculate obstacle dimensions
        const width = Math.abs(endX - obstacleStartPoint.x);
        const height = Math.abs(endY - obstacleStartPoint.y);
        
        // Only add if dimensions are valid
        if (width > 0.1 && height > 0.1) {
            const x = Math.min(obstacleStartPoint.x, endX);
            const y = Math.min(obstacleStartPoint.y, endY);
            
            // Add obstacle to the list
            const obstacle = {
                x,
                y,
                width,
                height,
                type: obstacleTypeInput.value,
                name: `${obstacleTypeInput.value.charAt(0).toUpperCase() + obstacleTypeInput.value.slice(1)} ${obstacles.length + 1}`
            };
            
            obstacles.push(obstacle);
            visualizer.drawWallAndObstacles(currentWall, obstacles);
            updateObstacleControls();
        }
        
        isAddingObstacle = false;
        obstacleStartPoint = null;
    });
    
    // Functions
    async function createWall() {
        const width = parseFloat(wallWidthInput.value);
        const height = parseFloat(wallHeightInput.value);
        
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            visualizer.showStatus('Please enter valid wall dimensions', 'error');
            return;
        }
        
        try {
            // In a real app, we would save this to the backend
            // const newWall = await apiClient.createWall({ width, height });
            // currentWall = newWall;
            
            // For demo purposes, just create a local wall object
            currentWall = { id: Date.now(), width, height };
            obstacles = [];
            trajectory = [];
            
            // Update UI
            visualizer.drawWallAndObstacles(currentWall, obstacles);
            updateObstacleControls();
            updateTrajectoryControls();
            
            visualizer.showStatus(`Created wall: ${width}m x ${height}m`, 'success');
        } catch (error) {
            console.error('Error creating wall:', error);
            visualizer.showStatus('Failed to create wall', 'error');
        }
    }
    
    function addObstacle() {
        if (!currentWall) {
            visualizer.showStatus('Please create a wall first', 'error');
            return;
        }
        
        const width = parseFloat(obstacleWidthInput.value);
        const height = parseFloat(obstacleHeightInput.value);
        const type = obstacleTypeInput.value;
        
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            visualizer.showStatus('Please enter valid obstacle dimensions', 'error');
            return;
        }
        
        // Add obstacle at a default position (center of the wall)
        const obstacle = {
            x: (currentWall.width - width) / 2,
            y: (currentWall.height - height) / 2,
            width,
            height,
            type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${obstacles.length + 1}`
        };
        
        obstacles.push(obstacle);
        visualizer.drawWallAndObstacles(currentWall, obstacles);
        updateObstacleControls();
        
        visualizer.showStatus(`Added ${type} obstacle`, 'success');
    }
    
    function clearObstacles() {
        if (obstacles.length === 0) {
            visualizer.showStatus('No obstacles to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to remove all obstacles?')) {
            obstacles = [];
            visualizer.drawWallAndObstacles(currentWall, obstacles);
            updateObstacleControls();
            visualizer.showStatus('All obstacles removed', 'success');
        }
    }
    
    async function planTrajectory() {
        if (!currentWall) {
            visualizer.showStatus('Please create a wall first', 'error');
            return;
        }
        
        const robotWidth = parseFloat(robotWidthInput.value);
        const overlap = parseFloat(overlapInput.value) / 100; // Convert percentage to decimal
        const name = trajectoryNameInput.value.trim() || 'Coverage Path';
        
        if (isNaN(robotWidth) || robotWidth <= 0) {
            visualizer.showStatus('Please enter a valid robot width', 'error');
            return;
        }
        
        if (isNaN(overlap) || overlap < 0 || overlap > 0.5) {
            visualizer.showStatus('Overlap must be between 0% and 50%', 'error');
            return;
        }
        
        try {
            visualizer.showStatus('Planning trajectory...', 'info');
            
            // In a real app, we would send this to the backend
            // const coverageRequest = {
            //     wall: currentWall,
            //     obstacles: obstacles,
            //     robotWidth: robotWidth,
            //     overlap: overlap,
            //     name: name
            // };
            // const response = await apiClient.planTrajectory(coverageRequest);
            // trajectory = response.path;
            
            // For demo purposes, generate a simple boustrophedon path
            trajectory = generateBoustrophedonPath(currentWall, obstacles, robotWidth, overlap);
            
            // Calculate total distance
            let totalDistance = 0;
            for (let i = 1; i < trajectory.length; i++) {
                const dx = trajectory[i].x - trajectory[i-1].x;
                const dy = trajectory[i].y - trajectory[i-1].y;
                totalDistance += Math.sqrt(dx*dx + dy*dy);
            }
            
            // Update UI
            visualizer.drawWallAndObstacles(currentWall, obstacles, null, trajectory);
            updateTrajectoryControls();
            
            // Update trajectory info
            trajectoryDistanceSpan.textContent = totalDistance.toFixed(2);
            trajectoryPointsSpan.textContent = trajectory.length;
            
            // Enable trajectory player
            trajectoryPlayer.loadTrajectory(trajectory);
            
            visualizer.showStatus('Trajectory planned successfully', 'success');
        } catch (error) {
            console.error('Error planning trajectory:', error);
            visualizer.showStatus('Failed to plan trajectory', 'error');
        }
    }
    
    function clearTrajectory() {
        if (trajectory.length === 0) {
            visualizer.showStatus('No trajectory to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear the current trajectory?')) {
            trajectory = [];
            visualizer.drawWallAndObstacles(currentWall, obstacles);
            updateTrajectoryControls();
            trajectoryPlayer.stop();
            visualizer.showStatus('Trajectory cleared', 'success');
        }
    }
    
    // Helper functions
    function updateObstacleControls() {
        const hasObstacles = obstacles.length > 0;
        clearObstaclesBtn.disabled = !hasObstacles;
        planTrajectoryBtn.disabled = !currentWall;
    }
    
    function updateTrajectoryControls() {
        const hasTrajectory = trajectory.length > 0;
        clearTrajectoryBtn.disabled = !hasTrajectory;
        playTrajectoryBtn.disabled = !hasTrajectory;
        pauseTrajectoryBtn.disabled = true;
        stopTrajectoryBtn.disabled = !hasTrajectory;
    }
    
    // Simple boustrophedon path generator for demo purposes
    function generateBoustrophedonPath(wall, obstacles, robotWidth, overlap) {
        const path = [];
        const step = robotWidth * (1 - overlap);
        const margin = robotWidth / 2;
        
        // Start from bottom-left corner
        let y = margin;
        let direction = 1; // 1 for right, -1 for left
        
        while (y <= wall.height - margin) {
            if (direction === 1) {
                // Moving right
                path.push({ x: margin, y });
                path.push({ x: wall.width - margin, y });
            } else {
                // Moving left
                path.push({ x: wall.width - margin, y });
                path.push({ x: margin, y });
            }
            
            // Move up for next pass
            y += step;
            direction *= -1;
        }
        
        return path;
    }
    
    // Initial setup
    updateObstacleControls();
    updateTrajectoryControls();
    
    // Show welcome message
    visualizer.showStatus('Welcome to the Wall-Finishing Robot Simulator', 'info');
});
