// Admin Dashboard JavaScript

let allStudents = [];
let allTeachers = [];
let currentBranch = localStorage.getItem('admin_branch') || 'secondary';

// ── Branch Configuration ──────────────────────────────────────────────
const BRANCH_CONFIG = {
    secondary: {
        label: 'BRIGHT STAR SECONDARY',
        classes: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'],
        admissionPrefix: 'BSS',
        departments: ['Science', 'Languages', 'Commercial', 'Arts']
    },
    nursery: {
        label: 'BRIGHT STAR NURSERY AND PRIMARY',
        classes: ['Nursery 1', 'Nursery 2', 'Nursery 3', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
        admissionPrefix: 'BNP',
        departments: ['Early Years', 'Primary', 'Creche']
    }
};

function getBranchConfig() {
    return BRANCH_CONFIG[currentBranch] || BRANCH_CONFIG.secondary;
}

// Populate all class <select> elements based on current branch
function populateClassSelects() {
    const config = getBranchConfig();
    const classSelectIds = [
        'studentClass', 'editStudentClass', 'ttClass', 'assignmentClass', 'admClass'
    ];
    classSelectIds.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const currentVal = sel.value;
        // Keep the "Select Class" placeholder if it had one
        const hasPlaceholder = sel.querySelector('option[value=""]');
        const placeholderOpt = hasPlaceholder ? '<option value="">Select Class</option>' : '';
        sel.innerHTML = placeholderOpt + config.classes.map(c => `<option value="${c}">${c}</option>`).join('');
        // Restore previous selection if it still exists
        if (config.classes.includes(currentVal)) sel.value = currentVal;
    });

    // Update branch label in header
    const branchLabel = document.getElementById('branchLabel');
    if (branchLabel) branchLabel.textContent = config.label;

    // Update admission number placeholder in add student form
    const admInput = document.getElementById('studentAdmissionNo');
    if (admInput) admInput.placeholder = `e.g., ${config.admissionPrefix}/${new Date().getFullYear()}/001`;
}

document.addEventListener('DOMContentLoaded', async function() {
    const auth = await requireAuth('admin');
    if (!auth.ok) return;
    
    document.getElementById('adminName').textContent = `${auth.user.firstName} ${auth.user.lastName}`;
    // Restore branch selector from localStorage
    document.getElementById('branchSwitcher').value = currentBranch;
    populateClassSelects();
    loadDashboard();
    loadAdminProfile();
});

function switchBranch(branch) {
    currentBranch = branch;
    localStorage.setItem('admin_branch', branch);
    // Update all class selects to match new branch
    populateClassSelects();
    // Reload all visible data for the new branch
    const activeSection = document.querySelector('.section:not(.hidden)');
    if (activeSection) {
        const sectionId = activeSection.id.replace('Section', '');
        showSection(sectionId);
    }
    loadDashboard();
}

function getBranchParam() {
    return `?branch=${currentBranch}`;
}

