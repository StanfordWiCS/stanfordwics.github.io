document.addEventListener('DOMContentLoaded', function() {
    
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
}); 