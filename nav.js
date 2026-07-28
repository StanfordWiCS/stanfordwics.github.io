document.addEventListener('DOMContentLoaded', function () {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('nav');

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('active');
            mobileToggle.classList.toggle('active', isOpen);
            mobileToggle.textContent = isOpen ? '✕' : '☰';
            mobileToggle.setAttribute('aria-expanded', isOpen.toString());
        });

        document.addEventListener('click', function (e) {
            if (
                nav.classList.contains('active') &&
                !nav.contains(e.target) &&
                !mobileToggle.contains(e.target)
            ) {
                nav.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.textContent = '☰';
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && nav.classList.contains('active')) {
                nav.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.textContent = '☰';
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Close mobile nav when clicking a nav link
    document.querySelectorAll('nav a').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768 && nav && mobileToggle) {
                nav.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.textContent = '☰';
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Scroll-reveal blur animations
    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                } else if (!entry.target.classList.contains('reveal-once')) {
                    entry.target.classList.remove('revealed');
                }
            });
        },
        {
            root: null,
            rootMargin: '80px 0px',
            threshold: 0.05
        }
    );

    document
        .querySelectorAll(
            '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
        )
        .forEach(function (el) {
            observer.observe(el);
        });

    // Active nav highlighting based on scroll position
    const sections = document.querySelectorAll('.page-section');
    const navItems = document.querySelectorAll('.nav-main li');

    function updateActiveNavLink() {
        let currentSection = 'home';

        sections.forEach(function (section) {
            if (window.pageYOffset >= section.offsetTop - 200) {
                currentSection = section.getAttribute('id') || currentSection;
            }
        });

        navItems.forEach(function (item) {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === '#' + currentSection) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();

    // Smooth scroll for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            window.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
            history.pushState(null, '', href);
        });
    });

    // Stagger delays
    document.querySelectorAll('.work-item').forEach(function (item, index) {
        item.style.transitionDelay = index * 0.1 + 's';
    });
    document.querySelectorAll('.team-section').forEach(function (section, index) {
        section.style.transitionDelay = index * 0.05 + 's';
    });
    document.querySelectorAll('.program-card').forEach(function (card, index) {
        card.style.transitionDelay = index * 0.15 + 's';
    });
    document.querySelectorAll('.sponsor-item').forEach(function (item, index) {
        item.style.transitionDelay = index * 0.03 + 's';
    });

    // Honor deep link on load
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            requestAnimationFrame(function () {
                window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
            });
        }
    }
});
