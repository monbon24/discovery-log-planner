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
        // Only render if we are in dashboard view
        // Actually, we might want to render it always if hidden, but optimization is good.
        // For now, simple render.
        
        const container = document.getElementById('destinations-grid');
        if (!container) return;

        let items = AppState.destinations || [];
        const currentChildId = AppState.currentChild;
        const currentChildData = AppState.children.find(c => c.id === currentChildId);

        // Filter by track/child if specific child selected
        if (currentChildId !== 'all') {
             // Basic filter logic: Map track to destinations or use child ID if added to destination model
             // Currently destinations have 'trackId'. 
             // Produce (id 1) -> Game Design
             // Faye (id 2) -> Performance Arts
             
             if (currentChildData) {
                 items = items.filter(d => d.trackId === currentChildData.track || d.trackId === 'General');
             }
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
            const isFuture = currentChildData ? dest.targetAge > (currentChildData.grade + 6) : true; // visual approximation
            const yearsLeft = currentChildData ? dest.targetAge - (currentChildData.grade + 6) : '?'; // Rough age calc: Grade+6

            return `
            <div class="bg-white rounded-3xl border-4 border-sky-100 p-6 relative overflow-hidden group hover:border-sunshine transition-all hover:shadow-xl hover:-translate-y-1">
                <!-- Postcard Stamp Look -->
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div class="border-4 border-dashed border-passportBlue rounded-full w-24 h-24 flex items-center justify-center transform rotate-12">
                        <span class="font-bold text-xs uppercase text-passportBlue">Checked</span>
                    </div>
                </div>

                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-4">
                        <span class="text-5xl drop-shadow-sm">${dest.image}</span>
                        <div class="text-right">
                            <span class="block text-xs font-bold uppercase tracking-widest text-sky-500">Target Age</span>
                            <span class="text-3xl font-fun font-bold text-passportBlue">${dest.targetAge}</span>
                        </div>
                    </div>
                    
                    <h3 class="text-2xl font-fun font-bold text-passportBlue mb-2">${dest.title}</h3>
                    
                    <div class="w-full bg-sky-50 rounded-full h-3 mb-4 overflow-hidden">
                        <div class="bg-sunshine h-full w-1/3 rounded-full"></div> 
                        <!-- Mock progress: 1/3 -->
                    </div>

                    <div class="bg-sky-50 rounded-xl p-4">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visa Requirements</p>
                        <ul class="space-y-2">
                            ${dest.requirements.map(req => `
                                <li class="flex items-center gap-2 text-sm text-deepOcean font-medium">
                                    <span class="w-4 h-4 rounded-full border-2 border-green-400 flex items-center justify-center text-[10px] text-green-600 bg-green-50">✓</span>
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
