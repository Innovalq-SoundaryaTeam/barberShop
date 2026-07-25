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
    setActiveNavLink();

});

/* ==================================================
   ACTIVE NAV LINK
   Highlights whichever navbar item matches the page
   currently being viewed, instead of relying on a
   hardcoded "active" class baked into each page's HTML
   (which previously always pointed at Home everywhere).
   Detail/child pages are mapped back to their parent
   nav item (e.g. service-details.html -> Services).
   ================================================== */
const setActiveNavLink = () => {

    const navbar = document.querySelector('#mainNavbar .navbar-nav');

    if (!navbar) return;

    let currentPage = window.location.pathname.split('/').pop();

    if (!currentPage) currentPage = 'index.html';

    const pageGroup = {
        'index.html': 'home',
        'home-2.html': 'home',
        'about.html': 'about.html',
        'team.html': 'about.html',
        'testimonials.html': 'about.html',
        'careers.html': 'about.html',
        'services.html': 'services.html',
        'service-details.html': 'services.html',
        'gallery.html': 'gallery.html',
        'pricing.html': 'pricing.html',
        'blog.html': 'blog.html',
        'blog-single.html': 'blog.html',
        'contact.html': 'contact.html',
        'faq.html': 'contact.html'
    };

    const group = pageGroup[currentPage];

    // Clear any pre-existing active state first — some pages ship with
    // a hardcoded "active" class that doesn't match the current page.
    navbar.querySelectorAll('.nav-link, .dropdown-item').forEach(el => {
        el.classList.remove('active');
    });

    if (group === 'home') {

        const homeToggle = navbar.querySelector('#homeDropdown');

        if (homeToggle) homeToggle.classList.add('active');

        navbar.querySelectorAll('.dropdown-item').forEach(item => {
            if (item.getAttribute('href') === currentPage) {
                item.classList.add('active');
            }
        });

        return;

    }

    if (group) {

        const link = navbar.querySelector(`.nav-link[href="${group}"]`);

        if (link) link.classList.add('active');

    }

};

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
   ACCOUNT NAV + BOOK NOW CTA (site-wide, non-admin pages)
   Injects a Login (secondary CTA) and Book Now (primary CTA)
   into the public navbar, in that order, right after the
   theme toggle, so every page stays consistent without
   editing each page's markup individually.
   ================================================== */

