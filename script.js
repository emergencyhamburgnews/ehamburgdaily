// DOM Elements
const loadingSpinner = document.getElementById('loading-spinner');
const newsGrid = document.getElementById('news-grid');
const gameUpdateTitle = document.getElementById('game-update-title');
const gameUpdateInfo = document.getElementById('game-update-info');

// Firebase helper functions and error handling
const FIREBASE_TIMEOUT = 15000; // 15 seconds timeout
const MAX_RETRIES = 3;

// Check if Firebase is properly initialized
function isFirebaseInitialized() {
    try {
        return (
            typeof window !== 'undefined' &&
            typeof window.db !== 'undefined' &&
            window.db !== null &&
            typeof collection !== 'undefined' &&
            typeof getDocs !== 'undefined' &&
            typeof query !== 'undefined' &&
            typeof orderBy !== 'undefined'
        );
    } catch (error) {
        console.error('Error checking Firebase initialization:', error);
        return false;
    }
}

// Create a promise with timeout
function withTimeout(promise, timeoutMs = FIREBASE_TIMEOUT, operation = 'Firebase operation') {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        })
    ]);
}

// Retry mechanism for Firebase operations
async function withRetry(operation, maxRetries = MAX_RETRIES, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            console.warn(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
}

// Enhanced logging function
function logOperation(operation, status, data = null, error = null) {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        operation,
        status,
        ...(data && { data }),
        ...(error && { error: error.message })
    };
    
    if (status === 'error') {
        console.error(`[${timestamp}] ${operation} FAILED:`, logData);
    } else {
        console.log(`[${timestamp}] ${operation} ${status.toUpperCase()}:`, logData);
    }
}

// Show user-friendly error message using settings page design
function showUserError(message, details = null, duration = 5000) {
    console.error('User Error:', message, details);
    
    // Only show non-critical errors to user
    // Skip news loading errors as they're handled gracefully with fallbacks
    const criticalErrors = [
        'Failed to initialize application',
        'Loading is taking longer than expected'
    ];
    
    const isCritical = criticalErrors.some(error => message.includes(error));
    if (!isCritical && message.includes('news')) {
        // Don't show news loading errors - they're annoying and handled gracefully
        return;
    }
    
    showMessage('error', message, duration);
}

// Show message using settings page design pattern
function showMessage(type, message, duration = 5000) {
    // Create message container if it doesn't exist
    let container = document.getElementById('message-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'message-container';
        container.className = 'message-container';
        document.body.appendChild(container);
    }
    
    const messageId = 'msg-' + Date.now();
    
    const toast = document.createElement('div');
    toast.id = messageId;
    toast.className = `message-toast ${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>';
    } else if (type === 'error') {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
        iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
    
    toast.innerHTML = `
        <div class="message-icon">${iconSvg}</div>
        <div class="message-text">${message}</div>
        <button class="message-close" onclick="removeMessage('${messageId}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        removeMessage(messageId);
    }, duration);
}

// Remove message toast
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.classList.add('removing');
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }
}

// Removed old featured article function - using single news system now

// Removed old loadLatestNews function - using loadAllNews now

// Removed old updateFeaturedArticle function - using single news system now

function displayNewsGrid(newsData) {
    newsGrid.innerHTML = '';
    
    newsData.forEach(article => {
        const newsItem = createNewsItem(article);
        newsGrid.appendChild(newsItem);
    });
}

