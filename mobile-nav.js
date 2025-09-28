// Unified Mobile Navigation - Single File for All Pages
document.addEventListener('DOMContentLoaded', function() {
    // Get mobile navigation elements
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMobile = document.getElementById('nav-mobile');
    
    // Check if elements exist
    if (!hamburgerMenu || !navMobile) {
        console.log('Mobile navigation elements not found');
        return;
    }
    
    // Toggle mobile menu function
    function toggleMobileMenu() {
        const isActive = navMobile.classList.contains('active');
        
        if (isActive) {
            navMobile.classList.remove('active');
            hamburgerMenu.classList.remove('active');
        } else {
            navMobile.classList.add('active');
            hamburgerMenu.classList.add('active');
        }
    }
    
    // Close mobile menu function
    function closeMobileMenu() {
        navMobile.classList.remove('active');
        hamburgerMenu.classList.remove('active');
    }
    
    // Hamburger menu click
    hamburgerMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close when clicking nav buttons
    const navButtons = navMobile.querySelectorAll('.nav-btn');
    navButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburgerMenu.contains(e.target) && !navMobile.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close on window resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Navigation button handlers
    const allNavButtons = document.querySelectorAll('.nav-btn');
    
    allNavButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = e.target.textContent;
            
            if (buttonText === 'Home') {
                if (window.location.pathname.includes('about.html')) {
                    window.location.href = 'index.html';
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else if (buttonText === 'About') {
                if (window.location.pathname.includes('index.html')) {
                    window.location.href = 'about.html';
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    });
});
