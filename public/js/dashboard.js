// Dashboard JavaScript for Student Portal

// Check authentication (server-verified)
document.addEventListener('DOMContentLoaded', async function() {
    const auth = await requireAuth('student');
    if (!auth.ok) return;
    
    const { user } = auth;
    
    // Update user info
    updateUserInfo(user);
    
    // Load dashboard data
    loadDashboardData();
    
    // Load profile picture
    loadStudentPic();
});

// Update user information in the UI
function updateUserInfo(user) {
    const firstName = user.firstName || 'Student';
    const lastName = user.lastName || '';
    const fullName = `${firstName} ${lastName}`;
    
    // Update all name displays
    document.getElementById('studentFirstName').textContent = firstName;
    document.getElementById('dashName').textContent = fullName;
    document.getElementById('userName').textContent = fullName;
    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileFullName').textContent = fullName;
    document.getElementById('dashAdmission').textContent = `Admission No: ${user.admissionNumber || 'N/A'}`;
    document.getElementById('profileAdmission').textContent = `Admission No: ${user.admissionNumber || 'N/A'}`;
    document.getElementById('profileEmail').textContent = user.email || 'N/A';
}

// Profile picture functions
function loadStudentPic() {
    const pic = localStorage.getItem('student_profile_pic');
    if (pic) {
        ['dashAvatarImg', 'profileAvatarImg'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.src = pic; el.classList.remove('hidden'); }
        });
        ['dashAvatarIcon', 'profileAvatarIcon'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
    }
}

function uploadStudentPic(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        localStorage.setItem('student_profile_pic', e.target.result);
        loadStudentPic();
    };
    reader.readAsDataURL(file);
}

function removeStudentPic() {
    localStorage.removeItem('student_profile_pic');
    ['dashAvatarImg', 'profileAvatarImg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.src = ''; el.classList.add('hidden'); }
    });
    ['dashAvatarIcon', 'profileAvatarIcon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
    });
}

