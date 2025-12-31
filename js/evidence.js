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

    // Smart categorization using DC Curriculum keywords
    categorize(description) {
        const text = description.toLowerCase();
        const subjects = AppState.dcCurriculum?.subjects || [];
        
        for (const subject of subjects) {
            for (const keyword of subject.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    return { id: subject.id, name: subject.name, icon: subject.icon };
                }
            }
        }
        return { id: 'general', name: 'General', icon: '📂' };
    },

    handleUpload() {
        // Prompt for description (this drives AI categorization)
        const description = prompt("Describe the work (AI will auto-categorize based on keywords):\n\nExamples:\n• 'Math worksheet on fractions'\n• 'Essay about the Civil War'\n• 'Piano practice video'");
        if (!description) return;

        // Auto-categorize based on description
        const category = this.categorize(description);
        
        // Ask for additional tag if user wants to override
        const tagOptions = ['Best Work', 'In Progress', 'Needs Review', 'Competition Ready'];
        const tag = prompt(`Auto-detected: ${category.icon} ${category.name}\n\nAdd a quality tag (optional):\n${tagOptions.join(', ')}`, 'Best Work');
        
        const type = prompt("Type (Image, Document, Video, Link):", "Document");
        
        // Build evidence item with smart categorization
        const newItem = {
            id: Date.now().toString(),
            childId: AppState.currentChild === 'all' ? '1' : AppState.currentChild,
            description,
            category: category.id,
            categoryName: category.name,
            categoryIcon: category.icon,
            tag: tag || 'General',
            type: type || 'Document',
            date: new Date().toISOString(),
            url: `https://via.placeholder.com/300x200?text=${encodeURIComponent(description.slice(0, 20))}`
        };

        if (!AppState.evidence) AppState.evidence = [];
        AppState.evidence.unshift(newItem);
        
        AppState.notify('evidence');
        Storage.save();
        
        showToast(`✅ Categorized as ${category.icon} ${category.name}!`);
        
        // Gamification bonus
        Gamification.awardXP(newItem.childId, 5);
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
            <div class="bg-white p-3 rounded-xl shadow-sm border border-skyBlue hover:shadow-md transition-all group relative">
                <div class="aspect-video bg-sky-50 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    ${item.type === 'Image' 
                        ? `<img src="${item.url}" class="w-full h-full object-cover">` 
                        : `<span class="text-5xl">${item.categoryIcon || '📄'}</span>`}
                </div>
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-medium text-passportBlue text-sm">${item.description}</h4>
                        <div class="flex gap-2 mt-1 flex-wrap">
                            <span class="text-xs bg-skyBlue text-passportBlue px-2 py-0.5 rounded-full font-medium">
                                ${item.categoryIcon || '📂'} ${item.categoryName || item.tag}
                            </span>
                            ${item.tag !== item.categoryName ? `
                                <span class="text-xs bg-sunshine text-passportBlue px-2 py-0.5 rounded-full">
                                    ${item.tag}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <button class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                            onclick="Evidence.deleteItem('${item.id}')">✕</button>
                </div>
                <div class="mt-2 text-[10px] text-slate-400 text-right">
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
