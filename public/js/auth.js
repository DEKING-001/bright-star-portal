// Authentication JavaScript

let currentRole = 'student';

// Check URL params for role
document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
        selectRole(role);
    }
    
    // Check if already logged in (any role) — verify server-side
    const active = getActiveSession();
    if (active) {
        try {
            const result = await verifyTokenWithServer(active.token);
            if (result.valid) {
                redirectBasedOnRole(active.role);
                return;
            }
        } catch (_) { /* network error — stay on login page */ }
        // Token invalid/expired/blacklisted — clear all stale sessions
        ['student', 'teacher', 'admin'].forEach(clearSession);
    }
});

// Select user role
function selectRole(role) {
    currentRole = role;
    document.getElementById('role').value = role;
    
    // Update button styles
    ['student', 'teacher', 'admin'].forEach(r => {
        const btn = document.getElementById(r + 'Btn');
        if (r === role) {
            btn.className = 'flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition bg-white text-brand-600 shadow-sm';
        } else {
            btn.className = 'flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition text-slate-500 hover:text-slate-700';
        }
    });
    
    // Show/hide fields
    document.getElementById('studentFields').classList.toggle('hidden', role !== 'student');
    document.getElementById('teacherFields').classList.toggle('hidden', role !== 'teacher');
    document.getElementById('adminFields').classList.toggle('hidden', role !== 'admin');
    
    // Update login button text
    document.getElementById('loginText').textContent = `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    
    // Update identifier field requirements
    const identifier = document.getElementById('identifier');
    const teacherIdentifier = document.getElementById('teacherIdentifier');
    const adminIdentifier = document.getElementById('adminIdentifier');
    
    if (role === 'student') {
        identifier.required = true;
        teacherIdentifier.required = false;
        adminIdentifier.required = false;
    } else if (role === 'teacher') {
        identifier.required = false;
        teacherIdentifier.required = true;
        adminIdentifier.required = false;
    } else {
        identifier.required = false;
        teacherIdentifier.required = false;
        adminIdentifier.required = true;
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    const errorMessage = document.getElementById('errorMessage');
    
    // Show loading state
    loginText.textContent = 'Logging in...';
    loginSpinner.classList.remove('hidden');
    loginBtn.disabled = true;
    errorMessage.classList.add('hidden');
    
    // Get branch
    const branch = document.getElementById('branch').value;
    if (!branch) {
        errorMessage.textContent = 'Please select a branch';
        errorMessage.classList.remove('hidden');
        loginText.textContent = `Login as ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`;
        loginSpinner.classList.add('hidden');
        loginBtn.disabled = false;
        return;
    }
    
    // Get identifier based on role
    let identifier;
    if (currentRole === 'student') {
        identifier = document.getElementById('identifier').value;
    } else if (currentRole === 'teacher') {
        identifier = document.getElementById('teacherIdentifier').value;
    } else {
        identifier = document.getElementById('adminIdentifier').value;
    }
    
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier,
                password,
                role: currentRole,
                branch
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store token and user data under the role-specific namespace
        saveSession(data.user.role, data.token, data.user);
        
        // Redirect based on role
        redirectBasedOnRole(data.user.role);
        
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
        loginText.textContent = `Login as ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`;
        loginSpinner.classList.add('hidden');
        loginBtn.disabled = false;
    }
}

// Redirect based on user role
function redirectBasedOnRole(role) {
    switch (role) {
        case 'admin':
            window.location.href = '/admin-dashboard';
            break;
        case 'teacher':
            window.location.href = '/teacher-dashboard';
            break;
        case 'student':
            window.location.href = '/dashboard';
            break;
        default:
            window.location.href = '/';
    }
}
