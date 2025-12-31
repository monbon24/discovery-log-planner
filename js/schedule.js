/**
 * Schedule Module for Homeschool Planner
 * Handles weekly and daily views
 */

const Schedule = {
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    
    init() {
        this.bindEvents();
        this.render();
        
        // Subscribe to state changes
        AppState.subscribe((changeType) => {
            if (changeType === 'lessons' || changeType === 'child' || changeType === 'week' || changeType === 'view') {
                this.render();
            }
        });
    },
    
    bindEvents() {
        // Week navigation
        document.getElementById('prev-week')?.addEventListener('click', () => {
            AppState.setWeekOffset(AppState.currentWeekOffset - 1);
        });
        
        document.getElementById('next-week')?.addEventListener('click', () => {
            AppState.setWeekOffset(AppState.currentWeekOffset + 1);
        });
        
        document.getElementById('current-week')?.addEventListener('click', () => {
            AppState.setWeekOffset(0);
        });
    },
    
    render() {
        this.renderTodayView();
        this.renderWeekView();
        this.updateWeekRange();
        this.updateTodayDate();
        this.highlightToday();
    },
    
    updateTodayDate() {
        const dateEl = document.getElementById('today-date');
        if (dateEl) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = today.toLocaleDateString('en-US', options);
        }
    },
    
    updateWeekRange() {
        const rangeEl = document.getElementById('week-range');
        if (!rangeEl) return;
        
        const { start, end } = this.getWeekDates(AppState.currentWeekOffset);
        const options = { month: 'short', day: 'numeric' };
        const startStr = start.toLocaleDateString('en-US', options);
        const endStr = end.toLocaleDateString('en-US', options);
        
        let label = `${startStr} - ${endStr}`;
        if (AppState.currentWeekOffset === 0) {
            label = `This Week: ${label}`;
        } else if (AppState.currentWeekOffset === 1) {
            label = `Next Week: ${label}`;
        } else if (AppState.currentWeekOffset === -1) {
            label = `Last Week: ${label}`;
        }
        
        rangeEl.textContent = label;
    },
    
    getWeekDates(offset = 0) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset + (offset * 7));
        
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);
        
        return { start: monday, end: friday };
    },
    
    highlightToday() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Remove existing highlights
        document.querySelectorAll('.day-column').forEach(col => {
            col.classList.remove('today');
        });
        
        // Only highlight if current week and weekday
        if (AppState.currentWeekOffset === 0 && dayOfWeek >= 1 && dayOfWeek <= 5) {
            const todayColumn = document.querySelector(`.day-column[data-day="${dayOfWeek}"]`);
            if (todayColumn) {
                todayColumn.classList.add('today');
            }
        }
    },
    
    renderTodayView() {
        const container = document.getElementById('today-lessons');
        const emptyState = document.getElementById('today-empty');
        if (!container) return;
        
        const lessons = AppState.getTodaysLessons();
        const incompleteLessons = lessons.filter(l => !l.completed);
        
        if (lessons.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-slate">
                    <p>No lessons scheduled for today.</p>
                    <p class="text-sm mt-2">Add lessons in the Subjects view!</p>
                </div>
            `;
            emptyState?.classList.add('hidden');
            return;
        }
        
        if (incompleteLessons.length === 0 && lessons.length > 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }
        
        emptyState?.classList.add('hidden');
        container.innerHTML = lessons.map(lesson => this.renderLessonCard(lesson, true)).join('');
    },
    
    renderWeekView() {
        for (let day = 1; day <= 5; day++) {
            const container = document.getElementById(`day-${day}-lessons`);
            if (!container) continue;
            
            const lessons = AppState.getLessonsForDay(day);
            
            if (lessons.length === 0) {
                container.innerHTML = `
                    <div class="text-slate text-xs italic text-center py-4">
                        No lessons
                    </div>
                `;
                continue;
            }
            
            container.innerHTML = lessons.map(lesson => this.renderLessonCard(lesson, false)).join('');
        }
    },
    
    renderLessonCard(lesson, isToday = false) {
        const subject = AppState.subjects.find(s => s.id === lesson.subjectId);
        const subjectColor = subject?.color || '#ccc';
        const subjectName = subject?.name || 'Unknown Subject';
        const child = AppState.children.find(c => c.id === lesson.childId);
        const childLabel = child ? `Grade ${child.grade}` : '';
        
        const completedClass = lesson.completed ? 'completed' : '';
        const checkedAttr = lesson.completed ? 'checked' : '';
        
        // Show reschedule button for incomplete lessons if end of day or past days
        const showReschedule = !lesson.completed && this.shouldShowReschedule(lesson);
        
        return `
            <div class="lesson-card ${completedClass}" style="border-color: ${subjectColor}" data-lesson-id="${lesson.id}">
                <div class="flex items-start gap-3">
                    <input type="checkbox" 
                           class="lesson-checkbox mt-1" 
                           style="border-color: ${subjectColor}"
                           ${checkedAttr}
                           onchange="Schedule.toggleLesson('${lesson.id}')"
                           id="lesson-${lesson.id}">
                    <div class="flex-1">
                        <label for="lesson-${lesson.id}" class="lesson-title cursor-pointer">${lesson.title}</label>
                        <div class="lesson-subject">
                            <span style="color: ${subjectColor}">●</span> ${subjectName}
                            ${AppState.currentChild === 'all' ? `<span class="ml-2 text-slate">(${childLabel})</span>` : ''}
                        </div>
                        ${showReschedule ? `
                            <button class="reschedule-btn" onclick="Reschedule.rescheduleLesson('${lesson.id}')">
                                🔄 Reschedule
                            </button>
                        ` : ''}
                    </div>
                    <button class="text-slate hover:text-dustyRose text-sm" onclick="Schedule.deleteLesson('${lesson.id}')" title="Delete lesson">
                        ✕
                    </button>
                </div>
            </div>
        `;
    },
    
    shouldShowReschedule(lesson) {
        if (AppState.currentWeekOffset < 0) {
            // Past weeks - always show reschedule for incomplete
            return true;
        }
        
        if (AppState.currentWeekOffset > 0) {
            // Future weeks - don't show
            return false;
        }
        
        // Current week - check if day has passed or it's end of day
        const today = new Date();
        const currentDay = today.getDay();
        const currentHour = today.getHours();
        
        // If lesson's day has passed
        if (lesson.dayOfWeek < currentDay) {
            return true;
        }
        
        // If it's the same day and after 3 PM (end of school day)
        if (lesson.dayOfWeek === currentDay && currentHour >= 15) {
            return true;
        }
        
        return false;
    },
    
    toggleLesson(lessonId) {
        const lesson = AppState.lessons.find(l => l.id === lessonId);
        const wasCompleted = lesson ? lesson.completed : false;
        
        AppState.toggleLesson(lessonId);
        Progress.update();
        
        // Gamification Hook
        if (lesson && !wasCompleted) {
            // Check if it's now completed (it should be, since we toggled it)
            // Wait, we need to re-fetch or trust the toggle logic. 
            // Better: Check the state after toggle, or assume success.
            // AppState.toggleLesson flips the boolean.
            // If it was FALSE, it is now TRUE.
            
            Gamification.awardXP(lesson.childId);
            Gamification.updateStreak(lesson.childId);
        }
    },
    
    deleteLesson(lessonId) {
        if (confirm('Delete this lesson?')) {
            AppState.removeLesson(lessonId);
            showToast('Lesson deleted');
        }
    }
};

// Make globally available
window.Schedule = Schedule;
