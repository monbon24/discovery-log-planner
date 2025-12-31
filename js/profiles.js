/**
 * Profiles Module for Homeschool Planner
 * Handles student switching, avatar display, and stats rendering
 */

const Profiles = {
    init() {
        this.renderSwitcher();
        this.updateHeaderStats();
        
        // Subscribe to state changes
        AppState.subscribe((changeType) => {
            if (changeType === 'child' || changeType === 'xp' || changeType === 'level') {
                this.renderSwitcher();
                this.updateHeaderStats();
            }
        });
    },
    
    renderSwitcher() {
        const container = document.getElementById('profile-switcher');
        if (!container) return;
        
        container.innerHTML = AppState.children.map(child => {
            const isActive = AppState.currentChild === child.id;
            // Active: Passport Blue filled. Inactive: Hover effect.
            const activeClass = isActive 
                ? 'bg-passportBlue text-white shadow-sm ring-2 ring-sunshine' 
                : 'bg-white text-passportBlue hover:bg-sky-100 border border-sky-200';
            
            return `
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${activeClass}" 
                        onclick="App.setChild('${child.id}')">
                    <span class="text-lg filter drop-shadow-sm">${child.avatar || '👤'}</span>
                    <span class="hidden md:inline">${child.name}</span>
                    ${isActive ? `<span class="text-[10px] bg-sunshine text-passportBlue px-1.5 rounded-full shadow-sm">Lvl ${child.level}</span>` : ''}
                </button>
            `;
        }).join('');
        
        // Family View Option
        const isBothActive = AppState.currentChild === 'all';
        const bothActiveClass = isBothActive 
            ? 'bg-passportBlue text-white shadow-sm ring-2 ring-sunshine' 
            : 'bg-white text-passportBlue hover:bg-sky-100 border border-sky-200';
        
        container.innerHTML += `
            <button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${bothActiveClass}"
                    onclick="App.setChild('all')">
                <span class="text-lg">👨‍👩‍👧‍👦</span>
                <span class="hidden md:inline">Family</span>
            </button>
        `;
    },
    
    updateHeaderStats() {
        const statsContainer = document.getElementById('header-user-stats');
        const avatarEl = document.getElementById('header-avatar');
        const levelEl = document.getElementById('header-level');
        const usernameEl = document.getElementById('header-username');
        const xpBar = document.getElementById('header-xp-bar');
        const streakEl = document.getElementById('streak-display');
        
        if (AppState.currentChild === 'all') {
            statsContainer?.classList.add('opacity-50');
            if (usernameEl) usernameEl.textContent = 'Family View';
            if (streakEl) streakEl.textContent = 'Family Mode';
            return;
        }
        
        statsContainer?.classList.remove('opacity-50');
        
        const child = AppState.children.find(c => c.id === AppState.currentChild);
        if (!child) return;
        
        if (avatarEl) avatarEl.textContent = child.avatar || '👤';
        if (levelEl) levelEl.textContent = child.level;
        if (usernameEl) usernameEl.textContent = child.name;
        
        // Calculate XP percentage
        const percentage = Math.min(100, (child.xp / child.xpToNextLevel) * 100);
        if (xpBar) xpBar.style.width = `${percentage}%`;
        
        if (streakEl) streakEl.textContent = `🔥 ${child.streak || 0} Day Streak`;
    }
};

window.Profiles = Profiles;
