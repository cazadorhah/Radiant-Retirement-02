/**
 * Search page specific JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Init tab functionality
    initTabSwitching();
    
    // Init filter form handling
    initFilterForm();
});

/**
 * Initialize the tab switching functionality
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the tab ID to show
            const tabToShow = this.getAttribute('data-tab');
            
            // Reset all buttons and hide all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Activate the clicked button and show the corresponding tab
            this.classList.add('active');
            document.getElementById(tabToShow).classList.remove('hidden');
        });
    });
}

/**
 * Initialize the filter form handling
 */
function initFilterForm() {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return;
    
    // Handle form submission
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get the current search query
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q') || '';
        
        // Build new URL with filters
        const careType = document.getElementById('care-type').value;
        const state = document.getElementById('state').value;
        const costRange = document.getElementById('cost-range').value;
        
        const newParams = new URLSearchParams();
        
        if (query) {
            newParams.append('q', query);
        }
        
        if (careType) {
            newParams.append('type', careType);
        }
        
        if (state) {
            newParams.append('state', state);
        }
        
        if (costRange) {
            newParams.append('cost', costRange);
        }
        
        // Redirect to the filtered search
        window.location.href = `/search.html?${newParams.toString()}`;
    });
}

/**
 * Helper function to update URL parameters
 * @param {string} key - Parameter name
 * @param {string} value - Parameter value
 * @returns {string} - URL with updated parameter
 */
function updateUrlParameter(key, value) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    if (value) {
        params.set(key, value);
    } else {
        params.delete(key);
    }
    
    url.search = params.toString();
    return url.toString();
}