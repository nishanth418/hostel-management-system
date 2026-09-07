// frontend/app.js
// Shared UI utilities for Hostel Management System

(function () {
    // 1. Initialize Animated Background Canvas
    function initAmbientBackground() {
        if (!document.querySelector('.ambient-canvas')) {
            const bg = document.createElement('div');
            bg.className = 'ambient-canvas';
            bg.setAttribute('aria-hidden', 'true');
            bg.innerHTML = `
                <div class="ambient-grid"></div>
                <div class="ambient-orb orb-1"></div>
                <div class="ambient-orb orb-2"></div>
                <div class="ambient-orb orb-3"></div>
                <div class="ambient-orb orb-4"></div>
            `;
            document.body.prepend(bg);
        }
    }

    // Initialize Page Accent Theme
    function initPageAccentTheme() {
        if (!document.body.dataset.page) {
            let path = window.location.pathname.replace(/\/+$/, '').split('/').pop() || '';
            path = path.replace('.html', '').toLowerCase();
            if (!path || path === 'index') {
                path = 'dashboard';
            }
            document.body.dataset.page = path;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initAmbientBackground();
            initPageAccentTheme();
        });
    } else {
        initAmbientBackground();
        initPageAccentTheme();
    }

    // 2. Mobile Menu Toggle
    window.toggleMobileMenu = function () {
        const menu = document.querySelector('.nav-menu');
        if (menu) {
            menu.classList.toggle('open');
        }
    };

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
        const menu = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.mobile-toggle');
        if (menu && menu.classList.contains('open')) {
            if (!menu.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
                menu.classList.remove('open');
            }
        }
    });

    // 3. Active Link Highlighting
    document.addEventListener('DOMContentLoaded', function () {
        const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
        
        // Highlight top navbar links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const cleanHref = href.replace(/\/+$/, '') || '/';
                if (cleanHref === currentPath || (cleanHref !== '/' && currentPath.startsWith(cleanHref))) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });

        // Highlight subnav pills
        const subnavPills = document.querySelectorAll('.subnav-pill');
        subnavPills.forEach(pill => {
            const href = pill.getAttribute('href');
            if (href) {
                const cleanHref = href.replace(/\/+$/, '') || '/';
                if (cleanHref === currentPath) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            }
        });
    });

    // 4. Smooth Number Counting Animation
    window.animateCount = function (element, targetValue, duration = 800) {
        if (!element) return;
        const target = parseInt(targetValue, 10);
        if (isNaN(target)) {
            element.textContent = targetValue;
            return;
        }

        // Accessibility: If reduced motion is preferred, jump straight to target
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            element.textContent = target.toLocaleString();
            return;
        }

        const start = 0;
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOutProgress);
            
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(updateNumber);
    };

    // 5. Live Table Search Filter with Smooth Row Transitions and Empty Search State
    window.filterTable = function (input, targetTableId) {
        const query = (input.value || '').toLowerCase().trim();
        const target = document.getElementById(targetTableId);
        const table = (target && target.tagName === 'TABLE') ? target : (target ? target.closest('table') : document.querySelector('table'));
        if (!table) return;

        const tbody = (target && target.tagName === 'TBODY') ? target : (table.querySelector('tbody') || table);
        const rows = Array.from(tbody.querySelectorAll('tr:not(.empty-search-row):not(.table-loading-row)'));

        let matchCount = 0;
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            if (!query || text.includes(query)) {
                if (row.style.display === 'none') {
                    row.style.display = '';
                    row.style.animation = 'rowFadeIn 0.22s ease forwards';
                }
                matchCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Handle empty search state
        let emptyRow = tbody.querySelector('.empty-search-row');
        if (matchCount === 0 && rows.length > 0) {
            if (!emptyRow) {
                const colCount = table.querySelectorAll('thead th').length || 8;
                emptyRow = document.createElement('tr');
                emptyRow.className = 'empty-search-row';
                emptyRow.innerHTML = `<td colspan="${colCount}" class="table-empty-cell"><span class="empty-icon">🔍</span>No matching records found.</td>`;
                tbody.appendChild(emptyRow);
            }
            emptyRow.style.display = '';
        } else if (emptyRow) {
            emptyRow.style.display = 'none';
        }

        const badge = table.closest('.table-card')?.querySelector('.record-badge') ||
                      document.getElementById('recordCountBadge');
        if (badge) {
            if (query) {
                badge.textContent = `${matchCount} found`;
            } else {
                badge.textContent = `${rows.length} records`;
            }
            badge.style.animation = 'none';
            void badge.offsetWidth;
            badge.style.animation = 'badgePop 0.25s cubic-bezier(0.16, 1, 0.3, 1) both';
        }
    };

    // 6. Toast Feedback Notification
    window.showToast = function (text, duration = 3000) {
        const existing = document.querySelector('.ui-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'ui-toast';
        toast.textContent = text;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // 7. Initial Loading Placeholder for Tables while data is being fetched
    function initTableLoadingStates() {
        const tables = document.querySelectorAll('.table-card table');
        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (tbody && tbody.children.length === 0) {
                const colCount = table.querySelectorAll('thead th').length || 6;
                tbody.innerHTML = `
                    <tr class="table-loading-row">
                        <td colspan="${colCount}" class="table-loading-cell">
                            <span class="table-spinner" aria-hidden="true"></span>
                            <span>Loading records from database...</span>
                        </td>
                    </tr>
                `;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTableLoadingStates);
    } else {
        initTableLoadingStates();
    }
})();
