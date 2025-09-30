// DOM Elements
const loadingSpinner = document.getElementById('loading-spinner');
const newsGrid = document.getElementById('news-grid');
const gameUpdateTitle = document.getElementById('game-update-title');
const gameUpdateInfo = document.getElementById('game-update-info');

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
        <div class="news-item-image" onclick="openArticle('${article.id}')">
            ${mediaContent}
        </div>
        <div class="news-item-info" onclick="openArticle('${article.id}')">
            <div class="news-item-header">
                <div class="news-item-date">${date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
                <button class="copy-link-btn" onclick="event.stopPropagation(); copyNewsLink('${article.id}', '${article.title || 'Title'}', '${article.description || 'Description'}', '${article.imageUrl || ''}')" title="Copy link to share">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
            <div class="news-item-title">${article.title || 'Title'}</div>
            <div class="news-item-description">${article.description || 'Description'}</div>
        </div>
    `;
    
    return newsItem;
}

// Function to open article (you can customize this)
function openArticle(articleId) {
    console.log('Opening article:', articleId);
    // For now, just scroll to top and show a message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // You can customize this to:
    // 1. Open a modal with full article
    // 2. Navigate to a separate article page
    // 3. Show more details
    // 4. Or just scroll to top (current behavior)
}

// Function to copy news link with meta tags
async function copyNewsLink(articleId, title, description, imageUrl) {
    try {
        // Get clean URL without index.html
        let currentUrl = window.location.origin + window.location.pathname;
        if (currentUrl.includes('/index.html')) {
            currentUrl = currentUrl.replace('/index.html', '/');
        }
        if (currentUrl.endsWith('/')) {
            currentUrl = currentUrl.slice(0, -1);
        }
        
        // Create shareable URL with article ID
        const shareableUrl = `${currentUrl}#article-${articleId}`;
        
        console.log('Generated URL:', shareableUrl);
        console.log('Article ID:', articleId);
        console.log('Title:', title);
        
        // Update meta tags for this specific article
        updateMetaTagsForArticle(title, description, imageUrl, shareableUrl);
        
        // Try multiple copy methods for better compatibility
        try {
            // Modern clipboard API
            await navigator.clipboard.writeText(shareableUrl);
            console.log('Copied using clipboard API');
        } catch (clipboardError) {
            console.log('Clipboard API failed, trying fallback method');
            
            // Fallback method for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareableUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                console.log('Copied using execCommand');
            } catch (execError) {
                console.error('Both copy methods failed');
                throw execError;
            } finally {
                document.body.removeChild(textArea);
            }
        }
        
        // Show success message
        showCopySuccess();
        
        console.log('Link successfully copied:', shareableUrl);
        
    } catch (error) {
        console.error('Error copying link:', error);
        showCopyError();
    }
}

// Update meta tags for specific article
function updateMetaTagsForArticle(title, description, imageUrl, url) {
    // Get the best image for social media
    let socialImage = './news1.jpg'; // Default fallback
    if (imageUrl) {
        // Check if imageUrl is actually a video
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
        const isVideoFile = videoExtensions.some(ext => imageUrl.toLowerCase().includes(ext));
        
        if (!isVideoFile) {
            // It's an image, use it
            socialImage = imageUrl.startsWith('http') ? imageUrl : './' + imageUrl;
        }
    }
    
    // Update Open Graph tags
    document.getElementById('og-title').setAttribute('content', title);
    document.getElementById('og-description').setAttribute('content', description);
    document.getElementById('og-image').setAttribute('content', socialImage);
    document.getElementById('og-image-secure').setAttribute('content', socialImage);
    document.getElementById('og-url').setAttribute('content', url);
    
    // Update Twitter Card tags
    document.getElementById('twitter-title').setAttribute('content', title);
    document.getElementById('twitter-description').setAttribute('content', description);
    document.getElementById('twitter-image').setAttribute('content', socialImage);
    
    // Update general meta tags
    document.getElementById('meta-description').setAttribute('content', description);
    document.title = `${title} - EHAMBURG DAILY`;
    
    console.log('Meta tags updated for article:', title);
    console.log('Social image:', socialImage);
    console.log('Shareable URL:', url);
}

// Show copy success message
function showCopySuccess() {
    const successMsg = document.createElement('div');
    successMsg.className = 'copy-success-message';
    successMsg.textContent = 'Link copied! Share it on social media.';
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
}

// Show copy error message
function showCopyError() {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'copy-error-message';
    errorMsg.textContent = 'Failed to copy link. Please try again.';
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        errorMsg.remove();
    }, 3000);
}

// Test function to verify copy functionality
function testCopyFunction() {
    const testUrl = 'https://example.com/test-link';
    console.log('Testing copy functionality...');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(testUrl).then(() => {
            console.log('Clipboard API works!');
        }).catch(err => {
            console.log('Clipboard API failed:', err);
        });
    } else {
        console.log('Clipboard API not supported, using fallback');
    }
}

// Make test function available globally for debugging
window.testCopyFunction = testCopyFunction;

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

