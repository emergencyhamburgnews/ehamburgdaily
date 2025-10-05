// Enhanced Search functionality with modern features
let searchTimeout;
let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchClear = document.getElementById('search-clear');
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (!searchInput || !searchResults) return;
    
    // Show/hide clear button
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        // Show/hide clear button
        if (query.length > 0) {
            searchClear.style.display = 'flex';
        } else {
            searchClear.style.display = 'none';
        }
        
        if (query.length === 0) {
            showSearchSuggestions();
            return;
        }
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
            addToSearchHistory(query);
        }, 300);
    });
    
    // Focus event to show suggestions
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length === 0) {
            showSearchSuggestions();
        } else {
            searchResults.style.display = 'block';
        }
    });
    
    // Clear button functionality
    if (searchClear) {
        searchClear.addEventListener('click', function() {
            searchInput.value = '';
            searchClear.style.display = 'none';
            searchResults.style.display = 'none';
            searchInput.focus();
        });
    }
    
    // Suggestion item clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('search-suggestion-item')) {
            const searchTerm = e.target.getAttribute('data-search');
            searchInput.value = searchTerm;
            performSearch(searchTerm);
            addToSearchHistory(searchTerm);
        }
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && 
            !searchResults.contains(e.target) && 
            !searchClear.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const activeItems = document.querySelectorAll('.search-result-item, .search-suggestion-item');
        let currentIndex = Array.from(activeItems).findIndex(item => item.classList.contains('active'));
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < activeItems.length - 1) {
                if (currentIndex >= 0) activeItems[currentIndex].classList.remove('active');
                activeItems[currentIndex + 1].classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                activeItems[currentIndex].classList.remove('active');
                activeItems[currentIndex - 1].classList.add('active');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentIndex >= 0) {
                activeItems[currentIndex].click();
            }
        }
    });
}

function showSearchSuggestions() {
    const searchResults = document.getElementById('search-results');
    const searchSuggestions = document.getElementById('search-suggestions');
    const searchResultsContent = document.getElementById('search-results-content');
    
    if (searchSuggestions && searchResultsContent) {
        searchSuggestions.style.display = 'block';
        searchResultsContent.innerHTML = '';
        
        // Add recent searches if any
        if (recentSearches.length > 0) {
            const recentSearchesHtml = `
                <div class="search-category">
                    <div class="search-category-title">Recent Searches</div>
                    ${recentSearches.slice(0, 3).map(search => 
                        `<div class="search-suggestion-item" data-search="${search}">
                            <span class="search-suggestion-icon">•</span> ${search}
                        </div>`
                    ).join('')}
                </div>
            `;
            searchSuggestions.innerHTML += recentSearchesHtml;
        }
        
        searchResults.style.display = 'block';
    }
}

