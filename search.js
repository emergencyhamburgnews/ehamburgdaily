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
                            <span class="search-suggestion-icon">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="8"></circle>
                                </svg>
                            </span> ${search}
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
    
    console.log('🔍 Searching for:', query, 'on page:', document.title);
    
    // Normalize query for better matching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Clear previous results cache
    window.searchElementsCache = [];
    
    // Universal search - works on ALL pages
    // This will search through ALL text content on the page regardless of page type
    const allTextElements = document.querySelectorAll(`
        h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, label, button, a,
        .news-item-title, .news-item-description, .news-item-date,
        .post-title, .post-date, .game-update-title, .game-update-info,
        .section-text, .gray-section-text, .mission-text, .focus-text, .commitment-text,
        .dev-name, .dev-username, .role-tag, .credits-title, .credits-subtitle,
        .about-title, .about-subtitle, .section-title, .focus-title, .thank-you-title,
        .contact-item, .stat-label, .nav-section-item, .nav-section-title,
        .emergency-hamburg-title, .role-title, .game-description, .play-button,
        .settings-section, .form-group, .checkbox-label, .status-label, .status-value,
        [data-search-content]
    `);
    
    console.log('📊 Found', allTextElements.length, 'searchable elements on this page');
    
    // Create a Set to track unique results and avoid duplicates
    const uniqueResults = new Set();
    let elementIndex = 0;
    
    allTextElements.forEach((element) => {
        const text = element.textContent || '';
        const searchContent = element.getAttribute('data-search-content') || '';
        const combinedText = `${text} ${searchContent}`.trim();
        
        // Skip if text is too short, invisible, or is a script/style element
        if (combinedText.length < 2 || 
            element.offsetParent === null || 
            ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName) ||
            element.style.display === 'none') {
            return;
        }
        
        // Check if text matches query (case insensitive)
        const textLower = combinedText.toLowerCase();
        if (textLower.includes(normalizedQuery)) {
            
            // Determine content type and description based on element and page
            let type = 'content';
            let description = 'Page content';
            let title = text.trim();
            
            // Smart type detection based on element classes and context
            if (element.classList.contains('news-item-title') || element.closest('.news-item')) {
                type = 'news';
                description = 'News article';
            } else if (element.classList.contains('post-title') || element.closest('.post-item')) {
                type = 'post';
                description = 'Post';
            } else if (element.classList.contains('dev-name') || element.closest('.dev-card')) {
                type = 'developer';
                description = 'Team member';
                // For dev cards, show the name as title
                const devName = element.closest('.dev-card')?.querySelector('.dev-name')?.textContent;
                if (devName) title = devName;
            } else if (element.classList.contains('game-update-title') || element.closest('.game-update-container')) {
                type = 'game-update';
                description = 'Game update';
            } else if (element.classList.contains('section-text') || element.classList.contains('gray-section-text')) {
                type = 'section';
                description = 'Section header';
            } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
                type = 'heading';
                description = 'Page heading';
            } else if (element.classList.contains('emergency-hamburg-title') || element.classList.contains('role-title')) {
                type = 'emergency-hamburg';
                description = 'Emergency Hamburg content';
            } else if (element.closest('.settings-section') || element.classList.contains('status-label')) {
                type = 'settings';
                description = 'Settings content';
            } else if (element.classList.contains('about-title') || element.classList.contains('mission-text') || 
                      element.classList.contains('focus-text') || element.classList.contains('commitment-text')) {
                type = 'about';
                description = 'About page content';
            } else if (element.classList.contains('credits-title') || element.closest('.credits-main')) {
                type = 'credits';
                description = 'Credits content';
            }
            
            // Create unique key to avoid duplicates
            const uniqueKey = `${type}-${title.substring(0, 50)}-${element.tagName}`;
            
            if (!uniqueResults.has(uniqueKey) && title.length > 0) {
                uniqueResults.add(uniqueKey);
                
                // Store element in global cache with unique ID
                const uniqueId = `search_${type}_${Date.now()}_${elementIndex++}`;
                window.searchElementsCache.push({
                    id: uniqueId,
                    element: element,
                    type: type
                });
                
                results.push({
                    type: type,
                    title: title.length > 60 ? title.substring(0, 60) + '...' : title,
                    description: description,
                    element: element,
                    elementId: uniqueId,
                    page: document.title.replace(' - EHAMBURG DAILY', '') || 'Home'
                });
            }
        }
    });
    
    console.log(`📊 Found ${results.length} search results`);
    console.log('Cached elements:', window.searchElementsCache.length);
    
    displaySearchResults(results, query);
}