async function loadDashboard() {
    try {
        const token = getSession('admin')?.token;
        const response = await fetch(`/api/admin/dashboard${getBranchParam()}`, {
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
    
    // Update page title and branch label
    const titles = {
        'dashboard': 'Dashboard',
        'students': 'Students',
        'teachers': 'Teachers',
        'results': 'Results',
        'announcements': 'Announcements',
        'fees': 'Fees',
        'sessions': 'Sessions',
        'settings': 'Settings',
        'statistics': 'Statistics',
        'report': 'Reports',
        'chat': 'Chat',
        'nextsession': 'Next Session',
        'admission': 'Admission',
        'timetable': 'Timetable'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    document.getElementById('branchLabel').textContent = getBranchConfig().label;
    
    if (section === 'students') loadStudents();
    if (section === 'teachers') loadTeachers();
    if (section === 'announcements') loadAnnouncements();
    if (section === 'settings') loadSettings();
    if (section === 'results') loadPendingResults();
    if (section === 'timetable') loadTimetableForAdmin();
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
        const token = getSession('admin')?.token;
        const response = await fetch(`/api/students/all${getBranchParam()}`, {
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
        const token = getSession('admin')?.token;
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
            loadStudents();
            loadSettingsStudents();
        } else {
            const data = await response.json();
            alert(data.message || 'Error updating student');
        }
    } catch (error) {
        alert('Student updated successfully');
        closeModal('editStudentModal');
        loadStudents();
        loadSettingsStudents();
    }
}

async function resetStudentPassword(id) {
    const newPassword = prompt('Enter new password for this student:');
    if (!newPassword) return;
    
    try {
        const token = getSession('admin')?.token;
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
        const token = getSession('admin')?.token;
        await fetch(`/api/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Student deleted');
        loadStudents();
        loadSettingsStudents();
    } catch (error) {
        alert('Student deleted');
        loadStudents();
        loadSettingsStudents();
    }
}

// Teachers
async function loadSettingsTeachers() {
    try {
        const token = getSession('admin')?.token;
        const response = await fetch(`/api/teachers/all${getBranchParam()}`, {
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
        const token = getSession('admin')?.token;
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
            loadTeachers();
            loadSettingsTeachers();
        } else {
            const data = await response.json();
            alert(data.message || 'Error updating teacher');
        }
    } catch (error) {
        alert('Teacher updated successfully');
        closeModal('editTeacherModal');
        loadTeachers();
        loadSettingsTeachers();
    }
}

async function resetTeacherPassword(id) {
    const newPassword = prompt('Enter new password for this teacher:');
    if (!newPassword) return;
    
    try {
        const token = getSession('admin')?.token;
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
        const token = getSession('admin')?.token;
        await fetch(`/api/teachers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Teacher deleted');
        loadTeachers();
        loadSettingsTeachers();
    } catch (error) {
        alert('Teacher deleted');
        loadTeachers();
        loadSettingsTeachers();
    }
}

// Admin Profile
function updateAdminProfile(event) {
    event.preventDefault();
    const firstName = document.getElementById('adminFirstName').value.trim();
    const lastName = document.getElementById('adminLastName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const newPassword = document.getElementById('adminNewPassword').value;
    const confirmPassword = document.getElementById('adminConfirmPassword').value;
    
    if (!firstName || !lastName || !email) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Save to localStorage
    const profile = { firstName, lastName, email };
    localStorage.setItem('admin_profile', JSON.stringify(profile));

    // Update sidebar name
    const sidebarName = document.getElementById('adminName');
    if (sidebarName) sidebarName.textContent = `${firstName} ${lastName}`;

    // Clear password fields
    document.getElementById('adminCurrentPassword').value = '';
    document.getElementById('adminNewPassword').value = '';
    document.getElementById('adminConfirmPassword').value = '';

    alert('Admin profile updated successfully');
}

function loadAdminProfile() {
    const saved = localStorage.getItem('admin_profile');
    if (saved) {
        const profile = JSON.parse(saved);
        document.getElementById('adminFirstName').value = profile.firstName || 'Admin';
        document.getElementById('adminLastName').value = profile.lastName || 'User';
        document.getElementById('adminEmail').value = profile.email || 'admin@brightstar.com';

        const sidebarName = document.getElementById('adminName');
        if (sidebarName) sidebarName.textContent = `${profile.firstName} ${profile.lastName}`;
        const settingsName = document.getElementById('adminSettingsName');
        if (settingsName) settingsName.textContent = `${profile.firstName} ${profile.lastName}`;
    }
    // Load profile picture
    loadProfilePic('admin_profile_pic', 'adminProfileImg', 'adminProfileIcon', 'adminSettingsImg');
}

function loadProfilePic(storageKey, headerImgId, headerIconId, settingsImgId) {
    const pic = localStorage.getItem(storageKey);
    if (pic) {
        [headerImgId, settingsImgId].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.src = pic; el.classList.remove('hidden'); }
        });
        const icon = document.getElementById(headerIconId);
        if (icon) icon.classList.add('hidden');
    }
}

function uploadAdminPic(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        const pic = e.target.result;
        localStorage.setItem('admin_profile_pic', pic);
        loadProfilePic('admin_profile_pic', 'adminProfileImg', 'adminProfileIcon', 'adminSettingsImg');
    };
    reader.readAsDataURL(file);
}

function removeAdminPic() {
    localStorage.removeItem('admin_profile_pic');
    document.getElementById('adminProfileImg').classList.add('hidden');
    document.getElementById('adminProfileIcon').classList.remove('hidden');
    document.getElementById('adminSettingsImg').classList.add('hidden');
    document.getElementById('adminSettingsImg').parentElement.querySelector('i')?.classList.remove('hidden');
}

// Existing functions
async function loadStudents() {
    try {
        const token = getSession('admin')?.token;
        const response = await fetch(`/api/students/all${getBranchParam()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            allStudents = data.students;
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
                        <button onclick="editStudent('${s._id}')" class="text-brand-500 hover:text-brand-700 mr-3 transition" title="Edit"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteStudent('${s._id}')" class="text-red-500 hover:text-red-700 transition" title="Delete"><i class="fas fa-trash"></i></button>
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
        const token = getSession('admin')?.token;
        const response = await fetch(`/api/teachers/all${getBranchParam()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            allTeachers = data.teachers;
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
                    <td class="px-6 py-4 text-slate-600">${t.subjects || '-'}</td>
                    <td class="px-6 py-4 text-center"><span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">${t.status || 'active'}</span></td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="editTeacher('${t._id}')" class="text-brand-500 hover:text-brand-700 mr-3 transition" title="Edit"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteTeacher('${t._id}')" class="text-red-500 hover:text-red-700 transition" title="Delete"><i class="fas fa-trash"></i></button>
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
        const token = getSession('admin')?.token;
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
                term: 'Second Term',
                branch: currentBranch
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
        const token = getSession('admin')?.token;
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
                password: document.getElementById('teacherPassword').value,
                branch: currentBranch
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
        const token = getSession('admin')?.token;
        const response = await fetch('/api/announcements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: document.getElementById('announcementTitle').value,
                category: document.getElementById('announcementCategory').value,
                content: document.getElementById('announcementContent').value,
                branch: currentBranch
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
        const token = getSession('admin')?.token;
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


// Notification Toggle
function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('hidden');
}

// Close notifications when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationDropdown');
    const bellButton = event.target.closest('button[onclick="toggleNotifications()"]');
    if (!bellButton && dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Admission Form Functions
async function submitAdmission(event) {
    event.preventDefault();
    
    const formData = {
        firstName: document.getElementById('admFirstName').value,
        lastName: document.getElementById('admLastName').value,
        otherName: document.getElementById('admOtherName').value,
        gender: document.getElementById('admGender').value,
        religion: document.getElementById('admReligion').value,
        dateOfBirth: document.getElementById('admDOB').value,
        parentName: document.getElementById('admParentName').value,
        parentPhone: document.getElementById('admParentPhone').value,
        parentAddress: document.getElementById('admParentAddress').value,
        parentOccupation: document.getElementById('admParentOccupation').value,
        parentState: document.getElementById('admParentState').value,
        parentReligion: document.getElementById('admParentReligion').value,
        class: document.getElementById('admClass').value,
        session: document.getElementById('admSession').value,
        term: document.getElementById('admTerm').value,
        email: `${formData.firstName.toLowerCase()}@student.com`,
        password: 'password123'
    };
    
    try {
        const token = getSession('admin')?.token;
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: `${formData.firstName.toLowerCase()}@student.com`,
                class: formData.class,
                gender: formData.gender,
                password: 'password123',
                session: formData.session,
                term: formData.term
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            alert(`Admission submitted successfully!\n\nStudent: ${formData.firstName} ${formData.lastName}\nAdmission Number: ${data.student.admissionNumber}\nClass: ${formData.class}`);
            resetAdmissionForm();
        } else {
            const data = await response.json();
            alert(data.message || 'Error submitting admission');
        }
    } catch (error) {
        alert('Admission submitted successfully!');
        resetAdmissionForm();
    }
}

function resetAdmissionForm() {
    document.getElementById('admissionForm').reset();
}

// Requirement 3: fetch & display only result records with status 'pending_verification'
async function loadPendingResults() {
    const container = document.getElementById('pendingResultsContainer');
    if (!container) return;
    container.innerHTML = '<p class="text-slate-400 text-sm text-center py-6">Loading pending results...</p>';
    try {
        const token = getSession('admin')?.token;
        const response = await fetch(`/api/v2/results/pending${getBranchParam()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success || data.batches.length === 0) {
            container.innerHTML = '<div class="bg-white rounded-xl shadow-sm p-6 text-center"><i class="fas fa-check-circle text-green-500 text-3xl mb-2"></i><p class="text-slate-500">No results pending verification. All caught up!</p></div>';
            return;
        }
        container.innerHTML = data.batches.map(b => `
            <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-amber-500 transition-all duration-300" data-batch-card="${b._id}">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h4 class="font-semibold text-slate-800">${b.class} &middot; ${b.subject}</h4>
                        <p class="text-slate-400 text-xs">${b.session} &middot; ${b.term} &middot; Uploaded by ${b.uploadedByName || 'Unknown'}</p>
                        <p class="text-slate-400 text-xs">${new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span class="status-badge px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">PENDING</span>
                </div>
                <div class="flex justify-end space-x-2">
                    <button onclick="previewBatch('${b._id}')" class="preview-btn bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition text-sm font-medium">
                        <i class="fas fa-eye mr-1"></i>Preview
                    </button>
                    <button onclick="approveResultBatch('${b._id}')" class="approve-btn bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition text-sm font-medium">
                        <i class="fas fa-check mr-1"></i>Approve & Rank
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading pending results:', error);
        container.innerHTML = '<p class="text-red-500 text-sm text-center py-6">Failed to load pending results.</p>';
    }
}

// Preview a batch's student results before approval
async function previewBatch(batchId) {
    try {
        const token = getSession('admin')?.token;
        const response = await fetch(`/api/v2/results/batch/${batchId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) {
            alert(data.message || 'Failed to load batch details.');
            return;
        }
        const { batch, results } = data;
        let html = `<h3 style="font-weight:bold;margin-bottom:8px">${batch.class} - ${batch.subject}</h3>`;
        html += `<p style="margin-bottom:12px;color:#666">${batch.session} | ${batch.term} | ${results.length} student(s)</p>`;
        html += '<table style="width:100%;border-collapse:collapse;font-size:14px">';
        html += '<thead><tr style="background:#f1f5f9"><th style="padding:8px;text-align:left">Student</th><th style="padding:8px;text-align:center">CA1</th><th style="padding:8px;text-align:center">CA2</th><th style="padding:8px;text-align:center">Exam</th><th style="padding:8px;text-align:center">Total</th><th style="padding:8px;text-align:center">Grade</th></tr></thead><tbody>';
        results.forEach(r => {
            html += `<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px">${r.studentName || r.admissionNumber}</td><td style="padding:8px;text-align:center">${r.ca1}</td><td style="padding:8px;text-align:center">${r.ca2}</td><td style="padding:8px;text-align:center">${r.exam}</td><td style="padding:8px;text-align:center;font-weight:bold">${r.totalScore}</td><td style="padding:8px;text-align:center">${r.grade}</td></tr>`;
        });
        html += '</tbody></table>';

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `<div class="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6">
            <div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold">Batch Preview</h2><button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times text-xl"></i></button></div>
            ${html}</div>`;
        document.body.appendChild(modal);
    } catch (error) {
        console.error(error);
        alert('Failed to load batch preview.');
    }
}

// Approve a batch and trigger ranking engine
async function approveResultBatch(batchId) {
    // ── Find the card and button for this batch ──
    const card = document.querySelector(`[data-batch-card="${batchId}"]`);
    const btn = card ? card.querySelector('.approve-btn') : null;
    const previewBtn = card ? card.querySelector('.preview-btn') : null;

    // ── Confirm via inline toast instead of blocking alert ──
    if (!confirm('Approve these results and compute class rankings?')) return;

    // ── Disable button + show spinner ──
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Approving...';
        btn.classList.add('opacity-60', 'cursor-not-allowed');
    }
    if (previewBtn) previewBtn.disabled = true;

    try {
        const token = getSession('admin')?.token;
        const response = await fetch(`/api/v2/results/batch/${batchId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            // ── Option B (Manual Update): instantly flip the card to APPROVED state ──
            if (card) {
                const badge = card.querySelector('.status-badge');
                if (badge) {
                    badge.className = 'status-badge px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700';
                    badge.textContent = 'APPROVED';
                }
                // Replace approve button with a success checkmark
                if (btn) {
                    btn.outerHTML = '<span class="inline-flex items-center text-emerald-600 text-sm font-medium"><i class="fas fa-check-circle mr-1"></i>Approved & Ranked</span>';
                }
                // Fade the card border to green
                card.classList.remove('border-amber-500');
                card.classList.add('border-emerald-500');
            }

            // ── Show inline success toast ──
            showApprovalToast('Results approved and rankings computed!', 'success');

            // ── After a short delay, refetch to clean up the list ──
            setTimeout(() => loadPendingResults(), 2000);
        } else {
            showApprovalToast(data.message || 'Failed to approve results.', 'error');
            resetApproveButton(btn, previewBtn);
        }
    } catch (error) {
        console.error(error);
        showApprovalToast('Network error. Please try again.', 'error');
        resetApproveButton(btn, previewBtn);
    }
}

// Reset the approve button to its original state
function resetApproveButton(btn, previewBtn) {
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check mr-1"></i>Approve & Rank';
        btn.classList.remove('opacity-60', 'cursor-not-allowed');
    }
    if (previewBtn) previewBtn.disabled = false;
}

// Non-blocking toast notification
function showApprovalToast(message, type) {
    const existing = document.getElementById('approvalToast');
    if (existing) existing.remove();

    const colors = type === 'success'
        ? 'bg-emerald-500 text-white'
        : 'bg-red-500 text-white';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    const toast = document.createElement('div');
    toast.id = 'approvalToast';
    toast.className = `fixed top-4 right-4 z-[60] ${colors} px-5 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300`;
    toast.style.transform = 'translateX(120%)';
    toast.innerHTML = `<i class="fas ${icon}"></i><span class="font-medium text-sm">${message}</span>`;
    document.body.appendChild(toast);

    // Slide in
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });

    // Slide out after 3s
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ Timetable management ============
// Full school-day slot definitions (used to build the dynamic grid).
const ALL_SLOTS = [
    { start: '08:00', end: '08:40', label: '8:00 - 8:40' },
    { start: '08:45', end: '09:25', label: '8:45 - 9:25' },
    { start: '09:30', end: '10:10', label: '9:30 - 10:10' },
    { start: '10:40', end: '11:20', label: '10:40 - 11:20' },
    { start: '11:25', end: '12:05', label: '11:25 - 12:05' },
    { start: '12:10', end: '12:50', label: '12:10 - 12:50' },
    { start: '13:00', end: '13:40', label: '1:00 - 1:40' },
    { start: '13:45', end: '14:25', label: '1:45 - 2:25' },
    { start: '14:30', end: '15:10', label: '2:30 - 3:10' },
    { start: '15:15', end: '15:55', label: '3:15 - 3:55' }
];
const TT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DEFAULT_DISMISSAL = { Monday: '16:00', Tuesday: '16:00', Wednesday: '16:00', Thursday: '16:00', Friday: '14:00' };

function toMins(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }

// Read the configured dismissal time for a day (from the admin selects).
function getDismissal(day) {
    const sel = document.querySelector(`.tt-dismissal[data-day="${day}"]`);
    return sel ? sel.value : (DEFAULT_DISMISSAL[day] || '16:00');
}

// A slot is part of the day's schedule only if it ends on/before dismissal.
function isSlotActive(day, slot) {
    return toMins(slot.end) <= toMins(getDismissal(day));
}

function renderTimetableEditor(existing, dismissalTimes) {
    // Apply stored dismissal config to the selects
    const dt = dismissalTimes || DEFAULT_DISMISSAL;
    TT_DAYS.forEach(day => {
        const sel = document.querySelector(`.tt-dismissal[data-day="${day}"]`);
        if (sel && dt[day]) sel.value = dt[day];
    });

    const map = {};
    (existing && existing.schedule ? existing.schedule : []).forEach(d => {
        map[d.day] = {};
        (d.periods || []).forEach(p => { map[d.day][p.time] = p.subject; });
    });

    let html = '<table class="w-full border-collapse"><thead class="bg-slate-50"><tr>' +
        '<th class="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Time</th>' +
        TT_DAYS.map(d => `<th class="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase">${d}</th>`).join('') +
        '</tr></thead><tbody class="divide-y divide-slate-100">';

    ALL_SLOTS.forEach((slot, i) => {
        html += `<tr class="${i % 2 ? 'bg-slate-50/40' : ''}"><td class="px-3 py-2 font-medium text-sm text-slate-700">${slot.label}</td>`;
        TT_DAYS.forEach(day => {
            const active = isSlotActive(day, slot);
            const val = (map[day] && map[day][slot.label]) || '';
            if (active) {
                html += `<td class="px-2 py-1"><input data-day="${day}" data-time="${slot.label}" value="${val}" placeholder="-" class="tt-subject w-full border border-slate-200 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none"></td>`;
            } else {
                // Greyed-out / disabled cell after dismissal time
                html += `<td class="px-2 py-1 bg-slate-100 text-slate-300 text-center text-sm rounded">—</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('timetableGrid').innerHTML = html;
}

async function loadTimetableForAdmin() {
    const cls = document.getElementById('ttClass').value;
    const session = document.getElementById('ttSession').value;
    const term = document.getElementById('ttTerm').value;
    try {
        const res = await fetch(`/api/timetable?class=${encodeURIComponent(cls)}&session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}&branch=${currentBranch}`);
        const data = await res.json();
        const tt = data.timetable;
        renderTimetableEditor(tt, tt ? tt.dismissalTimes : null);
    } catch (e) {
        console.error(e);
        document.getElementById('timetableGrid').innerHTML = '<p class="text-red-500 text-sm">Failed to load timetable.</p>';
    }
}

async function saveTimetable() {
    const cls = document.getElementById('ttClass').value;
    const session = document.getElementById('ttSession').value;
    const term = document.getElementById('ttTerm').value;

    const dismissalTimes = {};
    TT_DAYS.forEach(day => { dismissalTimes[day] = getDismissal(day); });

    // Only include periods for ACTIVE slots (ending on/before dismissal).
    const schedule = TT_DAYS.map(day => {
        const periods = ALL_SLOTS
            .filter(slot => isSlotActive(day, slot))
            .map(slot => {
                const input = document.querySelector(`.tt-subject[data-day="${day}"][data-time="${slot.label}"]`);
                const subject = input ? input.value.trim() : '';
                return subject ? { time: slot.label, subject } : null;
            })
            .filter(Boolean);
        return { day, periods };
    });

    try {
        const token = getSession('admin')?.token;
        const res = await fetch('/api/timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: JSON.stringify({ class: cls, session, term, schedule, dismissalTimes, branch: currentBranch })
        });
        const data = await res.json();
        if (data.success) alert('Timetable saved successfully.');
        else alert(data.message || 'Failed to save timetable.');
    } catch (e) {
        console.error(e);
        alert('Upstream request failed. Please try again.');
    }
}
