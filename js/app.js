/**
 * Main Application for Homeschool Planner
 */

// Toast notification helper
function showToast(message) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;
    
    msgEl.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Main app initialization
const App = {
    init() {
        Storage.init().then(() => {
            Profiles.init();
            Gamification.init();
            Evidence.init();
            Reports.init();
            Destinations.init();
            Subjects.init();
            Schedule.init();
            Progress.init();
            this.bindNavigation();
            this.setView('dashboard'); // Default to Roadmap/Dashboard for Travel Theme
            Reschedule.checkForAutoReschedule?.();
        });
    },
    
    bindNavigation() {
        // View navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                if (view) this.setView(view);
            });
        });
        
        // Child selector
        document.querySelectorAll('.child-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const childId = btn.dataset.child;
                if (childId) this.setChild(childId);
            });
        });
    },
    
    setView(view) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Show/hide view sections
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(`view-${view}`)?.classList.remove('hidden');
        
        AppState.setView(view);
    },
    
    setChild(childId) {
        document.querySelectorAll('.child-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.child === childId);
        });
        AppState.setChild(childId);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;
window.showToast = showToast;