// New function to scroll to specific search element using cached elements
function scrollToSearchElement(elementId) {
    console.log('🎯 Attempting to scroll to element with ID:', elementId);
    
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('search-input');
    
    // Hide search results
    if (searchResults) searchResults.style.display = 'none';
    if (searchInput) searchInput.value = '';
    
    // Check if cache exists
    if (!window.searchElementsCache || !Array.isArray(window.searchElementsCache)) {
        console.error('❌ Search elements cache not found or invalid');
        return;
    }
    
    console.log('📋 Cache contains', window.searchElementsCache.length, 'elements');
    
    // Find the element in cache
    const cachedItem = window.searchElementsCache.find(item => item.id === elementId);
    
    if (!cachedItem) {
        console.error('❌ Element not found in cache. ID:', elementId);
        console.log('Available cache IDs:', window.searchElementsCache.map(item => item.id));
        return;
    }
    
    if (!cachedItem.element) {
        console.error('❌ Cached item has no element:', cachedItem);
        return;
    }
    
    console.log('✅ Found cached element:', cachedItem);
    
    // Check if element is still in DOM
    if (!document.body.contains(cachedItem.element)) {
        console.error('❌ Element is no longer in DOM:', cachedItem.element);
        return;
    }
    
    // Check if element is visible
    const rect = cachedItem.element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
        console.warn('⚠️  Element appears to be hidden or has zero dimensions');
    }
    
    console.log('📐 Element position:', {
        top: cachedItem.element.offsetTop,
        left: cachedItem.element.offsetLeft,
        rect: rect
    });
    
    // Scroll to element
    scrollToElementWithOffset(cachedItem.element);
    highlightElement(cachedItem.element, cachedItem.type);
    
    console.log('✅ Successfully scrolled to element');
}

// Function to scroll with mobile offset consideration
function scrollToElementWithOffset(element) {
    if (!element) {
        console.error('❌ scrollToElementWithOffset: No element provided');
        return;
    }
    
    const isMobile = window.innerWidth <= 768;
    const offset = isMobile ? 140 : 100;
    
    // Get element position relative to document
    let elementPosition = 0;
    let currentElement = element;
    
    // Calculate cumulative offset from document top
    while (currentElement) {
        elementPosition += currentElement.offsetTop;
        currentElement = currentElement.offsetParent;
    }
    
    const offsetPosition = Math.max(0, elementPosition - offset);
    
    console.log('📐 Scroll calculation:', {
        elementOffsetTop: element.offsetTop,
        calculatedPosition: elementPosition,
        offset: offset,
        finalScrollPosition: offsetPosition,
        isMobile: isMobile
    });
    
    // Try using element.scrollIntoView as fallback
    try {
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Alternative method if the above doesn't work
        setTimeout(() => {
            const rect = element.getBoundingClientRect();
            if (rect.top < 0 || rect.top > window.innerHeight) {
                console.log('🔄 Using scrollIntoView fallback');
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Scroll error:', error);
        // Final fallback
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
    }
}

// Function to highlight an element
function highlightElement(element, type) {
    if (type === 'developer') {
        element.style.backgroundColor = '#ff6b35';
        element.style.color = '#ffffff';
        setTimeout(() => {
            element.style.backgroundColor = '';
            element.style.color = '';
        }, 3000);
    } else {
        element.style.backgroundColor = '#ffeb3b';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 3000);
    }
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
                <div class="search-no-results-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21L16.5 16.5"></path>
                    </svg>
                </div>
                <div class="search-no-results-text">No results found for "${query}"</div>
                <div class="search-no-results-suggestion">Try different keywords or check spelling</div>
            </div>
        `;
        searchResults.style.display = 'block';
        return;
    }
    
    // Group results by type
    const groupedResults = {};
    results.forEach((result, globalIndex) => {
        if (!groupedResults[result.type]) {
            groupedResults[result.type] = [];
        }
        groupedResults[result.type].push(result);
    });
    
    // Define icons and labels for each type
    const typeConfig = {
        'news': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2z"></path><path d="M6 12h2"></path><path d="M6 8h6"></path><path d="M6 16h4"></path></svg>', 
            label: 'News Articles' 
        },
        'post': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline></svg>', 
            label: 'Posts' 
        },
        'game-update': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><polygon points="12,7 15,12 9,12" fill="currentColor"></polygon></svg>', 
            label: 'Game Updates' 
        },
        'developer': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', 
            label: 'Team Members' 
        },
        'section': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>', 
            label: 'Sections' 
        },
        'heading': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4,7 4,4 20,4 20,7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>', 
            label: 'Page Content' 
        },
        'credits': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', 
            label: 'Credits' 
        },
        'navigation': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>', 
            label: 'Navigation' 
        },
        'content': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>', 
            label: 'Content' 
        },
        'about': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>', 
            label: 'About Content' 
        },
        'settings': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>', 
            label: 'Settings' 
        },
        'emergency-hamburg': { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"></path><path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1h-8.515a2 2 0 0 0-1.414.586l-1.414 1.414A2 2 0 0 1 8.243 6.5H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h5.243a2 2 0 0 1 1.414.586l1.414 1.414A2 2 0 0 0 12.485 17H21z"></path></svg>', 
            label: 'Emergency Hamburg' 
        }
    };
    
    let html = `<div class="search-results-header">
        <span class="search-results-count">${results.length} results found</span>
    </div>`;
    
    Object.keys(groupedResults).forEach(type => {
        const config = typeConfig[type] || { 
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline></svg>', 
            label: 'Content' 
        };
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
        
        typeResults.forEach((result, resultIndex) => {
            const highlightedTitle = highlightText(result.title, query);
            const highlightedDescription = highlightText(result.description, query);
            
            html += `
                <div class="search-result-item" onclick="scrollToSearchElement('${result.elementId}')">
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


// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});
