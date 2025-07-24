// API client for communicating with the FastAPI backend
export class ApiClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl || window.location.origin;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.headers,
                ...(options.headers || {})
            }
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.detail || 
                    `Request failed with status ${response.status}: ${response.statusText}`
                );
            }
            
            // For 204 No Content responses, return null
            if (response.status === 204) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request to ${endpoint} failed:`, error);
            throw error;
        }
    }
    
    // Wall endpoints
    async createWall(wallData) {
        return this.request('/api/walls/', {
            method: 'POST',
            body: JSON.stringify(wallData)
        });
    }
    
    async getWall(wallId) {
        return this.request(`/api/walls/${wallId}`);
    }
    
    async getWalls(skip = 0, limit = 100) {
        return this.request(`/api/walls/?skip=${skip}&limit=${limit}`);
    }
    
    async updateWall(wallId, wallData) {
        return this.request(`/api/walls/${wallId}`, {
            method: 'PUT',
            body: JSON.stringify(wallData)
        });
    }
    
    async deleteWall(wallId) {
        return this.request(`/api/walls/${wallId}`, {
            method: 'DELETE'
        });
    }
    
    // Obstacle endpoints
    async createObstacle(wallId, obstacleData) {
        return this.request(`/api/obstacles/?wall_id=${wallId}`, {
            method: 'POST',
            body: JSON.stringify(obstacleData)
        });
    }
    
    async getObstacles(wallId) {
        return this.request(`/api/obstacles/wall/${wallId}`);
    }
    
    async getObstacle(obstacleId) {
        return this.request(`/api/obstacles/${obstacleId}`);
    }
    
    async deleteObstacle(obstacleId) {
        return this.request(`/api/obstacles/${obstacleId}`, {
            method: 'DELETE'
        });
    }
    
    // Trajectory endpoints
    async planTrajectory(coverageRequest) {
        return this.request('/api/trajectories/plan', {
            method: 'POST',
            body: JSON.stringify(coverageRequest)
        });
    }
    
    async getTrajectory(trajectoryId) {
        return this.request(`/api/trajectories/${trajectoryId}`);
    }
    
    async getTrajectories(wallId, skip = 0, limit = 100) {
        return this.request(`/api/trajectories/wall/${wallId}?skip=${skip}&limit=${limit}`);
    }
    
    async deleteTrajectory(trajectoryId) {
        return this.request(`/api/tjectories/${trajectoryId}`, {
            method: 'DELETE'
        });
    }
    
    // System endpoints
    async getHealth() {
        return this.request('/api/health');
    }
}
