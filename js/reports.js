/**
 * Reports Module for Homeschool Planner
 * Handles Transcript generation and PDF export
 */

const Reports = {
    init() {
        this.bindEvents();
        
        AppState.subscribe((changeType) => {
            if (changeType === 'view' && AppState.currentView === 'transcript') {
                this.renderTranscript();
            }
            if (changeType === 'child') {
                this.renderTranscript();
            }
        });
    },

    bindEvents() {
        document.getElementById('generate-pdf-btn')?.addEventListener('click', () => {
            this.generatePDF();
        });
    },

    renderTranscript() {
        if (AppState.currentChild === 'all') {
            document.getElementById('transcript-preview').innerHTML = `
                <div class="text-center py-12 text-slate italic">
                    Please select a specific student profile above to view their transcript.
                </div>
            `;
            return;
        }

        const child = AppState.children.find(c => c.id === AppState.currentChild);
        if (!child) return;

        // Restore Template Structure if it was overwritten
        if (!document.getElementById('t-student-name')) {
            // Re-inject template if needed, or better, just hide/show sections
            // For now, simpler to re-render the whole inner block if missing, 
            // but let's assume the structure is there and just update text.
            // Actually, if 'all' was selected, we wiped it. So we need to restore it.
            this.restoreTemplate();
        }

        document.getElementById('t-student-name').textContent = `Name: ${child.name}`;
        
        // Mock Data for Transcript (In real app, calculate from Lessons/Subjects)
        // We'll generate "courses" based on Subjects and assign random/mock grades for demo
        const subjects = AppState.subjects.filter(s => s.childId === child.id || s.childId === 'both');
        const courses = subjects.map(s => ({
            name: s.name,
            credits: 1.0,
            grade: this.calculateGrade(s.id, child.id)
        }));

        this.renderCoursesTable(courses);
        this.updateGPA(courses);
        
        // Set ID
        document.getElementById('t-student-id').textContent = `Student ID: HS-2025-00${child.id}`;
    },

    restoreTemplate() {
        const preview = document.getElementById('transcript-preview');
        // If it doesn't have the header, restore it
        if (!preview.querySelector('h1')) {
            preview.innerHTML = `
                <div class="text-center border-b-2 border-charcoal pb-6 mb-6">
                    <h1 class="text-3xl font-serif font-bold text-charcoal mb-2">OFFICIAL HIGH SCHOOL TRANSCRIPT</h1>
                    <div class="flex justify-between text-sm mt-4 px-12">
                        <div class="text-left">
                            <p class="font-bold">Student Information</p>
                            <p id="t-student-name">Name: ...</p>
                            <p id="t-student-dob">DOB: 01/01/2012</p>
                            <p id="t-student-id">Student ID: ...</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold">School Information</p>
                            <p>Cozy Homeschool Academy</p>
                            <p>123 Learning Lane</p>
                            <p>Parent/Admin: Monica</p>
                        </div>
                    </div>
                </div>

                <div id="transcript-courses"></div>

                <div class="mt-8 flex justify-end">
                    <div class="bg-softPeach/30 p-4 rounded border border-softPeach">
                        <p class="font-bold text-lg">Cumulative GPA: <span id="t-gpa">4.0</span></p>
                        <p class="">Total Credits: <span id="t-credits">0</span></p>
                    </div>
                </div>
            `;
        }
    },

    calculateGrade(subjectId, childId) {
        // Mock Logic: Grade based on lesson completion %
        // Real app would use actual grades entered on cards
        const lessons = AppState.lessons.filter(l => l.subjectId === subjectId && l.childId === childId);
        if (lessons.length === 0) return 'A'; // Default start high
        
        const completed = lessons.filter(l => l.completed).length;
        const percentage = (completed / lessons.length) * 100;
        
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F'; // Harsh! But accurate to logic.
    },

    renderCoursesTable(courses) {
        const container = document.getElementById('transcript-courses');
        
        if (courses.length === 0) {
            container.innerHTML = `<p class="text-center italic text-slate">No courses registered.</p>`;
            return;
        }

        const rows = courses.map(c => `
            <tr class="border-b border-softPeach/50">
                <td class="py-2 text-left">${c.name}</td>
                <td class="py-2 text-center">${c.credits.toFixed(1)}</td>
                <td class="py-2 text-center font-bold">${c.grade}</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <table class="w-full">
                <thead>
                    <tr class="border-b-2 border-charcoal text-sm uppercase text-slate">
                        <th class="text-left py-2">Course Title</th>
                        <th class="text-center py-2">Credits</th>
                        <th class="text-center py-2">Final Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    },

    updateGPA(courses) {
        let totalPoints = 0;
        let totalCredits = 0;
        
        const gradePoints = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };

        courses.forEach(c => {
            totalPoints += (gradePoints[c.grade] || 0) * c.credits;
            totalCredits += c.credits;
        });

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
        
        document.getElementById('t-gpa').textContent = gpa;
        document.getElementById('t-credits').textContent = totalCredits.toFixed(1);
    },

    generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const child = AppState.children.find(c => c.id === AppState.currentChild);
        if (!child) return;

        // Simple PDF Generation (Text based for speed/reliability over html2canvas)
        doc.setFont('times', 'bold');
        doc.setFontSize(22);
        doc.text("OFFICIAL HIGH SCHOOL TRANSCRIPT", 105, 20, null, null, "center");
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student Name: ${child.name}`, 20, 40);
        doc.text(`Student ID: HS-2025-00${child.id}`, 20, 48);
        doc.text(`DOB: 01/01/2012`, 20, 56);
        
        doc.text("Cozy Homeschool Academy", 140, 40);
        doc.text("123 Learning Lane", 140, 48);
        doc.text("Admin: Monica", 140, 56);
        
        doc.line(20, 65, 190, 65);
        
        // Courses
        let y = 80;
        doc.setFont('helvetica', 'bold');
        doc.text("Course Title", 20, y);
        doc.text("Credits", 140, y);
        doc.text("Grade", 170, y);
        doc.setFont('helvetica', 'normal');
        
        y += 10;
        
        // Get courses again (duplicate logic, should extract but fine for now)
        constsubjects = AppState.subjects.filter(s => s.childId === child.id || s.childId === 'both');
        const subjects = AppState.subjects.filter(s => s.childId === child.id || s.childId === 'both');
        
        subjects.forEach(s => {
            const grade = this.calculateGrade(s.id, child.id);
            doc.text(s.name, 20, y);
            doc.text("1.0", 140, y);
            doc.text(grade, 170, y);
            y += 8;
        });
        
        doc.save(`${child.name}_transcript.pdf`);
        showToast("Transcript PDF downloaded!");
    }
};

window.Reports = Reports;
