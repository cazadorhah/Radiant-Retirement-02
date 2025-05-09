// search.js - Enhanced with autocomplete and pagination for Netlify-based site

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const filterForm = document.getElementById('filter-form');
    const resultsContainer = document.querySelector('.results-container');
    const resultsMeta = document.querySelector('.results-meta h2');
    
    // Configuration
    const RESULTS_PER_PAGE = 50; // Increased from 15 to 50
    let currentPage = 1;
    let totalResults = 0;
    let allCityData = []; // Will store all city data for autocomplete
    
    // Debug logging
    console.log('Search script initialized');
    
    // Load city data for autocomplete
    function loadCityData() {
        console.log('Attempting to load city data from /data/city-index.json');
        
        fetch('/data/city-index.json')
            .then(response => {
                console.log('City data response status:', response.status);
                if (!response.ok) {
                    throw new Error(`Failed to load city data: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Successfully loaded ${data.length} cities for autocomplete`);
                allCityData = data;
                initializeAutocomplete();
            })
            .catch(error => {
                console.error('Error loading city data:', error);
                // Try alternate location if primary fails
                console.log('Trying alternate location for city data...');
                fetch('/js/search-data.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load backup city data: ${response.status} ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(`Successfully loaded ${data.length || Object.keys(data).length} entries from backup location`);
                        // Handle different data structures
                        if (data.cities) {
                            allCityData = data.cities;
                        } else {
                            allCityData = data;
                        }
                        initializeAutocomplete();
                    })
                    .catch(backupError => {
                        console.error('Error loading backup city data:', backupError);
                    });
            });
    }
    
// Initialize autocomplete functionality
function initializeAutocomplete() {
    console.log('Initializing enhanced autocomplete with', allCityData.length, 'cities');
    
    // Create autocomplete container if it doesn't exist
    let autocompleteContainer = document.getElementById('autocomplete-container');
    if (!autocompleteContainer) {
        autocompleteContainer = document.createElement('div');
        autocompleteContainer.id = 'autocomplete-container';
        autocompleteContainer.className = 'autocomplete-items';
        searchInput.parentElement.appendChild(autocompleteContainer);
    }
    
    let currentFocus = -1;
    
    // Debounce function to prevent excessive searches
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Process input with debounce
    const processInput = debounce(function(value) {
        autocompleteContainer.style.display = 'none';
        autocompleteContainer.innerHTML = '';
        
        if (!value || value.length < 2) return;
        
        // Find and rank matches
        const matches = findMatches(value);
        
        if (matches.length > 0) {
            autocompleteContainer.style.display = 'block';
            renderAutocomplete(matches, autocompleteContainer, value);
            currentFocus = -1;
        }
    }, 200); // 200ms debounce
    
    // Input event to show suggestions
    searchInput.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        processInput(value);
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const suggestions = autocompleteContainer.querySelectorAll('.autocomplete-suggestion');
        if (!suggestions.length) return;
        
        // Down arrow
        if (e.keyCode === 40) {
            currentFocus++;
            if (currentFocus >= suggestions.length) currentFocus = 0;
            setActiveSuggestion(suggestions, currentFocus);
        } 
        // Up arrow
        else if (e.keyCode === 38) {
            currentFocus--;
            if (currentFocus < 0) currentFocus = suggestions.length - 1;
            setActiveSuggestion(suggestions, currentFocus);
        } 
        // Enter key - prevent default only if autocomplete is active
        else if (e.keyCode === 13 && autocompleteContainer.style.display === 'block') {
            e.preventDefault();
            if (currentFocus > -1 && suggestions[currentFocus]) {
                suggestions[currentFocus].click();
            }
        }
        // Escape key - close autocomplete
        else if (e.keyCode === 27) {
            autocompleteContainer.style.display = 'none';
        }
    });
    
    // Hide autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput) {
            autocompleteContainer.style.display = 'none';
        }
    });
    
    console.log('Enhanced autocomplete initialization complete');
}

