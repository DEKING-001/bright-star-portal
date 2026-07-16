// ═══════════════════════════════════════════════════════════════════
// Reusable Collapsible Sidebar Component
// ═══════════════════════════════════════════════════════════════════
// Desktop (>= 1024px): sidebar collapses to icon-only (72 px).
// Mobile  (< 1024px):  sidebar slides in as a full-width overlay
//                      with a dark backdrop behind it.
//
// State is persisted in localStorage ("sidebar_collapsed").
// ═══════════════════════════════════════════════════════════════════

(function () {
    var STORAGE_KEY  = 'sidebar_collapsed';
    var SIDEBAR_W    = 260;
    var COLLAPSED_W  = 72;
    var BP           = 1024;   // px — mobile / desktop breakpoint

    var sidebar, mainContent, hamburgerBtn, backdrop;

    // ── Helpers ────────────────────────────────────────────────────
    function isMobile()  { return window.innerWidth < BP; }
    function isCollapsed(){ return sidebar && sidebar.classList.contains('collapsed'); }
    function isOpen()    { return sidebar && sidebar.classList.contains('open'); }

    // ── DOM ready ──────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        sidebar     = document.getElementById('sidebar');
        mainContent = document.querySelector('.main-content');
        hamburgerBtn = document.getElementById('sidebarToggle');

        if (!sidebar || !mainContent) return;

        // Create the mobile backdrop element (appended to <body>)
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);

        // ── Hamburger click ────────────────────────────────────────
        if (hamburgerBtn) {
            // Use a dedicated handler so it is never accidentally removed
            hamburgerBtn.addEventListener('click', function (e) {
                e.stopPropagation();           // prevent document listener from firing
                if (isMobile()) {
                    isOpen() ? closeMobile() : openMobile();
                } else {
                    isCollapsed() ? expandDesktop(true) : collapseDesktop(true);
                }
            });
        }

        // ── Backdrop click → close mobile sidebar ──────────────────
        backdrop.addEventListener('click', function () {
            closeMobile();
        });

        // ── Click outside sidebar (on main content) → close mobile ─
        //    Only needed when there is no backdrop覆盖 (fallback).
        mainContent.addEventListener('click', function () {
            if (isMobile() && isOpen()) closeMobile();
        });

        // ── Escape key → close mobile sidebar ──────────────────────
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) closeMobile();
        });

        // ── Restore persisted state ────────────────────────────────
        var saved = localStorage.getItem(STORAGE_KEY);
        if (isMobile()) {
            // Mobile always starts closed (overlay)
            closeMobile();
        } else if (saved === 'true') {
            collapseDesktop(false);
        } else {
            expandDesktop(false);
        }

        // ── Resize handler — switch modes when crossing the BP ─────
        var wasMobile = isMobile();
        window.addEventListener('resize', function () {
            var nowMobile = isMobile();
            // Crossing the breakpoint in either direction
            if (wasMobile && !nowMobile) {
                // Mobile → Desktop: restore collapsed preference
                var saved = localStorage.getItem(STORAGE_KEY);
                if (saved === 'true') collapseDesktop(false);
                else expandDesktop(false);
                closeMobile();
            } else if (!wasMobile && nowMobile) {
                // Desktop → Mobile: close overlay, reset margin
                closeMobile();
                mainContent.style.marginLeft = '';
            }
            wasMobile = nowMobile;
        });
    });

    // ═══════════════════════════════════════════════════════════════
    //  DESKTOP collapse / expand
    // ═══════════════════════════════════════════════════════════════

    function collapseDesktop(animate) {
        if (!sidebar) return;
        sidebar.classList.add('collapsed');
        sidebar.classList.remove('open');
        setTransition(sidebar, animate);

        mainContent.style.marginLeft = COLLAPSED_W + 'px';
        hideTextLabels(true);
        localStorage.setItem(STORAGE_KEY, 'true');
    }

    function expandDesktop(animate) {
        if (!sidebar) return;
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('open');
        setTransition(sidebar, animate);

        mainContent.style.marginLeft = SIDEBAR_W + 'px';
        hideTextLabels(false);
        localStorage.setItem(STORAGE_KEY, 'false');
    }

    // ═══════════════════════════════════════════════════════════════
    //  MOBILE slide-in overlay
    // ═══════════════════════════════════════════════════════════════

    function openMobile() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        sidebar.classList.remove('collapsed');
        // Ensure full width on mobile
        sidebar.style.width = SIDEBAR_W + 'px';
        hideTextLabels(false);

        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';     // prevent background scroll
    }

    function closeMobile() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        sidebar.style.width = '';
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ═══════════════════════════════════════════════════════════════
    //  Shared helpers
    // ═══════════════════════════════════════════════════════════════

    function setTransition(el, animate) {
        if (animate) el.classList.add('sidebar-transition');
        else el.classList.remove('sidebar-transition');
    }

    function hideTextLabels(hide) {
        if (!sidebar) return;
        var prop = hide
            ? { opacity: '0', width: '0', overflow: 'hidden', whiteSpace: 'nowrap' }
            : { opacity: '', width: '', overflow: '', whiteSpace: '' };

        sidebar.querySelectorAll('.sidebar-text').forEach(function (el) {
            Object.keys(prop).forEach(function (k) { el.style[k] = prop[k]; });
        });

        var logo = sidebar.querySelector('.sidebar-logo-text');
        if (logo) Object.keys(prop).forEach(function (k) { logo.style[k] = prop[k]; });

        sidebar.querySelectorAll('.nav-item').forEach(function (el) {
            el.style.justifyContent = hide ? 'center' : '';
            el.style.paddingLeft    = hide ? '0' : '';
            el.style.paddingRight   = hide ? '0' : '';
        });

        sidebar.querySelectorAll('.sidebar-section-header').forEach(function (el) {
            el.style.display = hide ? 'none' : '';
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  Public API
    // ═══════════════════════════════════════════════════════════════

    window.Sidebar = {
        toggle: function () {
            if (isMobile()) isOpen() ? closeMobile() : openMobile();
            else isCollapsed() ? expandDesktop(true) : collapseDesktop(true);
        },
        collapse:   function () { collapseDesktop(true); },
        expand:     function () { expandDesktop(true); },
        openMobile: openMobile,
        closeMobile: closeMobile
    };

    window.toggleSidebar = window.Sidebar.toggle;
})();
