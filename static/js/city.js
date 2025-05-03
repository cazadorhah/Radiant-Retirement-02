/**
 * City page specific JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle hash links for facility navigation
    handleHashNavigation();
    
    // Highlight facilities when navigating to them
    highlightFacilityFromHash();
    
    // Listen for hash changes
    window.addEventListener('hashchange', highlightFacilityFromHash);
});

/**
 * Handle navigation to specific sections via hash
 */
function handleHashNavigation() {
    // Get all in-page links that should use smooth scrolling
    const inPageLinks = document.querySelectorAll('a[href^="#"]');
    
    inPageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target element id from the href
            const targetId = this.getAttribute('href').substring(1);
            
            // Make sure the target exists
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return;
            
            // Prevent default link behavior
            e.preventDefault();
            
            // Calculate position to scroll to
            const headerOffset = 80; // Adjust based on your header height
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            // Scroll to the element
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update URL hash without triggering a scroll
            history.pushState(null, null, `#${targetId}`);
            
            // If it's a facility, highlight it
            if (targetId.startsWith('facility-')) {
                highlightFacility(targetId);
            }
        });
    });
}

/**
 * Highlight the facility card based on the URL hash
 */
function highlightFacilityFromHash() {
    // Get current hash
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#facility-')) return;
    
    const facilityId = hash.substring(1);
    highlightFacility(facilityId);
    
    // Scroll to the facility
    const facilityElement = document.getElementById(facilityId);
    if (facilityElement) {
        setTimeout(() => {
            const headerOffset = 80; // Adjust based on your header height
            const elementPosition = facilityElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }, 100);
    }
}

/**
 * Highlight a specific facility in the list
 * @param {string} facilityId - The ID of the facility to highlight
 */
function highlightFacility(facilityId) {
    // Remove any existing highlights
    const highlightedFacilities = document.querySelectorAll('.facility-card.highlighted');
    highlightedFacilities.forEach(facility => {
        facility.classList.remove('highlighted');
    });
    
    // Add highlight to the target facility
    const targetFacility = document.getElementById(facilityId);
    if (targetFacility) {
        targetFacility.classList.add('highlighted');
    }
}

/**
 * Initialize cost comparison chart if available
 * Note: This would require a charting library like Chart.js in production
 */
function initCostChart() {
    // This is a placeholder for where you would initialize a chart
    // In production, you would use a library like Chart.js
    
    console.log('Cost chart would be initialized here in production');
    
    // Example code with Chart.js (commented out as it's not included in this demo)
    /*
    const ctx = document.getElementById('cost-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Assisted Living', 'Memory Care', 'Independent Living', 'Nursing Home'],
            datasets: [{
                label: 'Monthly Average Cost ($)',
                data: [
                    document.getElementById('cost-chart').dataset.assistedCost,
                    document.getElementById('cost-chart').dataset.memoryCost,
                    document.getElementById('cost-chart').dataset.independentCost,
                    document.getElementById('cost-chart').dataset.nursingCost
                ],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.7)',
                    'rgba(37, 99, 235, 0.5)',
                    'rgba(37, 99, 235, 0.3)',
                    'rgba(37, 99, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(37, 99, 235, 1)',
                    'rgba(37, 99, 235, 1)',
                    'rgba(37, 99, 235, 1)',
                    'rgba(37, 99, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    */
}