// ═══════════════════════════════════════════════════════════════════
// Theme Provider — toggle, persistence, system-preference detection
// ═══════════════════════════════════════════════════════════════════

(function () {
    const STORAGE_KEY = 'theme';
    const DARK = 'dark';
    const LIGHT = 'light';

    // ── Determine the initial theme ────────────────────────────────
    // Priority:  localStorage  >  OS preference  >  light (default)
    function getInitialTheme() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored === DARK || stored === LIGHT) return stored;

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK;
        }
        return LIGHT;
    }

    // ── Apply theme to <html> ──────────────────────────────────────
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        updateToggleIcons(theme);
    }

    // ── Toggle ─────────────────────────────────────────────────────
    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme') || LIGHT;
        applyTheme(current === DARK ? LIGHT : DARK);
    }

    // ── Swap sun / moon icons inside every .theme-toggle-btn ───────
    function updateToggleIcons(theme) {
        var btns = document.querySelectorAll('.theme-toggle-btn');
        btns.forEach(function (btn) {
            var sunIcon  = btn.querySelector('.icon-sun');
            var moonIcon = btn.querySelector('.icon-moon');
            if (sunIcon && moonIcon) {
                if (theme === DARK) {
                    sunIcon.classList.remove('hidden');
                    moonIcon.classList.add('hidden');
                } else {
                    sunIcon.classList.add('hidden');
                    moonIcon.classList.remove('hidden');
                }
            }
            // Update aria-label for accessibility
            btn.setAttribute('aria-label',
                theme === DARK ? 'Switch to light mode' : 'Switch to dark mode'
            );
        });
    }

    // ── Listen for OS preference changes ───────────────────────────
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            // Only auto-switch if the user hasn't explicitly chosen a theme
            if (!localStorage.getItem(STORAGE_KEY)) {
                applyTheme(e.matches ? DARK : LIGHT);
            }
        });
    }

    // ── Apply immediately (before DOM ready to prevent flash) ──────
    applyTheme(getInitialTheme());

    // ── After DOM is ready, wire up all toggle buttons ─────────────
    document.addEventListener('DOMContentLoaded', function () {
        // Bind click handlers to every .theme-toggle-btn
        document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
            btn.addEventListener('click', toggleTheme);
        });
        // Set initial icon state
        updateToggleIcons(document.documentElement.getAttribute('data-theme') || LIGHT);
    });

    // ── Public API ─────────────────────────────────────────────────
    window.Theme = {
        get:     function () { return document.documentElement.getAttribute('data-theme') || LIGHT; },
        set:     applyTheme,
        toggle:  toggleTheme,
        LIGHT:   LIGHT,
        DARK:    DARK
    };

    // Backward compat
    window.toggleTheme = toggleTheme;
})();
