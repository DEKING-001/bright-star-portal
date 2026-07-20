// Teacher Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    const auth = await requireAuth('teacher');
    if (!auth.ok) return;
    
    const { user } = auth;
    
    document.getElementById('teacherName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('teacherFirstName').textContent = user.firstName;
    document.getElementById('teacherSettingsName').textContent = `${user.firstName} ${user.lastName}`;
    
    // Load dashboard data
    loadDashboardData();
    
    // Load profile picture
    loadTeacherPic();
});

// Profile picture functions
function loadTeacherPic() {
    const pic = localStorage.getItem('teacher_profile_pic');
    if (pic) {
        const img = document.getElementById('teacherProfileImg');
        if (img) { img.src = pic; img.classList.remove('hidden'); }
        const icon = document.getElementById('teacherProfileIcon');
        if (icon) icon.classList.add('hidden');
    }
}

function uploadTeacherPic(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        localStorage.setItem('teacher_profile_pic', e.target.result);
        loadTeacherPic();
    };
    reader.readAsDataURL(file);
}

function removeTeacherPic() {
    localStorage.removeItem('teacher_profile_pic');
    const img = document.getElementById('teacherProfileImg');
    if (img) { img.src = ''; img.classList.add('hidden'); }
    const icon = document.getElementById('teacherProfileIcon');
    if (icon) icon.classList.remove('hidden');
}

