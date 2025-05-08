// search-api.js - Server-side endpoint for search functionality

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to combined data file and city index
const dataPath = path.join(__dirname, '..', 'data', 'combined_data.json');
const cityIndexPath = path.join(__dirname, '..', 'public', 'data', 'city-index.json');

// Load city data
let cityData = {};
let facilityData = {};
let cityIndex = [];

function loadData() {
    try {
        // Load the main data file
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);
        cityData = data.cities || {};
        
        // Extract facilities from city data
        facilityData = {};
        Object.keys(cityData).forEach(citySlug => {
            const city = cityData[citySlug];
            if (city.facilities) {
                Object.keys(city.facilities).forEach(facilityId => {
                    const facility = city.facilities[facilityId];
                    facilityData[facilityId] = {
                        ...facility,
                        city_slug: citySlug,
                        city_name: city.city_info.name,
                        state: city.city_info.state
                    };
                });
            }
        });
        
        // Load the city index if available
        if (fs.existsSync(cityIndexPath)) {
            const indexRawData = fs.readFileSync(cityIndexPath, 'utf8');
            cityIndex = JSON.parse(indexRawData);
        }
        
        console.log(`Loaded data: ${Object.keys(cityData).length} cities and ${Object.keys(facilityData).length} facilities`);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Load data on startup
loadData();

// Search API endpoint
router.get('/api/search', (req, res) => {
    try {
        // Extract query parameters
        const query = (req.query.q || '').toLowerCase();
        const state = (req.query.state || '').toUpperCase();
        const careType = (req.query.type || '').toLowerCase();
        const costRange = (req.query.cost || '').toLowerCase();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        
        // Calculate pagination offsets
        const offset = (page - 1) * limit;
        
        // Filter cities
        const filteredCities = Object.keys(cityData)
            .filter(citySlug => {
                const city = cityData[citySlug];
                const cityInfo = city.city_info;
                
                // Check if city matches the search query
                const nameMatch = query === '' || 
                    cityInfo.name.toLowerCase().includes(query) || 
                    cityInfo.state.toLowerCase().includes(query);
                
                // Check if city matches the state filter
                const stateMatch = state === '' || 
                    getStateAbbreviation(cityInfo.state) === state;
                
                // Check if city has facilities with matching care type
                let careTypeMatch = careType === '';
                
                if (!careTypeMatch && city.facilities) {
                    careTypeMatch = Object.values(city.facilities).some(facility => {
                        return facility.care_types.some(type => 
                            type.toLowerCase().replace(/\s+/g, '-') === careType
                        );
                    });
                }
                
                // Check if city's cost matches the cost range filter
                let costMatch = costRange === '';
                
                if (!costMatch && city.costs) {
                    const assistedLivingCost = city.costs.assisted_living?.monthly_avg || 0;
                    
                    if (costRange === 'under-3000') {
                        costMatch = assistedLivingCost < 3000;
                    } else if (costRange === '3000-4000') {
                        costMatch = assistedLivingCost >= 3000 && assistedLivingCost < 4000;
                    } else if (costRange === '4000-5000') {
                        costMatch = assistedLivingCost >= 4000 && assistedLivingCost < 5000;
                    } else if (costRange === '5000-6000') {
                        costMatch = assistedLivingCost >= 5000 && assistedLivingCost < 6000;
                    } else if (costRange === 'over-6000') {
                        costMatch = assistedLivingCost >= 6000;
                    }
                }
                
                return nameMatch && stateMatch && careTypeMatch && costMatch;
            })
            .map(citySlug => {
                const city = cityData[citySlug];
                const cityInfo = city.city_info;
                
                return {
                    type: 'city',
                    slug: citySlug,
                    name: cityInfo.name,
                    state: cityInfo.state,
                    population: cityInfo.population,
                    url: `/city/${citySlug}/`,
                    assisted_living_cost: city.costs?.assisted_living?.monthly_avg || 0,
                    memory_care_cost: city.costs?.memory_care?.monthly_avg || 0,
                    facility_count: city.facilities ? Object.keys(city.facilities).length : 0
                };
            });
        
        // Filter facilities
        const filteredFacilities = Object.keys(facilityData)
            .filter(facilityId => {
                const facility = facilityData[facilityId];
                const citySlug = facility.city_slug;
                const city = cityData[citySlug];
                
                // Check if facility or its city matches the search query
                const nameMatch = query === '' || 
                    facility.name.toLowerCase().includes(query) || 
                    facility.city_name.toLowerCase().includes(query) || 
                    facility.state.toLowerCase().includes(query);
                
                // Check if facility is in the filtered state
                const stateMatch = state === '' || 
                    getStateAbbreviation(facility.state) === state;
                
                // Check if facility has the matching care type
                const careTypeMatch = careType === '' || 
                    facility.care_types.some(type => 
                        type.toLowerCase().replace(/\s+/g, '-') === careType
                    );
                
                // Check if facility's cost matches the cost range filter
                let costMatch = costRange === '';
                
                if (!costMatch && facility.costs) {
                    const facilityCost = facility.costs.monthly_avg || 0;
                    
                    if (costRange === 'under-3000') {
                        costMatch = facilityCost < 3000;
                    } else if (costRange === '3000-4000') {
                        costMatch = facilityCost >= 3000 && facilityCost < 4000;
                    } else if (costRange === '4000-5000') {
                        costMatch = facilityCost >= 4000 && facilityCost < 5000;
                    } else if (costRange === '5000-6000') {
                        costMatch = facilityCost >= 5000 && facilityCost < 6000;
                    } else if (costRange === 'over-6000') {
                        costMatch = facilityCost >= 6000;
                    }
                }
                
                return nameMatch && stateMatch && careTypeMatch && costMatch;
            })
            .map(facilityId => {
                const facility = facilityData[facilityId];
                
                return {
                    type: 'facility',
                    id: facilityId,
                    name: facility.name,
                    city: facility.city_name,
                    state: facility.state,
                    url: `/city/${facility.city_slug}/#facility-${facilityId}`,
                    care_types: facility.care_types || [],
                    rating: facility.rating || 0,
                    address: facility.address || ''
                };
            });
        
        // Combine and sort results
        const allResults = [...filteredCities, ...filteredFacilities];
        
        // Sort results by relevance to query
        if (query !== '') {
            allResults.sort((a, b) => {
                // Cities are prioritized over facilities
                if (a.type === 'city' && b.type === 'facility') return -1;
                if (a.type === 'facility' && b.type === 'city') return 1;
                
                // Within the same type, exact matches are prioritized
                const aNameLower = a.name.toLowerCase();
                const bNameLower = b.name.toLowerCase();
                
                if (aNameLower === query && bNameLower !== query) return -1;
                if (aNameLower !== query && bNameLower === query) return 1;
                
                // Then, results that start with the query
                if (aNameLower.startsWith(query) && !bNameLower.startsWith(query)) return -1;
                if (!aNameLower.startsWith(query) && bNameLower.startsWith(query)) return 1;
                
                // For cities, sort by population
                if (a.type === 'city' && b.type === 'city') {
                    return b.population - a.population;
                }
                
                // For facilities, sort by rating
                if (a.type === 'facility' && b.type === 'facility') {
                    return b.rating - a.rating;
                }
                
                return 0;
            });
        } else {
            // Without a query, sort cities by population and facilities by rating
            allResults.sort((a, b) => {
                if (a.type === 'city' && b.type === 'city') {
                    return b.population - a.population;
                } else if (a.type === 'facility' && b.type === 'facility') {
                    return b.rating - a.rating;
                } else {
                    // Cities first, then facilities
                    return a.type === 'city' ? -1 : 1;
                }
            });
        }
        
        // Apply pagination
        const paginatedResults = allResults.slice(offset, offset + limit);
        
        // Return results with pagination info
        res.json({
            total: allResults.length,
            page: page,
            limit: limit,
            pages: Math.ceil(allResults.length / limit),
            results: paginatedResults
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'An error occurred while processing your search' });
    }
});

// Helper function to get state abbreviation
function getStateAbbreviation(stateName) {
    const stateAbbrs = {
        'Alabama': 'AL',
        'Alaska': 'AK',
        'Arizona': 'AZ',
        'Arkansas': 'AR',
        'California': 'CA',
        'Colorado': 'CO',
        'Connecticut': 'CT',
        'Delaware': 'DE',
        'Florida': 'FL',
        'Georgia': 'GA',
        'Hawaii': 'HI',
        'Idaho': 'ID',
        'Illinois': 'IL',
        'Indiana': 'IN',
        'Iowa': 'IA',
        'Kansas': 'KS',
        'Kentucky': 'KY',
        'Louisiana': 'LA',
        'Maine': 'ME',
        'Maryland': 'MD',
        'Massachusetts': 'MA',
        'Michigan': 'MI',
        'Minnesota': 'MN',
        'Mississippi': 'MS',
        'Missouri': 'MO',
        'Montana': 'MT',
        'Nebraska': 'NE',
        'Nevada': 'NV',
        'New Hampshire': 'NH',
        'New Jersey': 'NJ',
        'New Mexico': 'NM',
        'New York': 'NY',
        'North Carolina': 'NC',
        'North Dakota': 'ND',
        'Ohio': 'OH',
        'Oklahoma': 'OK',
        'Oregon': 'OR',
        'Pennsylvania': 'PA',
        'Rhode Island': 'RI',
        'South Carolina': 'SC',
        'South Dakota': 'SD',
        'Tennessee': 'TN',
        'Texas': 'TX',
        'Utah': 'UT',
        'Vermont': 'VT',
        'Virginia': 'VA',
        'Washington': 'WA',
        'West Virginia': 'WV',
        'Wisconsin': 'WI',
        'Wyoming': 'WY',
        'District of Columbia': 'DC'
    };
    
    return stateAbbrs[stateName] || stateName;
}

module.exports = router;