// Find and rank matches with advanced matching algorithm
function findMatches(query) {
    query = query.toLowerCase().trim();
    
    // Create an array to hold matches with their score
    const scoredMatches = [];
    
    // Process each city
    allCityData.forEach(city => {
        const cityName = (city.name || '').toLowerCase();
        const stateName = (city.state || '').toLowerCase();
        const stateAbbr = (city.state_abbr || '').toLowerCase();
        
        // Calculate match score (higher is better)
        let score = 0;
        let matched = false;
        
        // Exact matches get high scores
        if (cityName === query) {
            score += 100;
            matched = true;
        }
        
        // Starts with matches get good scores
        if (cityName.startsWith(query)) {
            score += 50;
            matched = true;
        }
        
        // Contains matches get medium scores
        if (cityName.includes(query)) {
            score += 25;
            matched = true;
        }
        
        // State name/abbreviation matches
        if (stateName.includes(query)) {
            score += 15;
            matched = true;
        }
        
        if (stateAbbr === query) {
            score += 10;
            matched = true;
        }
        
        // Check search tokens if available
        if (city.search_tokens) {
            for (const token of city.search_tokens) {
                if (token === query) {
                    score += 30;
                    matched = true;
                } else if (token.startsWith(query)) {
                    score += 20;
                    matched = true;
                } else if (token.includes(query)) {
                    score += 10;
                    matched = true;
                }
            }
        }
        
        // Word boundary matching (e.g. "york" matching "New York")
        const words = cityName.split(/\s+/);
        for (const word of words) {
            if (word === query) {
                score += 40;
                matched = true;
            } else if (word.startsWith(query)) {
                score += 30;
                matched = true;
            }
        }
        
        // Simple fuzzy matching for typos (edit distance check)
        if (!matched && query.length > 3) {
            // Check if city name is close to query with simple edit distance
            if (getEditDistance(cityName, query) <= 2) {
                score += 5;
                matched = true;
            }
        }
        
        // Boost score for cities with higher population or facility count
        if (matched) {
            if (city.population > 1000000) score += 5;
            if (city.facility_count > 50) score += 3;
            
            scoredMatches.push({
                city: city,
                score: score
            });
        }
    });
    
    // Sort by score (highest first) and take top 10
    return scoredMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.city);
}

// Simple edit distance for fuzzy matching
function getEditDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let i = 0; i <= a.length; i++) {
        matrix[0][i] = i;
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) === a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i-1][j-1] + 1, // Substitution
                    matrix[i][j-1] + 1,   // Insertion
                    matrix[i-1][j] + 1    // Deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// Render autocomplete with highlighting
function renderAutocomplete(matches, container, query) {
    container.innerHTML = '';
    
    matches.forEach(city => {
        const suggestion = document.createElement('div');
        suggestion.className = 'autocomplete-suggestion';
        
        // Highlight matching parts in city name
        const cityName = city.name;
        const stateName = city.state;
        const highlightedName = highlightMatch(cityName, query);
        
        suggestion.innerHTML = `${highlightedName}, ${stateName}`;
        
        suggestion.addEventListener('click', function() {
            searchInput.value = `${cityName}, ${stateName}`;
            container.style.display = 'none';
            // Optional: Auto-submit the form
            // searchForm.submit();
        });
        
        container.appendChild(suggestion);
    });
}

