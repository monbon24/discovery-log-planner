/**
 * State Management for Homeschool Planner
 * Handles local state and synchronization
 */

const AppState = {
    // Current UI state
    currentView: 'today',
    currentChild: '1', // '1', '2', or 'all'
    currentWeekOffset: 0, // 0 = current week, 1 = next week, -1 = prev week
    
    // Data
    children: [
        { 
            id: '1', 
            name: 'Prentiss', 
            grade: 4, 
            avatar: '🧑‍💻', 
            track: 'Game Design',
            level: 1, 
            xp: 0, 
            xpToNextLevel: 100,
            streak: 0
        },
        { 
            id: '2', 
            name: 'Faye', 
            grade: 6, 
            avatar: '🎭', 
            track: 'Performance Arts',
            level: 1, 
            xp: 0, 
            xpToNextLevel: 100,
            streak: 0
        }
    ],
    subjects: [],
    lessons: [],
    evidence: [], 
    
    // Travel / Adventure Mode Data
    mission: "To raise curious, creative, and capable world citizens who are ready for their biggest dreams.",
    destinations: [
        {
            id: 'd1',
            title: 'MIT / Tech Leader',
            trackId: 'Game Design', // Linked to Produce
            targetAge: 18,
            currentAge: 10,
            image: '🚀',
            requirements: ['Calculus Mastery', 'Released 3 Games', 'Python Cert'],
            status: 'in-progress'
        },
        {
            id: 'd2',
            title: 'Julliard / Broadway',
            trackId: 'Performance Arts', // Linked to Faye
            targetAge: 18,
            currentAge: 12,
            image: '🎭',
            requirements: ['Monologue Portfolio', 'Vocal Range C6', 'Regional Theater'],
            status: 'in-progress'
        },
        {
            id: 'd3',
            title: 'Le Cordon Bleu',
            trackId: 'Culinary', // Maybe shared?
            targetAge: 19,
            currentAge: 11, // Avg
            image: '👨‍🍳',
            requirements: ['Knife Skills', 'Sauce Mastery', 'Pastry Basics'],
            status: 'future'
        }
    ],

    // Event listeners for state changes
    listeners: [],
    
    // Subscribe to state changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    },
    
    // Notify all listeners of state change
    notify(changeType) {
        this.listeners.forEach(callback => callback(changeType));
    },
    
    // Set current view
    setView(view) {
        this.currentView = view;
        this.notify('view');
    },
    
    // Set current child filter
    setChild(childId) {
        this.currentChild = childId;
        this.notify('child');
    },
    
    // Set week offset
    setWeekOffset(offset) {
        this.currentWeekOffset = offset;
        this.notify('week');
    },
    
    // Add a subject
    addSubject(subject) {
        const newSubject = {
            id: Date.now().toString(),
            ...subject,
            createdAt: new Date().toISOString()
        };
        this.subjects.push(newSubject);
        this.notify('subjects');
        Storage.save();
        return newSubject;
    },
    
    // Remove a subject
    removeSubject(subjectId) {
        this.subjects = this.subjects.filter(s => s.id !== subjectId);
        // Also remove lessons for this subject
        this.lessons = this.lessons.filter(l => l.subjectId !== subjectId);
        this.notify('subjects');
        this.notify('lessons');
        Storage.save();
    },
    
    // Add a lesson
    addLesson(lesson) {
        const newLesson = {
            id: Date.now().toString(),
            ...lesson,
            completed: false,
            originalDay: lesson.dayOfWeek,
            weekOffset: lesson.weekOffset || 0,
            createdAt: new Date().toISOString()
        };
        this.lessons.push(newLesson);
        this.notify('lessons');
        Storage.save();
        return newLesson;
    },
    
    // Toggle lesson completion
    toggleLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
            lesson.completed = !lesson.completed;
            lesson.completedAt = lesson.completed ? new Date().toISOString() : null;
            this.notify('lessons');
            Storage.save();
        }
    },
    
    // Remove a lesson
    removeLesson(lessonId) {
        this.lessons = this.lessons.filter(l => l.id !== lessonId);
        this.notify('lessons');
        Storage.save();
    },
    
    // Get subjects for a specific child
    getSubjectsForChild(childId) {
        if (childId === 'all') {
            return this.subjects;
        }
        return this.subjects.filter(s => s.childId === childId || s.childId === 'both');
    },
    
    // Get lessons for current view
    getLessonsForCurrentView() {
        let lessons = this.lessons;
        
        // Filter by week offset
        lessons = lessons.filter(l => (l.weekOffset || 0) === this.currentWeekOffset);
        
        // Filter by child if not 'all'
        if (this.currentChild !== 'all') {
            lessons = lessons.filter(l => l.childId === this.currentChild);
        }
        
        return lessons;
    },
    
    // Get lessons for a specific day
    getLessonsForDay(dayOfWeek) {
        return this.getLessonsForCurrentView().filter(l => l.dayOfWeek === dayOfWeek);
    },
    
    // Get today's lessons
    getTodaysLessons() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // If weekend, show Monday's lessons
        const targetDay = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : dayOfWeek;
        
        // Only show current week for today view
        let lessons = this.lessons.filter(l => (l.weekOffset || 0) === 0);
        
        // Filter by day
        lessons = lessons.filter(l => l.dayOfWeek === targetDay);
        
        // Filter by child if not 'all'
        if (this.currentChild !== 'all') {
            lessons = lessons.filter(l => l.childId === this.currentChild);
        }
        
        return lessons;
    },
    
    // Calculate progress for a child
    getProgressForChild(childId) {
        const childLessons = this.lessons.filter(l => 
            l.childId === childId && 
            (l.weekOffset || 0) === this.currentWeekOffset
        );
        
        if (childLessons.length === 0) return 0;
        
        const completed = childLessons.filter(l => l.completed).length;
        return Math.round((completed / childLessons.length) * 100);
    },
    
    // Load state from storage
    loadFromStorage(data) {
        if (data.subjects) this.subjects = data.subjects;
        if (data.lessons) this.lessons = data.lessons;
        this.notify('subjects');
        this.notify('lessons');
    },
    
    // Get serializable state for storage
    getStorageData() {
        return {
            subjects: this.subjects,
            lessons: this.lessons
        };
    }
};

// Make globally available
window.AppState = AppState;
