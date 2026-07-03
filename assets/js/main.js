document.addEventListener('DOMContentLoaded', () => {

    initializeTheme();
    initializeThemeToggle();
    initializeContactForm();
    initializeNewsletterForms();
    initializeGalleryFilter();
    initializeBlogFilter();
    initializeLightbox();
    initializeCountdown();
    initializeSmoothScroll();
    initializeAccessibility();
    injectAccountNav();
    initializeRTLToggle();

});

/* ==================================================
   THEME DETECTION
   ================================================== */

const initializeTheme = () => {

    const savedTheme = localStorage.getItem('barber-theme');

    if (savedTheme) {
        document.body.classList.toggle(
            'light-mode',
            savedTheme === 'light'
        );
        return;
    }

    // Default to dark theme so the brand background (#0F3D2E) is shown
    document.body.classList.remove('light-mode');
};

/* ==================================================
   THEME TOGGLE
   ================================================== */

const initializeThemeToggle = () => {

    const toggleButton = document.getElementById('themeToggle');

    if (!toggleButton) return;

    toggleButton.addEventListener('click', () => {

        document.body.classList.toggle('light-mode');

        const currentTheme =
            document.body.classList.contains('light-mode')
                ? 'light'
                : 'dark';

        localStorage.setItem(
            'barber-theme',
            currentTheme
        );

        updateThemeIcon(toggleButton);

    });

    updateThemeIcon(toggleButton);
};

/* ==================================================
   UPDATE THEME ICON
   ================================================== */

