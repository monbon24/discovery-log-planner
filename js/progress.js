/**
 * Progress Module for Homeschool Planner
 */

const Progress = {
    init() {
        this.update();
        AppState.subscribe((changeType) => {
            if (changeType === 'lessons' || changeType === 'week') {
                this.update();
            }
        });
    },
    
    update() {
        this.updateChildProgress('1');
        this.updateChildProgress('2');
    },
    
    updateChildProgress(childId) {
        const progress = AppState.getProgressForChild(childId);
        const bar = document.getElementById(`progress-${childId}-bar`);
        const text = document.getElementById(`progress-${childId}-text`);
        
        if (bar) {
            bar.style.width = `${progress}%`;
            bar.className = `progress-bar ${this.getProgressColor(progress)}`;
        }
        if (text) text.textContent = `${progress}%`;
        
        if (progress === 100 && AppState.getProgressForChild(childId === '1' ? '2' : '1') === 100) {
            this.celebrate();
        }
    },
    
    getProgressColor(progress) {
        if (progress >= 100) return 'bg-sage';
        if (progress >= 75) return 'bg-sky';
        if (progress >= 50) return 'bg-honey';
        if (progress >= 25) return 'bg-terracotta';
        return 'bg-dustyRose';
    },
    
    celebrate() {
        const overlay = document.getElementById('celebration');
        if (!overlay) return;
        overlay.classList.remove('hidden');
        this.createConfetti();
        setTimeout(() => overlay.classList.add('hidden'), 3000);
    },
    
    createConfetti() {
        const colors = ['#E07A5F', '#A8C5A8', '#A7C7E7', '#C9B1D4', '#F4D03F', '#E8B4B8'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }
};

window.Progress = Progress;
