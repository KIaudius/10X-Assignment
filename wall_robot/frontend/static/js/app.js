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
            visualizer.showStatus('Creating wall...', 'info');
            const newWall = await apiClient.createWall({ width, height });
            currentWall = newWall;
            // Fetch obstacles for this wall (should be empty)
            obstacles = await apiClient.getObstacles(currentWall.id) || [];
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
    
    async function addObstacle() {
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
        
        try {
            visualizer.showStatus('Adding obstacle...', 'info');
            // Add obstacle at a default position (center of the wall)
            const obstacleData = {
                x: (currentWall.width - width) / 2,
                y: (currentWall.height - height) / 2,
                width,
                height,
                type,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${obstacles.length + 1}`
            };
            await apiClient.createObstacle(currentWall.id, obstacleData);
            // Refresh obstacles from backend
            obstacles = await apiClient.getObstacles(currentWall.id) || [];
            visualizer.drawWallAndObstacles(currentWall, obstacles);
            updateObstacleControls();
            visualizer.showStatus(`Added ${type} obstacle`, 'success');
        } catch (error) {
            console.error('Error adding obstacle:', error);
            visualizer.showStatus('Failed to add obstacle', 'error');
        }
    }
    
    async function clearObstacles() {
        if (obstacles.length === 0) {
            visualizer.showStatus('No obstacles to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to remove all obstacles?')) {
            try {
                visualizer.showStatus('Clearing obstacles...', 'info');
                // Delete each obstacle via API
                for (const obs of obstacles) {
                    await apiClient.deleteObstacle(obs.id);
                }
                obstacles = await apiClient.getObstacles(currentWall.id) || [];
                visualizer.drawWallAndObstacles(currentWall, obstacles);
                updateObstacleControls();
                visualizer.showStatus('All obstacles removed', 'success');
            } catch (error) {
                console.error('Error clearing obstacles:', error);
                visualizer.showStatus('Failed to clear obstacles', 'error');
            }
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
            // Prepare wall and obstacles for backend schema
            const wallForRequest = { width: currentWall.width, height: currentWall.height };
            const obstaclesForRequest = obstacles.map(o => ({
                wall_id: o.wall_id,
                type: o.type,
                width: o.width,
                height: o.height,
                x: o.x,
                y: o.y
            }));
            const coverageRequest = {
                wall: wallForRequest,
                obstacles: obstaclesForRequest,
                robot_width: robotWidth,
                overlap: overlap
            };
            console.log('Coverage request:', JSON.stringify(coverageRequest, null, 2));
            const response = await apiClient.planTrajectory(coverageRequest);
            console.log('Trajectory planning response:', response);
            trajectory = response.points || [];
            console.log('Trajectory after planning:', trajectory);
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
            trajectoryDistanceSpan.textContent = totalDistance.toFixed(2);
            trajectoryPointsSpan.textContent = trajectory.length;
            trajectoryPlayer.loadTrajectory(trajectory);
            visualizer.showStatus('Trajectory planned successfully', 'success');
        } catch (error) {
            console.error('Error planning trajectory:', error);
            visualizer.showStatus('Failed to plan trajectory', 'error');
        }
    }
    
    async function clearTrajectory() {
        if (trajectory.length === 0) {
            visualizer.showStatus('No trajectory to clear', 'info');
            return;
        }
        if (confirm('Are you sure you want to clear the current trajectory?')) {
            try {
                visualizer.showStatus('Clearing trajectory...', 'info');
                // If you have a backend endpoint for deleting trajectory, call it here
                // For now, just clear local
                trajectory = [];
                visualizer.drawWallAndObstacles(currentWall, obstacles);
                updateTrajectoryControls();
                trajectoryPlayer.stop();
                visualizer.showStatus('Trajectory cleared', 'success');
            } catch (error) {
                console.error('Error clearing trajectory:', error);
                visualizer.showStatus('Failed to clear trajectory', 'error');
            }
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
        console.log('updateTrajectoryControls called, hasTrajectory:', hasTrajectory, 'trajectory:', trajectory);
        clearTrajectoryBtn.disabled = !hasTrajectory;
        playTrajectoryBtn.disabled = !hasTrajectory;
        pauseTrajectoryBtn.disabled = !hasTrajectory; // Enable pause if trajectory exists
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
