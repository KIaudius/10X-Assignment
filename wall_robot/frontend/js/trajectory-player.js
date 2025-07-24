// TrajectoryPlayer class to handle trajectory animation
export class TrajectoryPlayer {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.trajectory = [];
        this.currentIndex = 0;
        this.animationId = null;
        this.isPlaying = false;
        this.speed = 1.0; // Animation speed multiplier
        this.lastTimestamp = 0;
    }
    
    loadTrajectory(trajectory) {
        this.stop();
        this.trajectory = [...trajectory];
        this.currentIndex = 0;
        return this.trajectory.length > 0;
    }
    
    play() {
        if (this.trajectory.length === 0) return false;
        if (this.isPlaying) return true;
        
        this.isPlaying = true;
        this.lastTimestamp = performance.now();
        
        // Start animation loop
        const animate = (timestamp) => {
            if (!this.isPlaying) return;
            
            const deltaTime = (timestamp - this.lastTimestamp) * this.speed;
            this.lastTimestamp = timestamp;
            
            // Move to next point based on time
            // For simplicity, we'll move one point per frame
            // In a real app, you'd calculate position based on speed and time
            if (this.currentIndex < this.trajectory.length - 1) {
                this.currentIndex++;
                this.visualizer.showRobot(this.trajectory[this.currentIndex]);
                this.animationId = requestAnimationFrame(animate);
            } else {
                // Reached the end
                this.pause();
                return;
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
        return true;
    }
    
    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    stop() {
        this.pause();
        this.currentIndex = 0;
        this.visualizer.showRobot(null);
    }
    
    seekToStart() {
        this.pause();
        this.currentIndex = 0;
        this.visualizer.showRobot(this.trajectory[0] || null);
    }
    
    seekToEnd() {
        this.pause();
        this.currentIndex = this.trajectory.length - 1;
        this.visualizer.showRobot(this.trajectory[this.currentIndex] || null);
    }
    
    setSpeed(speed) {
        this.speed = Math.max(0.1, Math.min(5, speed)); // Clamp between 0.1x and 5x
    }
    
    getCurrentPosition() {
        if (this.trajectory.length === 0 || this.currentIndex < 0) return null;
        return this.trajectory[this.currentIndex];
    }
    
    isAtEnd() {
        return this.currentIndex >= this.trajectory.length - 1;
    }
    
    getProgress() {
        if (this.trajectory.length <= 1) return 0;
        return this.currentIndex / (this.trajectory.length - 1);
    }
}
