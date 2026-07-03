/* ==================================================
   ADMIN PANEL SCRIPT
   Sidebar toggle, logout confirm, table search
   ================================================== */

document.addEventListener('DOMContentLoaded', () => {

    initSidebar();
    initLogout();
    initTableSearch();
    initDeleteButtons();
    initViewEditActions();

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

/* ==========================================
   VIEW / EDIT ACTIONS (generic — table rows & entity cards)
   Uses event delegation so it also works on rows/cards
   inserted dynamically after page load.
========================================== */
const initViewEditActions = () => {

    document.addEventListener('click', (e) => {

        const viewBtn = e.target.closest('.btn-icon-action[title="View"]');
        const editBtn = e.target.closest('.btn-icon-action[title="Edit"]');

        if (viewBtn) {
            openRecordModal(viewBtn, 'view');
        } else if (editBtn) {
            openRecordModal(editBtn, 'edit');
        }

    });

};

const getRecordFields = (btn) => {

    const row = btn.closest('tr');
    const card = !row && (btn.closest('.entity-card') || btn.closest('[data-search-item]'));
    const fields = [];

    if (row) {

        const table = row.closest('table');
        const headers = table
            ? Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim())
            : [];

        Array.from(row.children).forEach((cell, index) => {

            const label = headers[index] || ('Field ' + (index + 1));
            if (label.toLowerCase() === 'actions') return;

            const nameEl = cell.querySelector('.cell-title');
            const subEl = cell.querySelector('.cell-sub');
            const badgeEl = cell.querySelector('.badge-status');

            if (nameEl && subEl) {
                fields.push({ label: label + ' Name', value: nameEl.textContent.trim(), el: nameEl });
                fields.push({ label: label + ' Detail', value: subEl.textContent.trim(), el: subEl });
            } else if (badgeEl) {
                fields.push({ label: label, value: badgeEl.textContent.trim(), el: badgeEl });
            } else if (cell.children.length === 0) {
                fields.push({ label: label, value: cell.textContent.trim(), el: cell });
            } else {
                fields.push({ label: label, value: cell.textContent.trim().replace(/\s+/g, ' '), el: null });
            }

        });

    } else if (card) {

        const heading = card.querySelector('h3, h4, h5');
        const role = card.querySelector('.role');
        const priceRow = card.querySelector('.entity-card-body .d-flex.justify-content-between');
        const badge = card.querySelector('.badge-status');

        if (heading) fields.push({ label: 'Name', value: heading.textContent.trim(), el: heading });
        if (role) fields.push({ label: 'Category', value: role.textContent.trim(), el: role });

        if (priceRow) {
            const spans = Array.from(priceRow.children);
            if (spans[0]) fields.push({ label: 'Price', value: spans[0].textContent.trim(), el: spans[0] });
            if (spans[1]) fields.push({ label: 'Duration', value: spans[1].textContent.trim(), el: spans[1] });
        }

        if (badge) fields.push({ label: 'Status', value: badge.textContent.trim(), el: badge });

    }

    return fields;

};

const ensureRecordModal = () => {

    if (document.getElementById('recordActionModal')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML =
        '<div class="modal fade" id="recordActionModal" tabindex="-1" aria-hidden="true">' +
            '<div class="modal-dialog modal-dialog-centered">' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<h5 class="modal-title" id="recordActionModalTitle">Details</h5>' +
                        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
                    '</div>' +
                    '<div class="modal-body" id="recordActionModalBody"></div>' +
                    '<div class="modal-footer" id="recordActionModalFooter"></div>' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.appendChild(wrapper.firstElementChild);

};

const openRecordModal = (btn, mode) => {

    ensureRecordModal();

    const fields = getRecordFields(btn);
    const title = document.getElementById('recordActionModalTitle');
    const body = document.getElementById('recordActionModalBody');
    const footer = document.getElementById('recordActionModalFooter');

    const recordName = fields.length ? fields[0].value : 'Record';
    title.textContent = (mode === 'view' ? 'View Details — ' : 'Edit — ') + recordName;

    if (mode === 'view') {

        body.innerHTML = fields.map((f) =>
            '<div class="mb-3">' +
                '<label class="form-label">' + f.label + '</label>' +
                '<div class="cell-title">' + (f.value || '—') + '</div>' +
            '</div>'
        ).join('');

        footer.innerHTML =
            '<button type="button" class="btn-admin-outline" data-bs-dismiss="modal">Close</button>';

    } else {

        body.innerHTML = fields.map((f, i) => {

            if (!f.el) {
                return '<div class="mb-3">' +
                    '<label class="form-label">' + f.label + '</label>' +
                    '<div class="cell-sub">' + (f.value || '—') + ' (not editable)</div>' +
                '</div>';
            }

            const safeValue = (f.value || '').replace(/"/g, '&quot;');

            return '<div class="mb-3">' +
                '<label class="form-label">' + f.label + '</label>' +
                '<input type="text" class="form-control" data-field-index="' + i + '" value="' + safeValue + '">' +
            '</div>';

        }).join('');

        footer.innerHTML =
            '<button type="button" class="btn-admin-outline" data-bs-dismiss="modal">Cancel</button>' +
            '<button type="button" class="btn-admin-primary" id="recordActionSaveBtn">' +
                '<i class="fas fa-check me-2"></i>Save Changes' +
            '</button>';

        const saveBtn = document.getElementById('recordActionSaveBtn');

        saveBtn.addEventListener('click', () => {

            body.querySelectorAll('input[data-field-index]').forEach((input) => {

                const idx = Number(input.dataset.fieldIndex);
                const field = fields[idx];

                if (field && field.el) {
                    field.el.textContent = input.value;
                }

            });

            const modalEl = document.getElementById('recordActionModal');
            const instance = window.bootstrap && bootstrap.Modal.getInstance(modalEl);
            if (instance) instance.hide();

        }, { once: true });

    }

    const modalEl = document.getElementById('recordActionModal');

    if (!window.bootstrap) return;

    const bsModal = bootstrap.Modal.getOrCreateInstance
        ? bootstrap.Modal.getOrCreateInstance(modalEl)
        : new bootstrap.Modal(modalEl);

    bsModal.show();

};
