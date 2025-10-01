// Search functionality for both pages
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
    
    console.log('Searching for:', query);
    console.log('Posts grid element:', document.getElementById('posts-grid'));
    console.log('Post items found:', document.querySelectorAll('.post-item').length);
    
    // Search in news articles (if on home page)
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
    
    // Search in posts (if on home page)
    const postItems = document.querySelectorAll('.post-item');
    postItems.forEach((item, index) => {
        const title = item.querySelector('.post-title')?.textContent || '';
        const date = item.querySelector('.post-date')?.textContent || '';
        
        if (title.toLowerCase().includes(query.toLowerCase()) || 
            date.toLowerCase().includes(query.toLowerCase())) {
            
            results.push({
                type: 'post',
                title: title,
                description: `Post from ${date}`,
                date: date,
                element: item,
                index: index
            });
        }
    });
    
    // Also search in posts grid content (fallback for when posts are loading)
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
        const postsGridText = postsGrid.textContent || '';
        if (postsGridText.toLowerCase().includes(query.toLowerCase()) && 
            !postsGridText.includes('Loading latest posts') && 
            !postsGridText.includes('No Posts Yet')) {
            
            // Find the specific post that matches
            const postElements = postsGrid.querySelectorAll('.post-item');
            postElements.forEach((post, index) => {
                const title = post.querySelector('.post-title')?.textContent || '';
                const date = post.querySelector('.post-date')?.textContent || '';
                
                if (title.toLowerCase().includes(query.toLowerCase()) || 
                    date.toLowerCase().includes(query.toLowerCase())) {
                    
                    // Check if this result is already added
                    const isDuplicate = results.some(result => 
                        result.type === 'post' && result.title === title
                    );
                    
                    if (!isDuplicate) {
                        results.push({
                            type: 'post',
                            title: title,
                            description: `Post from ${date}`,
                            date: date,
                            element: post,
                            index: index
                        });
                    }
                }
            });
        }
    }
    
    // Search in game updates
    const gameUpdateTitle = document.querySelector('.game-update-title')?.textContent || '';
    const gameUpdateInfo = document.querySelector('.game-update-info')?.textContent || '';
    
    if (gameUpdateTitle.toLowerCase().includes(query.toLowerCase()) || 
        gameUpdateInfo.toLowerCase().includes(query.toLowerCase())) {
        
        results.push({
            type: 'game-update',
            title: gameUpdateTitle,
            description: gameUpdateInfo,
            element: document.querySelector('.game-update-container'),
            index: 0
        });
    }
    
    // Search in section headers and titles
    const sectionTexts = document.querySelectorAll('.section-text, .gray-section-text');
    sectionTexts.forEach((section, index) => {
        const text = section.textContent || '';
        if (text.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                type: 'section',
                title: text,
                description: 'Section header',
                element: section,
                index: index
            });
        }
    });
    
    // Search in all visible text content (comprehensive search)
    const allTextElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, .news-item-title, .news-item-description, .news-item-date, .post-title, .post-date, .game-update-title, .game-update-info, .section-text, .gray-section-text, .mission-text, .focus-text, .commitment-text');
    
    allTextElements.forEach((element, index) => {
        const text = element.textContent || '';
        const trimmedText = text.trim();
        
        // Skip if text is too short or already found
        if (trimmedText.length < 3) return;
        
        // Check if this text contains the query
        if (trimmedText.toLowerCase().includes(query.toLowerCase())) {
            // Avoid duplicates
            const isDuplicate = results.some(result => 
                result.title === trimmedText || 
                result.description === trimmedText
            );
            
            if (!isDuplicate) {
                // Determine the type based on element classes or tags
                let type = 'content';
                let title = trimmedText;
                let description = 'Website content';
                
                if (element.classList.contains('news-item-title')) {
                    type = 'news';
                    description = 'News article';
                } else if (element.classList.contains('post-title')) {
                    type = 'post';
                    description = 'Post';
                } else if (element.classList.contains('game-update-title')) {
                    type = 'game-update';
                    description = 'Game update';
                } else if (element.classList.contains('section-text') || element.classList.contains('gray-section-text')) {
                    type = 'section';
                    description = 'Section header';
                } else if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
                    type = 'heading';
                    description = 'Page heading';
                }
                
                results.push({
                    type: type,
                    title: title.length > 50 ? title.substring(0, 50) + '...' : title,
                    description: description,
                    element: element,
                    index: index
                });
            }
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
    } else if (type === 'post') {
        const postItems = document.querySelectorAll('.post-item');
        if (postItems[index]) {
            postItems[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add yellow highlight
            postItems[index].style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                postItems[index].style.backgroundColor = '';
            }, 3000);
        }
    } else if (type === 'game-update') {
        const gameUpdateContainer = document.querySelector('.game-update-container');
        if (gameUpdateContainer) {
            gameUpdateContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add yellow highlight
            gameUpdateContainer.style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                gameUpdateContainer.style.backgroundColor = '#ff6b35';
            }, 3000);
        }
    } else if (type === 'section') {
        const sectionElements = document.querySelectorAll('.section-text, .gray-section-text');
        if (sectionElements[index]) {
            sectionElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add yellow highlight
            sectionElements[index].style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                sectionElements[index].style.backgroundColor = '';
            }, 3000);
        }
    } else if (type === 'heading') {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings[index]) {
            headings[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add yellow highlight
            headings[index].style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                headings[index].style.backgroundColor = '';
            }, 3000);
        }
    } else if (type === 'content') {
        const aboutSections = document.querySelectorAll('h1, h2, h3, p, .section-title, .mission-text, .focus-text, .commitment-text');
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

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});
