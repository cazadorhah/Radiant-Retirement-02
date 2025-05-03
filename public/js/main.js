/**
 * Main JavaScript file for the Radiant Retirement website
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Current year for the footer copyright
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.current-year');
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });

    // Handle search functionality
    initSearchFunctionality();
});

/**
 * Initialize the search functionality with auto-suggestions
 */
function initSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (!searchInput || !searchSuggestions) return;
    
    // Sample cities and facilities for auto-suggestions
    // In production, this would be loaded from the server or a JSON file
    const suggestionsData = [
        { type: 'city', name: 'New York, NY', slug: 'new-york-ny' },
        { type: 'city', name: 'Los Angeles, CA', slug: 'los-angeles-ca' },
        { type: 'city', name: 'Chicago, IL', slug: 'chicago-il' },
        { type: 'city', name: 'Houston, TX', slug: 'houston-tx' },
        { type: 'city', name: 'Phoenix, AZ', slug: 'phoenix-az' },
        { type: 'city', name: 'Philadelphia, PA', slug: 'philadelphia-pa' },
        { type: 'facility', name: 'Sunrise Senior Living of Phoenix', city: 'Phoenix, AZ', slug: 'phoenix-az' },
        { type: 'facility', name: 'Golden Years Retirement Home', city: 'Phoenix, AZ', slug: 'phoenix-az' },
        { type: 'facility', name: 'Autumn Leaves of Chicago', city: 'Chicago, IL', slug: 'chicago-il' },
        { type: 'facility', name: 'Brookdale Battery Park', city: 'New York, NY', slug: 'new-york-ny' }
    ];
    
    let selectedSuggestionIndex = -1;
    
    // Function to show suggestions based on input
    function showSuggestions(query) {
        if (!query) {
            searchSuggestions.classList.remove('active');
            searchSuggestions.innerHTML = '';
            return;
        }
        
        query = query.toLowerCase();
        const matchingSuggestions = suggestionsData.filter(item => {
            return item.name.toLowerCase().includes(query);
        }).slice(0, 5); // Limit to 5 suggestions
        
        if (matchingSuggestions.length === 0) {
            searchSuggestions.classList.remove('active');
            return;
        }
        
        searchSuggestions.innerHTML = '';
        matchingSuggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('suggestion-item');
            suggestionElement.setAttribute('data-index', index);
            
            // Display different information based on type
            if (suggestion.type === 'city') {
                suggestionElement.innerHTML = `
                    <strong>${suggestion.name}</strong>
                    <span class="suggestion-type">City</span>
                `;
            } else {
                suggestionElement.innerHTML = `
                    <strong>${suggestion.name}</strong>
                    <span class="suggestion-type">Facility in ${suggestion.city}</span>
                `;
            }
            
            // Handle click event
            suggestionElement.addEventListener('click', function() {
                if (suggestion.type === 'city') {
                    window.location.href = `/city/${suggestion.slug}/`;
                } else {
                    window.location.href = `/city/${suggestion.slug}/#facility-${suggestion.name.toLowerCase().replace(/\s+/g, '-')}`;
                }
            });
            
            searchSuggestions.appendChild(suggestionElement);
        });
        
        searchSuggestions.classList.add('active');
        selectedSuggestionIndex = -1;
    }
    
    // Input event
    searchInput.addEventListener('input', function() {
        showSuggestions(this.value);
    });
    
    // Focus event
    searchInput.addEventListener('focus', function() {
        if (this.value) {
            showSuggestions(this.value);
        }
    });
    
    // Click event outside to close suggestions
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const suggestionItems = searchSuggestions.querySelectorAll('.suggestion-item');
        
        if (!suggestionItems.length) return;
        
        // Down arrow
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestionItems.length;
            updateSelectedSuggestion(suggestionItems);
        } 
        // Up arrow
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = selectedSuggestionIndex <= 0 ? suggestionItems.length - 1 : selectedSuggestionIndex - 1;
            updateSelectedSuggestion(suggestionItems);
        } 
        // Enter key
        else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            suggestionItems[selectedSuggestionIndex].click();
        }
    });
    
    // Update the selected suggestion UI
    function updateSelectedSuggestion(items) {
        items.forEach((item, index) => {
            if (index === selectedSuggestionIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

/**
 * Smooth scroll to an element on the page
 * @param {string} elementId - The ID of the element to scroll to
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const headerOffset = 80; // Adjust based on your header height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}