const injectAccountNav = () => {

    const navList = document.querySelector('#mainNavbar .navbar-nav');

    if (!navList) return;

    if (document.getElementById('navLoginLink')) return;

    const themeItem = navList.querySelector('.ms-lg-3');

    const loginLi = document.createElement('li');
    loginLi.className = 'nav-item ms-lg-2';
    loginLi.innerHTML =
        '<a id="navLoginLink" class="btn btn-outline-barber btn-sm" href="login.html">' +
        '<i class="fas fa-user me-1"></i>Login</a>';

    const bookLi = document.createElement('li');
    bookLi.className = 'nav-item ms-lg-2';
    bookLi.innerHTML =
        '<a id="navBookNowLink" class="btn btn-barber btn-sm" href="contact.html">' +
        '<i class="fas fa-calendar-check me-1"></i>Book Now</a>';

    if (themeItem) {
        themeItem.insertAdjacentElement('afterend', loginLi);
        loginLi.insertAdjacentElement('afterend', bookLi);
    } else {
        navList.appendChild(loginLi);
        navList.appendChild(bookLi);
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

    // RTL is a demo feature for the public marketing pages only — those are
    // the only pages that link rtl.css. Admin/auth pages (login, sign up,
    // dashboard, etc.) don't load that stylesheet and their layouts (e.g.
    // the two-column auth screens) were never built to support a live
    // direction flip, so skip injecting the toggle there entirely rather
    // than let it silently break those layouts.
    if (!document.querySelector('link[href*="rtl.css"]')) return;

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
        '<i class="fas fa-globe"></i><span class="rtl-toggle-label">LTR</span>';

    document.body.appendChild(button);

    // The navbar's actual height varies by screen size (collapsed
    // hamburger vs. expanded horizontal layout, wrapped nav items,
    // etc.), so a single fixed "top" value in CSS can't reliably sit
    // just below it on every viewport — it ends up overlapping the
    // navbar at some widths. Measure the real navbar height instead
    // and position the floating button just underneath it, recomputed
    // whenever the layout changes.
    const positionRTLToggle = () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        button.style.top = (navbar.getBoundingClientRect().height + 12) + 'px';
    };

    positionRTLToggle();
    window.addEventListener('resize', positionRTLToggle);
    window.addEventListener('load', positionRTLToggle);
    window.addEventListener('orientationchange', positionRTLToggle);

    // On mobile/tablet widths the navbar's collapsed menu drops down
    // and grows the navbar well past the height it had when closed,
    // but opening it doesn't fire a 'resize' event — so the floating
    // button stayed put at the "closed" height and ended up sitting
    // on top of the open menu instead of below everything. Simplest
    // fix: just hide it while the mobile menu is open, and reposition
    // it correctly once it's closed again.
    const mobileMenu = document.getElementById('mainNavbar');

    if (mobileMenu) {
        mobileMenu.addEventListener('show.bs.collapse', () => {
            button.style.visibility = 'hidden';
        });
        mobileMenu.addEventListener('hide.bs.collapse', () => {
            button.style.visibility = 'hidden';
        });
        mobileMenu.addEventListener('hidden.bs.collapse', () => {
            positionRTLToggle();
            button.style.visibility = '';
        });
    }

    const label = button.querySelector('.rtl-toggle-label');

    // CSS alone (flex-direction: row-reverse on the navbar's flex
    // containers) turned out not to visibly reorder anything —
    // Bootstrap's navbar layout combines justify-content:space-between
    // with flex-grow on the collapse area in a way that no CSS-only
    // reversal actually moved the logo or nav items. Reordering the
    // actual DOM nodes sidesteps that entirely and is guaranteed to
    // show up regardless of whatever Bootstrap is doing internally.
    const mirrorNavbar = (isRTL) => {

        // The container has 3 children: [brand, toggler, collapse].
        // The collapse panel MUST stay the last DOM child at every
        // breakpoint — that's what makes it wrap onto its own line
        // below the brand/toggler row when the mobile menu opens.
        // Reversing all 3 blindly would put collapse first, which
        // risks the open mobile menu rendering ABOVE the logo instead
        // of below it. So brand/toggler/collapse are repositioned
        // explicitly instead of with a generic array reverse:
        //   LTR             : brand, toggler, collapse
        //   RTL desktop     : toggler, collapse, brand  (brand → far right)
        //   RTL mobile/tablet: toggler, brand, collapse (collapse stays last)
        const container = document.querySelector('.navbar .container');
        const brand = document.querySelector('.navbar-brand');
        const toggler = document.querySelector('.navbar-toggler');
        const collapseEl = document.getElementById('mainNavbar');

        if (container && brand && toggler && collapseEl) {

            const isDesktop = window.innerWidth >= 1200;
            const want = !isRTL ? 'ltr' : (isDesktop ? 'rtl-desktop' : 'rtl-mobile');

            if (container.dataset.navOrder !== want) {

                if (want === 'ltr') {
                    container.appendChild(brand);
                    container.appendChild(toggler);
                    container.appendChild(collapseEl);
                } else if (want === 'rtl-desktop') {
                    container.appendChild(toggler);
                    container.appendChild(collapseEl);
                    container.appendChild(brand);
                } else {
                    container.appendChild(toggler);
                    container.appendChild(brand);
                    container.appendChild(collapseEl);
                }

                container.dataset.navOrder = want;
            }
        }

        // Only mirror the nav-links/theme-toggle/Login/Book-Now row on
        // the desktop horizontal layout (navbar-expand-xl, ≥1200px).
        // On the collapsed mobile/tablet menu it stays a vertical list
        // top-to-bottom — reversing that would just be confusing — so
        // it's re-evaluated on resize in case the viewport crosses the
        // 1200px breakpoint while open.
        const navList = document.querySelector('#mainNavbar .navbar-nav');

        if (navList) {
            if (navList.dataset.rtlMirrored === undefined) {
                navList.dataset.rtlMirrored = 'false';
            }
            const shouldMirror = isRTL && window.innerWidth >= 1200;
            const want = shouldMirror ? 'true' : 'false';
            if (navList.dataset.rtlMirrored !== want) {
                Array.from(navList.children)
                    .reverse()
                    .forEach(el => navList.appendChild(el));
                navList.dataset.rtlMirrored = want;
            }
        }
    };

    const applyDirection = (dir) => {
        document.documentElement.setAttribute('dir', dir);
        label.textContent = dir === 'rtl' ? 'RTL' : 'LTR';
        mirrorNavbar(dir === 'rtl');
    };

    window.addEventListener('resize', () => {
        mirrorNavbar(document.documentElement.getAttribute('dir') === 'rtl');
    });

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
        event.stopPropagation();

        clearErrors();
        hideFormMessage(form);

        // Every field with a `required`/`pattern` attribute (Name,
        // Email, Phone, Subject, Message) is checked here via native
        // constraint validation — not just Message. Invalid fields
        // get a red outline plus their matching .invalid-feedback
        // text once .was-validated is applied, same pattern already
        // used on the admin Add/Edit forms elsewhere in the site.
        if (!form.checkValidity()) {

            form.classList.add('was-validated');

            const firstInvalid = form.querySelector(':invalid');

            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        form.classList.add('was-validated');

        const name =
            document.getElementById('name');

        const email =
            document.getElementById('email');

        const phone =
            document.getElementById('phone');

        const subject =
            document.getElementById('subject');

        const message =
            document.getElementById('message');

        saveContactSubmission({
            name: name ? name.value.trim() : '',
            email: email ? email.value.trim() : '',
            phone: phone ? phone.value.trim() : '',
            subject: subject ? subject.value.trim() : '',
            service: '',
            message: message ? message.value.trim() : ''
        });

        showFormMessage(
            form,
            'success',
            "Thank you! Your message has been sent successfully. Our team will get back to you shortly."
        );

        form.reset();
        form.classList.remove('was-validated');

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



/* NOTE: real login/registration submit handling lives in
   login.html and signup.html, which verify credentials against
   accounts stored in localStorage ("bs_accounts"). There is no
   dashboard behind these — this site has no admin area. */
