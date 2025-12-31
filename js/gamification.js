/**
 * Gamification Module for Homeschool Planner
 * Handles XP, Leveling, and Rewards
 */

const Gamification = {
    // Configuration
    BASE_XP: 15,
    BONUS_XP_STREAK: 5,
    XP_EXPONENT: 1.5,
    BASE_XP_TO_LEVEL: 100,

    init() {
        // Subscribe to state changes if needed
        // Most logic is triggered by actions (completing a lesson)
    },

    /**
     * Award XP to a student
     * @param {string} childId - The ID of the student
     * @param {number} amount - Base XP amount (default if not provided)
     */
    awardXP(childId, amount = this.BASE_XP) {
        const child = AppState.children.find(c => c.id === childId);
        if (!child) return;

        let xpEarned = amount;
        
        // Streak Bonus
        if (child.streak > 0) {
            xpEarned += this.BONUS_XP_STREAK;
        }

        child.xp += xpEarned;
        
        // Check for Level Up
        let leveledUp = false;
        if (child.xp >= child.xpToNextLevel) {
            this.levelUp(child);
            leveledUp = true;
        }

        // Update State
        AppState.notify('xp');
        Storage.save();

        // Notification
        if (leveledUp) {
            this.showLevelUpModal(child);
        } else {
            showToast(`+${xpEarned} XP! ${child.streak > 0 ? '🔥 Streak Bonus!' : ''}`);
        }
    },

    levelUp(child) {
        child.xp -= child.xpToNextLevel; // Carry over excess XP
        child.level++;
        
        // Calculate next level requirement: 100 * (Level ^ 1.5)
        child.xpToNextLevel = Math.floor(this.BASE_XP_TO_LEVEL * Math.pow(child.level, this.XP_EXPONENT));
        
        AppState.notify('level');
        this.confettiExplosion();
    },

    /**
     * Update streak for a child (called daily)
     * This checks if they did any work yesterday/today
     * For now, simplistic: if they complete a task today, set streak.
     * Real logic needs lastActiveDate tracking.
     */
    updateStreak(childId) {
        // Placeholder for complex streak logic
        // For MVP: Increment streak if they complete a task and haven't yet today
        const child = AppState.children.find(c => c.id === childId);
        if (!child) return;
        
        // Simple mock increment for "feeling of progress"
        if (!child.streakLastUpdated || new Date(child.streakLastUpdated).toDateString() !== new Date().toDateString()) {
            child.streak++;
            child.streakLastUpdated = new Date().toISOString();
            AppState.notify('nav'); // Update UI
        }
    },

    showLevelUpModal(child) {
        // For now, a fancy alert/toast, can expand to modal later
        const modalHtml = `
            <div id="level-up-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                <div class="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-terracotta relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-terracotta to-sage"></div>
                    <div class="text-6xl mb-4">🎉</div>
                    <h2 class="text-3xl font-cozy font-bold text-charcoal mb-2">Level Up!</h2>
                    <p class="text-xl text-terracotta font-bold mb-6">You reached Level ${child.level}!</p>
                    
                    <div class="bg-softPeach/30 p-4 rounded-xl mb-6">
                        <p class="font-bold text-slate mb-2">Choose a Reward:</p>
                        <div class="space-y-2">
                            <button onclick="Gamification.claimReward('minecraft')" class="w-full p-2 bg-white border border-terracotta/30 rounded-lg hover:bg-terracotta hover:text-white transition-colors">
                                🎮 30min Minecraft Time
                            </button>
                            <button onclick="Gamification.claimReward('movie')" class="w-full p-2 bg-white border border-terracotta/30 rounded-lg hover:bg-terracotta hover:text-white transition-colors">
                                🎬 Movie Night Pick
                            </button>
                            <button onclick="Gamification.claimReward('dinner')" class="w-full p-2 bg-white border border-terracotta/30 rounded-lg hover:bg-terracotta hover:text-white transition-colors">
                                🍕 Choose Dinner
                            </button>
                        </div>
                    </div>
                    
                    <button onclick="document.getElementById('level-up-modal').remove()" class="text-slate text-sm hover:underline">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.confettiExplosion();
    },

    claimReward(type) {
        document.getElementById('level-up-modal')?.remove();
        showToast('Reward Claimed! Enjoy! 🎁');
        // Ideally log this to a "Rewards Claimed" history
    },

    confettiExplosion() {
        if (window.Progress && window.Progress.createConfetti) {
            window.Progress.createConfetti();
        }
    }
};

window.Gamification = Gamification;
