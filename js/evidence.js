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
            uploadBtn.addEventListener('click', () => this.showUploadModal());
        }

        // Filters
        const filtersContainer = document.getElementById('evidence-filters');
        if (filtersContainer) {
            filtersContainer.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Visual toggle
                    filtersContainer.querySelectorAll('button').forEach(b => {
                        b.classList.remove('bg-gradient-to-r', 'from-violet-600', 'to-cyan-600', 'text-white', 'shadow-glow');
                        b.classList.add('bg-card', 'text-textSecondary', 'border-transparent');
                    });
                    
                    e.target.classList.remove('bg-card', 'text-textSecondary', 'border-transparent');
                    e.target.classList.add('bg-gradient-to-r', 'from-violet-600', 'to-cyan-600', 'text-white', 'shadow-glow');
                    
                    this.render(e.target.textContent);
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

    showUploadModal() {
        // Remove existing modal if any
        const existing = document.getElementById('upload-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'upload-modal';
        modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200';
        
        modal.innerHTML = `
            <div class="bg-[#1a1a24] border border-[#2a2a3a] w-full max-w-md rounded-2xl p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-display font-bold text-white">Upload Evidence</h3>
                    <button id="close-modal" class="text-gray-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <form id="upload-form" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                        <input type="text" id="ev-desc" required placeholder="e.g. Math worksheet on fractions" 
                               class="w-full bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-gray-600">
                        <p class="text-[10px] text-gray-500 mt-1">💡 Auto-categorizes based on keywords</p>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" data-type="Device" class="type-btn active bg-violet-500/20 border border-violet-500 text-violet-300 rounded-lg py-2 text-sm font-medium transition-all">Device File</button>
                            <button type="button" data-type="Cloud" class="type-btn bg-[#12121a] border border-[#2a2a3a] text-gray-400 rounded-lg py-2 text-sm font-medium hover:bg-[#2a2a3a] transition-all">Cloud Link</button>
                        </div>
                        <input type="hidden" id="ev-type" value="Device">
                    </div>

                    <div id="input-device" class="space-y-2">
                        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">File Preview</label>
                        <div class="relative group">
                            <input type="file" id="ev-file" accept="image/*,.pdf" class="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer">
                            <div class="bg-[#12121a] border border-dashed border-gray-600 rounded-xl p-8 text-center group-hover:border-violet-500 group-hover:bg-violet-500/5 transition-all">
                                <span class="text-2xl mb-2 block">📄</span>
                                <span class="text-sm text-gray-400 group-hover:text-violet-300">Choose a file...</span>
                            </div>
                        </div>
                    </div>

                    <div id="input-cloud" class="hidden space-y-2">
                        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Link URL</label>
                        <input type="url" id="ev-url" placeholder="Paste Google Drive or Dropbox link..." 
                               class="w-full bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600">
                    </div>

                    <div class="pt-4">
                        <button type="submit" class="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 hover:scale-[1.02] transition-all">
                            Add to Locker
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Modal Logic
        const form = modal.querySelector('#upload-form');
        const typeBtns = modal.querySelectorAll('.type-btn');
        const inputDevice = modal.querySelector('#input-device');
        const inputCloud = modal.querySelector('#input-cloud');
        const typeInput = modal.querySelector('#ev-type');

        // Close handlers
        modal.querySelector('#close-modal').onclick = () => modal.remove();
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Type toggle
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                typeBtns.forEach(b => {
                    b.classList.remove('bg-violet-500/20', 'border-violet-500', 'text-violet-300');
                    b.classList.add('bg-[#12121a]', 'border-[#2a2a3a]', 'text-gray-400');
                });
                btn.classList.remove('bg-[#12121a]', 'border-[#2a2a3a]', 'text-gray-400');
                btn.classList.add('bg-violet-500/20', 'border-violet-500', 'text-violet-300');
                
                const type = btn.dataset.type;
                typeInput.value = type;
                
                if (type === 'Device') {
                    inputDevice.classList.remove('hidden');
                    inputCloud.classList.add('hidden');
                } else {
                    inputDevice.classList.add('hidden');
                    inputCloud.classList.remove('hidden');
                }
            });
        });

        // Helper to read file as base64
        const readFile = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        // Submit handler
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const description = document.getElementById('ev-desc').value;
            const type = typeInput.value;
            const category = this.categorize(description);
            let url = '';
            let fileType = 'Document';

            if (type === 'Cloud') {
                url = document.getElementById('ev-url').value;
                if (!url) {
                    alert('Please enter a valid URL');
                    return;
                }
                fileType = 'Link';
            } else {
                const fileInput = document.getElementById('ev-file');
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    // Basic file type detection
                    fileType = file.type.startsWith('image/') ? 'Image' : 'Document';
                    // In a real app we'd upload to specific storage. Here we use DataURL for local demo.
                    // For persistent large files, this isn't ideal for localStorage, but works for MVP.
                    try {
                        url = await readFile(file);
                    } catch (err) {
                        console.error(err);
                        alert('Error reading file');
                        return;
                    }
                } else {
                    // Fallback placeholder if no file selected but description provided
                    url = `https://via.placeholder.com/300x200?text=${encodeURIComponent(description.slice(0, 20))}`;
                }
            }

            const newItem = {
                id: Date.now().toString(),
                childId: AppState.currentChild === 'all' ? '1' : AppState.currentChild,
                description,
                category: category.id,
                categoryName: category.name,
                categoryIcon: category.icon,
                tag: 'Best Work', // Default tag
                type: fileType,
                date: new Date().toISOString(),
                url: url
            };

            if (!AppState.evidence) AppState.evidence = [];
            AppState.evidence.unshift(newItem);
            
            AppState.notify('evidence');
            Storage.save();
            
            showToast(`✅ Uploaded to ${category.name}!`);
            Gamification.awardXP(newItem.childId, 10);
            
            modal.remove();
        };
    },

    render(filter = 'All') {
        const grid = document.getElementById('evidence-grid');
        if (!grid) return;

        let items = AppState.evidence || [];

        // Filter by child
        if (AppState.currentChild !== 'all') {
            items = items.filter(i => i.childId === AppState.currentChild);
        }

        // Filter by tag/category if needed (simplified for now)
        // In this implementation logic 'filter' comes from the button text
        if (filter !== 'All') {
            // Check match against category name OR tag
            items = items.filter(i => 
                (i.categoryName && i.categoryName.toLowerCase() === filter.toLowerCase()) || 
                (i.tag && i.tag.toLowerCase() === filter.toLowerCase())
            );
        }

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="text-gray-500 italic col-span-full text-center py-12 border border-dashed border-[#2a2a3a] rounded-xl bg-[#12121a]/50">
                    No evidence items found. Upload some work to fill the locker!
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(item => {
            let previewHtml = '';
            
            if (item.type === 'Image') {
                previewHtml = `<img src="${item.url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">`;
            } else if (item.type === 'Link') {
                previewHtml = `
                    <div class="flex flex-col items-center justify-center h-full text-cyan-400 bg-cyan-900/10">
                        <span class="text-4xl mb-2">🔗</span>
                        <span class="text-[10px] font-mono text-cyan-300 opacity-60 px-4 text-center truncate w-full">Google Drive / Cloud</span>
                    </div>
                `;
            } else {
                previewHtml = `
                    <div class="flex items-center justify-center h-full text-violet-400 bg-violet-900/10">
                        <span class="text-5xl">${item.categoryIcon || '📄'}</span>
                    </div>
                `;
            }

            const actionBtn = item.type === 'Link' 
                ? `<a href="${item.url}" target="_blank" class="absolute inset-0 z-10"></a>`
                : '';

            return `
            <div class="glass relative group rounded-2xl p-3 hover:-translate-y-1 transition-all duration-300 border border-[#2a2a3a] hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-900/20">
                ${actionBtn}
                <div class="aspect-video bg-[#0a0a0f] rounded-xl mb-3 overflow-hidden relative">
                    ${previewHtml}
                    <div class="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-white font-medium border border-white/10">
                        ${item.type}
                    </div>
                </div>
                
                <div class="flex justify-between items-start gap-2">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-200 text-sm truncate">${item.description}</h4>
                        <div class="flex gap-2 mt-2 flex-wrap">
                            <span class="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                                ${item.categoryIcon || '📂'} ${item.categoryName || 'General'}
                            </span>
                        </div>
                    </div>
                    <button class="relative z-20 text-gray-600 hover:text-red-400 p-1 rounded-lg hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100" 
                            onclick="Evidence.deleteItem('${item.id}')" title="Delete">✕</button>
                </div>
                <div class="mt-2 pt-2 border-t border-[#2a2a3a] flex justify-between items-center text-[10px] text-gray-500">
                    <span>${new Date(item.date).toLocaleDateString()}</span>
                    ${item.type === 'Link' ? '<span class="text-cyan-400 flex items-center gap-1">Open ↗</span>' : ''}
                </div>
            </div>
            `;
        }).join('');
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
