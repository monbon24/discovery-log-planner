/**
 * Evidence Locker Module
 * Handles portfolio uploads and gallery display
 */

const Evidence = {
    init() {
        this.bindEvents();
        this.render();
        
        AppState.subscribe((changeType) => {
            if (changeType === 'evidence' || changeType === 'child') {
                this.render();
            }
        });
    },

    bindEvents() {
        const uploadBtn = document.getElementById('add-evidence-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.handleUpload());
        }

        // Filters
        const filtersContainer = document.getElementById('evidence-filters');
        if (filtersContainer) {
            filtersContainer.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Visual toggle
                    filtersContainer.querySelectorAll('button').forEach(b => {
                        b.classList.remove('bg-terracotta', 'text-white');
                        b.classList.add('bg-white', 'text-slate');
                    });
                    e.target.classList.remove('bg-white', 'text-slate');
                    e.target.classList.add('bg-terracotta', 'text-white');
                    
                    this.render(e.target.textContent); // Filter by text content for simplicity
                });
            });
        }
    },

    handleUpload() {
        // Simulation: In a real app, this would be a file input
        // For local demo, we prompt for details and use a placeholder image or logic
        
        const description = prompt("Description of work (e.g., 'Math Worksheet 4.2' or 'Oil Painting'):");
        if (!description) return;

        const tag = prompt("Tag (Math, Reading, Best Work, Art, Project):", "Best Work");
        const type = prompt("Type (Image, Document, Link):", "Image");
        
        // Mock data
        const newItem = {
            id: Date.now().toString(),
            childId: AppState.currentChild === 'all' ? '1' : AppState.currentChild, // Default to child 1 if 'all'
            description,
            tag: tag || 'General',
            type: type || 'Image',
            date: new Date().toISOString(),
            url: `https://via.placeholder.com/300x200?text=${encodeURIComponent(description)}` // Placeholder
        };

        if (!AppState.evidence) AppState.evidence = [];
        AppState.evidence.unshift(newItem);
        
        AppState.notify('evidence');
        Storage.save(); // Save to local storage
        
        showToast("Work uploaded to locker! 📸");
        
        // Gamification: Analyzing evidence earns XP too!
        Gamification.awardXP(newItem.childId, 5); // Small bonus for documenting
    },

    render(filter = 'All') {
        const grid = document.getElementById('evidence-grid');
        if (!grid) return;

        let items = AppState.evidence || [];

        // Filter by child
        if (AppState.currentChild !== 'all') {
            items = items.filter(i => i.childId === AppState.currentChild);
        }

        // Filter by tag
        if (filter !== 'All') {
            items = items.filter(i => i.tag.toLowerCase() === filter.toLowerCase());
        }

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="text-slate italic col-span-full text-center py-12">
                    No evidence items found for this view.
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="bg-white p-3 rounded-xl shadow-sm border border-softPeach hover:shadow-md transition-all group relative">
                <div class="aspect-video bg-softPeach/30 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    ${item.type === 'Image' 
                        ? `<img src="${item.url}" class="w-full h-full object-cover">` 
                        : `<span class="text-4xl">📄</span>`}
                </div>
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-medium text-charcoal text-sm">${item.description}</h4>
                        <span class="text-xs text-slate bg-softPeach/50 px-2 py-0.5 rounded-full mt-1 inline-block">
                            ${item.tag}
                        </span>
                    </div>
                    <button class="text-slate hover:text-dustyRose opacity-0 group-hover:opacity-100 transition-opacity" 
                            onclick="Evidence.deleteItem('${item.id}')">✕</button>
                </div>
                <div class="mt-2 text-[10px] text-slate/60 text-right">
                    ${new Date(item.date).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    },

    deleteItem(id) {
        if (confirm("Remove this item from the locker?")) {
            AppState.evidence = AppState.evidence.filter(i => i.id !== id);
            AppState.notify('evidence');
            Storage.save();
        }
    }
};

window.Evidence = Evidence;
