// ================================
// THEME TOGGLE SYSTEM - ENHANCED
// ================================

// Apply theme IMMEDIATELY to prevent any flash
(function() {
    const storedTheme = localStorage.getItem('theme-preference');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = storedTheme || systemTheme;
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
})();

class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        // Ensure theme is applied
        this.applyThemeImmediate(this.theme);
        
        // Set up theme toggle buttons when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggleButtons());
        } else {
            this.setupToggleButtons();
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.theme, true);
            }
        });
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('theme-preference');
    }

    storeTheme(theme) {
        if (theme) {
            localStorage.setItem('theme-preference', theme);
        } else {
            localStorage.removeItem('theme-preference');
        }
    }

    // Immediate theme application without animations (for page load)
    applyThemeImmediate(theme) {
        const html = document.documentElement;
        
        // Apply the theme immediately without transitions
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }

        // Update meta theme-color immediately
        this.updateMetaThemeColor(theme);
        
        this.theme = theme;
    }

    applyTheme(theme, animate = true) {
        const html = document.documentElement;
        
        // Add transition class for smooth theme switching
        if (animate) {
            html.classList.add('theme-transitioning');
        }

        // Apply the theme
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }

        // Update logo sources
        this.updateLogos(theme);

        // Update toggle button states
        this.updateToggleButtons(theme);

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);

        // Remove transition class after animation completes
        if (animate) {
            setTimeout(() => {
                html.classList.remove('theme-transitioning');
            }, 300);
        }

        this.theme = theme;
    }

    updateLogos(theme) {
        const logos = document.querySelectorAll('.main-logo');
        logos.forEach(logo => {
            if (theme === 'dark') {
                logo.src = 'eh white logo.png';
                logo.alt = 'EHAMBURG DAILY - Dark Mode';
            } else {
                logo.src = 'dark ehd logo.png';
                logo.alt = 'EHAMBURG DAILY - Light Mode';
            }
        });
    }

    updateToggleButtons(theme) {
        const toggleButtons = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile');
        toggleButtons.forEach(button => {
            const icon = button.querySelector('.theme-icon');
            if (theme === 'dark') {
                button.classList.add('active');
                button.setAttribute('aria-label', 'Switch to light mode');
                button.title = 'Switch to light mode';
                if (icon) {
                    // Preserve existing icon size (mobile uses 28x28, desktop uses 18x18)
                    const existingSvg = icon.querySelector('svg');
                    const iconSize = existingSvg ? existingSvg.getAttribute('width') || '18' : '18';
                    icon.innerHTML = `
                        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    `;
                }
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-label', 'Switch to dark mode');
                button.title = 'Switch to dark mode';
                if (icon) {
                    // Preserve existing icon size (mobile uses 28x28, desktop uses 18x18)
                    const existingSvg = icon.querySelector('svg');
                    const iconSize = existingSvg ? existingSvg.getAttribute('width') || '18' : '18';
                    icon.innerHTML = `
                        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    `;
                }
            }
        });
    }

    updateMetaThemeColor(theme) {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
        }
        
        if (theme === 'dark') {
            themeColorMeta.content = '#121212';
        } else {
            themeColorMeta.content = '#ffffff';
        }
    }

    setupToggleButtons() {
        try {
            const toggleButtons = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile');
            
            if (toggleButtons.length === 0) {
                console.warn('No theme toggle buttons found');
                return;
            }
            
            console.log(`Found ${toggleButtons.length} theme toggle buttons`);
            
            toggleButtons.forEach(button => {
                // Remove existing listeners to prevent duplicates
                button.removeEventListener('click', this.handleToggleClick);
                button.removeEventListener('keydown', this.handleToggleKeydown);
                
                // Add new listeners
                button.addEventListener('click', this.handleToggleClick.bind(this));
                button.addEventListener('keydown', this.handleToggleKeydown.bind(this));
                
                console.log('Theme toggle button setup:', button.className);
            });

            // Initial button state update
            this.updateToggleButtons(this.theme);
        } catch (error) {
            console.error('Error setting up theme toggle buttons:', error);
        }
    }
    
    handleToggleClick() {
        this.toggleTheme();
    }
    
    handleToggleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleTheme();
        }
    }

    toggleTheme() {
        try {
            const newTheme = this.theme === 'dark' ? 'light' : 'dark';
            this.storeTheme(newTheme);
            this.applyTheme(newTheme, true);

            // Add a subtle haptic feedback for mobile devices
            if ('vibrate' in navigator) {
                try {
                    navigator.vibrate(50);
                } catch (e) {
                    // Ignore vibration errors
                }
            }

            // Dispatch custom event for other components to listen to
            try {
                const event = new CustomEvent('themeChanged', {
                    detail: { theme: newTheme, previousTheme: this.theme }
                });
                document.dispatchEvent(event);
            } catch (e) {
                console.warn('Could not dispatch theme change event:', e);
            }

            console.log(`Theme switched to: ${newTheme}`);
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    getCurrentTheme() {
        return this.theme;
    }

    // Method to manually set theme (useful for settings page)
    setTheme(theme) {
        if (theme === 'auto') {
            this.storeTheme(null);
            this.theme = this.getSystemTheme();
        } else {
            this.storeTheme(theme);
            this.theme = theme;
        }
        this.applyTheme(this.theme, true);
    }
}

// Initialize theme manager safely
try {
    // Prevent multiple initializations
    if (!window.themeManager) {
        let themeManager;
        
        // Initialize immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                try {
                    themeManager = new ThemeManager();
                    window.themeManager = themeManager;
                } catch (error) {
                    console.error('Failed to initialize theme manager on DOM ready:', error);
                }
            });
        } else {
            themeManager = new ThemeManager();
            window.themeManager = themeManager;
        }
    } else {
        // If theme manager exists, just re-setup buttons
        try {
            window.themeManager.setupToggleButtons();
        } catch (error) {
            console.warn('Failed to re-setup theme toggle buttons:', error);
        }
    }
} catch (error) {
    console.error('Critical error initializing theme system:', error);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
