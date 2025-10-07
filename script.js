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


// Load posts from Firebase
async function loadPosts() {
    try {
        console.log('Loading posts from Firebase...');
        
        // Check if Firebase is available
        if (typeof db === 'undefined') {
            console.log('Firebase not available, showing fallback');
            displayPostsFallback();
            return;
        }
        
        // Get posts from Firebase
        const postsRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsRef);
        
        console.log('Posts found:', postsSnapshot.size);
        
        if (!postsSnapshot.empty) {
            // Sort posts by timestamp (newest first)
            const posts = postsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const dateA = a.timestamp ? new Date(a.timestamp.seconds * 1000) : new Date(0);
                    const dateB = b.timestamp ? new Date(b.timestamp.seconds * 1000) : new Date(0);
                    return dateB - dateA;
                });
            
            console.log('Posts data:', posts);
            displayPosts(posts);
        } else {
            console.log('No posts found in Firebase');
            displayPostsFallback();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
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
    try {
        console.log('=== LOADING MESSAGE BANNER ===');
        console.log('Firebase db object:', typeof db);
        console.log('Collection function:', typeof collection);
        console.log('GetDocs function:', typeof getDocs);
        
        // Check if Firebase is available
        if (typeof db === 'undefined') {
            console.error('Firebase db is undefined!');
            document.getElementById('message-banner').style.display = 'none';
            return;
        }
        
        if (typeof collection === 'undefined') {
            console.error('Firebase collection function is undefined!');
            document.getElementById('message-banner').style.display = 'none';
            return;
        }
        
        console.log('Firebase is available, proceeding...');
        
        // Get message settings from Firebase
        const messageRef = collection(db, 'messageSettings');
        const messageSnapshot = await getDocs(messageRef);
        
        if (!messageSnapshot.empty) {
            const settings = messageSnapshot.docs[0].data();
            console.log('Message settings from Firebase:', settings);
            console.log('Enabled:', settings.enabled);
            console.log('Message:', settings.message);
            
            // Check if message is enabled
            if (settings.enabled) {
                const messageText = settings.message || 'My message...';
                console.log('Setting banner text to:', messageText);
                
                document.getElementById('message-text').textContent = messageText;
                document.getElementById('message-banner').style.display = 'block';
                
                // Add class to header and main content to adjust positioning
                document.querySelector('.header').classList.add('with-banner');
                document.querySelector('.main-content').classList.add('with-banner');
                
                console.log('Message banner displayed with text:', messageText);
            } else {
                document.getElementById('message-banner').style.display = 'none';
                
                // Remove class from header and main content
                document.querySelector('.header').classList.remove('with-banner');
                document.querySelector('.main-content').classList.remove('with-banner');
                
                console.log('Message banner hidden - disabled');
            }
        } else {
            console.log('No message settings found in Firebase');
            document.getElementById('message-banner').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading message banner:', error);
        document.getElementById('message-banner').style.display = 'none';
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
    const articleUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}article.html?id=${articleId}`;
    
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

// Show share notification
function showShareNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadAllNews();
    loadGameUpdates();
    loadSocialMediaSettings();
    loadPosts();
    loadMessageBanner();
    initializeSearch();
    
    // Listen for storage changes (when settings are updated in another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'messageSettings') {
            console.log('Message settings changed, refreshing banner...');
            refreshBanner();
        }
    });
    
    // Make functions available globally for testing
    window.testBannerDisplay = testBannerDisplay;
    window.refreshBanner = refreshBanner;
    window.loadMessageBanner = loadMessageBanner;
    window.testFirebaseConnection = testFirebaseConnection;
    window.forceShowBanner = forceShowBanner;
    window.copyArticleLink = copyArticleLink;
    window.handleTouchStart = handleTouchStart;
    window.handleTouchEnd = handleTouchEnd;
});

// Handle window resize for responsive behavior - handled in DOMContentLoaded
