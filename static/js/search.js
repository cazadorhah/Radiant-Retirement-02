document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchForm = document.getElementById('search-form');
    const filterForm = document.getElementById('filter-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.querySelector('.results-container');
    const distanceSlider = document.getElementById('distance');
    const distanceValue = document.getElementById('distance-value');
    const useLocationBtn = document.getElementById('use-location');
    
    // Search data will be loaded from JSON
    let searchData = null;
    let userLocation = null;
    
    // Load search data
    fetch('/js/search-data.json')
        .then(response => response.json())
        .then(data => {
            searchData = data;
            // If URL has search params, perform search
            if (window.location.search) {
                performSearch();
            }
        });
    
    // Set up autocomplete
    setupAutocomplete();
    
    // Distance slider
    if (distanceSlider) {
        distanceSlider.addEventListener('input', function() {
            distanceValue.textContent = this.value + ' miles';
        });
    }
    
    // Use my location button
    if (useLocationBtn) {
        useLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                useLocationBtn.textContent = 'Getting location...';
                navigator.geolocation.getCurrentPosition(
                    position => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        useLocationBtn.textContent = 'Location found';
                        useLocationBtn.classList.add('location-active');
                    },
                    error => {
                        console.error('Error getting location:', error);
                        useLocationBtn.textContent = 'Location error';
                        setTimeout(() => {
                            useLocationBtn.textContent = 'Use My Location';
                        }, 2000);
                    }
                );
            }
        });
    }
    
    // Search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchQuery = searchInput.value.trim();
            if (searchQuery) {
                window.location.href = `/search.html?q=${encodeURIComponent(searchQuery)}`;
            }
        });
    }
    
    // Filter form submission
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get all form values
            const formData = new FormData(filterForm);
            const params = new URLSearchParams(window.location.search);
            
            // Update URL with form values
            for (const [key, value] of formData.entries()) {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            }
            
            // Add user location if available
            if (userLocation) {
                params.set('lat', userLocation.lat);
                params.set('lng', userLocation.lng);
            }
            
            // Redirect with parameters
            window.location.href = `/search.html?${params.toString()}`;
        });
    }
    
    // Perform search based on URL parameters
    function performSearch() {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        const careType = params.get('type') || '';
        const state = params.get('state') || '';
        const costRange = params.get('cost') || '';
        const amenities = params.getAll('amenities') || [];
        const rating = params.get('rating') || '';
        const distance = params.get('distance') || 25;
        const lat = parseFloat(params.get('lat')) || null;
        const lng = parseFloat(params.get('lng')) || null;
        
        // Filter results
        const filteredResults = filterSearchResults(query, careType, state, costRange, amenities, rating, lat, lng, distance);
        
        // Display results
        displayResults(filteredResults);
    }
    
    // Filter search results
    function filterSearchResults(query, careType, state, costRange, amenities, rating, lat, lng, distance) {
        if (!searchData) return { cities: [], facilities: [] };
        
        // Filter cities
        const filteredCities = searchData.cities.filter(city => {
            // Basic text search
            const matchesQuery = !query || 
                city.name.toLowerCase().includes(query.toLowerCase()) || 
                city.state.toLowerCase().includes(query.toLowerCase());
            
            // State filter
            const matchesState = !state || city.state_abbr === state;
            
            // Cost filter
            let matchesCost = true;
            if (costRange) {
                if (costRange === 'under-3000' && city.assisted_living_cost >= 3000) matchesCost = false;
                else if (costRange === '3000-4000' && (city.assisted_living_cost < 3000 || city.assisted_living_cost > 4000)) matchesCost = false;
                else if (costRange === '4000-5000' && (city.assisted_living_cost < 4000 || city.assisted_living_cost > 5000)) matchesCost = false;
                else if (costRange === '5000-6000' && (city.assisted_living_cost < 5000 || city.assisted_living_cost > 6000)) matchesCost = false;
                else if (costRange === 'over-6000' && city.assisted_living_cost < 6000) matchesCost = false;
            }
            
            // Location distance filter
            let matchesDistance = true;
            if (lat && lng && city.coordinates) {
                const cityDistance = calculateDistance(lat, lng, city.coordinates.lat, city.coordinates.lng);
                matchesDistance = cityDistance <= distance;
            }
            
            return matchesQuery && matchesState && matchesCost && matchesDistance;
        });
        
        // Filter facilities
        const filteredFacilities = searchData.facilities.filter(facility => {
            // Basic text search
            const matchesQuery = !query || 
                facility.name.toLowerCase().includes(query.toLowerCase()) || 
                facility.city.toLowerCase().includes(query.toLowerCase()) || 
                facility.state.toLowerCase().includes(query.toLowerCase());
            
            // Care type filter
            const matchesCareType = !careType || facility.care_types.includes(careType);
            
            // State filter
            const matchesState = !state || facility.state === state;
            
            // Amenities filter
            const matchesAmenities = amenities.length === 0 || amenities.every(a => facility.amenities.includes(a));
            
            // Rating filter
            const matchesRating = !rating || facility.rating >= parseInt(rating);
            
            // Location distance filter
            let matchesDistance = true;
            if (lat && lng && facility.coordinates) {
                const facilityDistance = calculateDistance(lat, lng, facility.coordinates.lat, facility.coordinates.lng);
                matchesDistance = facilityDistance <= distance;
            }
            
            return matchesQuery && matchesCareType && matchesState && matchesAmenities && matchesRating && matchesDistance;
        });
        
        return {
            cities: filteredCities,
            facilities: filteredFacilities
        };
    }
    
    // Display search results
    function displayResults(results) {
        // Update results count
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const totalResults = results.cities.length + results.facilities.length;
            const query = new URLSearchParams(window.location.search).get('q') || '';
            resultsCount.textContent = `${totalResults} Results ${query ? `for "${query}"` : ''}`;
        }
        
        // Update tab content
        updateTabContent('all', [...results.cities, ...results.facilities]);
        updateTabContent('cities', results.cities);
        updateTabContent('facilities', results.facilities);
    }
    
    // Calculate distance between two points in miles
    function calculateDistance(lat1, lng1, lat2, lng2) {
        if (!lat1 || !lng1 || !lat2 || !lng2) return 999999;
        
        const R = 3958.8; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    // Set up autocomplete
    function setupAutocomplete() {
        // Implementation of autocomplete functionality
        // (This would connect to the city-index.json data)
    }
});
