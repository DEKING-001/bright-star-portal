// Dashboard JavaScript for Student Portal

// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.role || user.role !== 'student') {
        window.location.href = '/login?role=student';
        return;
    }
    
    // Update user info
    updateUserInfo(user);
    
    // Load dashboard data
    loadDashboardData();
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

// Load dashboard data from API
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        
        // Load student profile
        const profileResponse = await fetch('/api/students/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            updateProfileData(profileData.student);
        }
        
        // Load announcements
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
        const q = new URLSearchParams();
        if (cls) q.set('class', cls);
        if (session) q.set('session', session);
        if (term) q.set('term', term);
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
        const q = new URLSearchParams();
        if (cls) q.set('class', cls);
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

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Load results
async function loadResults() {
    try {
        const token = localStorage.getItem('token');
        const session = document.getElementById('resultSession').value;
        const term = document.getElementById('resultTerm').value;
        
        const response = await fetch(`/api/results/student?session=${session}&term=${term}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayResults(data);
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// Display results
function displayResults(data) {
    const tbody = document.getElementById('resultsTable');
    
    if (!data.results || data.results.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No results found for this session/term
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = data.results.map(result => {
        const gradeColors = {
            'A': 'bg-green-100 text-green-700',
            'B': 'bg-blue-100 text-blue-700',
            'C': 'bg-yellow-100 text-yellow-700',
            'D': 'bg-orange-100 text-orange-700',
            'E': 'bg-red-100 text-red-700',
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
    
    // Update summary
    if (data.summary) {
        document.getElementById('totalScore').textContent = data.summary.totalScore;
        document.getElementById('averageScore').textContent = data.summary.average;
        document.getElementById('position').textContent = getOrdinal(data.summary.position);
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
        const token = localStorage.getItem('token');
        const response = await fetch('/api/attendance/student', {
            headers: { 'Authorization': `Bearer ${token}` }
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
        const token = localStorage.getItem('token');
        const response = await fetch('/api/fees/student', {
            headers: { 'Authorization': `Bearer ${token}` }
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

// Download report card (placeholder)
function downloadReportCard() {
    alert('Report card PDF download feature will be available soon. This feature requires a PDF generation library.');
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
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login?role=student';
}

// Format currency
function formatCurrency(amount) {
    return '₦' + amount.toLocaleString();
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
