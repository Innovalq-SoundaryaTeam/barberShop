/* ==================================================
   ADMIN PANEL SCRIPT
   Sidebar toggle, logout confirm, table search
   ================================================== */

document.addEventListener('DOMContentLoaded', () => {

    initSidebar();
    initLogout();
    initTableSearch();
    initDeleteButtons();

});

/* ==========================================
   SIDEBAR (mobile show/hide)
========================================== */
const initSidebar = () => {

    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const openBtn = document.getElementById('sidebarToggle');
    const closeBtn = document.getElementById('sidebarClose');

    if (!sidebar) return;

    const openSidebar = () => {
        sidebar.classList.add('show');
        if (overlay) overlay.classList.add('show');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    };

    if (openBtn) openBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('.sidebar-nav a').forEach((link) => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) closeSidebar();
        });
    });
};

/* ==========================================
   LOGOUT CONFIRM
========================================== */
const initLogout = () => {

    const logoutBtn = document.getElementById('logoutBtn');

    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const confirmed = window.confirm('Are you sure you want to logout?');

        if (confirmed) {
            window.location.href = logoutBtn.getAttribute('href') || 'admin-login.html';
        }
    });
};

/* ==========================================
   TABLE SEARCH
   Usage: <input data-table-search="tableId">
========================================== */
const initTableSearch = () => {

    document.querySelectorAll('[data-table-search]').forEach((input) => {

        const tableId = input.getAttribute('data-table-search');
        const table = document.getElementById(tableId);

        if (!table) return;

        input.addEventListener('input', () => {

            const query = input.value.trim().toLowerCase();

            table.querySelectorAll('tbody tr').forEach((row) => {
                const match = row.textContent.toLowerCase().includes(query);
                row.style.display = match ? '' : 'none';
            });

        });

    });

    /* Card grid search: <input data-grid-search="gridId"> */
    document.querySelectorAll('[data-grid-search]').forEach((input) => {

        const gridId = input.getAttribute('data-grid-search');
        const grid = document.getElementById(gridId);

        if (!grid) return;

        input.addEventListener('input', () => {

            const query = input.value.trim().toLowerCase();

            grid.querySelectorAll('[data-search-item]').forEach((item) => {
                const match = item.textContent.toLowerCase().includes(query);
                item.style.display = match ? '' : 'none';
            });

        });

    });

};

/* ==========================================
   DEMO DELETE BUTTONS (row / card removal)
========================================== */
const initDeleteButtons = () => {

    document.querySelectorAll('[data-remove-row]').forEach((btn) => {

        btn.addEventListener('click', () => {

            const target = btn.closest('tr') || btn.closest('[data-search-item]');

            if (target && window.confirm('Delete this record?')) {
                target.remove();
            }

        });

    });

};

/* ==========================================
   FILTER PILLS (status filter tabs)
   Usage: nav-pills-admin with data-filter + rows/cards with data-status
========================================== */
document.querySelectorAll('.nav-pills-admin [data-filter]').forEach((pill) => {

    pill.addEventListener('click', (e) => {
        e.preventDefault();

        const group = pill.closest('.nav-pills-admin');
        const targetSelector = group.getAttribute('data-filter-target');
        const status = pill.getAttribute('data-filter');

        group.querySelectorAll('.nav-link').forEach((el) => el.classList.remove('active'));
        pill.classList.add('active');

        if (!targetSelector) return;

        document.querySelectorAll(targetSelector).forEach((item) => {
            const itemStatus = item.getAttribute('data-status');
            const show = status === 'all' || itemStatus === status;
            item.style.display = show ? '' : 'none';
        });

    });

});
