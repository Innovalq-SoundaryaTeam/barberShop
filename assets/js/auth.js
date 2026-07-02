/* ==================================================
   BARBER STUDIO — CLIENT AUTH (front-end demo)
   Handles: Registration, Login verification,
   Session, and Page Guards for User / Admin areas.

   Storage:
   - localStorage  "bs_users"      -> array of registered users
   - sessionStorage "bs_user_auth" -> currently logged in user
   - sessionStorage "bs_admin_auth"-> admin session flag (set by admin-login.html)
   ================================================== */

(function (window) {

    const USERS_KEY = 'bs_users';
    const USER_SESSION_KEY = 'bs_user_auth';

    /* ---------- helpers ---------- */

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch (e) {}
    }

    function findUserByEmail(email) {
        const normalized = String(email || '').trim().toLowerCase();
        return getUsers().find(u => u.email.toLowerCase() === normalized);
    }

    /* ---------- public API ---------- */

    const BSAuth = {

        /* Create a new account. Returns {success, message} */
        register(name, email, phone, password) {

            name = String(name || '').trim();
            email = String(email || '').trim();
            password = String(password || '');

            if (!name || !email || !password) {
                return { success: false, message: 'Please fill in all required fields.' };
            }

            if (findUserByEmail(email)) {
                return { success: false, message: 'An account with this email already exists. Please login instead.' };
            }

            const users = getUsers();

            users.push({
                name: name,
                email: email,
                phone: String(phone || '').trim(),
                password: password,
                createdAt: new Date().toISOString()
            });

            saveUsers(users);

            return { success: true, message: 'Account created successfully.' };
        },

        /* Verify credentials against registered users. Returns {success, message} */
        login(email, password) {

            const user = findUserByEmail(email);

            if (!user) {
                return { success: false, message: "No account found with this email. Please register first." };
            }

            if (user.password !== String(password || '')) {
                return { success: false, message: 'Incorrect password. Please try again.' };
            }

            try {
                sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || ''
                }));
            } catch (e) {}

            return { success: true, message: 'Login successful.' };
        },

        /* Returns the logged-in user object, or null */
        currentUser() {
            try {
                return JSON.parse(sessionStorage.getItem(USER_SESSION_KEY));
            } catch (e) {
                return null;
            }
        },

        /* Clears user session */
        logout() {
            try {
                sessionStorage.removeItem(USER_SESSION_KEY);
            } catch (e) {}
        },

        /* Call on user-only pages. Redirects to login if not authenticated.
           Note: the customer-facing login page has been removed; this is
           kept only for backward compatibility and defaults to admin login. */
        guardUserPage(redirectTo) {
            if (!this.currentUser()) {
                window.location.href = redirectTo || 'admin-login.html';
            }
        },

        /* Call on admin-only pages. Redirects to admin-login if not authenticated. */
        guardAdminPage(redirectTo) {
            let ok = false;
            try {
                ok = sessionStorage.getItem('bs_admin_auth') === '1';
            } catch (e) {}
            if (!ok) {
                window.location.href = redirectTo || 'admin-login.html';
            }
        }

    };

    window.BSAuth = BSAuth;

})(window);
