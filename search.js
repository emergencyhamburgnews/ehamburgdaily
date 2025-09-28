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
    
    // Search in about page content
    const aboutSections = document.querySelectorAll('h1, h2, h3, p, .section-title, .mission-text, .focus-text, .commitment-text');
    aboutSections.forEach((section, index) => {
        const text = section.textContent || '';
        if (text.toLowerCase().includes(query.toLowerCase()) && text.length > 10) {
            results.push({
                type: 'content',
                title: section.tagName === 'H1' || section.tagName === 'H2' || section.tagName === 'H3' ? text : 'Content',
                description: text.substring(0, 100) + '...',
                element: section,
                index: index
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
