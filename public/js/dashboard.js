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

// Display announcements
function displayAnnouncements(announcements) {
    const container = document.getElementById('recentAnnouncements');
    if (!announcements || announcements.length === 0) return;
    
    const colors = {
        'urgent': 'border-red-500',
        'academic': 'border-blue-500',
        'events': 'border-green-500',
        'sports': 'border-purple-500',
        'general': 'border-yellow-500'
    };
    
    container.innerHTML = announcements.slice(0, 3).map(ann => `
        <div class="border-l-4 ${colors[ann.category] || 'border-gray-500'} pl-4 py-2">
            <p class="font-semibold text-gray-700">${ann.title}</p>
            <p class="text-gray-500 text-sm">${ann.content.substring(0, 100)}...</p>
            <p class="text-gray-400 text-xs mt-1"><i class="fas fa-clock mr-1"></i> ${formatDate(ann.createdAt)}</p>
        </div>
    `).join('');
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
        document.getElementById('totalFee').textContent = formatCurrency(350000);
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
