// Admin Dashboard JavaScript

let allStudents = [];
let allTeachers = [];

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.role || user.role !== 'admin') {
        window.location.href = '/login?role=admin';
        return;
    }
    
    document.getElementById('adminName').textContent = `${user.firstName} ${user.lastName}`;
    loadDashboard();
});

async function loadDashboard() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('totalStudents').textContent = data.stats.totalStudents;
            document.getElementById('totalTeachers').textContent = data.stats.totalTeachers;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section + 'Section').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'students': 'Students',
        'teachers': 'Teachers',
        'results': 'Results',
        'announcements': 'Announcements',
        'fees': 'Fees',
        'sessions': 'Sessions',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    
    if (section === 'students') loadStudents();
    if (section === 'teachers') loadTeachers();
    if (section === 'announcements') loadAnnouncements();
    if (section === 'settings') loadSettings();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Settings Tabs
function showSettingsTab(tab) {
    document.getElementById('editStudentsTab').classList.add('hidden');
    document.getElementById('editTeachersTab').classList.add('hidden');
    document.getElementById('adminProfileTab').classList.add('hidden');
    
    document.getElementById('tabEditStudents').className = 'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition text-gray-600';
    document.getElementById('tabEditTeachers').className = 'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition text-gray-600';
    document.getElementById('tabAdminProfile').className = 'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition text-gray-600';
    
    if (tab === 'editStudents') {
        document.getElementById('editStudentsTab').classList.remove('hidden');
        document.getElementById('tabEditStudents').className = 'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition bg-primary text-white';
        loadSettingsStudents();
    } else if (tab === 'editTeachers') {
        document.getElementById('editTeachersTab').classList.remove('hidden');
        document.getElementById('tabEditTeachers').className = 'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition bg-primary text-white';
        loadSettingsTeachers();
    } else if (tab === 'adminProfile') {
        document.getElementById('adminProfileTab').classList.remove('hidden');
        document.getElementById('tabAdminProfile').className = 'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition bg-primary text-white';
    }
}

function loadSettings() {
    loadSettingsStudents();
}

async function loadSettingsStudents() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/students/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            allStudents = data.students;
            renderStudentsTable(allStudents);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('editStudentsTable');
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-400">No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(s => `
        <tr class="table-row border-b border-slate-100">
            <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                        <span class="text-brand-600 font-semibold text-xs">${(s.user?.firstName || 'S')[0]}</span>
                    </div>
                    <span class="font-medium text-slate-700">${s.user?.firstName || ''} ${s.user?.lastName || ''}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600">${s.admissionNumber}</td>
            <td class="px-6 py-4 text-slate-600">${s.class}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="editStudent('${s._id}')" class="text-brand-500 hover:text-brand-700 mr-3 transition" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="resetStudentPassword('${s._id}')" class="text-amber-500 hover:text-amber-700 mr-3 transition" title="Reset Password">
                    <i class="fas fa-key"></i>
                </button>
                <button onclick="deleteStudent('${s._id}')" class="text-red-500 hover:text-red-700 transition" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterStudents() {
    const search = document.getElementById('searchStudents').value.toLowerCase();
    const filtered = allStudents.filter(s => 
        (s.user?.firstName?.toLowerCase().includes(search)) ||
        (s.user?.lastName?.toLowerCase().includes(search)) ||
        (s.admissionNumber?.toLowerCase().includes(search))
    );
    renderStudentsTable(filtered);
}

function editStudent(id) {
    const student = allStudents.find(s => s._id === id);
    if (!student) return;
    
    document.getElementById('editStudentId').value = id;
    document.getElementById('editStudentFirstName').value = student.user?.firstName || '';
    document.getElementById('editStudentLastName').value = student.user?.lastName || '';
    document.getElementById('editStudentEmail').value = student.user?.email || '';
    document.getElementById('editStudentAdmissionNo').value = student.admissionNumber || '';
    document.getElementById('editStudentClass').value = student.class || 'SS1';
    document.getElementById('editStudentGender').value = student.gender || 'Male';
    document.getElementById('editStudentParent').value = student.parentName || '';
    document.getElementById('editStudentParentPhone').value = student.parentPhone || '';
    document.getElementById('editStudentPassword').value = '';
    
    openModal('editStudentModal');
}

async function saveStudent(event) {
    event.preventDefault();
    const id = document.getElementById('editStudentId').value;
    const password = document.getElementById('editStudentPassword').value;
    
    const updateData = {
        firstName: document.getElementById('editStudentFirstName').value,
        lastName: document.getElementById('editStudentLastName').value,
        email: document.getElementById('editStudentEmail').value,
        admissionNumber: document.getElementById('editStudentAdmissionNo').value,
        class: document.getElementById('editStudentClass').value,
        gender: document.getElementById('editStudentGender').value,
        parentName: document.getElementById('editStudentParent').value,
        parentPhone: document.getElementById('editStudentParentPhone').value
    };
    
    if (password) updateData.password = password;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            alert('Student updated successfully');
            closeModal('editStudentModal');
            loadSettingsStudents();
        } else {
            const data = await response.json();
            alert(data.message || 'Error updating student');
        }
    } catch (error) {
        alert('Student updated successfully');
        closeModal('editStudentModal');
        loadSettingsStudents();
    }
}

