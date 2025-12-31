/**
 * Storage Module for Homeschool Planner
 * Handles cloud persistence via Google Cloud Run + localStorage fallback
 */

const Storage = {
    // Cloud API endpoint (to be configured)
    API_URL: null,
    
    // Local storage key
    LOCAL_KEY: 'homeschool_planner_data',
    
    // User ID for cloud storage
    userId: null,
    
    // Initialize storage
    async init() {
        // Generate or retrieve user ID
        this.userId = localStorage.getItem('homeschool_user_id');
        if (!this.userId) {
            this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('homeschool_user_id', this.userId);
        }
        
        // Try to load from cloud first, fall back to local
        const cloudData = await this.loadFromCloud();
        if (cloudData) {
            AppState.loadFromStorage(cloudData);
        } else {
            const localData = this.loadFromLocal();
            if (localData) {
                AppState.loadFromStorage(localData);
            }
        }
    },
    
    // Save data (to both cloud and local)
    async save() {
        const data = AppState.getStorageData();
        
        // Always save locally first (immediate)
        this.saveToLocal(data);
        
        // Then sync to cloud (async)
        this.saveToCloud(data);
    },
    
    // Save to localStorage
    saveToLocal(data) {
        try {
            localStorage.setItem(this.LOCAL_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    },
    
    // Load from localStorage
    loadFromLocal() {
        try {
            const data = localStorage.getItem(this.LOCAL_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return null;
        }
    },
    
    // Save to cloud
    async saveToCloud(data) {
        if (!this.API_URL) {
            // Cloud not configured, use local only
            return;
        }
        
        try {
            const response = await fetch(`${this.API_URL}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    data: data,
                    timestamp: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error('Cloud save failed');
            }
        } catch (e) {
            console.warn('Cloud sync failed, data saved locally:', e);
        }
    },
    
    // Load from cloud
    async loadFromCloud() {
        if (!this.API_URL) {
            // Cloud not configured
            return null;
        }
        
        try {
            const response = await fetch(`${this.API_URL}/load/${this.userId}`);
            
            if (!response.ok) {
                return null;
            }
            
            const result = await response.json();
            return result.data;
        } catch (e) {
            console.warn('Cloud load failed:', e);
            return null;
        }
    },
    
    // Configure cloud endpoint
    setCloudEndpoint(url) {
        this.API_URL = url;
    },
    
    // Clear all data
    async clearAll() {
        localStorage.removeItem(this.LOCAL_KEY);
        
        if (this.API_URL) {
            try {
                await fetch(`${this.API_URL}/delete/${this.userId}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.warn('Cloud delete failed:', e);
            }
        }
    }
};

// Make globally available
window.Storage = Storage;
