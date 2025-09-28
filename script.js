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
        console.log('Setting video for latest news:', article.videoUrl); // Debug log
        if (article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be')) {
            const videoId = article.videoUrl.includes('youtu.be') ? 
                article.videoUrl.split('youtu.be/')[1] : 
                article.videoUrl.split('v=')[1]?.split('&')[0];
            mediaContent = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="width: 100%; height: 100%;"></iframe>`;
        } else if (article.videoUrl.includes('vimeo.com')) {
            const videoId = article.videoUrl.split('vimeo.com/')[1];
            mediaContent = `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen style="width: 100%; height: 100%;"></iframe>`;
        } else {
            mediaContent = `<video controls style="width: 100%; height: 100%; object-fit: cover;"><source src="${article.videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
        }
    } else if (article.imageUrl) {
        console.log('Article imageUrl:', article.imageUrl);
        // Handle local image files by adding ./ prefix if not a full URL
        let imageSrc = article.imageUrl;
        if (!imageSrc.startsWith('http') && !imageSrc.startsWith('./')) {
            imageSrc = './' + imageSrc;
        }
        console.log('Final image source:', imageSrc);
        mediaContent = `<img src="${imageSrc}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<span style=&quot;color:red;&quot;>Image not found: ${imageSrc}</span>';" onload="console.log('Image loaded:', this.src);">`;
    } else {
        console.log('No imageUrl for article:', article);
        mediaContent = '<span>Image/Video</span>';
    }

    newsItem.innerHTML = `
        <div class="news-item-image">
            ${mediaContent}
        </div>
        <div class="news-item-info">
            <div class="news-item-date">${date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</div>
            <div class="news-item-title">${article.title || 'Title'}</div>
            <div class="news-item-description">${article.description || 'Description'}</div>
        </div>
    `;
    
    return newsItem;
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
    
    // Get current URL
    const currentUrl = window.location.href;
    
    // Update Open Graph tags
    document.getElementById('og-title').setAttribute('content', latestArticle.title || 'EHAMBURG DAILY');
    document.getElementById('og-description').setAttribute('content', latestArticle.description || 'Latest news and updates from EHAMBURG DAILY');
    document.getElementById('og-image').setAttribute('content', latestArticle.imageUrl ? (latestArticle.imageUrl.startsWith('http') ? latestArticle.imageUrl : './' + latestArticle.imageUrl) : './news1.jpg');
    document.getElementById('og-image-secure').setAttribute('content', latestArticle.imageUrl ? (latestArticle.imageUrl.startsWith('http') ? latestArticle.imageUrl : './' + latestArticle.imageUrl) : './news1.jpg');
    document.getElementById('og-url').setAttribute('content', currentUrl);
    
    // Update Twitter Card tags
    document.getElementById('twitter-title').setAttribute('content', latestArticle.title || 'EHAMBURG DAILY');
    document.getElementById('twitter-description').setAttribute('content', latestArticle.description || 'Latest news and updates from EHAMBURG DAILY');
    document.getElementById('twitter-image').setAttribute('content', latestArticle.imageUrl ? (latestArticle.imageUrl.startsWith('http') ? latestArticle.imageUrl : './' + latestArticle.imageUrl) : './news1.jpg');
    
    // Update general meta tags
    document.getElementById('meta-description').setAttribute('content', latestArticle.description || 'Latest news and updates from EHAMBURG DAILY');
    document.title = latestArticle.title ? `${latestArticle.title} - EHAMBURG DAILY` : 'EHAMBURG DAILY';
    
    console.log('Social meta tags updated with latest article:', latestArticle.title);
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

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadAllNews();
    loadGameUpdates();
});

// Handle window resize for responsive behavior - handled in DOMContentLoaded
