/**
 * Reschedule Module for Homeschool Planner
 */

const Reschedule = {
    rescheduleLesson(lessonId) {
        const lesson = AppState.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        
        const subjectLessons = AppState.lessons.filter(l => 
            l.subjectId === lesson.subjectId && 
            l.childId === lesson.childId &&
            !l.completed
        );
        
        subjectLessons.sort((a, b) => {
            if (a.weekOffset !== b.weekOffset) return (a.weekOffset || 0) - (b.weekOffset || 0);
            return a.dayOfWeek - b.dayOfWeek;
        });
        
        const currentIndex = subjectLessons.findIndex(l => l.id === lessonId);
        if (currentIndex === -1) return;
        
        const lessonsToReschedule = subjectLessons.slice(currentIndex);
        lessonsToReschedule.forEach(l => this.moveToNextDay(l));
        
        AppState.notify('lessons');
        Storage.save();
        showToast(`Rescheduled ${lessonsToReschedule.length} lesson(s)`);
    },
    
    moveToNextDay(lesson) {
        let newDay = lesson.dayOfWeek + 1;
        let newWeekOffset = lesson.weekOffset || 0;
        
        if (newDay > 5) {
            newDay = 1;
            newWeekOffset++;
        }
        
        lesson.dayOfWeek = newDay;
        lesson.weekOffset = newWeekOffset;
        lesson.rescheduled = true;
    }
};

window.Reschedule = Reschedule;
