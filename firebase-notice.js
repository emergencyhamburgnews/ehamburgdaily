// Firebase Notice Banner System
// Based on MyWebsite2 notice banner implementation

// Load notice banner from Firebase
async function loadNoticeBanner() {
    try {
        console.log('=== LOADING NOTICE BANNER ===');
        
        // Check if Firebase is available
        if (typeof db === 'undefined') {
            console.error('Firebase db is undefined!');
            document.getElementById('website-notice').style.display = 'none';
            return;
        }
        
        if (typeof collection === 'undefined') {
            console.error('Firebase collection function is undefined!');
            document.getElementById('website-notice').style.display = 'none';
            return;
        }
        
        console.log('Firebase functions available, loading notice banner...');
        
        // Load notice data from Firebase
        const noticeRef = collection(db, 'notice');
        const noticeSnapshot = await getDocs(noticeRef);
        
        let noticeData = null;
        noticeSnapshot.forEach((doc) => {
            const data = doc.data();
            noticeData = data; // Use the first document in the notice collection
        });
        
        console.log('Notice data from Firebase:', noticeData);
        
        if (noticeData && noticeData.enabled) {
            // Cache the enabled state in localStorage
            localStorage.setItem('noticeBannerEnabled', 'true');
            localStorage.setItem('noticeBannerText', noticeData.text || 'Notice');
            
            const noticeBanner = document.getElementById('website-notice');
            const noticeText = noticeBanner.querySelector('.notice-text');
            const noticeIcon = noticeBanner.querySelector('.notice-icon');
            
            if (noticeBanner && noticeData.enabled) {
                noticeBanner.style.display = 'block';
                // Force visibility on mobile
                noticeBanner.style.visibility = 'visible';
                noticeBanner.style.opacity = '1';
                if (noticeText) {
                    // Use innerHTML to support HTML links
                    noticeText.innerHTML = noticeData.text || 'Notice';
                    console.log('Notice text set to:', noticeData.text);
                    
                    // Auto-adjust banner size based on text length
                    adjustBannerSize(noticeBanner, noticeData.text);
                }
                if (noticeIcon) {
                    // Keep the default "!" icon, don't change it from Firebase
                    console.log('Notice icon kept as default "!"');
                }
                
                // Add class to header and main content to adjust positioning
                const header = document.querySelector('.header');
                const mainContent = document.querySelector('.main-content');
                header.classList.add('with-notice');
                mainContent.classList.add('with-notice');
                
                console.log('Notice banner displayed successfully and cached');
            }
        } else {
            // Cache the disabled state in localStorage
            localStorage.setItem('noticeBannerEnabled', 'false');
            
            console.log('Notice banner disabled or no data found - hiding banner');
            const noticeBanner = document.getElementById('website-notice');
            if (noticeBanner) {
                noticeBanner.style.display = 'none';
            }
            
            // Remove class from header and main content
            document.querySelector('.header').classList.remove('with-notice');
            document.querySelector('.main-content').classList.remove('with-notice');
        }
    } catch (error) {
        console.error('Error loading notice banner:', error);
        document.getElementById('website-notice').style.display = 'none';
    }
}

// Refresh notice banner when settings change
function refreshNoticeBanner() {
    console.log('Refreshing notice banner...');
    loadNoticeBanner();
}

// Test notice banner display
function testNoticeBannerDisplay() {
    const banner = document.getElementById('website-notice');
    if (banner) {
        console.log('Notice banner element found:', banner);
        console.log('Notice banner display style:', banner.style.display);
        console.log('Notice banner computed style:', window.getComputedStyle(banner).display);
        
        // Temporarily show banner for testing
        banner.style.display = 'block';
        banner.style.background = '#ff6b35'; // Orange for testing
        
        setTimeout(() => {
            banner.style.background = '#ff0000'; // Back to red
            loadNoticeBanner(); // Reload proper settings
        }, 3000);
    } else {
        console.error('Notice banner element not found!');
    }
}

// Force show notice banner with custom message (for testing)
function forceShowNoticeBanner(text = 'Test notice from console', icon = '⚠️') {
    console.log('Forcing notice banner to show with text:', text);
    const banner = document.getElementById('website-notice');
    const bannerText = banner.querySelector('.notice-text');
    const bannerIcon = banner.querySelector('.notice-icon');
    
    if (banner && bannerText && bannerIcon) {
        bannerText.textContent = text;
        bannerIcon.textContent = icon;
        banner.style.display = 'block';
        document.querySelector('.header').classList.add('with-notice');
        document.querySelector('.main-content').classList.add('with-notice');
        console.log('Notice banner forced to show!');
    } else {
        console.error('Notice banner elements not found!');
    }
}

