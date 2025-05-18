// Create and handle mobile navigation
document.addEventListener('DOMContentLoaded', () => {
    // Create mobile nav toggle
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-nav-toggle';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation');
    mobileToggle.setAttribute('type', 'button');
    mobileToggle.innerHTML = '☰';
    document.body.insertBefore(mobileToggle, document.body.firstChild);
    
    // Force display check on mobile
    if (window.innerWidth <= 768) {
        mobileToggle.style.display = 'flex';
    }
    
    // Create navigation
    const nav = document.createElement('nav');
    const navList = document.createElement('ul');
    navList.className = 'nav-main';
    
    const navItems = [
        { text: 'home', href: 'index.html' },
        { text: 'team', href: 'team.html' },
        { text: 'events', href: 'events.html' },
        { text: 'get involved', href: 'get-involved.html' }
    ];
    
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text;
        if (window.location.pathname.endsWith(item.href)) {
            li.classList.add('active');
        }
        li.appendChild(a);
        navList.appendChild(li);
    });
    
    nav.appendChild(navList);
    
    const socialDiv = document.createElement('div');
    socialDiv.className = 'nav-social';
    const socialList = document.createElement('ul');
    const socialLinks = [
        { text: 'instagram', href: 'https://instagram.com/stanfordwics' },
        { text: 'linkedin', href: 'https://linkedin.com/company/stanfordwics' }
    ];
    
    socialLinks.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        a.target = '_blank';
        li.appendChild(a);
        socialList.appendChild(li);
    });
    
    socialDiv.appendChild(socialList);
    nav.appendChild(socialDiv);
    
    document.body.insertBefore(nav, document.body.firstChild);

    mobileToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        mobileToggle.setAttribute('aria-expanded', 
            nav.classList.contains('active').toString());
    });

    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            nav.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('active')) {
            nav.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });
}); 