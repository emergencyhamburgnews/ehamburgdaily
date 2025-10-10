// Simple Mobile Theme Toggle - No Animations
// This works independently from the main theme-toggle.js

function toggleMobileTheme() {
    const html = document.documentElement;
    const mobileThemeIcons = document.querySelectorAll('.mobile-theme-icon');
    
    // Check current theme
    const isDark = html.hasAttribute('data-theme') && html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        // Switch to light theme
        html.removeAttribute('data-theme');
        localStorage.setItem('theme-preference', 'light');
        
        // Update mobile icons to moon (for light theme)
        mobileThemeIcons.forEach(icon => {
            icon.textContent = '🌙';
        });
        
        // Update logo
        const logos = document.querySelectorAll('.main-logo');
        logos.forEach(logo => {
            logo.src = 'dark ehd logo.png';
        });
        
        console.log('Switched to light theme');
    } else {
        // Switch to dark theme
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme-preference', 'dark');
        
        // Update mobile icons to sun (for dark theme)
        mobileThemeIcons.forEach(icon => {
            icon.textContent = '☀️';
        });
        
        // Update logo
        const logos = document.querySelectorAll('.main-logo');
        logos.forEach(logo => {
            logo.src = 'eh white logo.png';
        });
        
        console.log('Switched to dark theme');
    }
    
    // Update desktop theme toggle if it exists (keep it in sync)
    if (window.themeManager) {
        try {
            window.themeManager.applyTheme(isDark ? 'light' : 'dark', false);
        } catch (e) {
            // Ignore errors if themeManager is not available
        }
    }
}

// Initialize mobile theme icons on page load
function initMobileThemeIcons() {
    const html = document.documentElement;
    const mobileThemeIcons = document.querySelectorAll('.mobile-theme-icon');
    
    // Check current theme
    const isDark = html.hasAttribute('data-theme') && html.getAttribute('data-theme') === 'dark';
    
    // Set correct icon based on current theme
    mobileThemeIcons.forEach(icon => {
        if (isDark) {
            icon.textContent = '☀️'; // Sun for dark theme
        } else {
            icon.textContent = '🌙'; // Moon for light theme
        }
    });
    
    console.log('Mobile theme icons initialized:', isDark ? 'dark theme (sun icon)' : 'light theme (moon icon)');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileThemeIcons);
} else {
    initMobileThemeIcons();
}

// Also initialize after a short delay to ensure themes are applied
setTimeout(initMobileThemeIcons, 100);