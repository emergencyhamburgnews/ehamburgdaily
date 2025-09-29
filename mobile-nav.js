// Unified Mobile Navigation - Off Canvas Slide Out
document.addEventListener('DOMContentLoaded', function() {
    // Get mobile navigation elements
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMobile = document.getElementById('nav-mobile');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    // Check if elements exist
    if (!hamburgerMenu || !navMobile || !mobileOverlay) {
        console.log('Mobile navigation elements not found');
        return;
    }
    
    // Toggle mobile menu function
    function toggleMobileMenu() {
        const isActive = navMobile.classList.contains('active');
        
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    
    // Open mobile menu function
    function openMobileMenu() {
        navMobile.classList.add('active');
        mobileOverlay.classList.add('active');
        hamburgerMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }
    
    // Close mobile menu function
    function closeMobileMenu() {
        navMobile.classList.remove('active');
        mobileOverlay.classList.remove('active');
        hamburgerMenu.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scroll
    }
    
    // Hamburger menu click
    hamburgerMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close when clicking overlay
    mobileOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });
    
    // Close when clicking nav section items
    const navSectionItems = navMobile.querySelectorAll('.nav-section-item');
    navSectionItems.forEach(function(item) {
        item.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    // Close on window resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
});