// Highlight matching text
function highlightMatch(text, query) {
    if (!query || query.length < 2) return text;
    
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return text.replace(regex, '<strong>$1</strong>');
}
    
    // Handle search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            currentPage = 1; // Reset to first page on new search
            performSearch();
        });
    }
    
    // Handle filter form submission
    if (filterForm) {
        filterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            currentPage = 1; // Reset to first page on new filter
            performSearch();
        });
    }
    
    // Perform search with filters and pagination using Netlify function
    function performSearch() {
        const query = searchInput ? searchInput.value.trim() : '';
        console.log('Performing search with query:', query);
        
        // Create URLSearchParams object for the query
        const filterParams = new URLSearchParams();
        
        // Add query parameter
        filterParams.append('q', query);
        filterParams.append('page', currentPage.toString());
        filterParams.append('limit', RESULTS_PER_PAGE.toString());
        
        // Add form parameters if filterForm exists
        if (filterForm) {
            const formData = new FormData(filterForm);
            for (const [key, value] of formData.entries()) {
                if (value) filterParams.append(key, value);
            }
        }
        
        // Update URL with search parameters
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of filterParams.entries()) {
            if (value) searchParams.set(key, value);
            else searchParams.delete(key);
        }
        
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        history.pushState({}, '', newUrl);
        
        // Show loading state
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="loading">Loading results...</div>';
        }
        
        // Fetch search results from the Netlify function
        console.log('Fetching results from /.netlify/functions/search');
        fetch(`/.netlify/functions/search?${filterParams.toString()}`)
            .then(response => {
                console.log('Search response status:', response.status);
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Server error response:', text);
                        throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(`Got ${data.total} search results`);
                renderSearchResults(data);
            })
            .catch(error => {
                console.error('Detailed search error:', error);
                // Fallback to client-side search if Netlify function fails
                console.log('Falling back to client-side search...');
                
                if (allCityData.length > 0) {
                    performClientSideSearch(query);
                } else {
                    // Try to load city data for client-side search
                    fetch('/data/city-index.json')
                        .then(response => response.json())
                        .then(data => {
                            allCityData = data;
                            performClientSideSearch(query);
                        })
                        .catch(err => {
                            console.error('Failed to load city data for fallback search:', err);
                            if (resultsContainer) {
                                resultsContainer.innerHTML = `
                                    <div class="error">
                                        <p>An error occurred while searching. Please try again later.</p>
                                        <p>Error details: ${error.message}</p>
                                    </div>
                                `;
                            }
                        });
                }
            });
    }
    
    // Fallback client-side search function
    function performClientSideSearch(query) {
        query = query.toLowerCase();
        
        // Filter cities based on query
        let results = [];
        
        if (query) {
            results = allCityData.filter(city => {
                const cityName = (city.name || '').toLowerCase();
                const stateName = (city.state || '').toLowerCase();
                return cityName.includes(query) || stateName.includes(query);
            });
        } else {
            results = allCityData.slice(0, RESULTS_PER_PAGE);
        }
        
        // Apply pagination
        const total = results.length;
        const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
        const endIndex = startIndex + RESULTS_PER_PAGE;
        const paginatedResults = results.slice(startIndex, endIndex);
        
        // Format for rendering
        const formattedResults = paginatedResults.map(city => ({
            ...city,
            type: 'city',
            population: city.population || 0,
            assisted_living_cost: city.assisted_living_cost || 0,
            memory_care_cost: city.memory_care_cost || 0,
            facility_count: city.facility_count || 0
        }));
        
        renderSearchResults({
            total: total,
            results: formattedResults
        });
    }
    
    // Render search results with pagination
    function renderSearchResults(data) {
        if (!resultsContainer) return;
        
        totalResults = data.total || 0;
        const results = data.results || [];
        
        // Update results meta
        if (resultsMeta) {
            resultsMeta.textContent = `${totalResults} Results`;
        }
        
        // Clear previous results
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => {
            tab.innerHTML = '';
        });
        
        // Group results by type
        const cityResults = results.filter(result => result.type === 'city');
        const facilityResults = results.filter(result => result.type === 'facility');
        
        // Render all results tab
        const allTab = document.getElementById('all');
        if (allTab) {
            results.forEach(result => {
                const resultCard = createResultCard(result);
                allTab.appendChild(resultCard);
            });
        }
        
        // Render cities tab
        const citiesTab = document.getElementById('cities');
        if (citiesTab) {
            cityResults.forEach(result => {
                const resultCard = createResultCard(result);
                citiesTab.appendChild(resultCard);
            });
        }
        
        // Render facilities tab
        const facilitiesTab = document.getElementById('facilities');
        if (facilitiesTab) {
            facilityResults.forEach(result => {
                const resultCard = createResultCard(result);
                facilitiesTab.appendChild(resultCard);
            });
        }
        
        // Add pagination if needed
        if (totalResults > RESULTS_PER_PAGE) {
            const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
            renderPagination(totalPages);
        }
        
        // Restore tab state
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab) {
            const tabName = activeTab.dataset.tab;
            showTab(tabName);
        }
    }
    
    // Create a result card element
    function createResultCard(result) {
        const card = document.createElement('div');
        card.className = `result-card ${result.type}-result`;
        
        let html = '';
        
        if (result.type === 'city') {
            const population = result.population ? result.population.toLocaleString() : '0';
            const assistedLivingCost = result.assisted_living_cost ? result.assisted_living_cost.toLocaleString() : '0';
            const memoryCareCost = result.memory_care_cost ? result.memory_care_cost.toLocaleString() : '0';
            
            html = `
                <div class="result-content">
                    <h3 class="result-title">
                        <a href="${result.url}">${result.name}, ${result.state}</a>
                    </h3>
                    <div class="result-meta">
                        <span class="result-type">City</span>
                        <span class="result-population">Population: ${population}</span>
                    </div>
                    <div class="result-details">
                        <div class="result-costs">
                            <span>Assisted Living: $${assistedLivingCost}/month</span>
                            <span>Memory Care: $${memoryCareCost}/month</span>
                        </div>
                        <div class="result-facilities">
                            <span>${result.facility_count || 0} senior living facilities</span>
                        </div>
                    </div>
                </div>
                <div class="result-action">
                    <a href="${result.url}" class="view-details">View Details</a>
                </div>
            `;
        } else {
            // Facility result
            const rating = result.rating || 0;
            const stars = '★'.repeat(Math.round(rating));
            
            html = `
                <div class="result-content">
                    <h3 class="result-title">
                        <a href="${result.url}">${result.name}</a>
                    </h3>
                    <div class="result-meta">
                        <span class="result-type">Facility</span>
                        <span class="result-location">${result.city || ''}, ${result.state || ''}</span>
                        <span class="result-rating">
                            Rating: ${rating}/5
                            <span class="rating-stars">
                                ${stars}
                            </span>
                        </span>
                    </div>
                    <div class="result-details">
                        <div class="result-care-types">
                            <span>Care Types: ${(result.care_types || []).join(', ')}</span>
                        </div>
                        <div class="result-address">
                            <span>${result.address || ''}</span>
                        </div>
                    </div>
                </div>
                <div class="result-action">
                    <a href="${result.url}" class="view-details">View Details</a>
                </div>
            `;
        }
        
        card.innerHTML = html;
        return card;
    }
    
    // Render pagination controls
    function renderPagination(totalPages) {
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-button prev';
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                performSearch();
                window.scrollTo(0, 0);
            }
        });
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-button next';
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                performSearch();
                window.scrollTo(0, 0);
            }
        });
        
        // Page info
        const pageInfo = document.createElement('span');
        pageInfo.className = 'pagination-info';
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        // Add page number buttons (up to 5)
        const pageButtons = document.createElement('div');
        pageButtons.className = 'pagination-numbers';
        
        // Calculate range of page numbers to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-number ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            
            pageButton.addEventListener('click', () => {
                if (i !== currentPage) {
                    currentPage = i;
                    performSearch();
                    window.scrollTo(0, 0);
                }
            });
            
            pageButtons.appendChild(pageButton);
        }
        
        // Assemble pagination
        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageButtons);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextButton);
        
        // Add to results container
        resultsContainer.appendChild(paginationContainer);
    }
    
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab
            showTab(tabName);
        });
    });
    
    function showTab(tabName) {
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.classList.add('hidden');
        });
        
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }
    }
    
    // Check if we need to perform a search on page load (if there are search params)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q') || urlParams.has('state') || urlParams.has('type') || urlParams.has('cost')) {
        // Set form values from URL params
        if (urlParams.has('q') && searchInput) {
            searchInput.value = urlParams.get('q');
        }
        
        if (filterForm) {
            for (const [key, value] of urlParams.entries()) {
                const input = filterForm.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                }
            }
        }
        
        if (urlParams.has('page')) {
            currentPage = parseInt(urlParams.get('page')) || 1;
        }
        
        // Perform search based on URL params
        performSearch();
    } else {
        // Otherwise load city data for autocomplete
        loadCityData();
    }
});