// Initialize notice banner when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing notice banner...');

    // Check if we have cached banner state in localStorage
    const cachedBannerState = localStorage.getItem('noticeBannerEnabled');
    console.log('Cached banner state:', cachedBannerState);
    
    const banner = document.getElementById('website-notice');
    if (banner) {
        // If we have cached state, use it immediately while Firebase loads
        if (cachedBannerState === 'true') {
            console.log('Using cached enabled state');
            banner.style.display = 'block';
            banner.style.background = '#2196F3';
            banner.style.color = 'white';
            const text = banner.querySelector('.notice-text');
            if (text) {
                text.textContent = 'Loading notice...';
                text.style.color = 'white';
            }
        } else if (cachedBannerState === 'false') {
            console.log('Using cached disabled state');
            banner.style.display = 'none';
        } else {
            // No cached state, show loading
            console.log('No cached state, showing loading banner...');
            banner.style.display = 'block';
            banner.style.background = '#2196F3';
            banner.style.color = 'white';
            const text = banner.querySelector('.notice-text');
            if (text) {
                text.textContent = 'Loading...';
                text.style.color = 'white';
            }
        }
    }

    // Then load from Firebase to get the most up-to-date state
    loadNoticeBanner();

    // Hide banner if Firebase fails to load within 8 seconds
    setTimeout(() => {
        const banner = document.getElementById('website-notice');
        const text = banner ? banner.querySelector('.notice-text') : null;
        if (text && (text.textContent === 'Loading...' || text.textContent === 'Loading notice...')) {
            console.log('Firebase loading timeout - using cached state or hiding banner');
            if (cachedBannerState !== 'true') {
                banner.style.display = 'none';
            }
        }
    }, 8000);
    
    // Fix mobile browser jumping
    fixMobileScrollJumping();
    
    // Ensure banner is visible on mobile
    ensureMobileBannerVisibility();
});

// Listen for real-time updates
if (typeof window !== 'undefined') {
    // Listen for localStorage changes (from settings page)
    window.addEventListener('storage', function(e) {
        if (e.key === 'noticeBannerUpdate') {
            try {
                const update = JSON.parse(e.newValue);
                console.log('Notice banner update received:', update);
                updateNoticeBannerFromSettings(update.enabled);
            } catch (error) {
                console.error('Error parsing notice banner update:', error);
            }
        }
    });
    
    // Listen for custom events (same page updates)
    window.addEventListener('noticeBannerUpdate', function(e) {
        console.log('Notice banner update event received:', e.detail);
        updateNoticeBannerFromSettings(e.detail.enabled);
    });
    
    // Make functions available globally for testing
    window.testNoticeBannerDisplay = testNoticeBannerDisplay;
    window.refreshNoticeBanner = refreshNoticeBanner;
    window.loadNoticeBanner = loadNoticeBanner;
    window.forceShowNoticeBanner = forceShowNoticeBanner;
}

// Update notice banner from settings (fast update)
function updateNoticeBannerFromSettings(enabled) {
    console.log('Updating notice banner from settings, enabled:', enabled);
    const banner = document.getElementById('website-notice');
    
    if (banner) {
        if (enabled) {
            banner.style.display = 'block';
            // Add class to header and main content to adjust positioning
            document.querySelector('.header').classList.add('with-notice');
            document.querySelector('.main-content').classList.add('with-notice');
            
            // Load content from Firebase when enabled
            loadNoticeBanner();
            console.log('Notice banner enabled from settings');
        } else {
            banner.style.display = 'none';
            // Remove class from header and main content
            document.querySelector('.header').classList.remove('with-notice');
            document.querySelector('.main-content').classList.remove('with-notice');
            console.log('Notice banner disabled from settings');
        }
    } else {
        console.error('Notice banner element not found for settings update');
    }
}

// Function to automatically adjust banner size based on text length
function adjustBannerSize(banner, text) {
    if (!banner || !text) return;
    
    // Remove existing size classes from banner and header
    banner.classList.remove('long-text', 'very-long-text');
    const header = document.querySelector('.header');
    if (header) {
        header.classList.remove('long-text', 'very-long-text');
    }
    
    // Calculate text length (remove HTML tags for accurate count)
    const textLength = text.replace(/<[^>]*>/g, '').length;
    
    console.log('Text length:', textLength, 'characters');
    
    // Apply appropriate size class based on text length
    if (textLength > 200) {
        // Very long text - smaller font, more padding
        banner.classList.add('very-long-text');
        if (header) header.classList.add('very-long-text');
        console.log('Applied very-long-text class for', textLength, 'characters');
    } else if (textLength > 100) {
        // Long text - medium font, more padding
        banner.classList.add('long-text');
        if (header) header.classList.add('long-text');
        console.log('Applied long-text class for', textLength, 'characters');
    } else {
        // Short text - default styling
        console.log('Using default styling for', textLength, 'characters');
    }
    
    // Force a reflow to ensure styles are applied
    banner.offsetHeight;
}

// Fix mobile browser scroll jumping
function fixMobileScrollJumping() {
    console.log('Applying mobile scroll jumping fixes...');
    
    // Fix viewport height issues on mobile
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Set initial viewport height
    setViewportHeight();
    
    // Update on resize
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    console.log('Mobile scroll jumping fixes applied');
}

// Ensure notice banner is visible on mobile devices
function ensureMobileBannerVisibility() {
    console.log('Ensuring mobile banner visibility...');
    
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) {
        console.log('Mobile device detected, ensuring banner visibility...');
        
        // Only apply mobile fixes, don't force display
        const banner = document.getElementById('website-notice');
        if (banner) {
            // Only apply positioning fixes, don't override display
            banner.style.position = 'fixed';
            banner.style.top = '0';
            banner.style.left = '0';
            banner.style.right = '0';
            banner.style.width = '100%';
            banner.style.zIndex = '1002';
            
            console.log('Mobile banner positioning applied');
        }
    }
}
