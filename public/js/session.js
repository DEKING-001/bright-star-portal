// Session utility — role-namespaced localStorage helpers with server-side
// verification and token blacklist support.
//
// Each role stores its token + user under its own key so that logging in
// as one role never overwrites another role's session.

const SESSION_KEY_MAP = {
    student: 'student_session',
    teacher: 'teacher_session',
    admin:   'admin_session'
};

// ── localStorage helpers ─────────────────────────────────────────────

function saveSession(role, token, user) {
    const key = SESSION_KEY_MAP[role];
    if (!key) return;
    localStorage.setItem(key, JSON.stringify({ token, user }));
}

function getSession(role) {
    const key = SESSION_KEY_MAP[role];
    if (!key) return null;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.token && parsed.user) return parsed;
    } catch (_) { /* corrupt entry — treat as empty */ }
    return null;
}

function clearSession(role) {
    const key = SESSION_KEY_MAP[role];
    if (key) localStorage.removeItem(key);
}

function getActiveSession() {
    for (const role of ['student', 'teacher', 'admin']) {
        const s = getSession(role);
        if (s) return { role, ...s };
    }
    return null;
}

function getAuthHeader(role) {
    const s = getSession(role);
    if (!s) return {};
    return { 'Authorization': `Bearer ${s.token}` };
}

// ── JWT decode (no signature verification — client-side only) ─────────

function decodeToken(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (_) {
        return null;
    }
}

function isTokenExpired(token) {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    // exp is in seconds; add a 10-second grace period for clock skew
    return Date.now() >= (decoded.exp * 1000) - 10000;
}

// ── Server-side verification ─────────────────────────────────────────

// Calls GET /api/auth/verify to confirm the token is valid, not blacklisted,
// and belongs to the expected role. Returns { valid, role } or throws.
async function verifyTokenWithServer(token) {
    const res = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data; // { success, valid, role, user, message }
}

// ── Unified auth guard ───────────────────────────────────────────────

// requireAuth(expectedRole) — called once per dashboard page load.
// 1. Reads the session from localStorage for the expected role.
// 2. Checks client-side JWT expiry (fast, no network).
// 3. Verifies the token with the server (catches blacklisted / revoked tokens).
// 4. Confirms the token's role matches the expected portal.
//
// Returns { ok: true, user, token } on success.
// On failure, redirects to /login?role=<expectedRole> and returns { ok: false }.
async function requireAuth(expectedRole) {
    const session = getSession(expectedRole);

    // ── Fast client-side checks ──
    if (!session || !session.user || !session.token) {
        window.location.href = `/login?role=${expectedRole}`;
        return { ok: false };
    }

    // Role mismatch — someone pasted the wrong dashboard URL
    if (session.user.role !== expectedRole) {
        clearSession(expectedRole);
        window.location.href = `/login?role=${expectedRole}`;
        return { ok: false };
    }

    // Client-side expiry check (avoids an unnecessary round-trip)
    if (isTokenExpired(session.token)) {
        clearSession(expectedRole);
        window.location.href = `/login?role=${expectedRole}`;
        return { ok: false };
    }

    // ── Server-side verification (blacklist + live validity) ──
    try {
        const result = await verifyTokenWithServer(session.token);
        if (!result.valid) {
            clearSession(expectedRole);
            window.location.href = `/login?role=${expectedRole}`;
            return { ok: false };
        }
        // Server confirms the role matches
        if (result.role !== expectedRole) {
            clearSession(expectedRole);
            window.location.href = `/login?role=${expectedRole}`;
            return { ok: false };
        }
    } catch (err) {
        // Network error — allow the dashboard to load with stale data
        // (the API calls will fail individually and show appropriate errors)
        console.warn('Session verification failed (network):', err.message);
    }

    return { ok: true, user: session.user, token: session.token };
}

// ── Logout ───────────────────────────────────────────────────────────

// logout(role) — invalidates the token server-side, then clears localStorage.
async function logout(role) {
    const session = getSession(role);
    if (session && session.token) {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
        } catch (_) { /* best-effort — clear locally regardless */ }
    }
    clearSession(role);
    window.location.href = `/login?role=${role}`;
}