function createNewsItem(article) {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    
    const date = article.timestamp ? 
        (article.timestamp.toDate ? article.timestamp.toDate() : new Date(article.timestamp)) : 
        new Date();
    
    // Handle image/video for news items
    console.log('Latest news article:', article); // Debug log
    console.log('Article image URL:', article.imageUrl); // Debug log
    console.log('Article video URL:', article.videoUrl); // Debug log
    
    let mediaContent = '<span>Image/Video</span>';
    if (article.videoUrl) {
        console.log('Article videoUrl:', article.videoUrl);
        // Handle YouTube videos
        if (article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be')) {
            let videoId = '';
            if (article.videoUrl.includes('youtu.be/')) {
                videoId = article.videoUrl.split('youtu.be/')[1].split('?')[0];
            } else if (article.videoUrl.includes('youtube.com/watch?v=')) {
                videoId = article.videoUrl.split('v=')[1].split('&')[0];
            } else if (article.videoUrl.includes('youtube.com/embed/')) {
                videoId = article.videoUrl.split('embed/')[1].split('?')[0];
            }
            
            if (videoId) {
                mediaContent = `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" frameborder="0" allowfullscreen style="width: 100%; height: 100%;" onerror="console.log('YouTube embed error for video:', '${videoId}')"></iframe>`;
            } else {
                mediaContent = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #666;">
                    <div style="text-align: center;">
                        <p>Invalid YouTube URL</p>
                        <a href="${article.videoUrl}" target="_blank" style="color: #ff6b35;">Open in YouTube</a>
                    </div>
                </div>`;
            }
        } 
        // Handle Vimeo videos
        else if (article.videoUrl.includes('vimeo.com')) {
            const videoId = article.videoUrl.split('vimeo.com/')[1];
            mediaContent = `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen style="width: 100%; height: 100%;"></iframe>`;
        }
        // Handle Imgur gallery links - Pure video only
        else if (article.videoUrl.includes('imgur.com/a/')) {
            const galleryId = article.videoUrl.split('imgur.com/a/')[1];
            // Pure video player - no logos, no buttons, just video
            mediaContent = `<video controls preload="metadata" style="width: 100%; height: 100%; object-fit: cover; background: #000;" onloadstart="console.log('Video loading started:', this.src)" onloadedmetadata="console.log('Video metadata loaded:', this.duration)" onerror="console.log('Video error:', this.error)">
                <source src="https://i.imgur.com/${galleryId}.mp4" type="video/mp4">
                <source src="https://i.imgur.com/${galleryId}.webm" type="video/webm">
                <source src="https://i.imgur.com/${galleryId}.gifv" type="video/mp4">
                <source src="https://i.imgur.com/${galleryId}.mov" type="video/quicktime">
            </video>`;
        }
        // Handle regular Imgur links
        else if (article.videoUrl.includes('imgur.com/')) {
            if (article.videoUrl.includes('/a/')) {
                // Gallery link - pure video only
                const galleryId = article.videoUrl.split('/a/')[1];
                mediaContent = `<video controls preload="metadata" style="width: 100%; height: 100%; object-fit: cover; background: #000;" onloadstart="console.log('Video loading started:', this.src)" onloadedmetadata="console.log('Video metadata loaded:', this.duration)" onerror="console.log('Video error:', this.error)">
                    <source src="https://i.imgur.com/${galleryId}.mp4" type="video/mp4">
                    <source src="https://i.imgur.com/${galleryId}.webm" type="video/webm">
                    <source src="https://i.imgur.com/${galleryId}.gifv" type="video/mp4">
                    <source src="https://i.imgur.com/${galleryId}.mov" type="video/quicktime">
                </video>`;
            } else {
                // Try to get direct video link from Imgur
                const imgurId = article.videoUrl.split('imgur.com/')[1].split('.')[0];
                // Try multiple Imgur direct link formats
                mediaContent = `
                    <video controls preload="metadata" style="width: 100%; height: 100%; object-fit: cover;" onloadstart="console.log('Video loading started:', this.src)" onloadedmetadata="console.log('Video metadata loaded:', this.duration)" onerror="console.log('Video error:', this.error)">
                        <source src="https://i.imgur.com/${imgurId}.mp4" type="video/mp4">
                        <source src="https://i.imgur.com/${imgurId}.webm" type="video/webm">
                        <source src="https://i.imgur.com/${imgurId}.gifv" type="video/mp4">
                        <p>Video not supported. <a href="${article.videoUrl}" target="_blank" style="color: #ff6b35;">Click to view on Imgur</a></p>
                    </video>
                `;
            }
        } 
        // Handle direct video files (MP4, WebM, etc.)
        else {
            // Check if it's a direct video file
            const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
            const isVideoFile = videoExtensions.some(ext => article.videoUrl.toLowerCase().includes(ext));
            
            if (isVideoFile) {
                // Determine video type based on extension
                let videoType = 'video/mp4';
                if (article.videoUrl.toLowerCase().includes('.webm')) videoType = 'video/webm';
                else if (article.videoUrl.toLowerCase().includes('.ogg')) videoType = 'video/ogg';
                else if (article.videoUrl.toLowerCase().includes('.mov')) videoType = 'video/quicktime';
                else if (article.videoUrl.toLowerCase().includes('.avi')) videoType = 'video/x-msvideo';
                
                mediaContent = `<video controls preload="metadata" style="width: 100%; height: 100%; object-fit: cover;" onloadstart="console.log('Video loading started:', this.src)" onloadedmetadata="console.log('Video metadata loaded:', this.duration)" onerror="console.log('Video error:', this.error)">
                    <source src="${article.videoUrl}" type="${videoType}">
                    <source src="${article.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`;
            } else {
                // Try as direct video URL with multiple formats
                mediaContent = `<video controls preload="metadata" style="width: 100%; height: 100%; object-fit: cover;" onloadstart="console.log('Video loading started:', this.src)" onloadedmetadata="console.log('Video metadata loaded:', this.duration)" onerror="console.log('Video error:', this.error)">
                    <source src="${article.videoUrl}" type="video/mp4">
                    <source src="${article.videoUrl}" type="video/webm">
                    Your browser does not support the video tag.
                </video>`;
            }
        }
    } else if (article.imageUrl) {
        console.log('Article imageUrl:', article.imageUrl);
        
        // Check if imageUrl is actually a video
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
        const isVideoFile = videoExtensions.some(ext => article.imageUrl.toLowerCase().includes(ext));
        
        if (isVideoFile) {
            // Handle video in imageUrl field
            let videoType = 'video/mp4';
            if (article.imageUrl.toLowerCase().includes('.webm')) videoType = 'video/webm';
            else if (article.imageUrl.toLowerCase().includes('.ogg')) videoType = 'video/ogg';
            else if (article.imageUrl.toLowerCase().includes('.mov')) videoType = 'video/quicktime';
            else if (article.imageUrl.toLowerCase().includes('.avi')) videoType = 'video/x-msvideo';
            
            mediaContent = `<video controls preload="metadata" style="width: 100%; height: 100%; object-fit: cover;" onloadstart="console.log('Video loading started:', this.src)" onloadedmetadata="console.log('Video metadata loaded:', this.duration)" onerror="console.log('Video error:', this.error)">
                <source src="${article.imageUrl}" type="${videoType}">
                <source src="${article.imageUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
        } else {
            // Handle image files
            let imageSrc = article.imageUrl;
            if (!imageSrc.startsWith('http') && !imageSrc.startsWith('./')) {
                imageSrc = './' + imageSrc;
            }
            console.log('Final image source:', imageSrc);
            mediaContent = `<img src="${imageSrc}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<span style=&quot;color:red;&quot;>Image not found: ${imageSrc}</span>';" onload="console.log('Image loaded:', this.src);">`;
        }
    } else {
        console.log('No imageUrl for article:', article);
        mediaContent = '<span>Image/Video</span>';
    }

    newsItem.innerHTML = `
        <div class="news-item-image" 
             onclick="openArticle('${article.id}')" 
             oncontextmenu="openArticle('${article.id}', event)"
             ontouchstart="handleTouchStart(event, '${article.id}')"
             ontouchend="handleTouchEnd(event, '${article.id}')">
            ${mediaContent}
            <div class="share-overlay" style="display: none;">
                <div class="share-message">Hold to copy link</div>
            </div>
        </div>
        <div class="news-item-info" 
             onclick="openArticle('${article.id}')" 
             oncontextmenu="openArticle('${article.id}', event)"
             ontouchstart="handleTouchStart(event, '${article.id}')"
             ontouchend="handleTouchEnd(event, '${article.id}')">
            <div class="news-item-header">
                <div class="news-item-date">${date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
            </div>
            <div class="news-item-title">${article.title || 'Title'}</div>
            <div class="news-item-description">${article.description || 'Description'}</div>
        </div>
    `;
    
    return newsItem;
}

// Function to open article
function openArticle(articleId, event = null) {
    // If it's a right-click or long press, copy link instead
    if (event && (event.type === 'contextmenu' || event.type === 'touchend')) {
        event.preventDefault();
        copyArticleLink(articleId);
        return;
    }
    
    console.log('Opening article:', articleId);
    // Navigate to individual article page
    window.location.href = `article.html?id=${articleId}`;
}

// Load social media settings from Firebase
async function loadSocialMediaSettings() {
    try {
        console.log('Loading social media settings from Firebase...');
        
        // Check if Firebase is available
        if (typeof db === 'undefined') {
            console.log('Firebase not available, using default settings');
            return;
        }
        
        // Get social media settings from Firebase
        const socialRef = collection(db, 'socialSettings');
        const socialSnapshot = await getDocs(socialRef);
        
        if (!socialSnapshot.empty) {
            const settings = socialSnapshot.docs[0].data();
            console.log('Social media settings:', settings);
            
            // Update meta tags with Firebase settings
            updateSocialMetaTags(settings);
        } else {
            console.log('No social media settings found in Firebase');
        }
    } catch (error) {
        console.error('Error loading social media settings:', error);
    }
}

// Update social media meta tags from Firebase
function updateSocialMetaTags(settings) {
    // Update Open Graph tags
    if (settings.title) {
        document.getElementById('og-title').setAttribute('content', settings.title);
        document.getElementById('twitter-title').setAttribute('content', settings.title);
    }
    
    if (settings.description) {
        document.getElementById('og-description').setAttribute('content', settings.description);
        document.getElementById('twitter-description').setAttribute('content', settings.description);
        document.getElementById('meta-description').setAttribute('content', settings.description);
    }
    
    if (settings.image) {
        // Handle image URL
        let socialImage = settings.image;
        if (socialImage && !socialImage.startsWith('http')) {
            // If it's a local image, make it a full URL
            socialImage = window.location.origin + (socialImage.startsWith('/') ? socialImage : '/' + socialImage);
        }
        
        // Check if image is actually a video (don't use video for social sharing)
        if (socialImage && (socialImage.includes('.mp4') || socialImage.includes('.webm') || socialImage.includes('.mov'))) {
            console.log('Image URL appears to be a video, using fallback image');
            socialImage = './news1.jpg'; // Use fallback image for videos
        }
        
        if (socialImage) {
            document.getElementById('og-image').setAttribute('content', socialImage);
            document.getElementById('og-image-secure').setAttribute('content', socialImage);
            document.getElementById('twitter-image').setAttribute('content', socialImage);
        }
    }
    
    // Update URL
    let currentUrl = window.location.origin + window.location.pathname;
    if (currentUrl.includes('/index.html')) {
        currentUrl = currentUrl.replace('/index.html', '/');
    }
    if (currentUrl.endsWith('/')) {
        currentUrl = currentUrl.slice(0, -1);
    }
    document.getElementById('og-url').setAttribute('content', currentUrl);
    
    console.log('Social media meta tags updated from Firebase');
}


function displayPlaceholderNews() {
    const placeholderNews = [
        {
            title: 'Breaking News',
            description: 'Stay tuned for the latest updates and stories.',
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        },
        {
            title: 'Local Events',
            description: 'Discover what\'s happening in your community.',
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        },
        {
            title: 'Community Spotlight',
            description: 'Highlighting the people and stories that matter.',
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        }
    ];
    
    displayNewsGrid(placeholderNews);
}

// Enhanced loading state management
let loadingOperations = new Set();
let loadingTimeout = null;

// Show loading with operation tracking
function showLoading(operationId = 'default') {
    if (loadingSpinner) {
        loadingOperations.add(operationId);
        loadingSpinner.style.display = 'block';
        
        // Add loading class to body for global loading styles
        document.body.classList.add('loading');
        
        logOperation('loadingManager', 'show_loading', {
            operationId,
            activeOperations: Array.from(loadingOperations)
        });
        
        // Set a maximum loading timeout (30 seconds)
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
        
        loadingTimeout = setTimeout(() => {
            logOperation('loadingManager', 'loading_timeout_reached');
            console.warn('Loading timeout reached - force hiding loading spinner');
            hideLoading('timeout');
        }, 20000);
    }
}

// Hide loading with operation tracking
function hideLoading(operationId = 'default') {
    if (operationId === 'timeout') {
        // Force hide loading on timeout
        loadingOperations.clear();
    } else {
        loadingOperations.delete(operationId);
    }
    
    // Only hide loading spinner if no operations are running
    if (loadingOperations.size === 0) {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        // Remove loading class from body
        document.body.classList.remove('loading');
        
        // Clear timeout
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
        }
        
        logOperation('loadingManager', 'hide_loading', {
            operationId,
            remainingOperations: Array.from(loadingOperations)
        });
    } else {
        logOperation('loadingManager', 'keep_loading', {
            operationId,
            remainingOperations: Array.from(loadingOperations)
        });
    }
}

// Force hide loading (emergency use)
function forceHideLoading() {
    loadingOperations.clear();
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    document.body.classList.remove('loading');
    
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }
    
    logOperation('loadingManager', 'force_hide_loading');
}

// Check if loading is currently active
function isLoading() {
    return loadingOperations.size > 0;
}

// Legacy error function - kept for compatibility
function showError(message) {
    console.error(message);
    showUserError(message);
    hideLoading('error');
}

// Initialize the application
async function init() {
    try {
        showLoading();
        
        // Wait for Firebase to be available
        if (typeof db === 'undefined') {
            console.log('Firebase not configured. Using placeholder data.');
            await loadFeaturedArticle();
            await loadLatestNews();
            hideLoading();
            return;
        }
        
        // Load content from Firebase
        await Promise.all([
            loadFeaturedArticle(),
            loadLatestNews()
        ]);
        
        hideLoading();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize application');
    }
}

// Navigation button handlers
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = e.target.textContent;
            
            if (buttonText === 'Home') {
                // Scroll to top or reload featured content
                window.scrollTo({ top: 0, behavior: 'smooth' });
                init();
            } else if (buttonText === 'About') {
                // Navigate to about page
                window.location.href = 'about.html';
            }
        });
    });
});

// Load all news articles
async function loadAllNews() {
    const operationId = 'loadAllNews';
    logOperation('loadAllNews', 'started');
    
    try {
        showLoading(operationId);
        
        // Check if Firebase is properly initialized
        if (!isFirebaseInitialized()) {
            logOperation('loadAllNews', 'firebase_not_initialized');
            console.log('Firebase not initialized, showing placeholder news');
            displayPlaceholderNews();
            return;
        }
        
        logOperation('loadAllNews', 'firebase_initialized');
        
        // Define the Firebase operation
        const firebaseOperation = async () => {
            logOperation('loadAllNews', 'querying_firebase');
            
            const newsQuery = query(
                collection(window.db, 'news'),
                orderBy('timestamp', 'desc')
            );
            
            return await getDocs(newsQuery);
        };
        
        // Execute with timeout and retry
        const newsSnapshot = await withTimeout(
            withRetry(firebaseOperation, MAX_RETRIES, 2000),
            FIREBASE_TIMEOUT,
            'Loading news from Firebase'
        );
        
        logOperation('loadAllNews', 'firebase_query_success', {
            documentsFound: newsSnapshot.size,
            isEmpty: newsSnapshot.empty
        });
        
        if (!newsSnapshot.empty) {
            const newsData = newsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Ensure timestamp is properly handled
                    timestamp: data.timestamp || null
                };
            });
            
            logOperation('loadAllNews', 'processing_news_data', {
                articlesCount: newsData.length,
                firstArticleTitle: newsData[0]?.title || 'N/A'
            });
            
            // Display the news grid
            displayNewsGrid(newsData);
            
            // Update social media meta tags with the latest article
            if (newsData.length > 0) {
                try {
                    updateSocialMetaTags(newsData[0]);
                    logOperation('loadAllNews', 'social_meta_updated');
                } catch (metaError) {
                    logOperation('loadAllNews', 'social_meta_error', null, metaError);
                    console.warn('Failed to update social meta tags:', metaError);
                }
            }
            
            logOperation('loadAllNews', 'completed_successfully', {
                articlesLoaded: newsData.length
            });
        } else {
            logOperation('loadAllNews', 'no_articles_found');
            console.log('No news articles found in Firebase, showing placeholder');
            displayPlaceholderNews();
        }
        
    } catch (error) {
        logOperation('loadAllNews', 'error', null, error);
        
        // Log errors for debugging but don't show annoying user messages
        // News loading errors are handled gracefully with placeholder content
        if (error.message.includes('timed out')) {
            console.warn('News loading timed out - showing placeholder content:', error);
        } else if (error.code === 'permission-denied') {
            console.warn('News permission denied - showing placeholder content:', error);
        } else if (error.code === 'unavailable') {
            console.warn('News service unavailable - showing placeholder content:', error);
        } else {
            console.error('Unexpected error loading news - showing placeholder content:', error);
        }
        
        // Show placeholder content as fallback
        try {
            displayPlaceholderNews();
        } catch (fallbackError) {
            logOperation('loadAllNews', 'fallback_error', null, fallbackError);
            console.error('Even fallback failed:', fallbackError);
        }
        
    } finally {
        // Always hide loading, regardless of success or failure
        hideLoading(operationId);
        logOperation('loadAllNews', 'loading_hidden');
    }
}

// Global variable to store game update data
let gameUpdateData = null;

// Load game updates from Firebase
async function loadGameUpdates() {
    logOperation('loadGameUpdates', 'started');
    
    try {
        // Check if DOM elements exist
        if (!gameUpdateTitle || !gameUpdateInfo) {
            logOperation('loadGameUpdates', 'dom_elements_missing');
            console.warn('Game update DOM elements not found, skipping game updates');
            return;
        }
        
        // Check if Firebase is properly initialized
        if (!isFirebaseInitialized()) {
            logOperation('loadGameUpdates', 'firebase_not_initialized');
            console.log('Firebase not initialized, showing default game update state');
            gameUpdateTitle.textContent = 'Game Updates';
            gameUpdateInfo.textContent = 'Game updates will appear here when available.';
            return;
        }
        
        logOperation('loadGameUpdates', 'firebase_initialized');
        
        // Define the Firebase operation
        const firebaseOperation = async () => {
            logOperation('loadGameUpdates', 'querying_firebase');
            
            const gameUpdatesRef = collection(window.db, 'gameUpdates');
            return await getDocs(gameUpdatesRef);
        };
        
        // Execute with timeout and retry
        const gameUpdatesSnapshot = await withTimeout(
            withRetry(firebaseOperation, MAX_RETRIES, 1000),
            FIREBASE_TIMEOUT,
            'Loading game updates from Firebase'
        );
        
        logOperation('loadGameUpdates', 'firebase_query_success', {
            documentsFound: gameUpdatesSnapshot.size,
            isEmpty: gameUpdatesSnapshot.empty
        });
        
        if (!gameUpdatesSnapshot.empty) {
            gameUpdateData = gameUpdatesSnapshot.docs[0].data();
            
            logOperation('loadGameUpdates', 'processing_game_data', {
                hasTitle: !!gameUpdateData.title,
                hasInfo: !!gameUpdateData.info,
                hasMultiLanguage: !!(gameUpdateData.title_en || gameUpdateData.title_de)
            });
            
            // Set default language to English
            updateGameUpdateDisplay(gameUpdateData, 'en');
            
            logOperation('loadGameUpdates', 'completed_successfully');
        } else {
            logOperation('loadGameUpdates', 'no_updates_found');
            console.log('No game updates found in Firebase');
            gameUpdateTitle.textContent = 'No Updates Available';
            gameUpdateInfo.textContent = 'Check back later for game updates.';
        }
        
    } catch (error) {
        logOperation('loadGameUpdates', 'error', null, error);
        
        if (error.message.includes('timed out')) {
            console.warn('Game updates loading timed out:', error);
            gameUpdateTitle.textContent = 'Updates Unavailable';
            gameUpdateInfo.textContent = 'Connection timeout. Please try refreshing the page.';
        } else if (error.code === 'permission-denied') {
            console.warn('Game updates permission denied:', error);
            gameUpdateTitle.textContent = 'Updates Unavailable';
            gameUpdateInfo.textContent = 'Unable to access updates at this time.';
        } else if (error.code === 'unavailable') {
            console.warn('Game updates service unavailable:', error);
            gameUpdateTitle.textContent = 'Service Unavailable';
            gameUpdateInfo.textContent = 'Updates service is temporarily unavailable.';
        } else {
            console.error('Unexpected error loading game updates:', error);
            gameUpdateTitle.textContent = 'Error Loading Updates';
            gameUpdateInfo.textContent = 'Unable to load game updates. Please try again later.';
        }
    }
}

// Update game update display based on language
function updateGameUpdateDisplay(data, language) {
    if (language === 'en') {
        gameUpdateTitle.textContent = data.title_en || data.title || 'Game Update';
        gameUpdateInfo.textContent = data.info_en || data.info || 'No update information available.';
    } else if (language === 'de') {
        gameUpdateTitle.textContent = data.title_de || data.title || 'Spiel-Update';
        gameUpdateInfo.textContent = data.info_de || data.info || 'Keine Update-Informationen verfügbar.';
    }
}

// Update social media meta tags with latest news
function updateSocialMetaTags(latestArticle) {
    if (!latestArticle) return;
    
    // Get clean URL without index.html
    let currentUrl = window.location.href;
    if (currentUrl.includes('/index.html')) {
        currentUrl = currentUrl.replace('/index.html', '/');
    }
    if (currentUrl.includes('/about.html')) {
        currentUrl = currentUrl.replace('/about.html', '/about');
    }
    
    // Get the best image for social media (prefer imageUrl, fallback to videoUrl if it's an image)
    let socialImage = './news1.jpg'; // Default fallback
    if (latestArticle.imageUrl) {
        // Check if imageUrl is actually a video
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
        const isVideoFile = videoExtensions.some(ext => latestArticle.imageUrl.toLowerCase().includes(ext));
        
        if (!isVideoFile) {
            // It's an image, use it
            socialImage = latestArticle.imageUrl.startsWith('http') ? latestArticle.imageUrl : './' + latestArticle.imageUrl;
        }
    }
    
    // Update Open Graph tags
    document.getElementById('og-title').setAttribute('content', latestArticle.title || 'EHAMBURG DAILY');
    document.getElementById('og-description').setAttribute('content', latestArticle.description || 'Latest news and updates from EHAMBURG DAILY');
    document.getElementById('og-image').setAttribute('content', socialImage);
    document.getElementById('og-image-secure').setAttribute('content', socialImage);
    document.getElementById('og-url').setAttribute('content', currentUrl);
    
    // Update Twitter Card tags
    document.getElementById('twitter-title').setAttribute('content', latestArticle.title || 'EHAMBURG DAILY');
    document.getElementById('twitter-description').setAttribute('content', latestArticle.description || 'Latest news and updates from EHAMBURG DAILY');
    document.getElementById('twitter-image').setAttribute('content', socialImage);
    
    // Update general meta tags
    document.getElementById('meta-description').setAttribute('content', latestArticle.description || 'Latest news and updates from EHAMBURG DAILY');
    document.title = latestArticle.title ? `${latestArticle.title} - EHAMBURG DAILY` : 'EHAMBURG DAILY';
    
    console.log('Social meta tags updated with latest article:', latestArticle.title);
    console.log('Social image for sharing:', socialImage);
    console.log('Clean URL for sharing:', currentUrl);
}

// Language selector functionality
document.addEventListener('DOMContentLoaded', function() {
    // Language selector buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            langButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected language
            const selectedLang = this.getAttribute('data-lang');
            
            // Use cached data for instant switching
            if (gameUpdateData) {
                updateGameUpdateDisplay(gameUpdateData, selectedLang);
            }
        });
    });
});

// Search functionality
let searchTimeout;

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    const results = [];
    
    // Search in news articles
    const newsItems = document.querySelectorAll('.news-item');
    newsItems.forEach((item, index) => {
        const title = item.querySelector('.news-item-title')?.textContent || '';
        const description = item.querySelector('.news-item-description')?.textContent || '';
        const date = item.querySelector('.news-item-date')?.textContent || '';
        
        if (title.toLowerCase().includes(query.toLowerCase()) || 
            description.toLowerCase().includes(query.toLowerCase()) ||
            date.toLowerCase().includes(query.toLowerCase())) {
            
            results.push({
                type: 'news',
                title: title,
                description: description,
                date: date,
                element: item,
                index: index
            });
        }
    });
    
    // Search in about page content
    const aboutSections = document.querySelectorAll('h1, h2, h3, p');
    aboutSections.forEach(section => {
        const text = section.textContent || '';
        if (text.toLowerCase().includes(query.toLowerCase()) && text.length > 10) {
            results.push({
                type: 'content',
                title: section.tagName === 'H1' || section.tagName === 'H2' || section.tagName === 'H3' ? text : 'Content',
                description: text.substring(0, 100) + '...',
                element: section
            });
        }
    });
    
    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    const html = results.map(result => {
        const highlightedTitle = highlightText(result.title, query);
        const highlightedDescription = highlightText(result.description, query);
        
        return `
            <div class="search-result-item" onclick="selectSearchResult('${result.type}', ${result.index || 0})">
                <div class="search-result-title">${highlightedTitle}</div>
                <div class="search-result-preview">${highlightedDescription}</div>
            </div>
        `;
    }).join('');
    
    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function selectSearchResult(type, index) {
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('search-input');
    
    searchResults.style.display = 'none';
    searchInput.value = '';
    
    if (type === 'news') {
        const newsItems = document.querySelectorAll('.news-item');
        if (newsItems[index]) {
            newsItems[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add yellow highlight
            newsItems[index].style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                newsItems[index].style.backgroundColor = '';
            }, 3000);
        }
    } else if (type === 'content') {
        const aboutSections = document.querySelectorAll('h1, h2, h3, p');
        if (aboutSections[index]) {
            aboutSections[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add yellow highlight
            aboutSections[index].style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                aboutSections[index].style.backgroundColor = '';
            }, 3000);
        }
    }
}


// Load posts from Firebase
async function loadPosts() {
    logOperation('loadPosts', 'started');
    
    try {
        // Check if Firebase is properly initialized
        if (!isFirebaseInitialized()) {
            logOperation('loadPosts', 'firebase_not_initialized');
            console.log('Firebase not available, showing fallback');
            displayPostsFallback();
            return;
        }
        
        logOperation('loadPosts', 'firebase_initialized');
        
        // Define the Firebase operation
        const firebaseOperation = async () => {
            logOperation('loadPosts', 'querying_firebase');
            
            const postsRef = collection(window.db, 'posts');
            return await getDocs(postsRef);
        };
        
        // Execute with timeout and retry
        const postsSnapshot = await withTimeout(
            withRetry(firebaseOperation, MAX_RETRIES, 1500),
            FIREBASE_TIMEOUT,
            'Loading posts from Firebase'
        );
        
        logOperation('loadPosts', 'firebase_query_success', {
            documentsFound: postsSnapshot.size,
            isEmpty: postsSnapshot.empty
        });
        
        if (!postsSnapshot.empty) {
            // Sort posts by timestamp (newest first)
            const posts = postsSnapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // Ensure timestamp is properly handled
                        timestamp: data.timestamp || null
                    };
                })
                .sort((a, b) => {
                    const dateA = a.timestamp ? new Date(a.timestamp.seconds * 1000) : new Date(0);
                    const dateB = b.timestamp ? new Date(b.timestamp.seconds * 1000) : new Date(0);
                    return dateB - dateA;
                });
            
            logOperation('loadPosts', 'processing_posts_data', {
                postsCount: posts.length,
                firstPostTitle: posts[0]?.title || 'N/A'
            });
            
            displayPosts(posts);
            logOperation('loadPosts', 'completed_successfully', {
                postsLoaded: posts.length
            });
        } else {
            logOperation('loadPosts', 'no_posts_found');
            console.log('No posts found in Firebase, showing fallback');
            displayPostsFallback();
        }
        
    } catch (error) {
        logOperation('loadPosts', 'error', null, error);
        
        if (error.message.includes('timed out')) {
            console.warn('Posts loading timed out, showing fallback:', error);
        } else if (error.code === 'permission-denied') {
            console.warn('Posts permission denied, showing fallback:', error);
        } else if (error.code === 'unavailable') {
            console.warn('Posts service unavailable, showing fallback:', error);
        } else {
            console.error('Unexpected error loading posts:', error);
        }
        
        // Always show fallback content
        displayPostsFallback();
    }
}

// Display posts from Firebase
function displayPosts(posts) {
    const postsGrid = document.getElementById('posts-grid');
    
    if (!postsGrid) {
        console.log('Posts grid element not found');
        return;
    }
    
    console.log('Displaying posts:', posts);
    
    if (posts.length === 0) {
        displayPostsFallback();
        return;
    }
    
    postsGrid.innerHTML = posts.map(post => createPostItem(post)).join('');
    console.log('Posts HTML created, post items:', document.querySelectorAll('.post-item').length);
    
    // Load TikTok embed script if not already loaded
    if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        script.onload = function() {
            console.log('TikTok embed script loaded');
        };
        script.onerror = function() {
            console.error('Failed to load TikTok embed script');
        };
        document.head.appendChild(script);
    } else {
        console.log('TikTok embed script already loaded');
    }
}

// Extract video ID from YouTube URL
function extractYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// Check if URL is YouTube
function isYouTubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

// Extract TikTok video ID from URL
function extractTikTokVideoId(url) {
    console.log('Extracting TikTok video ID from:', url);
    
    // Handle different TikTok URL formats
    const patterns = [
        /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
        /tiktok\.com\/v\/(\d+)/,
        /tiktok\.com\/embed\/(\d+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            console.log('TikTok video ID extracted:', match[1]);
            return match[1];
        }
    }
    
    console.log('Could not extract TikTok video ID');
    return null;
}

// Check if URL is TikTok
function isTikTokUrl(url) {
    return url.includes('tiktok.com');
}

// Create post item HTML
function createPostItem(post) {
    const date = post.timestamp ? new Date(post.timestamp.seconds * 1000) : new Date();
    const videoUrl = post.tiktokUrl || post.youtubeUrl || post.videoUrl;
    
    console.log('Creating post item for:', post.title);
    console.log('Video URL:', videoUrl);
    console.log('Is TikTok URL:', isTikTokUrl(videoUrl));
    
    let videoEmbed = '';
    
    if (isYouTubeUrl(videoUrl)) {
        const videoId = extractYouTubeVideoId(videoUrl);
        if (videoId) {
            videoEmbed = `
                <iframe 
                    width="100%" 
                    height="315" 
                    src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
                    frameborder="0" 
                    allowfullscreen
                    style="border-radius: 0;">
                </iframe>
            `;
        } else {
            videoEmbed = `<p>Invalid YouTube URL</p>`;
        }
    } else if (isTikTokUrl(videoUrl)) {
        // Extract video ID from TikTok URL
        const videoId = extractTikTokVideoId(videoUrl);
        if (videoId) {
            videoEmbed = `
                <blockquote class="tiktok-embed" cite="${videoUrl}" data-video-id="${videoId}" style="max-width: 605px; min-width: 325px; border-radius: 0;">
                    <section>
                        <a href="${videoUrl}" target="_blank" title="@ehamburgdaily">@ehamburgdaily</a>
                    </section>
                </blockquote>
            `;
        } else {
            // Fallback for URLs without clear video ID
            videoEmbed = `
                <blockquote class="tiktok-embed" cite="${videoUrl}" style="max-width: 605px; min-width: 325px; border-radius: 0;">
                    <section>
                        <a href="${videoUrl}" target="_blank" title="@ehamburgdaily">@ehamburgdaily</a>
                    </section>
                </blockquote>
            `;
        }
    } else {
        videoEmbed = `<p>Unsupported video URL</p>`;
    }
    
    return `
        <div class="post-item">
            <div class="post-title">${post.title || 'Untitled Post'}</div>
            <div class="post-date">${date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</div>
            <div class="post-video-container">
                ${videoEmbed}
            </div>
        </div>
    `;
}

// Display fallback when no posts are available
function displayPostsFallback() {
    const postsGrid = document.getElementById('posts-grid');
    
    if (!postsGrid) {
        console.log('Posts grid element not found');
        return;
    }
    
    postsGrid.innerHTML = `
        <div class="posts-fallback">
            <h3>No Posts Yet</h3>
            <p>Check back later for our latest TikTok posts!</p>
            <a href="https://www.tiktok.com/@ehamburgdaily" target="_blank">Follow us on TikTok</a>
        </div>
    `;
}

// Load message banner from Firebase
async function loadMessageBanner() {
    logOperation('loadMessageBanner', 'started');
    
    try {
        // Check if DOM elements exist
        const messageBanner = document.getElementById('message-banner');
        const messageText = document.getElementById('message-text');
        const header = document.querySelector('.header');
        const mainContent = document.querySelector('.main-content');
        
        if (!messageBanner) {
            logOperation('loadMessageBanner', 'dom_elements_missing');
            console.warn('Message banner DOM element not found, skipping banner');
            return;
        }
        
        // Check if Firebase is properly initialized
        if (!isFirebaseInitialized()) {
            logOperation('loadMessageBanner', 'firebase_not_initialized');
            console.log('Firebase not initialized, hiding banner');
            messageBanner.style.display = 'none';
            
            // Ensure classes are removed
            if (header) header.classList.remove('with-banner');
            if (mainContent) mainContent.classList.remove('with-banner');
            return;
        }
        
        logOperation('loadMessageBanner', 'firebase_initialized');
        
        // Define the Firebase operation
        const firebaseOperation = async () => {
            logOperation('loadMessageBanner', 'querying_firebase');
            
            const messageRef = collection(window.db, 'messageSettings');
            return await getDocs(messageRef);
        };
        
        // Execute with timeout and retry
        const messageSnapshot = await withTimeout(
            withRetry(firebaseOperation, MAX_RETRIES, 800),
            FIREBASE_TIMEOUT,
            'Loading message banner from Firebase'
        );
        
        logOperation('loadMessageBanner', 'firebase_query_success', {
            documentsFound: messageSnapshot.size,
            isEmpty: messageSnapshot.empty
        });
        
        if (!messageSnapshot.empty) {
            const settings = messageSnapshot.docs[0].data();
            
            logOperation('loadMessageBanner', 'processing_settings', {
                enabled: settings.enabled,
                hasMessage: !!settings.message,
                messageLength: settings.message ? settings.message.length : 0
            });
            
            // Check if message is enabled
            if (settings.enabled) {
                const messageTextContent = settings.message || 'Message banner enabled';
                
                if (messageText) {
                    messageText.textContent = messageTextContent;
                }
                
                messageBanner.style.display = 'block';
                
                // Add classes to header and main content to adjust positioning
                if (header) header.classList.add('with-banner');
                if (mainContent) mainContent.classList.add('with-banner');
                
                logOperation('loadMessageBanner', 'banner_displayed', {
                    messageText: messageTextContent
                });
            } else {
                messageBanner.style.display = 'none';
                
                // Remove classes from header and main content
                if (header) header.classList.remove('with-banner');
                if (mainContent) mainContent.classList.remove('with-banner');
                
                logOperation('loadMessageBanner', 'banner_disabled');
            }
            
            logOperation('loadMessageBanner', 'completed_successfully');
        } else {
            logOperation('loadMessageBanner', 'no_settings_found');
            console.log('No message settings found in Firebase, hiding banner');
            messageBanner.style.display = 'none';
            
            // Ensure classes are removed
            if (header) header.classList.remove('with-banner');
            if (mainContent) mainContent.classList.remove('with-banner');
        }
        
    } catch (error) {
        logOperation('loadMessageBanner', 'error', null, error);
        
        // Always hide banner on error
        const messageBanner = document.getElementById('message-banner');
        const header = document.querySelector('.header');
        const mainContent = document.querySelector('.main-content');
        
        if (messageBanner) {
            messageBanner.style.display = 'none';
        }
        
        // Remove classes to prevent layout issues
        if (header) header.classList.remove('with-banner');
        if (mainContent) mainContent.classList.remove('with-banner');
        
        if (error.message.includes('timed out')) {
            console.warn('Message banner loading timed out:', error);
        } else if (error.code === 'permission-denied') {
            console.warn('Message banner permission denied:', error);
        } else if (error.code === 'unavailable') {
            console.warn('Message banner service unavailable:', error);
        } else {
            console.error('Unexpected error loading message banner:', error);
        }
    }
}

// Refresh banner when settings change
function refreshBanner() {
    console.log('Refreshing banner...');
    loadMessageBanner();
}

// Test banner display
function testBannerDisplay() {
    const banner = document.getElementById('message-banner');
    if (banner) {
        console.log('Banner element found:', banner);
        console.log('Banner display style:', banner.style.display);
        console.log('Banner computed style:', window.getComputedStyle(banner).display);
        
        // Temporarily show banner for testing
        banner.style.display = 'block';
        banner.style.background = '#ff6b35'; // Orange for testing
        setTimeout(() => {
            banner.style.background = '#2196F3'; // Back to blue
            loadMessageBanner(); // Reload proper settings
        }, 2000);
    } else {
        console.error('Banner element not found!');
    }
}

// Test Firebase connection directly
async function testFirebaseConnection() {
    try {
        console.log('=== TESTING FIREBASE CONNECTION ===');
        console.log('db:', db);
        console.log('collection:', collection);
        console.log('getDocs:', getDocs);
        
        if (typeof db === 'undefined') {
            console.error('Firebase db is undefined!');
            return;
        }
        
        const testRef = collection(db, 'messageSettings');
        console.log('Collection reference created:', testRef);
        
        const snapshot = await getDocs(testRef);
        console.log('Snapshot:', snapshot);
        console.log('Empty:', snapshot.empty);
        console.log('Size:', snapshot.size);
        
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                console.log('Document ID:', doc.id);
                console.log('Document data:', doc.data());
            });
        }
        
        console.log('Firebase connection test completed successfully!');
    } catch (error) {
        console.error('Firebase connection test failed:', error);
    }
}

// Force show banner with custom message (for testing)
function forceShowBanner(message = 'Test message from console') {
    console.log('Forcing banner to show with message:', message);
    const banner = document.getElementById('message-banner');
    const bannerText = document.getElementById('message-text');
    
    if (banner && bannerText) {
        bannerText.textContent = message;
        banner.style.display = 'block';
        document.querySelector('.header').classList.add('with-banner');
        document.querySelector('.main-content').classList.add('with-banner');
        console.log('Banner forced to show!');
    } else {
        console.error('Banner elements not found!');
    }
}

// Touch handling for long-press functionality
let touchStartTime = 0;
let longPressTimer = null;
let isLongPress = false;

function handleTouchStart(event, articleId) {
    touchStartTime = Date.now();
    isLongPress = false;
    
    // Set a timer for long press (800ms)
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        copyArticleLink(articleId);
        
        // Show visual feedback
        const shareOverlay = event.currentTarget.querySelector('.share-overlay');
        if (shareOverlay) {
            shareOverlay.style.display = 'flex';
            setTimeout(() => {
                shareOverlay.style.display = 'none';
            }, 2000);
        }
    }, 800);
}

function handleTouchEnd(event, articleId) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Clear the long press timer
    if (longPressTimer) {
        clearTimeout(longPressTimer);
    }
    
    // If it was a long press, don't open the article
    if (isLongPress) {
        event.preventDefault();
        return;
    }
    
    // If it was a short tap, open the article
    if (touchDuration < 800) {
        openArticle(articleId);
    }
}

// Copy article link to clipboard
async function copyArticleLink(articleId) {
    // Generate URL based on environment
    let articleUrl;
    const currentUrl = window.location.href;
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
    
    // Check if we're in a production environment with clean URLs enabled
    if (currentUrl.includes('.html') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Local development or .html-based URLs
        articleUrl = `${baseUrl}/article.html?id=${articleId}`;
    } else {
        // Production with clean URLs
        articleUrl = `${baseUrl}/article/${articleId}`;
    }
    
    try {
        await navigator.clipboard.writeText(articleUrl);
        showShareNotification('Article link copied to clipboard!');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = articleUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showShareNotification('Article link copied to clipboard!');
    }
    
    console.log('Article link copied:', articleUrl);
}

// Show share notification using consistent design
function showShareNotification(message) {
    showMessage('success', message, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    logOperation('appInitialization', 'started');
    
    // Initialize all loading operations concurrently
    const initializationPromises = [
        loadAllNews().catch(error => {
            logOperation('appInitialization', 'loadAllNews_failed', null, error);
            return null;
        }),
        loadGameUpdates().catch(error => {
            logOperation('appInitialization', 'loadGameUpdates_failed', null, error);
            return null;
        }),
        loadSocialMediaSettings().catch(error => {
            logOperation('appInitialization', 'loadSocialMediaSettings_failed', null, error);
            return null;
        }),
        loadPosts().catch(error => {
            logOperation('appInitialization', 'loadPosts_failed', null, error);
            return null;
        }),
        loadMessageBanner().catch(error => {
            logOperation('appInitialization', 'loadMessageBanner_failed', null, error);
            return null;
        })
    ];
    
    // Wait for all operations to complete (or fail)
    Promise.allSettled(initializationPromises).then(results => {
        const successful = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.filter(result => result.status === 'rejected').length;
        
        logOperation('appInitialization', 'completed', {
            successfulOperations: successful,
            failedOperations: failed,
            totalOperations: results.length
        });
        
        // Force hide any remaining loading state after initialization
        setTimeout(() => {
            if (isLoading()) {
                logOperation('appInitialization', 'force_hiding_remaining_loading');
                forceHideLoading();
            }
        }, 2000);
    }).catch(error => {
        logOperation('appInitialization', 'critical_error', null, error);
        forceHideLoading();
        showUserError('Failed to initialize application. Please refresh the page.');
    });
    
    // Initialize search (doesn't require loading)
    try {
        initializeSearch();
    } catch (error) {
        logOperation('appInitialization', 'search_initialization_failed', null, error);
    }
    
    // Listen for storage changes (when settings are updated in another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'messageSettings') {
            console.log('Message settings changed, refreshing banner...');
            refreshBanner();
        }
    });
    
    // Make functions available globally for testing and notifications
    window.testBannerDisplay = testBannerDisplay;
    window.refreshBanner = refreshBanner;
    window.loadMessageBanner = loadMessageBanner;
    window.testFirebaseConnection = testFirebaseConnection;
    window.forceShowBanner = forceShowBanner;
    window.copyArticleLink = copyArticleLink;
    window.handleTouchStart = handleTouchStart;
    window.handleTouchEnd = handleTouchEnd;
    window.removeMessage = removeMessage;
    window.showMessage = showMessage;
});

// Handle window resize for responsive behavior - handled in DOMContentLoaded
