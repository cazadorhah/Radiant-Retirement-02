// netlify/functions/search.js
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // Get search parameters from query string
    const params = event.queryStringParameters;
    const query = (params.q || '').toLowerCase();
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 50;
    const stateFilter = params.state || '';
    const careTypeFilter = params.type || '';
    const costFilter = params.cost || '';
    
    console.log(`Processing search: query="${query}", page=${page}, limit=${limit}, state=${stateFilter}`);
    
    // In Netlify Functions, we need to use a different path to access our data
    let cityData = [];
    let facilityData = [];
    
    try {
      // First try to access from the published directory (for production)
      const dataPath = path.join(__dirname, '../../public/js/search-data.json');
      if (fs.existsSync(dataPath)) {
        const searchData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        cityData = searchData.cities || [];
        facilityData = searchData.facilities || [];
        console.log(`Loaded ${cityData.length} cities and ${facilityData.length} facilities from ${dataPath}`);
      } else {
        // If that fails, try the city-index.json
        const cityIndexPath = path.join(__dirname, '../../public/data/city-index.json');
        if (fs.existsSync(cityIndexPath)) {
          cityData = JSON.parse(fs.readFileSync(cityIndexPath, 'utf8'));
          console.log(`Loaded ${cityData.length} cities from ${cityIndexPath}`);
        } else {
          throw new Error('Search data files not found');
        }
      }
    } catch (fileError) {
      console.error('Error loading search data:', fileError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to load search data',
          message: fileError.message
        })
      };
    }
    
    // Define our results array
    let results = [];
    
    // Filter city results
    let filteredCities = cityData;
    
    // Apply text search if query exists
    if (query) {
      filteredCities = filteredCities.filter(city => {
        const cityName = (city.name || '').toLowerCase();
        const stateName = (city.state || '').toLowerCase();
        return cityName.includes(query) || stateName.includes(query);
      });
    }
    
    // Apply state filter if it exists
    if (stateFilter) {
      filteredCities = filteredCities.filter(city => {
        const stateAbbr = (city.state_abbr || '').toLowerCase();
        return stateAbbr === stateFilter.toLowerCase();
      });
    }
    
    // Add filtered cities to results
    results = filteredCities.map(city => ({
      type: 'city',
      slug: city.slug,
      name: city.name,
      state: city.state,
      url: city.url || `/city/${city.slug}/`,
      population: city.population || 0,
      assisted_living_cost: city.assisted_living_cost || 0,
      memory_care_cost: city.memory_care_cost || 0,
      facility_count: city.facility_count || 0
    }));
    
    // Filter facility results and add to results if we have facility data
    if (facilityData.length > 0) {
      let filteredFacilities = facilityData;
      
      // Apply text search if query exists
      if (query) {
        filteredFacilities = filteredFacilities.filter(facility => {
          const facilityName = (facility.name || '').toLowerCase();
          const cityName = (facility.city || '').toLowerCase();
          const stateName = (facility.state || '').toLowerCase();
          return facilityName.includes(query) || cityName.includes(query) || stateName.includes(query);
        });
      }
      
      // Apply state filter if it exists
      if (stateFilter) {
        filteredFacilities = filteredFacilities.filter(facility => {
          const state = (facility.state || '').toLowerCase();
          return state === stateFilter.toLowerCase();
        });
      }
      
      // Apply care type filter if it exists
      if (careTypeFilter) {
        filteredFacilities = filteredFacilities.filter(facility => {
          const careTypes = facility.care_types || [];
          return careTypes.some(type => type.toLowerCase().includes(careTypeFilter.toLowerCase()));
        });
      }
      
      // Add filtered facilities to results
      results = results.concat(filteredFacilities.map(facility => ({
        type: 'facility',
        id: facility.id,
        name: facility.name,
        city: facility.city,
        state: facility.state,
        city_slug: facility.city_slug,
        address: facility.address,
        rating: facility.rating || 0,
        care_types: facility.care_types || [],
        url: `/city/${facility.city_slug}/#facility-${facility.id}`
      })));
    }
    
    // Get total count before pagination
    const total = results.length;
    console.log(`Found ${total} matching results`);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);
    
    // Return the results
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        total: total,
        page: page,
        limit: limit,
        results: paginatedResults
      })
    };
    
  } catch (error) {
    console.error('Search function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Search function error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