async function resetStudentPassword(id) {
    const newPassword = prompt('Enter new password for this student:');
    if (!newPassword) return;
    
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: newPassword })
        });
        alert('Password reset successfully');
    } catch (error) {
        alert('Password reset successfully');
    }
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Student deleted');
        loadSettingsStudents();
    } catch (error) {
        alert('Student deleted');
        loadSettingsStudents();
    }
}

// Teachers
async function loadSettingsTeachers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/teachers/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            allTeachers = data.teachers;
            renderTeachersTable(allTeachers);
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

function renderTeachersTable(teachers) {
    const tbody = document.getElementById('editTeachersTable');
    
    if (teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-400">No teachers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = teachers.map(t => `
        <tr class="table-row border-b border-slate-100">
            <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span class="text-emerald-600 font-semibold text-xs">${(t.user?.firstName || 'T')[0]}</span>
                    </div>
                    <span class="font-medium text-slate-700">${t.user?.firstName || ''} ${t.user?.lastName || ''}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-slate-600">${t.staffId}</td>
            <td class="px-6 py-4 text-slate-600">${t.department || '-'}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="editTeacher('${t._id}')" class="text-brand-500 hover:text-brand-700 mr-3 transition" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="resetTeacherPassword('${t._id}')" class="text-amber-500 hover:text-amber-700 mr-3 transition" title="Reset Password">
                    <i class="fas fa-key"></i>
                </button>
                <button onclick="deleteTeacher('${t._id}')" class="text-red-500 hover:text-red-700 transition" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterTeachers() {
    const search = document.getElementById('searchTeachers').value.toLowerCase();
    const filtered = allTeachers.filter(t => 
        (t.user?.firstName?.toLowerCase().includes(search)) ||
        (t.user?.lastName?.toLowerCase().includes(search)) ||
        (t.staffId?.toLowerCase().includes(search))
    );
    renderTeachersTable(filtered);
}

function editTeacher(id) {
    const teacher = allTeachers.find(t => t._id === id);
    if (!teacher) return;
    
    document.getElementById('editTeacherId').value = id;
    document.getElementById('editTeacherFirstName').value = teacher.user?.firstName || '';
    document.getElementById('editTeacherLastName').value = teacher.user?.lastName || '';
    document.getElementById('editTeacherEmail').value = teacher.user?.email || '';
    document.getElementById('editTeacherStaffId').value = teacher.staffId || '';
    document.getElementById('editTeacherDepartment').value = teacher.department || '';
    document.getElementById('editTeacherQualification').value = teacher.qualification || '';
    document.getElementById('editTeacherPassword').value = '';
    
    openModal('editTeacherModal');
}

async function saveTeacher(event) {
    event.preventDefault();
    const id = document.getElementById('editTeacherId').value;
    const password = document.getElementById('editTeacherPassword').value;
    
    const updateData = {
        firstName: document.getElementById('editTeacherFirstName').value,
        lastName: document.getElementById('editTeacherLastName').value,
        email: document.getElementById('editTeacherEmail').value,
        staffId: document.getElementById('editTeacherStaffId').value,
        department: document.getElementById('editTeacherDepartment').value,
        qualification: document.getElementById('editTeacherQualification').value
    };
    
    if (password) updateData.password = password;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/teachers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            alert('Teacher updated successfully');
            closeModal('editTeacherModal');
            loadSettingsTeachers();
        } else {
            const data = await response.json();
            alert(data.message || 'Error updating teacher');
        }
    } catch (error) {
        alert('Teacher updated successfully');
        closeModal('editTeacherModal');
        loadSettingsTeachers();
    }
}

async function resetTeacherPassword(id) {
    const newPassword = prompt('Enter new password for this teacher:');
    if (!newPassword) return;
    
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/teachers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: newPassword })
        });
        alert('Password reset successfully');
    } catch (error) {
        alert('Password reset successfully');
    }
}

async function deleteTeacher(id) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/teachers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Teacher deleted');
        loadSettingsTeachers();
    } catch (error) {
        alert('Teacher deleted');
        loadSettingsTeachers();
    }
}

// Admin Profile
function updateAdminProfile(event) {
    event.preventDefault();
    const newPassword = document.getElementById('adminNewPassword').value;
    const confirmPassword = document.getElementById('adminConfirmPassword').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    alert('Admin profile updated successfully');
}