// Load dashboard data from API
async function loadDashboardData() {
    try {
        const session = getSession('teacher');
        const token = session ? session.token : null;
        const user = session ? session.user : {};
        const teacherBranch = user.branch || 'secondary';
        let classBreakdown = {};
        
        // Fetch statistics
        const statsResponse = await fetch(`/api/statistics?branch=${teacherBranch}`, {
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
        const teachersResponse = await fetch(`/api/teachers?branch=${teacherBranch}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (teachersResponse.ok) {
            const teachersData = await teachersResponse.json();
            if (teachersData.success) {
                const teacher = teachersData.teachers.find(t => t.staffId === user.staffId);
                if (teacher && teacher.subjects) {
                    document.getElementById('mySubjects').textContent = teacher.subjects.length;
                    populateClassSelect();
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

// Maps raw database IDs / class keys to user-friendly display names.
// If a key is not found, it falls back to 'Unknown Class'.
const CLASS_NAME_MAP = {
    '1': 'JSS 1', 'JSS1': 'JSS 1',
    '2': 'JSS 2', 'JSS2': 'JSS 2',
    '3': 'JSS 3', 'JSS3': 'JSS 3',
    '4': 'SS 1',  'SS1': 'SS 1',
    '5': 'SS 2',  'SS2': 'SS 2',
    '6': 'SS 3',  'SS3': 'SS 3'
};

// Return a user-friendly class name, falling back to 'Unknown Class' for unmapped keys.
function cleanClassName(name) {
    return CLASS_NAME_MAP[name] || 'Unknown Class';
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
// Fixed class options: label (clean display) mapped to the underlying
// database class value (e.g. 'JSS 1' -> 'JSS1'). This avoids duplicate/
// confusing labels and ensures the correct value is sent to the backend.
const CLASS_OPTIONS = [
    { label: 'JSS 1', value: 'JSS1' },
    { label: 'JSS 2', value: 'JSS2' },
    { label: 'JSS 3', value: 'JSS3' },
    { label: 'SS 1', value: 'SS1' },
    { label: 'SS 2', value: 'SS2' },
    { label: 'SS 3', value: 'SS3' }
];

function populateClassSelect() {
    const select = document.getElementById('resultClassSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Select Class</option>' +
        CLASS_OPTIONS.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
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
        const token = getSession('teacher')?.token;
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

// Requirement 2: Save results with status 'Pending' for admin approval
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
        const nameCell = row.querySelector('td:first-child');
        return {
            admissionNumber: row.getAttribute('data-admission'),
            studentName: nameCell ? nameCell.textContent.trim() : '',
            ca1, ca2, exam
        };
    });

    const payload = { class: cls, subject, session, term, students };

    try {
        const token = getSession('teacher')?.token;
        if (!token) {
            showSaveMsg(msg, 'Session expired. Please log in again.', false);
            return;
        }
        const res = await fetch('/api/v2/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            const note = data.replaced ? 'Existing results updated.' : 'Results saved.';
            showSaveMsg(msg, `${note} Pending admin approval.`, true);
            loadTeacherUploadedResults();
        } else {
            showSaveMsg(msg, data.message || 'Failed to save results.', false);
        }
    } catch (e) {
        console.error('Save results error:', e);
        showSaveMsg(msg, `Network error: ${e.message}. Is the server running on port 3000?`, false);
    }
}

function showSaveMsg(el, text, success) {
    el.textContent = text;
    el.className = 'mt-3 text-sm ' + (success ? 'text-green-600' : 'text-red-600');
}

// View students in a class (uses the ORIGINAL class key for the backend request)
async function viewClassStudents(originalClass) {
    try {
        const token = getSession('teacher')?.token;
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

    if (section === 'assignments') loadTeacherAssignments();
    if (section === 'announcements') loadTeacherAnnouncements();
    if (section === 'results') loadTeacherUploadedResults();
}

// Load teacher's own uploaded result batches with approval status
async function loadTeacherUploadedResults() {
    const container = document.getElementById('teacherUploadedResults');
    if (!container) return;
    container.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">Loading...</p>';
    try {
        const token = getSession('teacher')?.token;
        const res = await fetch('/api/v2/results/teacher', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        const batches = data.batches || [];
        if (batches.length === 0) {
            container.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">No results uploaded yet. Use the form above to upload results.</p>';
            return;
        }
        container.innerHTML = batches.map(b => {
            const isApproved = b.status === 'Approved';
            const badgeClass = isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
            return `
                <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 ${isApproved ? 'bg-emerald-100' : 'bg-amber-100'} rounded-lg flex items-center justify-center">
                            <i class="fas ${isApproved ? 'fa-check-circle text-emerald-600' : 'fa-clock text-amber-600'}"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-slate-800">${b.class} &mdash; ${b.subject}</p>
                            <p class="text-xs text-slate-500">${b.session} | ${b.term}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}">${b.status.toUpperCase()}</span>
                        <p class="text-xs text-slate-400 mt-1">${new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>`;
        }).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-500 text-sm text-center py-4">Failed to load results.</p>';
    }
}


function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}


// Post a new assignment (shared with student portal)
async function postAssignment(event) {
    event.preventDefault();
    const token = getSession('teacher')?.token;
    const teacherBranch = getSession('teacher')?.user?.branch || 'secondary';
    const payload = {
        title: document.getElementById('assignmentTitle').value,
        description: document.getElementById('assignmentDescription').value,
        subject: document.getElementById('assignmentSubject').value,
        class: document.getElementById('assignmentClass').value,
        dueDate: document.getElementById('assignmentDueDate').value,
        totalMarks: Number(document.getElementById('assignmentTotalMarks').value) || 100,
        branch: teacherBranch
    };

    try {
        const res = await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            closeModal('addAssignmentModal');
            document.getElementById('addAssignmentForm').reset();
            loadTeacherAssignments();
            alert('Assignment posted successfully.');
        } else {
            alert(data.message || 'Failed to post assignment.');
        }
    } catch (e) {
        console.error(e);
        alert('Upstream request failed. Please try again.');
    }
}

// Load assignments posted by this teacher
async function loadTeacherAssignments() {
    const container = document.getElementById('teacherAssignmentsList');
    if (!container) return;
    try {
        const token = getSession('teacher')?.token;
        const teacherBranch = getSession('teacher')?.user?.branch || 'secondary';
        const res = await fetch(`/api/assignments/all?branch=${teacherBranch}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        const list = data.assignments || [];
        if (list.length === 0) {
            container.innerHTML = '<p class="text-slate-400 text-center py-4">No assignments posted yet.</p>';
            return;
        }
        container.innerHTML = list.map(a => `
            <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div class="flex items-start justify-between">
                    <div>
                        <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">${a.subject}</span>
                        <span class="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded ml-1">${a.class}</span>
                        <h3 class="text-lg font-bold text-slate-800 mt-2">${a.title}</h3>
                        <p class="text-slate-600 mt-2 text-sm">${a.description || ''}</p>
                        <p class="text-sm text-slate-500 mt-2">Due: ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'} | ${a.totalMarks} marks</p>
                    </div>
                    <button onclick="deleteAssignment('${a._id}')" class="text-slate-400 hover:text-red-500 p-2"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-500 text-center py-4">Failed to load assignments.</p>';
    }
}

async function deleteAssignment(id) {
    if (!confirm('Delete this assignment?')) return;
    try {
        const token = getSession('teacher')?.token;
        await fetch(`/api/assignments/${id}`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        loadTeacherAssignments();
    } catch (e) {
        console.error(e);
        alert('Failed to delete assignment.');
    }
}

// Load announcements shared from admin
async function loadTeacherAnnouncements() {
    const container = document.getElementById('teacherAnnouncementsList');
    if (!container) return;
    try {
        const teacherBranch = getSession('teacher')?.user?.branch || 'secondary';
        const res = await fetch('/api/announcements');
        const data = await res.json();
        const list = data.announcements || [];
        if (list.length === 0) {
            container.innerHTML = '<p class="text-slate-400 text-center py-4">No announcements yet.</p>';
            return;
        }
        container.innerHTML = list.map(a => `
            <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 ${a.category === 'urgent' ? 'border-red-500' : a.category === 'academic' ? 'border-blue-500' : 'border-emerald-500'}">
                <div class="flex items-center space-x-2 mb-1">
                    <span class="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-100 text-slate-600">${a.category || 'general'}</span>
                    <span class="text-slate-400 text-xs">${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <h3 class="font-semibold text-slate-800">${a.title}</h3>
                <p class="text-slate-500 mt-1 text-sm">${a.content}</p>
            </div>`).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-500 text-center py-4">Failed to load announcements.</p>';
    }
}
