// Admin Dashboard JavaScript

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
    
    if (section === 'students') loadStudents();
    if (section === 'teachers') loadTeachers();
    if (section === 'announcements') loadAnnouncements();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

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
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No students found</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.students.map(s => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">${s.user?.firstName || ''} ${s.user?.lastName || ''}</td>
                    <td class="px-6 py-4">${s.admissionNumber}</td>
                    <td class="px-6 py-4">${s.class}</td>
                    <td class="px-6 py-4 text-center"><span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">${s.status}</span></td>
                    <td class="px-6 py-4 text-center">
                        <button class="text-accent hover:underline mr-2"><i class="fas fa-edit"></i></button>
                        <button class="text-red-500 hover:underline"><i class="fas fa-trash"></i></button>
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
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No teachers found</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.teachers.map(t => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">${t.user?.firstName || ''} ${t.user?.lastName || ''}</td>
                    <td class="px-6 py-4">${t.staffId}</td>
                    <td class="px-6 py-4">${t.department || '-'}</td>
                    <td class="px-6 py-4 text-center"><span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">${t.status}</span></td>
                    <td class="px-6 py-4 text-center">
                        <button class="text-accent hover:underline mr-2"><i class="fas fa-edit"></i></button>
                        <button class="text-red-500 hover:underline"><i class="fas fa-trash"></i></button>
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
                container.innerHTML = '<p class="text-gray-500 text-center py-4">No announcements yet</p>';
                return;
            }
            
            container.innerHTML = data.announcements.map(ann => `
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-start justify-between">
                        <div>
                            <span class="bg-${ann.category === 'urgent' ? 'red' : ann.category === 'academic' ? 'blue' : 'green'}-100 text-${ann.category === 'urgent' ? 'red' : ann.category === 'academic' ? 'blue' : 'green'}-700 text-xs px-2 py-1 rounded">${ann.category.toUpperCase()}</span>
                            <h3 class="text-lg font-bold text-primary mt-2">${ann.title}</h3>
                            <p class="text-gray-600 mt-2">${ann.content}</p>
                        </div>
                        <button onclick="deleteAnnouncement('${ann._id}')" class="text-red-500 hover:underline"><i class="fas fa-trash"></i></button>
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
                admissionNumber: document.getElementById('studentAdmissionNo').value,
                class: document.getElementById('studentClass').value,
                gender: document.getElementById('studentGender').value,
                password: document.getElementById('studentPassword').value,
                session: '2025/2026',
                term: 'Second Term'
            })
        });
        
        if (response.ok) {
            alert('Student added successfully');
            closeModal('addStudentModal');
            loadStudents();
            document.getElementById('addStudentForm').reset();
        } else {
            const data = await response.json();
            alert(data.message || 'Error adding student');
        }
    } catch (error) {
        alert('Error adding student');
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
        alert('Error adding teacher');
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
        alert('Error posting announcement');
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
        alert('Error deleting announcement');
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