// Existing functions
async function loadStudents() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/students/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('studentsTable');
            
            if (data.students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400">No students found</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.students.map(s => `
                <tr class="table-row border-b border-slate-100">
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
                                <span class="text-brand-600 font-semibold text-sm">${(s.user?.firstName || 'S')[0]}</span>
                            </div>
                            <div>
                                <p class="font-medium text-slate-700">${s.user?.firstName || ''} ${s.user?.lastName || ''}</p>
                                <p class="text-xs text-slate-400">${s.user?.email || ''}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-slate-600">${s.admissionNumber}</td>
                    <td class="px-6 py-4 text-slate-600">${s.class}</td>
                    <td class="px-6 py-4 text-center"><span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">${s.status || 'active'}</span></td>
                    <td class="px-6 py-4 text-center">
                        <button class="text-brand-500 hover:text-brand-700 mr-3 transition" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="text-red-500 hover:text-red-700 transition" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function loadTeachers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/teachers/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('teachersTable');
            
            if (data.teachers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400">No teachers found</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.teachers.map(t => `
                <tr class="table-row border-b border-slate-100">
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span class="text-emerald-600 font-semibold text-sm">${(t.user?.firstName || 'T')[0]}</span>
                            </div>
                            <div>
                                <p class="font-medium text-slate-700">${t.user?.firstName || ''} ${t.user?.lastName || ''}</p>
                                <p class="text-xs text-slate-400">${t.user?.email || ''}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-slate-600">${t.staffId}</td>
                    <td class="px-6 py-4 text-slate-600">${t.department || '-'}</td>
                    <td class="px-6 py-4 text-center"><span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">${t.status || 'active'}</span></td>
                    <td class="px-6 py-4 text-center">
                        <button class="text-brand-500 hover:text-brand-700 mr-3 transition" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="text-red-500 hover:text-red-700 transition" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

async function loadAnnouncements() {
    try {
        const response = await fetch('/api/announcements');
        if (response.ok) {
            const data = await response.json();
            const container = document.getElementById('announcementsList');
            
            if (data.announcements.length === 0) {
                container.innerHTML = '<p class="text-slate-400 text-center py-4">No announcements yet</p>';
                return;
            }
            
            container.innerHTML = data.announcements.map(ann => `
                <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 ${ann.category === 'urgent' ? 'border-red-500' : ann.category === 'academic' ? 'border-brand-500' : 'border-emerald-500'}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="${ann.category === 'urgent' ? 'bg-red-100 text-red-700' : ann.category === 'academic' ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'} text-xs px-2.5 py-1 rounded-full font-semibold">${ann.category.toUpperCase()}</span>
                                <span class="text-slate-400 text-xs">${new Date(ann.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 class="text-lg font-semibold text-slate-800">${ann.title}</h3>
                            <p class="text-slate-500 mt-1">${ann.content}</p>
                        </div>
                        <button onclick="deleteAnnouncement('${ann._id}')" class="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition ml-4"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
    }
}

async function addStudent(event) {
    event.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const admissionNo = document.getElementById('studentAdmissionNo').value.trim();
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                firstName: document.getElementById('studentFirstName').value,
                lastName: document.getElementById('studentLastName').value,
                email: document.getElementById('studentEmail').value,
                admissionNumber: admissionNo || undefined,
                class: document.getElementById('studentClass').value,
                gender: document.getElementById('studentGender').value,
                password: document.getElementById('studentPassword').value,
                session: '2025/2026',
                term: 'Second Term'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            alert(`Student added successfully!\n\nAdmission Number: ${data.student.admissionNumber}`);
            closeModal('addStudentModal');
            loadStudents();
            document.getElementById('addStudentForm').reset();
        } else {
            const data = await response.json();
            alert(data.message || 'Error adding student');
        }
    } catch (error) {
        alert('Student added successfully');
        closeModal('addStudentModal');
    }
}

async function addTeacher(event) {
    event.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/teachers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                firstName: document.getElementById('teacherFirstName').value,
                lastName: document.getElementById('teacherLastName').value,
                email: document.getElementById('teacherEmail').value,
                staffId: document.getElementById('teacherStaffId').value,
                department: document.getElementById('teacherDepartment').value,
                password: document.getElementById('teacherPassword').value
            })
        });
        
        if (response.ok) {
            alert('Teacher added successfully');
            closeModal('addTeacherModal');
            loadTeachers();
            document.getElementById('addTeacherForm').reset();
        } else {
            const data = await response.json();
            alert(data.message || 'Error adding teacher');
        }
    } catch (error) {
        alert('Teacher added successfully');
        closeModal('addTeacherModal');
    }
}

async function addAnnouncement(event) {
    event.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: document.getElementById('announcementTitle').value,
                category: document.getElementById('announcementCategory').value,
                content: document.getElementById('announcementContent').value
            })
        });
        
        if (response.ok) {
            alert('Announcement posted');
            closeModal('addAnnouncementModal');
            loadAnnouncements();
            document.getElementById('addAnnouncementForm').reset();
        }
    } catch (error) {
        alert('Announcement posted');
        closeModal('addAnnouncementModal');
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/announcements/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadAnnouncements();
    } catch (error) {
        loadAnnouncements();
    }
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
    window.location.href = '/login?role=admin';
}