// Load dashboard data from API
async function loadDashboardData() {
    try {
        const headers = getAuthHeader('student');
        const session = getSession('student');
        const studentBranch = session?.user?.branch || 'secondary';
        
        // Load student profile
        const profileResponse = await fetch('/api/students/profile', { headers });
        
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            updateProfileData(profileData.student);
        }
        
        // Load announcements (global — not filtered by branch)
        const announcementsResponse = await fetch('/api/announcements');
        if (announcementsResponse.ok) {
            const announcementsData = await announcementsResponse.json();
            displayAnnouncements(announcementsData.announcements);
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update profile data
function updateProfileData(student) {
    if (student) {
        window.studentClass = student.class;
        window.studentSession = student.session;
        window.studentTerm = student.term;
        document.getElementById('dashClass').textContent = student.class || 'N/A';
        document.getElementById('dashSession').textContent = student.session || 'N/A';
        document.getElementById('dashTerm').textContent = student.term || 'N/A';
        document.getElementById('profileClass').textContent = student.class || 'N/A';
        document.getElementById('profileGender').textContent = student.gender || 'N/A';
        document.getElementById('profileDOB').textContent = student.dateOfBirth ? formatDate(student.dateOfBirth) : 'N/A';
        document.getElementById('profileParent').textContent = student.parentName || 'N/A';
        document.getElementById('profileParentPhone').textContent = student.parentPhone || 'N/A';
        document.getElementById('profileSession').textContent = student.session || 'N/A';
    }
}

// Display announcements (recent feed on dashboard + full list on announcements page)
function displayAnnouncements(announcements) {
    if (!announcements || announcements.length === 0) {
        const recent = document.getElementById('recentAnnouncements');
        if (recent) recent.innerHTML = '<p class="text-slate-400 text-sm">No announcements yet.</p>';
        const all = document.getElementById('allAnnouncements');
        if (all) all.innerHTML = '<p class="text-slate-400 text-center py-4">No announcements yet.</p>';
        return;
    }

    const colors = {
        'urgent': 'border-red-500',
        'academic': 'border-blue-500',
        'events': 'border-green-500',
        'sports': 'border-purple-500',
        'general': 'border-yellow-500'
    };

    const recent = document.getElementById('recentAnnouncements');
    if (recent) {
        recent.innerHTML = announcements.slice(0, 3).map(ann => `
            <div class="border-l-4 ${colors[ann.category] || 'border-gray-500'} pl-4 py-2">
                <p class="font-semibold text-gray-700">${ann.title}</p>
                <p class="text-gray-500 text-sm">${ann.content.substring(0, 100)}...</p>
                <p class="text-gray-400 text-xs mt-1"><i class="fas fa-clock mr-1"></i> ${formatDate(ann.createdAt)}</p>
            </div>
        `).join('');
    }

    const all = document.getElementById('allAnnouncements');
    if (all) {
        all.innerHTML = announcements.map(ann => `
            <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition">
                <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 ${ann.category === 'urgent' ? 'bg-red-500' : 'bg-brand'} rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas ${ann.category === 'sports' ? 'fa-futbol' : ann.category === 'urgent' ? 'fa-exclamation-triangle' : 'fa-bullhorn'} text-white"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium uppercase">${ann.category || 'general'}</span>
                            <span class="text-slate-400 text-xs">${formatDate(ann.createdAt)}</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800">${ann.title}</h3>
                        <p class="text-slate-600 mt-2 text-sm">${ann.content}</p>
                    </div>
                </div>
            </div>`).join('');
    }
}

// Show different sections
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    
    // Show selected section
    document.getElementById(section + 'Section').classList.remove('hidden');
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Load section-specific data
    switch(section) {
        case 'results':
            loadResults();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'fees':
            loadFees();
            break;
        case 'timetable':
            loadTimetable();
            break;
        case 'assignments':
            loadAssignments();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
    }
}

// Load the student's class timetable from the shared DB
async function loadTimetable() {
    const container = document.getElementById('timetableBody');
    if (!container) return;
    try {
        const cls = window.studentClass;
        const session = window.studentSession;
        const term = window.studentTerm;
        const studentBranch = getSession('student')?.user?.branch || 'secondary';
        const q = new URLSearchParams();
        if (cls) q.set('class', cls);
        if (session) q.set('session', session);
        if (term) q.set('term', term);
        q.set('branch', studentBranch);
        const res = await fetch(`/api/timetable?${q.toString()}`);
        const data = await res.json();
        const tt = data.timetable;
        if (!tt || !tt.schedule || tt.schedule.length === 0) {
            container.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-slate-400">No timetable published yet.</td></tr>';
            return;
        }
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const slots = [];
        tt.schedule.forEach(d => d.periods.forEach(p => { if (!slots.includes(p.time)) slots.push(p.time); }));
        const map = {};
        tt.schedule.forEach(d => { map[d.day] = {}; d.periods.forEach(p => map[d.day][p.time] = p.subject); });

        let html = '';
        slots.forEach(slot => {
            html += `<tr class="table-row"><td class="px-4 py-3 font-medium text-sm text-slate-700">${slot}</td>`;
            days.forEach(day => {
                const subj = (map[day] && map[day][slot]) || '-';
                html += `<td class="px-4 py-3 text-center text-sm text-slate-600">${subj}</td>`;
            });
            html += '</tr>';
        });
        container.innerHTML = html;
    } catch (e) {
        console.error(e);
        container.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-red-500">Failed to load timetable.</td></tr>';
    }
}

// Load assignments targeted at the student's class
async function loadAssignments() {
    const container = document.getElementById('assignmentsList');
    if (!container) return;
    try {
        const cls = window.studentClass;
        const studentBranch = getSession('student')?.user?.branch || 'secondary';
        const q = new URLSearchParams();
        if (cls) q.set('class', cls);
        q.set('branch', studentBranch);
        const res = await fetch(`/api/assignments?${q.toString()}`);
        const data = await res.json();
        const list = data.assignments || [];
        if (list.length === 0) {
            container.innerHTML = '<p class="text-slate-400 text-center py-4">No assignments for your class yet.</p>';
            return;
        }
        container.innerHTML = list.map(a => `
            <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">${a.subject}</span>
                            <span class="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">${a.class}</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800">${a.title}</h3>
                        <p class="text-slate-600 mt-2 text-sm">${a.description || ''}</p>
                        <p class="text-sm text-slate-400 mt-3"><i class="fas fa-clock mr-1"></i> Due: ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'} | ${a.totalMarks} marks</p>
                    </div>
                    <button class="btn-primary px-4 py-2 rounded-lg text-sm"><i class="fas fa-upload mr-1"></i> Submit</button>
                </div>
            </div>`).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-500 text-center py-4">Failed to load assignments.</p>';
    }
}

// Load all announcements (full list)
async function loadAnnouncements() {
    try {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        displayAnnouncements(data.announcements);
    } catch (e) {
        console.error(e);
    }
}


// Load results from the v2 Result Processing system
async function loadResults() {
    try {
        const headers = getAuthHeader('student');
        const session = document.getElementById('resultSession').value;
        const term = document.getElementById('resultTerm').value;
        
        const response = await fetch(`/api/v2/results/student?session=${session}&term=${term}`, {
            headers
        });
        
        if (response.ok) {
            const data = await response.json();
            displayResults(data);
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// Display results with ranking
function displayResults(data) {
    const tbody = document.getElementById('resultsTable');
    
    if (!data.results || data.results.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No approved results found for this session/term. Results will appear here once uploaded by your teacher and approved by the admin.
                </td>
            </tr>
        `;
        document.getElementById('totalScore').textContent = '-';
        document.getElementById('averageScore').textContent = '-';
        document.getElementById('position').textContent = '-';
        window.studentResults = null;
        return;
    }
    
    // Store for PDF download
    window.studentResults = data.results;
    window.studentSummary = data.summary;
    
    tbody.innerHTML = data.results.map(result => {
        const gradeColors = {
            'A': 'bg-green-100 text-green-700',
            'B': 'bg-blue-100 text-blue-700',
            'C': 'bg-yellow-100 text-yellow-700',
            'D': 'bg-orange-100 text-orange-700',
            'F': 'bg-red-200 text-red-800'
        };
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium">${result.subject}</td>
                <td class="px-4 py-4 text-center">${result.ca1}</td>
                <td class="px-4 py-4 text-center">${result.ca2}</td>
                <td class="px-4 py-4 text-center">${result.exam}</td>
                <td class="px-4 py-4 text-center font-bold">${result.totalScore}</td>
                <td class="px-4 py-4 text-center">
                    <span class="${gradeColors[result.grade] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded">${result.grade}</span>
                </td>
            </tr>
        `;
    }).join('');
    
    // Update summary with ranking
    if (data.summary) {
        document.getElementById('totalScore').textContent = data.summary.totalScore;
        document.getElementById('averageScore').textContent = data.summary.average;
        document.getElementById('position').textContent = data.summary.classRank || getOrdinal(data.summary.position);
    }
}

// ═════════════════════════════════════════════════════════════════════════
// Report Card PDF Download
// ═════════════════════════════════════════════════════════════════════════

async function downloadReportCard() {
    if (!window.studentResults || window.studentResults.length === 0) {
        alert('No results to download. Please view your results first.');
        return;
    }

    const btn = document.querySelector('[onclick="downloadReportCard()"]');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        // ── Colors ──
        const navy = [15, 23, 42];
        const brand = [59, 130, 246];
        const slate600 = [71, 85, 105];
        const slate400 = [148, 163, 184];
        const white = [255, 255, 255];
        const slate50 = [248, 250, 252];
        const slate100 = [241, 245, 249];
        const slate200 = [226, 232, 240];

        // ── Helper: draw line ──
        function drawLine(yPos, color = slate200, width = 0.3) {
            doc.setDrawColor(...color);
            doc.setLineWidth(width);
            doc.line(margin, yPos, pageWidth - margin, yPos);
        }

        // ── School Logo ──
        try {
            const logoImg = new Image();
            logoImg.src = '/images/logo.jpeg';
            await new Promise((resolve, reject) => {
                logoImg.onload = resolve;
                logoImg.onerror = reject;
                setTimeout(reject, 3000);
            });
            doc.addImage(logoImg, 'JPEG', margin, y, 20, 20);
        } catch (_) {
            // Logo not available — draw placeholder circle
            doc.setFillColor(...brand);
            doc.circle(margin + 10, y + 10, 8, 'F');
            doc.setTextColor(...white);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('BS', margin + 10, y + 12, { align: 'center' });
        }

        // ── School Name & Address ──
        doc.setTextColor(...navy);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('BRIGHT STAR INTERNATIONAL SCHOOL', margin + 25, y + 8);

        doc.setTextColor(...slate600);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('10/12 Ikpeamaeze Street, Off Umuikpo Ariaria, ABA', margin + 25, y + 13);
        doc.text('Phone: +234 703 568 5063  |  Email: brightstars@gmail.com', margin + 25, y + 17);

        y += 25;
        drawLine(y, brand, 0.8);
        y += 3;

        // ── Report Card Title ──
        doc.setFillColor(...navy);
        doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'F');
        doc.setTextColor(...white);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT REPORT CARD', pageWidth / 2, y + 6.5, { align: 'center' });
        y += 14;

        // ── Student Info Box ──
        doc.setFillColor(...slate50);
        doc.roundedRect(margin, y, contentWidth, 22, 1, 1, 'F');
        doc.setDrawColor(...slate200);
        doc.roundedRect(margin, y, contentWidth, 22, 1, 1, 'S');

        const session = document.getElementById('resultSession')?.value || window.studentSession || '2025/2026';
        const term = document.getElementById('resultTerm')?.value || window.studentTerm || 'Second Term';
        const studentName = document.getElementById('dashName')?.textContent || 'Student';
        const admissionNo = document.getElementById('dashAdmission')?.textContent?.replace('Admission No: ', '') || 'N/A';
        const studentClass = window.studentClass || 'N/A';

        const leftCol = margin + 4;
        const rightCol = pageWidth / 2 + 5;
        let infoY = y + 5;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate600);
        doc.text('STUDENT NAME:', leftCol, infoY);
        doc.text('ADMISSION NO:', rightCol, infoY);
        infoY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...navy);
        doc.setFontSize(10);
        doc.text(studentName, leftCol, infoY);
        doc.text(admissionNo, rightCol, infoY);
        infoY += 6;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate600);
        doc.text('CLASS:', leftCol, infoY);
        doc.text('SESSION:', rightCol, infoY);
        infoY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...navy);
        doc.setFontSize(10);
        doc.text(studentClass, leftCol, infoY);
        doc.text(session + '  |  ' + term, rightCol, infoY);

        y += 27;

        // ── Results Table ──
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navy);
        doc.text('ACADEMIC RESULTS', margin, y);
        y += 4;

        const results = window.studentResults;
        const colWidths = [60, 22, 22, 22, 22, 22];
        const headers = ['Subject', 'CA1', 'CA2', 'Exam', 'Total', 'Grade'];
        const colX = [margin];
        for (let i = 0; i < colWidths.length - 1; i++) {
            colX.push(colX[i] + colWidths[i]);
        }

        // Table header
        doc.setFillColor(...brand);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setTextColor(...white);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => {
            const align = i === 0 ? 'left' : 'center';
            const xPos = i === 0 ? colX[i] + 2 : colX[i] + colWidths[i] / 2;
            doc.text(h, xPos, y + 4.5, { align });
        });
        y += 7;

        // Table rows
        results.forEach((r, idx) => {
            const bgColor = idx % 2 === 0 ? white : slate50;
            doc.setFillColor(...bgColor);
            doc.rect(margin, y, contentWidth, 7, 'F');
            doc.setDrawColor(...slate200);
            doc.setLineWidth(0.1);
            doc.line(margin, y, pageWidth - margin, y);

            doc.setFontSize(8);
            doc.setTextColor(...navy);

            const values = [r.subject, r.ca1, r.ca2, r.exam, r.totalScore, r.grade];
            values.forEach((v, i) => {
                const align = i === 0 ? 'left' : 'center';
                const xPos = i === 0 ? colX[i] + 2 : colX[i] + colWidths[i] / 2;
                if (i === 4) doc.setFont('helvetica', 'bold');
                else doc.setFont('helvetica', 'normal');
                doc.text(String(v), xPos, y + 4.5, { align });
            });
            y += 7;
        });

        // Table bottom border
        doc.setDrawColor(...brand);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // ── Summary & Remarks (side by side) ──
        const summary = window.studentSummary || {};
        const halfWidth = (contentWidth - 5) / 2;

        // Summary box
        doc.setFillColor(...slate50);
        doc.roundedRect(margin, y, halfWidth, 32, 1, 1, 'F');
        doc.setDrawColor(...slate200);
        doc.roundedRect(margin, y, halfWidth, 32, 1, 1, 'S');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navy);
        doc.text('SUMMARY', margin + 4, y + 5);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...slate600);
        const summaryItems = [
            ['Total Score:', summary.totalScore || '-'],
            ['Average:', summary.average || '-'],
            ['Class Position:', summary.classRank || getOrdinal(summary.position) || '-'],
            ['Total Subjects:', summary.totalSubjects || results.length]
        ];
        let sy = y + 11;
        summaryItems.forEach(([label, val]) => {
            doc.text(label, margin + 4, sy);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...navy);
            doc.text(String(val), margin + halfWidth - 4, sy, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...slate600);
            sy += 5.5;
        });

        // Remarks box
        const remarksX = margin + halfWidth + 5;
        doc.setFillColor(...slate50);
        doc.roundedRect(remarksX, y, halfWidth, 32, 1, 1, 'F');
        doc.setDrawColor(...slate200);
        doc.roundedRect(remarksX, y, halfWidth, 32, 1, 1, 'S');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navy);
        doc.text('REMARKS', remarksX + 4, y + 5);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate600);
        doc.text('Class Teacher:', remarksX + 4, y + 12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...navy);
        doc.text('Good performance. Keep it up!', remarksX + 4, y + 17);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate600);
        doc.text('Principal:', remarksX + 4, y + 24);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...navy);
        doc.text('Excellent effort. Continue to strive for excellence.', remarksX + 4, y + 29);

        y += 38;

        // ── Footer ──
        drawLine(y, brand, 0.5);
        y += 4;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...slate400);
        doc.text('This report card was generated from Bright Star International School Portal', pageWidth / 2, y, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y + 4, { align: 'center' });

        // ── Download ──
        const fileName = `ReportCard_${studentName.replace(/\s+/g, '_')}_${session.replace('/', '-')}_${term.replace(/\s+/g, '')}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Failed to generate report card. Please try again.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }
}

// Get ordinal suffix
function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Load attendance
async function loadAttendance() {
    try {
        const headers = getAuthHeader('student');
        const response = await fetch('/api/attendance/student', {
            headers
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAttendance(data);
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// Display attendance
function displayAttendance(data) {
    if (data.summary) {
        document.getElementById('totalDays').textContent = data.summary.totalDays;
        document.getElementById('presentDays').textContent = data.summary.presentDays;
        document.getElementById('absentDays').textContent = data.summary.absentDays;
        document.getElementById('attendancePercent').textContent = data.summary.percentage + '%';
    }
    
    const tbody = document.getElementById('attendanceTable');
    if (data.attendance && data.attendance.length > 0) {
        const statusColors = {
            'present': 'bg-green-100 text-green-700',
            'absent': 'bg-red-100 text-red-700',
            'late': 'bg-yellow-100 text-yellow-700',
            'excused': 'bg-blue-100 text-blue-700'
        };
        
        tbody.innerHTML = data.attendance.map(att => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">${formatDate(att.date)}</td>
                <td class="px-6 py-4 text-center">
                    <span class="${statusColors[att.status]} px-3 py-1 rounded-full text-sm capitalize">${att.status}</span>
                </td>
                <td class="px-6 py-4 text-center text-gray-500">${att.remark || '-'}</td>
            </tr>
        `).join('');
    }
}

// Load fees
async function loadFees() {
    try {
        const headers = getAuthHeader('student');
        const response = await fetch('/api/fees/student', {
            headers
        });
        
        if (response.ok) {
            const data = await response.json();
            displayFees(data);
        }
    } catch (error) {
        console.error('Error loading fees:', error);
    }
}

// Display fees
function displayFees(data) {
    if (data.summary) {
        document.getElementById('totalFee').textContent = formatCurrency(320000);
        document.getElementById('amountPaid').textContent = formatCurrency(data.summary.totalPaid);
        document.getElementById('balance').textContent = formatCurrency(data.summary.totalBalance);
    }
}

// Change password
async function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    try {
        const headers = { ...getAuthHeader('student'), 'Content-Type': 'application/json' };
        const response = await fetch('/api/auth/change-password', {
            method: 'PUT',
            headers,
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Password changed successfully');
            document.getElementById('changePasswordForm').reset();
        } else {
            alert(data.message || 'Failed to change password');
        }
    } catch (error) {
        alert('Error changing password');
    }
}

// Logout

// Format currency
function formatCurrency(amount) {
    return '₦' + amount.toLocaleString();
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