function addToSearchHistory(query) {
    if (!query || query.length < 2) return;
    
    // Add to recent searches (avoid duplicates)
    recentSearches = recentSearches.filter(search => search !== query);
    recentSearches.unshift(query);
    recentSearches = recentSearches.slice(0, 5); // Keep only 5 recent searches
    
    // Add to search history with timestamp
    searchHistory.unshift({
        query: query,
        timestamp: new Date().toISOString()
    });
    searchHistory = searchHistory.slice(0, 20); // Keep only 20 history items
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    const results = [];
    
    console.log('🔍 Searching for:', query);
    
    // Normalize query for better matching
    const normalizedQuery = query.toLowerCase().trim();
    
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
    
    // Search in credits/developer content
    const devCards = document.querySelectorAll('.dev-card');
    devCards.forEach((card, index) => {
        const searchContent = card.getAttribute('data-search-content') || '';
        const devName = card.querySelector('.dev-name')?.textContent || '';
        const devUsername = card.querySelector('.dev-username')?.textContent || '';
        const roles = Array.from(card.querySelectorAll('.role-tag')).map(tag => tag.textContent).join(' ');
        
        const combinedContent = `${searchContent} ${devName} ${devUsername} ${roles}`;
        
        if (combinedContent.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                type: 'developer',
                title: devName,
                description: `Developer: ${roles}`,
                element: card,
                index: index
            });
        }
    });
    
    // Search in credits text content
    const creditsTextElements = document.querySelectorAll('.credits-title, .credits-subtitle, .credits-text, .contact-text, .stat-label, .contact-item');
    creditsTextElements.forEach((element, index) => {
        const text = element.textContent || '';
        if (text.toLowerCase().includes(query.toLowerCase())) {
            const isDuplicate = results.some(result => result.title === text);
            if (!isDuplicate) {
                results.push({
                    type: 'credits',
                    title: text.length > 50 ? text.substring(0, 50) + '...' : text,
                    description: 'Credits page content',
                    element: element,
                    index: index
                });
            }
        }
    });
    
    // Comprehensive search across ALL text content
    const searchableElements = document.querySelectorAll(`
        h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, label, button,
        .news-item-title, .news-item-description, .news-item-date,
        .post-title, .post-date, .game-update-title, .game-update-info,
        .section-text, .gray-section-text, .mission-text, .focus-text, .commitment-text,
        .dev-name, .dev-username, .role-tag, .credits-title, .credits-subtitle,
        .about-title, .about-subtitle, .section-title, .focus-title, .thank-you-title,
        .contact-item, .stat-label, .nav-section-item, .nav-section-title,
        [data-search-content]
    `);
    
    // Create a Set to track unique results and avoid duplicates
    const uniqueResults = new Set();
    
    searchableElements.forEach((element, index) => {
        const text = element.textContent || '';
        const searchContent = element.getAttribute('data-search-content') || '';
        const combinedText = `${text} ${searchContent}`.trim();
        
        // Skip if text is too short
        if (combinedText.length < 2) return;
        
        // Check if text matches query (partial matching)
        const textLower = combinedText.toLowerCase();
        if (textLower.includes(normalizedQuery)) {
            
            // Determine content type and description
            let type = 'content';
            let description = 'Page content';
            let title = text.trim();
            
            // Better type detection
            if (element.classList.contains('news-item-title') || element.closest('.news-item')) {
                type = 'news';
                description = 'News article';
            } else if (element.classList.contains('post-title') || element.closest('.post-item')) {
                type = 'post';
                description = 'Post';
            } else if (element.classList.contains('dev-name') || element.closest('.dev-card')) {
                type = 'developer';
                description = 'Team member';
            } else if (element.classList.contains('game-update-title') || element.closest('.game-update-container')) {
                type = 'game-update';
                description = 'Game update';
            } else if (element.classList.contains('section-text') || element.classList.contains('gray-section-text')) {
                type = 'section';
                description = 'Section header';
            } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                type = 'heading';
                description = 'Page heading';
            } else if (element.classList.contains('role-tag')) {
                type = 'developer';
                description = 'Developer role';
            } else if (element.classList.contains('nav-section-item') || element.classList.contains('nav-section-title')) {
                type = 'navigation';
                description = 'Navigation item';
            }
            
            // Create unique key to avoid duplicates
            const uniqueKey = `${type}-${title.substring(0, 30)}`;
            
            if (!uniqueResults.has(uniqueKey) && title.length > 0) {
                uniqueResults.add(uniqueKey);
                
                // Highlight matching text
                const highlightedTitle = highlightMatchingText(title, query);
                
                results.push({
                    type: type,
                    title: title.length > 60 ? title.substring(0, 60) + '...' : title,
                    description: description,
                    element: element,
                    index: results.length,
                    highlightedTitle: highlightedTitle
                });
            }
        }
    });
    
    console.log(`📊 Found ${results.length} search results`);
    
    // Helper function to highlight matching text
    function highlightMatchingText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    const searchResultsContent = document.getElementById('search-results-content');
    const searchSuggestions = document.getElementById('search-suggestions');
    
    // Hide suggestions when showing results
    if (searchSuggestions) {
        searchSuggestions.style.display = 'none';
    }
    
    if (results.length === 0) {
        searchResultsContent.innerHTML = `
            <div class="search-no-results">
                <div class="search-no-results-icon">•</div>
                <div class="search-no-results-text">No results found for "${query}"</div>
                <div class="search-no-results-suggestion">Try different keywords or check spelling</div>
            </div>
        `;
        searchResults.style.display = 'block';
        return;
    }
    
    // Group results by type
    const groupedResults = {};
    results.forEach(result => {
        if (!groupedResults[result.type]) {
            groupedResults[result.type] = [];
        }
        groupedResults[result.type].push(result);
    });
    
    // Define icons and labels for each type
    const typeConfig = {
        'news': { icon: '•', label: 'News Articles' },
        'post': { icon: '•', label: 'Posts' },
        'game-update': { icon: '•', label: 'Game Updates' },
        'developer': { icon: '•', label: 'Team Members' },
        'section': { icon: '•', label: 'Sections' },
        'heading': { icon: '•', label: 'Page Content' },
        'credits': { icon: '•', label: 'Credits' },
        'navigation': { icon: '•', label: 'Navigation' },
        'content': { icon: '•', label: 'Content' }
    };
    
    let html = `<div class="search-results-header">
        <span class="search-results-count">${results.length} results found</span>
    </div>`;
    
    Object.keys(groupedResults).forEach(type => {
        const config = typeConfig[type] || { icon: '📄', label: 'Content' };
        const typeResults = groupedResults[type];
        
        html += `
            <div class="search-results-category">
                <div class="search-results-category-header">
                    <span class="search-results-category-icon">${config.icon}</span>
                    <span class="search-results-category-title">${config.label}</span>
                    <span class="search-results-category-count">(${typeResults.length})</span>
                </div>
                <div class="search-results-category-items">
        `;
        
        typeResults.forEach(result => {
            const highlightedTitle = highlightText(result.title, query);
            const highlightedDescription = highlightText(result.description, query);
            
            html += `
                <div class="search-result-item" onclick="selectSearchResult('${result.type}', ${result.index || 0})">
                    <div class="search-result-content">
                        <div class="search-result-title">${highlightedTitle}</div>
                        <div class="search-result-preview">${highlightedDescription}</div>
                    </div>
                    <div class="search-result-arrow">→</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    searchResultsContent.innerHTML = html;
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
    } else if (type === 'developer') {
        const devCards = document.querySelectorAll('.dev-card');
        if (devCards[index]) {
            devCards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add blue highlight for developer cards
            devCards[index].style.backgroundColor = '#007bff';
            devCards[index].style.color = '#ffffff';
            setTimeout(() => {
                devCards[index].style.backgroundColor = '';
                devCards[index].style.color = '';
            }, 3000);
        }
    } else if (type === 'credits') {
        const creditsElements = document.querySelectorAll('.credits-title, .credits-subtitle, .credits-text, .contact-text, .stat-label, .contact-item');
        if (creditsElements[index]) {
            creditsElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add yellow highlight
            creditsElements[index].style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                creditsElements[index].style.backgroundColor = '';
            }, 3000);
        }
    } else if (type === 'navigation') {
        // For navigation items, just highlight them
        const navItems = document.querySelectorAll('.nav-section-item, .nav-section-title');
        if (navItems[index]) {
            navItems[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            navItems[index].style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                navItems[index].style.backgroundColor = '';
            }, 3000);
        }
    } else if (type === 'content') {
        // Generic content search - find the specific element
        const allElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, .section-title, .mission-text, .focus-text, .commitment-text, .about-title, .credits-title');
        if (allElements[index]) {
            allElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add yellow highlight
            allElements[index].style.backgroundColor = '#ffeb3b';
            setTimeout(() => {
                allElements[index].style.backgroundColor = '';
            }, 3000);
        }
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});
