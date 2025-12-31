/**
 * Subjects Module for Homeschool Planner
 * Handles subject setup and management
 */

const Subjects = {
    init() {
        this.bindEvents();
        this.render();
        
        // Subscribe to state changes
        AppState.subscribe((changeType) => {
            if (changeType === 'subjects' || changeType === 'child') {
                this.render();
                this.updateLessonSubjectDropdown();
            }
        });
    },
    
    bindEvents() {
        // ... previous event bindings ...
        // Add subject form
        const form = document.getElementById('add-subject-form');
         if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddSubject();
            });
        }
        
        // Color presets
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const colorInput = document.getElementById('subject-color');
                if (colorInput) {
                    colorInput.value = btn.dataset.color;
                }
            });
        });
        
        // Add lesson form
        const lessonForm = document.getElementById('add-lesson-form');
        if (lessonForm) {
            lessonForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddLesson();
            });
        }
    },
    
    // ... handleAddSubject and handleAddLesson ...

    render() {
        this.renderSubjectList('1');
        this.renderSubjectList('2');
        this.updateLessonSubjectDropdown();
        this.renderMathChart();
    },

    renderMathChart() {
        const container = document.getElementById('math-progress-container');
        if (!container) return;

        // Only show for Produce (Child 1)
        if (AppState.currentChild === '1') {
            if (!window.Chart) {
                console.warn('Chart.js not loaded yet');
                return;
            }
            container.classList.remove('hidden');
            
            const canvas = document.getElementById('mathChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            
            // Destroy existing chart if any
            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            // Mock Data - In real app, query "Math" tagged lessons
            // For demo, we'll just show mock progress over weeks
            this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                    datasets: [{
                        label: 'Math Mastery (Avg Score)',
                        data: [65, 72, 75, 82, 88],
                        borderColor: '#E07A5F',
                        backgroundColor: 'rgba(224, 122, 95, 0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Lessons Completed',
                        data: [2, 4, 3, 5, 4],
                        borderColor: '#A8C5A8',
                        backgroundColor: 'rgba(168, 197, 168, 0.2)',
                        tension: 0.2,
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Score' }
                        },
                        y1: {
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            title: { display: true, text: 'Count' }
                        }
                    }
                }
            });
            
        } else {
            container.classList.add('hidden');
        }
    },
    
    handleAddSubject() {
        const nameInput = document.getElementById('subject-name');
        const colorInput = document.getElementById('subject-color');
        const childSelect = document.getElementById('subject-child');
        
        const name = nameInput.value.trim();
        const color = colorInput.value;
        const childId = childSelect.value;
        
        if (!name) return;
        
        // If 'both', create subject for both children
        if (childId === 'both') {
            AppState.addSubject({ name, color, childId: '1' });
            AppState.addSubject({ name, color, childId: '2' });
        } else {
            AppState.addSubject({ name, color, childId });
        }
        
        // Reset form
        nameInput.value = '';
        colorInput.value = '#E07A5F';
        
        showToast(`Subject "${name}" added!`);
    },
    
    handleAddLesson() {
        const subjectSelect = document.getElementById('lesson-subject');
        const titleInput = document.getElementById('lesson-title');
        const daySelect = document.getElementById('lesson-day');
        
        const subjectId = subjectSelect.value;
        const title = titleInput.value.trim();
        const dayOfWeek = parseInt(daySelect.value);
        
        if (!subjectId || !title) return;
        
        // Find the subject to get childId
        const subject = AppState.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        AppState.addLesson({
            subjectId,
            childId: subject.childId,
            title,
            dayOfWeek,
            weekOffset: AppState.currentWeekOffset
        });
        
        // Reset form
        titleInput.value = '';
        
        showToast(`Lesson "${title}" added!`);
    },
    
    render() {
        this.renderSubjectList('1');
        this.renderSubjectList('2');
        this.updateLessonSubjectDropdown();
    },
    
    renderSubjectList(childId) {
        const container = document.getElementById(`subjects-child-${childId}`);
        if (!container) return;
        
        const subjects = AppState.subjects.filter(s => s.childId === childId);
        
        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="text-slate text-sm italic p-3 bg-white/50 rounded-lg">
                    No subjects yet. Add one above!
                </div>
            `;
            return;
        }
        
        container.innerHTML = subjects.map(subject => `
            <div class="subject-card" style="border-color: ${subject.color}">
                <div class="flex items-center gap-3">
                    <div class="w-4 h-4 rounded-full" style="background-color: ${subject.color}"></div>
                    <span class="subject-name">${subject.name}</span>
                </div>
                <button class="btn-delete" onclick="Subjects.deleteSubject('${subject.id}')" title="Delete subject">
                    ✕
                </button>
            </div>
        `).join('');
    },
    
    updateLessonSubjectDropdown() {
        const select = document.getElementById('lesson-subject');
        if (!select) return;
        
        const subjects = AppState.subjects;
        
        select.innerHTML = '<option value="">Select subject...</option>';
        
        // Group by child
        const child1Subjects = subjects.filter(s => s.childId === '1');
        const child2Subjects = subjects.filter(s => s.childId === '2');
        
        if (child1Subjects.length > 0) {
            const group1 = document.createElement('optgroup');
            group1.label = 'Grade 4';
            child1Subjects.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                group1.appendChild(opt);
            });
            select.appendChild(group1);
        }
        
        if (child2Subjects.length > 0) {
            const group2 = document.createElement('optgroup');
            group2.label = 'Grade 6';
            child2Subjects.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                group2.appendChild(opt);
            });
            select.appendChild(group2);
        }
    },
    
    deleteSubject(subjectId) {
        if (confirm('Delete this subject and all its lessons?')) {
            AppState.removeSubject(subjectId);
            showToast('Subject deleted');
        }
    }
};

// Make globally available
window.Subjects = Subjects;
