/**
 * Destinations Module
 * Handles the "Roadmap" view, visualizing long-term goals and milestones.
 */

const Destinations = {
    init() {
        this.render();
        
        AppState.subscribe((changeType) => {
            if (changeType === 'child' || changeType === 'view') {
                this.render();
            }
        });
    },

    render() {
        const container = document.getElementById('destinations-grid');
        if (!container) return;

        let items = AppState.destinations || [];
        const currentChildId = AppState.currentChild;
        const currentChildData = AppState.children.find(c => c.id === currentChildId);

        // In Family view, show ALL destinations
        // In child view, show their track + shared tracks
        if (currentChildId !== 'all' && currentChildData) {
            // Show destinations matching child's track OR shared paths like Life Skills, Service
            const sharedTracks = ['Life Skills', 'Service', 'Culinary', 'Healthcare', 'Aviation'];
            items = items.filter(d => 
                d.trackId === currentChildData.track || 
                sharedTracks.includes(d.trackId)
            );
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 opacity-50">
                    <div class="text-6xl mb-4">🌍</div>
                    <p class="text-xl font-fun text-passportBlue">No destinations set for this explorer yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(dest => {
            const statusColor = dest.status === 'in-progress' 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            const statusLabel = dest.status === 'in-progress' ? '● Active' : '○ Future';

            return `
            <div class="glass rounded-2xl p-5 relative overflow-hidden group card-hover transition-all duration-300">
                <!-- Status Badge -->
                <div class="absolute top-4 right-4 z-20">
                    <span class="text-[10px] font-semibold px-2 py-1 rounded-full border ${statusColor}">
                        ${statusLabel}
                    </span>
                </div>

                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center text-2xl">
                            ${dest.image}
                        </div>
                        <div class="text-right">
                            <span class="block text-[10px] font-semibold uppercase tracking-widest text-textMuted">Age</span>
                            <span class="text-2xl font-display font-bold gradient-text">${dest.targetAge}</span>
                        </div>
                    </div>
                    
                    <h3 class="text-lg font-display font-bold text-textPrimary mb-1">${dest.title}</h3>
                    <p class="text-xs text-textMuted mb-4">${dest.trackId}</p>
                    
                    <div class="w-full bg-border rounded-full h-1.5 mb-4 overflow-hidden">
                        <div class="bg-gradient-to-r from-violet-500 to-cyan-500 h-full w-1/4 rounded-full"></div>
                    </div>

                    <div class="bg-surface/50 rounded-xl p-3 border border-border">
                        <p class="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-2">Requirements</p>
                        <ul class="space-y-1.5">
                            ${dest.requirements.map(req => `
                                <li class="flex items-center gap-2 text-xs text-textSecondary">
                                    <span class="w-3 h-3 rounded-full border border-textMuted flex items-center justify-center text-[8px]">○</span>
                                    ${req}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
};

window.Destinations = Destinations;
