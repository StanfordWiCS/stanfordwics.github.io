// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // MOBILE NAV TOGGLE
    // ==========================================
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('nav');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            mobileToggle.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
    }
    
    // Close mobile nav when clicking a link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                nav.classList.remove('active');
                if (mobileToggle) {
                    mobileToggle.classList.remove('active');
                    mobileToggle.textContent = '☰';
                }
            }
        });
    });
    
    // ==========================================
    // SCROLL ANIMATIONS
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '80px 0px',
        threshold: 0.05
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            } else {
                if (!entry.target.classList.contains('reveal-once')) {
                    entry.target.classList.remove('revealed');
                }
            }
        });
    }, observerOptions);
    
    // Observe all elements with scroll-reveal classes
    const scrollRevealElements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
    );
    
    scrollRevealElements.forEach(element => {
        observer.observe(element);
    });
    
    // ==========================================
    // ACTIVE NAV LINK HIGHLIGHTING
    // ==========================================
    const sections = document.querySelectorAll('.page-section');
    const navItems = document.querySelectorAll('nav ul li');
    
    function updateActiveNavLink() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // Check if section is in viewport
            if (window.pageYOffset >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === `#${currentSection}`) {
                item.classList.add('active');
            }
        });
    }
    
    // Update on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Update on page load
    updateActiveNavLink();
    
    // ==========================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only prevent default for internal navigation links
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ==========================================
    // STAGGER ANIMATIONS FOR MULTIPLE ELEMENTS
    // ==========================================
    function addStaggerDelay() {
        // Add stagger delay to work items
        const workItems = document.querySelectorAll('.work-item');
        workItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.1}s`;
        });
        
        // Add stagger delay to team sections
        const teamSections = document.querySelectorAll('.team-section');
        teamSections.forEach((section, index) => {
            section.style.transitionDelay = `${index * 0.05}s`;
        });
        
        // Add stagger delay to program cards
        const programCards = document.querySelectorAll('.program-card');
        programCards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.15}s`;
        });
        
        // Add stagger delay to sponsor items
        const sponsorItems = document.querySelectorAll('.sponsor-item');
        sponsorItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.03}s`;
        });
    }
    
    addStaggerDelay();
    
    // ==========================================
    // PARALLAX EFFECT FOR FLOATING SHAPES (Optional)
    // ==========================================
    const floatingShapes = document.querySelectorAll('.floating-shape');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        floatingShapes.forEach((shape, index) => {
            const speed = 0.1 + (index * 0.02);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
    });
});