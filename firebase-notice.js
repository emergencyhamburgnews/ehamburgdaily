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
            const noticeBanner = document.getElementById('website-notice');
            const noticeText = noticeBanner.querySelector('.notice-text');
            const noticeIcon = noticeBanner.querySelector('.notice-icon');
            
            if (noticeBanner && noticeData.enabled) {
                noticeBanner.style.display = 'block';
                if (noticeText) {
                    // Use innerHTML to support HTML links
                    noticeText.innerHTML = noticeData.text || 'Notice';
                    console.log('Notice text set to:', noticeData.text);
                }
                if (noticeIcon) {
                    // Keep the default "!" icon, don't change it from Firebase
                    console.log('Notice icon kept as default "!"');
                }
                
                // Add class to header and main content to adjust positioning
                document.querySelector('.header').classList.add('with-notice');
                document.querySelector('.main-content').classList.add('with-notice');
                
                console.log('Notice banner displayed successfully');
            }
        } else {
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
    
    // Show loading banner immediately
    console.log('Showing loading banner...');
    const banner = document.getElementById('website-notice');
    if (banner) {
        console.log('Notice banner element found:', banner);
        banner.style.display = 'block';
        banner.style.background = '#2196F3';
        banner.style.color = 'white';
        const text = banner.querySelector('.notice-text');
        if (text) {
            text.textContent = 'Loading...';
            text.style.color = 'white';
            console.log('Loading banner displayed');
        }
    }
    
    // Then load from Firebase
    loadNoticeBanner();
    
    // Hide banner if Firebase fails to load within 5 seconds
    setTimeout(() => {
        const banner = document.getElementById('website-notice');
        const text = banner ? banner.querySelector('.notice-text') : null;
        if (text && text.textContent === 'Loading...') {
            console.log('Firebase loading timeout - hiding banner');
            banner.style.display = 'none';
        }
    }, 5000);
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
