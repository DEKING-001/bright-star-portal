// Main JavaScript for Public Pages

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Check if user is logged in (any role) — verify server-side
    const active = getActiveSession();
    
    if (active) {
        // Quick client-side expiry check
        if (!isTokenExpired(active.token)) {
            verifyTokenWithServer(active.token).then(result => {
                if (result.valid) {
                    updateNavigation(active.user);
                } else {
                    // Token blacklisted or revoked — clear stale sessions
                    ['student', 'teacher', 'admin'].forEach(clearSession);
                }
            }).catch(() => {
                // Network error — show nav based on local data
                updateNavigation(active.user);
            });
        } else {
            ['student', 'teacher', 'admin'].forEach(clearSession);
        }
    }
});

// Update navigation based on user role
function updateNavigation(user) {
    const loginLink = document.querySelector('a[href="/login"]');
    if (loginLink && user.firstName) {
        const dashboardUrl = user.role === 'admin' ? '/admin-dashboard' : 
                            user.role === 'teacher' ? '/teacher-dashboard' : '/dashboard';
        loginLink.href = dashboardUrl;
        loginLink.textContent = user.firstName;
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card-hover').forEach(card => {
    observer.observe(card);
});

// API helper function — uses the active session's token automatically.
async function apiCall(url, method = 'GET', body = null, role = null) {
    const active = role ? getSession(role) : getActiveSession();
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (active && active.token) {
        headers['Authorization'] = `Bearer ${active.token}`;
    }
    
    const options = {
        method,
        headers
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (response.status === 401 && active) {
            // Token invalidated — clear the stale session
            clearSession(active.role || active.user?.role);
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
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

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