const updateThemeIcon = (button) => {

    const icon = button.querySelector('i');

    if (!icon) return;

    if (document.body.classList.contains('light-mode')) {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
};

/* ==================================================
   ACCOUNT NAV LINK (site-wide, non-admin pages)
   Injects a Login link into the public navbar so every
   page stays connected to the new auth pages without
   editing each page's markup individually.
   ================================================== */

const injectAccountNav = () => {

    const navList = document.querySelector('#mainNavbar .navbar-nav');

    if (!navList) return;

    if (document.getElementById('navLoginLink')) return;

    const themeItem = navList.querySelector('.ms-lg-3');

    const li = document.createElement('li');
    li.className = 'nav-item ms-lg-3';
    li.innerHTML =
        '<a id="navLoginLink" class="nav-link" href="admin-login.html">' +
        '<i class="fas fa-user-shield me-1"></i>Admin Login</a>';

    if (themeItem) {
        navList.insertBefore(li, themeItem);
    } else {
        navList.appendChild(li);
    }

};

/* ==================================================
   RTL / LTR TOGGLE (site-wide, non-admin pages)
   Injects a direction switch into the public navbar so
   the whole layout can be flipped for RTL languages
   (Arabic / Hebrew) using assets/css/rtl.css.
   ================================================== */

const initializeRTLToggle = () => {

    if (document.getElementById('rtlToggle')) return;

    // Standalone floating button, fixed to the corner of the viewport.
    // Deliberately kept OUT of the navbar so it never touches/alters
    // the navbar's own layout on any screen size.
    const button = document.createElement('button');
    button.id = 'rtlToggle';
    button.type = 'button';
    button.className = 'rtl-floating-toggle';
    button.setAttribute('aria-label', 'Toggle Right-To-Left Layout');
    button.setAttribute('title', 'Switch Layout Direction');
    button.innerHTML =
        '<i class="fas fa-globe"></i><span class="rtl-toggle-label">EN</span>';

    document.body.appendChild(button);

    const label = button.querySelector('.rtl-toggle-label');

    const applyDirection = (dir) => {
        document.documentElement.setAttribute('dir', dir);
        label.textContent = dir === 'rtl' ? 'AR' : 'EN';
    };

    let savedDir = 'ltr';

    try {
        savedDir = localStorage.getItem('barber-dir') || 'ltr';
    } catch (e) {}

    applyDirection(savedDir === 'rtl' ? 'rtl' : 'ltr');

    button.addEventListener('click', () => {

        const nextDir =
            document.documentElement.getAttribute('dir') === 'rtl'
                ? 'ltr'
                : 'rtl';

        applyDirection(nextDir);

        try {
            localStorage.setItem('barber-dir', nextDir);
        } catch (e) {}

    });

};

/* ==================================================
   CONTACT FORM VALIDATION
   ================================================== */

const initializeContactForm = () => {

    const form = document.getElementById('contactForm');

    if (!form) return;

    form.addEventListener('submit', (event) => {

        event.preventDefault();

        clearErrors();
        hideFormMessage(form);

        let isValid = true;

        const name =
            document.getElementById('name');

        const email =
            document.getElementById('email');

        const phone =
            document.getElementById('phone');

        const subject =
            document.getElementById('subject');

        const service =
            document.getElementById('service');

        const message =
            document.getElementById('message');

        if (name && !name.value.trim()) {
            showError(
                name,
                'Name is required.'
            );
            isValid = false;
        }

        if (email && !validateEmail(email.value.trim())) {
            showError(
                email,
                'Please enter a valid email address.'
            );
            isValid = false;
        }

        if (phone && phone.hasAttribute('required') &&
            !validatePhone(phone.value.trim())) {
            showError(
                phone,
                'Please enter a valid phone number.'
            );
            isValid = false;
        }

        if (subject && subject.hasAttribute('required') &&
            !subject.value.trim()) {
            showError(
                subject,
                'Subject is required.'
            );
            isValid = false;
        }

        if (service && service.hasAttribute('required') &&
            !service.value) {
            showError(
                service,
                'Please select a service.'
            );
            isValid = false;
        }

        if (message && !message.value.trim()) {
            showError(
                message,
                'Message is required.'
            );
            isValid = false;
        }

        if (isValid) {

            saveContactSubmission({
                name: name ? name.value.trim() : '',
                email: email ? email.value.trim() : '',
                phone: phone ? phone.value.trim() : '',
                subject: subject ? subject.value.trim() : '',
                service: service ? service.value : '',
                message: message ? message.value.trim() : ''
            });

            showFormMessage(
                form,
                'success',
                "Thank you! Your message has been sent successfully. Our team will get back to you shortly."
            );

            form.reset();
            form.classList.remove('was-validated');
        }

    });
};

/* ==================================================
   CONTACT SUBMISSION STORAGE (used by admin pages)
   ================================================== */

const saveContactSubmission = (entry) => {

    const STORAGE_KEY = 'bs_inquiries';

    let entries = [];

    try {
        entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        entries = [];
    }

    entries.unshift({
        ...entry,
        id: 'inq_' + Date.now(),
        status: 'New',
        submittedAt: new Date().toISOString()
    });

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {}

};

/* ==================================================
   FORM SUCCESS / ERROR MESSAGE
   ================================================== */

const showFormMessage = (form, type, text) => {

    let msg = form.parentElement.querySelector('.form-message');

    if (!msg) {
        msg = document.createElement('div');
        msg.className = 'form-message';
        form.insertAdjacentElement('beforebegin', msg);
    }

    msg.textContent = text;
    msg.classList.remove('form-message-success', 'form-message-error');
    msg.classList.add(
        type === 'success' ? 'form-message-success' : 'form-message-error'
    );
    msg.style.display = 'block';

    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const hideFormMessage = (form) => {

    const msg = form.parentElement.querySelector('.form-message');

    if (msg) {
        msg.style.display = 'none';
    }
};

/* ==================================================
   NEWSLETTER FORMS (FOOTER)
   ================================================== */

const initializeNewsletterForms = () => {

    document.querySelectorAll('.newsletter-form')
        .forEach((form) => {

            form.addEventListener('submit', (event) => {

                event.preventDefault();

                const input = form.querySelector('input[type="email"]');
                const feedback = form.querySelector('.newsletter-feedback');

                if (!input) return;

                const email = input.value.trim();

                if (!validateEmail(email)) {

                    if (feedback) {
                        feedback.textContent =
                            'Please enter a valid email address.';
                        feedback.classList.remove('newsletter-success');
                        feedback.classList.add('newsletter-error', 'show');
                    }

                    return;
                }

                if (feedback) {
                    feedback.textContent =
                        "Thanks for subscribing! You'll hear from us soon.";
                    feedback.classList.remove('newsletter-error');
                    feedback.classList.add('newsletter-success', 'show');
                }

                form.reset();
            });

        });
};

/* ==================================================
   EMAIL VALIDATION
   ================================================== */

const validateEmail = (email) => {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);
};

/* ==================================================
   PHONE VALIDATION
   ================================================== */

const validatePhone = (phone) => {

    const pattern =
        /^[0-9+\-\s()]{7,20}$/;

    return pattern.test(phone);
};

/* ==================================================
   SHOW ERROR
   ================================================== */

const showError = (field, message) => {

    const error = document.createElement('small');

    error.className = 'error-message';
    error.textContent = message;

    field.insertAdjacentElement(
        'afterend',
        error
    );
};

/* ==================================================
   CLEAR ERRORS
   ================================================== */

const clearErrors = () => {

    document
        .querySelectorAll('.error-message')
        .forEach(error => error.remove());
};

/* ==================================================
   GALLERY FILTER
   ================================================== */

const initializeGalleryFilter = () => {

    const filterButtons =
        document.querySelectorAll('.gallery-filters .filter-btn');

    const galleryItems =
        document.querySelectorAll('.gallery-item');

    if (!filterButtons.length) return;

    filterButtons.forEach(button => {

        button.addEventListener('click', () => {

            const filter =
                button.dataset.filter;

            filterButtons.forEach(btn =>
                btn.classList.remove('active')
            );

            button.classList.add('active');

            galleryItems.forEach(item => {

                const category =
                    item.dataset.category;

                const column =
                    item.closest('.col-md-6, .col-lg-3, .col-lg-4') ||
                    item.parentElement;

                if (
                    filter === 'all' ||
                    category === filter
                ) {
                    column.style.display = '';
                    item.style.display = 'block';
                } else {
                    column.style.display = 'none';
                }

            });

        });

    });
};

/* ==================================================
   BLOG CATEGORY FILTER
   ================================================== */

const initializeBlogFilter = () => {

    const filterButtons =
        document.querySelectorAll('.blog-filters .filter-btn');

    const blogItems =
        document.querySelectorAll('.blog-item');

    if (!filterButtons.length) return;

    filterButtons.forEach(button => {

        button.addEventListener('click', () => {

            const filter =
                button.dataset.filter;

            filterButtons.forEach(btn =>
                btn.classList.remove('active')
            );

            button.classList.add('active');

            blogItems.forEach(item => {

                const category =
                    item.dataset.category;

                if (
                    filter === 'all' ||
                    category === filter
                ) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }

            });

        });

    });
};

