// Teacher Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.role || user.role !== 'teacher') {
        window.location.href = '/login?role=teacher';
        return;
    }
    
    document.getElementById('teacherName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('teacherFirstName').textContent = user.firstName;
    
    // Load dashboard data
    loadDashboardData();
});

// Load dashboard data from API
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        let classBreakdown = {};
        
        // Fetch statistics
        const statsResponse = await fetch('/api/statistics', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success) {
                classBreakdown = statsData.statistics.classBreakdown || {};
                document.getElementById('totalStudents').textContent = statsData.statistics.totalStudents;
                document.getElementById('totalTeachers').textContent = statsData.statistics.totalTeachers;
                renderMyClasses(classBreakdown, user);
            }
        }
        
        // Fetch teacher's subjects from demo data
        const teachersResponse = await fetch('/api/teachers', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (teachersResponse.ok) {
            const teachersData = await teachersResponse.json();
            if (teachersData.success) {
                const teacher = teachersData.teachers.find(t => t.staffId === user.staffId);
                if (teacher && teacher.subjects) {
                    document.getElementById('mySubjects').textContent = teacher.subjects.length;
                    populateClassSelect(Object.keys(classBreakdown));
                }
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values if API fails
        document.getElementById('totalStudents').textContent = '5';
        document.getElementById('totalTeachers').textContent = '3';
        document.getElementById('mySubjects').textContent = '2';
    }
}

// Clean a class name for DISPLAY only: strip all alphabetical characters.
// "SS 1A" -> "1", "SS1" -> "1". Original key is preserved for backend requests.
function cleanClassName(name) {
    return name.replace(/[A-Za-z]/g, '').trim();
}

// Build "My Classes" cards from real class-breakdown data
function renderMyClasses(classBreakdown, user) {
    const container = document.getElementById('myClassesContainer');
    if (!container) return;
    
    const classes = Object.keys(classBreakdown);
    if (classes.length === 0) {
        container.innerHTML = '<p class="text-slate-400 col-span-3">No classes assigned yet.</p>';
        return;
    }
    
    container.innerHTML = classes.map(cls => {
        const displayName = cleanClassName(cls);
        const count = classBreakdown[cls];
        // original key (cls) kept in data-class for backend "View Students" requests
        return `
            <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <h3 class="font-bold text-slate-800 text-lg mb-2">${displayName}</h3>
                <p class="text-slate-600 mb-4">${count} Student${count !== 1 ? 's' : ''}</p>
                <p class="text-sm text-slate-500"><i class="fas fa-book mr-1"></i> Class Record</p>
                <button class="mt-4 text-primary hover:underline text-sm" data-class="${cls}" onclick="viewClassStudents('${cls}')">View Students <i class="fas fa-arrow-right ml-1"></i></button>
            </div>`;
    }).join('');
}

// Populate the Upload Results class dropdown.
// Display value is cleaned (numeric only); the option VALUE keeps the original
// class key (e.g. "SS1") so backend lookups don't fail.
function populateClassSelect(classKeys) {
    const select = document.getElementById('resultClassSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Select Class</option>' +
        (classKeys || []).map(c => `<option value="${c}">${cleanClassName(c)}</option>`).join('');
}

// Load students for the selected class into the results table
async function loadStudentsForResults() {
    const cls = document.getElementById('resultClassSelect').value;
    const tbody = document.getElementById('resultsTableBody');
    if (!cls) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-6 text-center text-slate-400 text-sm">Please select a class first.</td></tr>';
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/students?class=${encodeURIComponent(cls)}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        const students = data.success ? data.students : [];
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-6 text-center text-slate-400 text-sm">No students found in this class.</td></tr>';
            return;
        }
        tbody.innerHTML = students.map(s => `
            <tr class="hover:bg-slate-50 transition" data-admission="${s.admissionNumber}">
                <td class="px-4 py-3 text-sm text-slate-700">${s.user.firstName} ${s.user.lastName}</td>
                <td class="px-4 py-3 text-center"><input type="number" class="ca-input w-20 border border-slate-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-primary" min="0" max="20" data-field="ca1"></td>
                <td class="px-4 py-3 text-center"><input type="number" class="ca-input w-20 border border-slate-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-primary" min="0" max="20" data-field="ca2"></td>
                <td class="px-4 py-3 text-center"><input type="number" class="ca-input w-20 border border-slate-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-primary" min="0" max="60" data-field="exam"></td>
                <td class="total-cell px-4 py-3 text-center font-bold text-slate-800">-</td>
            </tr>`).join('');

        // Requirement 1: auto-calculate Total = CA1 + CA2 + Exam in real time
        tbody.querySelectorAll('.ca-input').forEach(input => {
            input.addEventListener('input', function() {
                const row = this.closest('tr');
                const ca1 = parseFloat(row.querySelector('[data-field="ca1"]').value) || 0;
                const ca2 = parseFloat(row.querySelector('[data-field="ca2"]').value) || 0;
                const exam = parseFloat(row.querySelector('[data-field="exam"]').value) || 0;
                row.querySelector('.total-cell').textContent = (ca1 + ca2 + exam).toFixed(0);
            });
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-6 text-center text-red-500 text-sm">Failed to load students.</td></tr>';
    }
}

// Requirement 2: Save results with status 'pending_verification' for admin approval
async function saveResults() {
    const cls = document.getElementById('resultClassSelect').value;
    const subject = document.getElementById('resultSubjectSelect').value;
    const session = document.getElementById('resultSessionSelect').value;
    const term = document.getElementById('resultTermSelect').value;
    const msg = document.getElementById('resultsSaveMsg');

    if (!cls || !subject) {
        showSaveMsg(msg, 'Please select a class and subject before saving.', false);
        return;
    }

    const rows = document.querySelectorAll('#resultsTableBody tr[data-admission]');
    if (rows.length === 0) {
        showSaveMsg(msg, 'No student scores loaded. Click "Load Students" first.', false);
        return;
    }

    const students = Array.from(rows).map(row => {
        const ca1 = parseFloat(row.querySelector('[data-field="ca1"]').value) || 0;
        const ca2 = parseFloat(row.querySelector('[data-field="ca2"]').value) || 0;
        const exam = parseFloat(row.querySelector('[data-field="exam"]').value) || 0;
        return {
            admissionNumber: row.getAttribute('data-admission'),
            ca1, ca2, exam,
            total: ca1 + ca2 + exam
        };
    });

    const payload = {
        class: cls,            // original key kept for backend
        subject,
        session,
        term,
        status: 'pending_verification',
        students
    };

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            showSaveMsg(msg, 'Results saved and sent for admin verification.', true);
        } else {
            showSaveMsg(msg, data.message || 'Failed to save results.', false);
        }
    } catch (e) {
        console.error(e);
        showSaveMsg(msg, 'Upstream request failed. Please try again.', false);
    }
}

function showSaveMsg(el, text, success) {
    el.textContent = text;
    el.className = 'mt-3 text-sm ' + (success ? 'text-green-600' : 'text-red-600');
}

// View students in a class (uses the ORIGINAL class key for the backend request)
async function viewClassStudents(originalClass) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/students?class=${encodeURIComponent(originalClass)}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success) {
            const names = data.students.map(s => `${s.user.firstName} ${s.user.lastName} (${s.admissionNumber})`).join('\n');
            alert(`Class ${cleanClassName(originalClass)} — ${data.total} student(s):\n\n${names || 'None'}`);
        }
    } catch (e) {
        console.error(e);
        alert('Could not load students for this class.');
    }
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section + 'Section').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login?role=teacher';
}