function showLoading() {
    loadingSpinner.style.display = 'block';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showError(message) {
    console.error(message);
    // You can implement a toast notification or error display here
    hideLoading();
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
    try {
        showLoading();
        
        // Check if Firebase is initialized
        if (!window.db) {
            throw new Error('Firebase not initialized');
        }
        
        // Query for all articles, ordered by timestamp (newest first)
        const newsQuery = query(
            collection(db, 'news'),
            orderBy('timestamp', 'desc')
        );
        
        const newsSnapshot = await getDocs(newsQuery);
        
        if (!newsSnapshot.empty) {
            const newsData = newsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('Loaded news data:', newsData);
            displayNewsGrid(newsData);
            
            // Update social media meta tags with the latest article
            if (newsData.length > 0) {
                updateSocialMetaTags(newsData[0]); // First article is the latest
            }
        } else {
            console.log('No news articles found in Firebase');
            displayPlaceholderNews();
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading news:', error);
        showError('Failed to load news. Please refresh the page.');
        hideLoading();
    }
}

// Global variable to store game update data
let gameUpdateData = null;

// Load game updates from Firebase
async function loadGameUpdates() {
    try {
        console.log('Loading game updates...');
        
        const gameUpdatesRef = collection(db, 'gameUpdates');
        const gameUpdatesSnapshot = await getDocs(gameUpdatesRef);
        
        if (!gameUpdatesSnapshot.empty) {
            gameUpdateData = gameUpdatesSnapshot.docs[0].data();
            console.log('Game update data:', gameUpdateData);
            
            // Set default language to English
            updateGameUpdateDisplay(gameUpdateData, 'en');
        } else {
            console.log('No game updates found');
            gameUpdateTitle.textContent = 'No Updates Available';
            gameUpdateInfo.textContent = 'Check back later for game updates.';
        }
    } catch (error) {
        console.error('Error loading game updates:', error);
        gameUpdateTitle.textContent = 'Error Loading Updates';
        gameUpdateInfo.textContent = 'Unable to load game updates. Please try again later.';
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

// Load latest TikTok post from TikTok account
async function loadLatestTikTok() {
    try {
        console.log('Loading latest TikTok post from @ehamburgdaily...');
        
        // TikTok username
        const tiktokUsername = 'ehamburgdaily';
        
        // Display TikTok profile with latest posts
        displayTikTokProfile(tiktokUsername);
        
    } catch (error) {
        console.error('Error loading TikTok post:', error);
        displayTikTokFallback();
    }
}

// Display TikTok profile with latest posts
function displayTikTokProfile(username) {
    const tiktokPostElement = document.getElementById('tiktok-post');
    
    if (!tiktokPostElement) {
        console.log('TikTok post element not found');
        return;
    }
    
    // Create TikTok iframe embed that actually works
    tiktokPostElement.innerHTML = `
        <div class="tiktok-video-container">
            <iframe 
                src="https://www.tiktok.com/embed/v2/${username}" 
                class="tiktok-iframe"
                frameborder="0" 
                allowfullscreen
                allow="autoplay; fullscreen"
                onload="console.log('TikTok iframe loaded')"
                onerror="console.log('TikTok iframe error'); this.parentElement.innerHTML='<div class=\\"tiktok-fallback\\"><h3>Latest TikTok Content</h3><p>Check out our latest TikTok posts!</p><a href=\\"https://www.tiktok.com/@${username}\\" target=\\"_blank\\">View Latest Posts</a></div>'">
            </iframe>
        </div>
    `;
}

// Display TikTok post
function displayTikTokPost(post) {
    const tiktokPostElement = document.getElementById('tiktok-post');
    
    if (!tiktokPostElement) {
        console.log('TikTok post element not found');
        return;
    }
    
    // Create TikTok embed URL
    const embedUrl = `https://www.tiktok.com/embed/${post.videoId}`;
    
    tiktokPostElement.innerHTML = `
        <iframe 
            class="tiktok-embed" 
            src="${embedUrl}" 
            frameborder="0" 
            allowfullscreen
            onload="console.log('TikTok embed loaded')"
            onerror="console.log('TikTok embed error'); this.parentElement.innerHTML='<div class=\\"tiktok-fallback\\"><h3>TikTok Post</h3><p>Unable to load TikTok video</p><a href=\\"${post.url}\\" target=\\"_blank\\">View on TikTok</a></div>'">
        </iframe>
    `;
}

// Display fallback when no TikTok post is available
function displayTikTokFallback() {
    const tiktokPostElement = document.getElementById('tiktok-post');
    
    if (!tiktokPostElement) {
        console.log('TikTok post element not found');
        return;
    }
    
    tiktokPostElement.innerHTML = `
        <div class="tiktok-fallback">
            <h3>No TikTok Posts Yet</h3>
            <p>Check back later for our latest TikTok content!</p>
            <a href="https://www.tiktok.com/@ehamburgdaily" target="_blank">Follow us on TikTok</a>
        </div>
    `;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadAllNews();
    loadGameUpdates();
    loadLatestTikTok();
    initializeSearch();
});

// Handle window resize for responsive behavior - handled in DOMContentLoaded