/* ==================================================
   LIGHTBOX
   ================================================== */

const initializeLightbox = () => {

    const images =
        document.querySelectorAll(
            '.gallery-item img'
        );

    if (!images.length) return;

    images.forEach(image => {

        image.addEventListener('click', () => {

            const overlay =
                document.createElement('div');

            overlay.className =
                'lightbox-overlay';

            overlay.innerHTML = `
                <div class="lightbox-container">
                    <img src="${image.src}"
                         alt="${image.alt}">
                    <button
                        class="lightbox-close"
                        aria-label="Close Lightbox">
                        &times;
                    </button>
                </div>
            `;

            document.body.appendChild(
                overlay
            );

            overlay.addEventListener(
                'click',
                (event) => {

                    if (
                        event.target === overlay ||
                        event.target.classList.contains(
                            'lightbox-close'
                        )
                    ) {
                        overlay.remove();
                    }

                }
            );

        });

    });
};

/* ==================================================
   COUNTDOWN TIMER
   ================================================== */

const initializeCountdown = () => {

    const countdown =
        document.getElementById(
            'countdown'
        );

    if (!countdown) return;

    const launchDate =
        new Date(
            '2027-01-01T00:00:00'
        ).getTime();

    const updateCountdown = () => {

        const now = new Date().getTime();

        const distance =
            launchDate - now;

        if (distance <= 0) {

            countdown.innerHTML =
                '<h3>We Are Live!</h3>';

            return;
        }

        const days =
            Math.floor(
                distance /
                (1000 * 60 * 60 * 24)
            );

        const hours =
            Math.floor(
                (
                    distance %
                    (1000 * 60 * 60 * 24)
                ) /
                (1000 * 60 * 60)
            );

        const minutes =
            Math.floor(
                (
                    distance %
                    (1000 * 60 * 60)
                ) /
                (1000 * 60)
            );

        const seconds =
            Math.floor(
                (
                    distance %
                    (1000 * 60)
                ) / 1000
            );

        countdown.innerHTML = `
            <div class="row text-center">
                <div class="col">
                    <div class="countdown-box">
                        <h2>${days}</h2>
                        <p>Days</p>
                    </div>
                </div>

                <div class="col">
                    <div class="countdown-box">
                        <h2>${hours}</h2>
                        <p>Hours</p>
                    </div>
                </div>

                <div class="col">
                    <div class="countdown-box">
                        <h2>${minutes}</h2>
                        <p>Minutes</p>
                    </div>
                </div>

                <div class="col">
                    <div class="countdown-box">
                        <h2>${seconds}</h2>
                        <p>Seconds</p>
                    </div>
                </div>
            </div>
        `;
    };

    updateCountdown();

    setInterval(
        updateCountdown,
        1000
    );
};

