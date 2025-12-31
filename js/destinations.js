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
                ? 'bg-green-100 text-green-700 border-green-300' 
                : 'bg-slate-100 text-slate-500 border-slate-200';
            const statusLabel = dest.status === 'in-progress' ? '🚀 Active' : '📌 Future';

            return `
            <div class="bg-white rounded-3xl border-4 border-sky-100 p-6 relative overflow-hidden group hover:border-sunshine transition-all hover:shadow-xl hover:-translate-y-1">
                <!-- Status Badge -->
                <div class="absolute top-4 right-4 z-20">
                    <span class="text-xs font-bold px-2 py-1 rounded-full border ${statusColor}">
                        ${statusLabel}
                    </span>
                </div>

                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-5xl drop-shadow-sm">${dest.image}</span>
                        <div class="text-right">
                            <span class="block text-xs font-bold uppercase tracking-widest text-sky-500">Target Age</span>
                            <span class="text-3xl font-fun font-bold text-passportBlue">${dest.targetAge}</span>
                        </div>
                    </div>
                    
                    <h3 class="text-xl font-fun font-bold text-passportBlue mb-1">${dest.title}</h3>
                    <p class="text-xs text-slate-400 mb-3">${dest.trackId} Track</p>
                    
                    <div class="w-full bg-sky-50 rounded-full h-2 mb-4 overflow-hidden">
                        <div class="bg-gradient-to-r from-sunshine to-amber-500 h-full w-1/4 rounded-full"></div>
                    </div>

                    <div class="bg-sky-50 rounded-xl p-3">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
                        <ul class="space-y-1.5">
                            ${dest.requirements.map(req => `
                                <li class="flex items-center gap-2 text-xs text-deepOcean font-medium">
                                    <span class="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[8px] text-slate-400 bg-white">○</span>
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
