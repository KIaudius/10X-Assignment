// WallVisualizer class to handle canvas rendering
export class WallVisualizer {
    constructor(canvas, statusElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.statusElement = statusElement;
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.robotPosition = null;
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }
    
    handleResize() {
        // Set canvas size to match container
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Redraw if we have content
        if (this.lastWall) {
            this.drawWallAndObstacles(this.lastWall, this.lastObstacles, this.lastPreview, this.lastTrajectory);
        }
    }
    
    drawWallAndObstacles(wall, obstacles = [], previewObstacle = null, trajectory = []) {
        // Store for redraw
        this.lastWall = wall;
        this.lastObstacles = [...obstacles];
        this.lastPreview = previewObstacle;
        this.lastTrajectory = [...trajectory];
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate scale and offset to fit wall in canvas with padding
        const padding = 40;
        const scaleX = (this.canvas.width - 2 * padding) / wall.width;
        const scaleY = (this.canvas.height - 2 * padding) / wall.height;
        this.scale = Math.min(scaleX, scaleY);
        
        this.offset = {
            x: (this.canvas.width - wall.width * this.scale) / 2,
            y: (this.canvas.height - wall.height * this.scale) / 2
        };
        
        // Draw wall
        this.ctx.fillStyle = '#E3F2FD';
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 2;
        
        this.ctx.fillRect(
            this.offset.x,
            this.offset.y,
            wall.width * this.scale,
            wall.height * this.scale
        );
        
        this.ctx.strokeRect(
            this.offset.x,
            this.offset.y,
            wall.width * this.scale,
            wall.height * this.scale
        );
        
        // Draw obstacles
        obstacles.forEach(obstacle => {
            this.drawObstacle(obstacle, '#FF9800');
        });
        
        // Draw preview obstacle (if any)
        if (previewObstacle) {
            this.drawObstacle(previewObstacle, 'rgba(255, 152, 0, 0.5)', true);
        }
        
        // Draw trajectory
        if (trajectory.length > 1) {
            this.drawTrajectory(trajectory);
        }
        
        // Draw robot if present
        if (this.robotPosition) {
            this.drawRobot(this.robotPosition);
        }
        
        // Draw scale indicator
        this.drawScaleIndicator();
    }
    
    drawObstacle(obstacle, color, isPreview = false) {
        const x = this.offset.x + obstacle.x * this.scale;
        const y = this.offset.y + obstacle.y * this.scale;
        const width = obstacle.width * this.scale;
        const height = obstacle.height * this.scale;
        
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = isPreview ? '#FF9800' : '#E65100';
        this.ctx.lineWidth = isPreview ? 1 : 2;
        
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);
        
        // Add label
        if (!isPreview) {
            this.ctx.fillStyle = '#000';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                obstacle.name || obstacle.type,
                x + width / 2,
                y + height / 2 + 3
            );
        }
    }
    
    drawTrajectory(points) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Start at first point
        const startX = this.offset.x + points[0].x * this.scale;
        const startY = this.offset.y + points[0].y * this.scale;
        this.ctx.moveTo(startX, startY);
        
        // Draw lines to subsequent points
        for (let i = 1; i < points.length; i++) {
            const x = this.offset.x + points[i].x * this.scale;
            const y = this.offset.y + points[i].y * this.scale;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
        
        // Draw start and end markers
        this.drawPointMarker(points[0], '#4CAF50'); // Start (green)
        this.drawPointMarker(points[points.length - 1], '#F44336'); // End (red)
    }
    
    drawPointMarker(point, color) {
        const x = this.offset.x + point.x * this.scale;
        const y = this.offset.y + point.y * this.scale;
        const radius = 5;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawScaleIndicator() {
        const indicatorWidth = 50; // pixels
        const indicatorHeight = 20;
        const margin = 10;
        
        // Calculate real-world distance that corresponds to indicatorWidth pixels
        const realWorldDistance = indicatorWidth / this.scale;
        const roundedDistance = Math.round(realWorldDistance * 100) / 100; // Round to 2 decimal places
        
        // Position at bottom-right corner
        const x = this.canvas.width - margin - indicatorWidth;
        const y = this.canvas.height - margin - indicatorHeight - 15;
        
        // Draw line
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(x, y + indicatorHeight / 2);
        this.ctx.lineTo(x + indicatorWidth, y + indicatorHeight / 2);
        this.ctx.stroke();
        
        // Draw end caps
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + indicatorHeight);
        this.ctx.moveTo(x + indicatorWidth, y);
        this.ctx.lineTo(x + indicatorWidth, y + indicatorHeight);
        this.ctx.stroke();
        
        // Draw label
        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${roundedDistance} m`,
            x + indicatorWidth / 2,
            y + indicatorHeight + 12
        );
    }
    
    showRobot(position) {
        this.robotPosition = position;
        // Redraw to show/hide robot
        if (this.lastWall) {
            this.drawWallAndObstacles(this.lastWall, this.lastObstacles, this.lastPreview, this.lastTrajectory);
        }
    }
    
    drawRobot(position) {
        // Draw the robot as a red circle
        const x = this.offset.x + position.x * this.scale;
        const y = this.offset.y + position.y * this.scale;
        const radius = 10;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#F44336';
        this.ctx.shadowColor = '#F44336';
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    showStatus(message, type = 'info') {
        if (!this.statusElement) return;
        
        this.statusElement.textContent = message;
        this.statusElement.className = 'status-message';
        
        // Add type class
        if (type === 'error') {
            this.statusElement.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
        } else if (type === 'success') {
            this.statusElement.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
        } else if (type === 'warning') {
            this.statusElement.style.backgroundColor = 'rgba(255, 152, 0, 0.9)';
        } else {
            this.statusElement.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
        }
        
        // Show and auto-hide
        this.statusElement.classList.add('visible');
        
        // Clear any existing timeout
        if (this.statusTimeout) {
            clearTimeout(this.statusTimeout);
        }
        
        // Auto-hide after 3 seconds (for non-error messages)
        if (type !== 'error') {
            this.statusTimeout = setTimeout(() => {
                this.statusElement.classList.remove('visible');
            }, 3000);
        }
    }
}