/* ==================================================
   SMOOTH SCROLL
   ================================================== */

const initializeSmoothScroll = () => {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(anchor => {

            anchor.addEventListener(
                'click',
                event => {

                    const target =
                        document.querySelector(
                            anchor.getAttribute(
                                'href'
                            )
                        );

                    if (!target) return;

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: 'smooth'
                    });

                }
            );

        });
};

/* ==================================================
   ACCESSIBILITY
   ================================================== */

const initializeAccessibility = () => {

    document
        .querySelectorAll(
            'button, a, input, textarea, select'
        )
        .forEach(element => {

            element.addEventListener(
                'keyup',
                event => {

                    if (
                        event.key === 'Enter'
                    ) {
                        element.click();
                    }

                }
            );

        });
};




/* ==========================================
   COMING SOON COUNTDOWN
========================================== */

const countdownDate = new Date(
    "Jan 01, 2027 00:00:00"
).getTime();

const countdown = setInterval(() => {

    const now = new Date().getTime();

    const distance = countdownDate - now;

    const days = Math.floor(
        distance / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24))
        / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
        (distance % (1000 * 60 * 60))
        / (1000 * 60)
    );

    const seconds = Math.floor(
        (distance % (1000 * 60))
        / 1000
    );

    if(document.getElementById("days")){

        document.getElementById("days").textContent =
            String(days).padStart(2,"0");

        document.getElementById("hours").textContent =
            String(hours).padStart(2,"0");

        document.getElementById("minutes").textContent =
            String(minutes).padStart(2,"0");

        document.getElementById("seconds").textContent =
            String(seconds).padStart(2,"0");

    }

    if(distance < 0){

        clearInterval(countdown);

    }

},1000);



/* ==========================================
   PASSWORD TOGGLE
========================================== */

const togglePassword =
document.getElementById("togglePassword");

const loginPassword =
document.getElementById("loginPassword");

if(togglePassword){

    togglePassword.addEventListener("click",()=>{

        const type =
        loginPassword.getAttribute("type") === "password"
        ? "text"
        : "password";

        loginPassword.setAttribute(
            "type",
            type
        );

        togglePassword.innerHTML =
        type === "password"
        ?
        '<i class="fas fa-eye"></i>'
        :
        '<i class="fas fa-eye-slash"></i>';

    });

}


/* ==========================================
   REGISTER PAGE
========================================== */

const registerPassword =
document.getElementById("registerPassword");

const confirmPassword =
document.getElementById("confirmPassword");

const strengthBar =
document.getElementById("strengthBar");

const strengthText =
document.getElementById("strengthText");

function togglePasswordField(
    buttonId,
    inputId
){

    const button =
    document.getElementById(buttonId);

    const input =
    document.getElementById(inputId);

    if(button){

        button.addEventListener("click",()=>{

            const type =
            input.type === "password"
            ? "text"
            : "password";

            input.type = type;

            button.innerHTML =
            type === "password"
            ?
            '<i class="fas fa-eye"></i>'
            :
            '<i class="fas fa-eye-slash"></i>';

        });

    }

}

togglePasswordField(
    "toggleRegisterPassword",
    "registerPassword"
);

togglePasswordField(
    "toggleConfirmPassword",
    "confirmPassword"
);

/* Password Strength */

if(registerPassword){

    registerPassword.addEventListener(
        "input",
        function(){

            const value = this.value;

            let strength = 0;

            if(value.length >= 8) strength++;
            if(/[A-Z]/.test(value)) strength++;
            if(/[0-9]/.test(value)) strength++;
            if(/[^A-Za-z0-9]/.test(value)) strength++;

            const widths =
            ["0%","25%","50%","75%","100%"];

            const labels =
            [
                "Very Weak",
                "Weak",
                "Medium",
                "Strong",
                "Very Strong"
            ];

            strengthBar.style.width =
            widths[strength];

            if(strength <= 1){

                strengthBar.style.background =
                "#dc3545";

            }

            else if(strength === 2){

                strengthBar.style.background =
                "#ffc107";

            }

            else{

                strengthBar.style.background =
                "#198754";

            }

            strengthText.textContent =
            labels[strength];

        }
    );

}



/* NOTE: real login/registration submit handling now lives in
   admin-login.html and register.html (Admin Sign Up), which
   verify credentials instead of redirecting unconditionally.
   The customer-facing login/dashboard has been removed. */
