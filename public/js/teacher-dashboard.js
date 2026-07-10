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
        
        // Fetch statistics
        const statsResponse = await fetch('/api/statistics', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success) {
                document.getElementById('totalStudents').textContent = statsData.statistics.totalStudents;
                document.getElementById('totalTeachers').textContent = statsData.statistics.totalTeachers;
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
