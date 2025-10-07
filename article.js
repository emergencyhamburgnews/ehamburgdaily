// Article page functionality
let currentArticle = null;

// Get article ID from URL parameters or path
function getArticleIdFromURL() {
    // First try to get from URL parameters (backward compatibility)
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id');
    if (paramId) {
        return paramId;
    }
    
    // Then try to get from clean URL path (/article/articleId)
    const path = window.location.pathname;
    const matches = path.match(/\/article\/([^/]+)/);
    if (matches && matches[1]) {
        return matches[1];
    }
    
    return null;
}

// Load article from Firebase
async function loadArticle() {
    const articleId = getArticleIdFromURL();
    
    if (!articleId) {
        showError();
        return;
    }
    
    try {
        // Wait for Firebase to be ready
        if (!window.db) {
            setTimeout(loadArticle, 100);
            return;
        }
        
        const articleRef = doc(db, 'news', articleId);
        const articleSnap = await getDoc(articleRef);
        
        if (articleSnap.exists()) {
            currentArticle = { id: articleSnap.id, ...articleSnap.data() };
            displayArticle(currentArticle);
            updateMetaTags(currentArticle);
        } else {
            showError();
        }
    } catch (error) {
        console.error('Error loading article:', error);
        showError();
    }
}

// Display article content
function displayArticle(article) {
    const loading = document.getElementById('article-loading');
    const content = document.getElementById('article-content');
    const error = document.getElementById('article-error');
    
    // Hide loading and error
    loading.style.display = 'none';
    error.style.display = 'none';
    
    // Show content
    content.style.display = 'block';
    
    // Set article data
    const date = article.timestamp ? 
        (article.timestamp.toDate ? article.timestamp.toDate() : new Date(article.timestamp)) : 
        new Date();
    
    document.getElementById('article-date').textContent = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('article-title').textContent = article.title || 'Untitled Article';
    document.getElementById('article-description').textContent = article.description || 'No description available.';
    
    // Handle media content
    const mediaContainer = document.getElementById('article-media');
    let mediaContent = '';
    
    if (article.videoUrl) {
        mediaContent = createVideoContent(article.videoUrl);
    } else if (article.imageUrl) {
        // Check if imageUrl is actually a video
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
        const isVideoFile = videoExtensions.some(ext => article.imageUrl.toLowerCase().includes(ext));
        
        if (isVideoFile) {
            mediaContent = createVideoContent(article.imageUrl);
        } else {
            // It's an image
            let imageSrc = article.imageUrl;
            if (!imageSrc.startsWith('http') && !imageSrc.startsWith('./')) {
                imageSrc = './' + imageSrc;
            }
            mediaContent = `<img src="${imageSrc}" alt="${article.title}" onerror="this.style.display='none';">`;
        }
    }
    
    mediaContainer.innerHTML = mediaContent;
}

// Create video content HTML
function createVideoContent(videoUrl) {
    // Handle YouTube videos
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';
        if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        } else if (videoUrl.includes('youtube.com/watch?v=')) {
            videoId = videoUrl.split('v=')[1].split('&')[0];
        } else if (videoUrl.includes('youtube.com/embed/')) {
            videoId = videoUrl.split('embed/')[1].split('?')[0];
        }
        
        if (videoId) {
            return `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" frameborder="0" allowfullscreen style="width: 100%; height: 100%;"></iframe>`;
        }
    }
    
    // Handle Vimeo videos
    if (videoUrl.includes('vimeo.com')) {
        const videoId = videoUrl.split('vimeo.com/')[1];
        return `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen style="width: 100%; height: 100%;"></iframe>`;
    }
    
    // Handle direct video files
    return `<video controls style="width: 100%; height: auto;">
        <source src="${videoUrl}" type="video/mp4">
        <source src="${videoUrl}" type="video/webm">
        Your browser does not support the video tag.
    </video>`;
}

// Update meta tags for social sharing
function updateMetaTags(article) {
    const currentUrl = window.location.href;
    
    // Get the best image for social media
    let socialImage = './news1.jpg'; // Default fallback
    if (article.imageUrl) {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
        const isVideoFile = videoExtensions.some(ext => article.imageUrl.toLowerCase().includes(ext));
        
        if (!isVideoFile) {
            // It's an image, use it
            socialImage = article.imageUrl.startsWith('http') ? article.imageUrl : './' + article.imageUrl;
        }
    }
    
    // Get absolute URL for social image
    if (!socialImage.startsWith('http')) {
        const baseUrl = window.location.origin + window.location.pathname.replace('article.html', '');
        socialImage = baseUrl + socialImage.replace('./', '');
    }
    
    // Update page title
    document.title = article.title ? `${article.title} - EHAMBURG DAILY` : 'EHAMBURG DAILY';
    
    // Update Open Graph tags
    document.getElementById('og-title').setAttribute('content', article.title || 'EHAMBURG DAILY');
    document.getElementById('og-description').setAttribute('content', article.description || 'Latest news and updates from EHAMBURG DAILY');
    document.getElementById('og-image').setAttribute('content', socialImage);
    document.getElementById('og-image-secure').setAttribute('content', socialImage);
    document.getElementById('og-url').setAttribute('content', currentUrl);
    document.getElementById('og-image-alt').setAttribute('content', article.title || 'EHAMBURG DAILY News');
    
    // Update Twitter Card tags
    document.getElementById('twitter-title').setAttribute('content', article.title || 'EHAMBURG DAILY');
    document.getElementById('twitter-description').setAttribute('content', article.description || 'Latest news and updates from EHAMBURG DAILY');
    document.getElementById('twitter-image').setAttribute('content', socialImage);
    document.getElementById('twitter-image-alt').setAttribute('content', article.title || 'EHAMBURG DAILY News');
    
    // Update general meta tags
    document.getElementById('meta-description').setAttribute('content', article.description || 'Latest news and updates from EHAMBURG DAILY');
    
    // Update article-specific meta tags
    if (article.timestamp) {
        const date = article.timestamp.toDate ? article.timestamp.toDate() : new Date(article.timestamp);
        document.getElementById('article-published-time').setAttribute('content', date.toISOString());
    }
    
    console.log('Meta tags updated for article:', article.title);
    console.log('Social image for sharing:', socialImage);
    console.log('Article URL:', currentUrl);
}

// Show error state
function showError() {
    const loading = document.getElementById('article-loading');
    const content = document.getElementById('article-content');
    const error = document.getElementById('article-error');
    
    loading.style.display = 'none';
    content.style.display = 'none';
    error.style.display = 'block';
}

// Copy article link to clipboard
async function copyArticleLink() {
    const currentUrl = window.location.href;
    
    try {
        await navigator.clipboard.writeText(currentUrl);
        showShareMessage('Link copied to clipboard!');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showShareMessage('Link copied to clipboard!');
    }
}

// Share on Facebook
function shareOnFacebook() {
    if (!currentArticle) return;
    
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
}

// Share on Twitter
function shareOnTwitter() {
    if (!currentArticle) return;
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${currentArticle.title} - EHAMBURG DAILY`);
    const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

// Show share message (notification)
function showShareMessage(message) {
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadArticle();
    
    // Make functions available globally
    window.copyArticleLink = copyArticleLink;
    window.shareOnFacebook = shareOnFacebook;
    window.shareOnTwitter = shareOnTwitter;
});

// Handle back/forward navigation
window.addEventListener('popstate', function() {
    loadArticle();
});