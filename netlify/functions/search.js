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
    
    console.log(`Processing search: query="${query}", page=${page}, limit=${limit}, state=${stateFilter}`);
    
    // Determine the path to the city index data
    // Note: In Netlify Functions, the published site is in a different location
    const dataPath = path.join(__dirname, '../../public/data/city-index.json');
    
    // Check if the file exists
    if (!fs.existsSync(dataPath)) {
      console.error(`City index file not found at: ${dataPath}`);
      // Try alternate path for Netlify production environment
      const altPath = path.join(__dirname, '../city-index.json');
      
      if (fs.existsSync(altPath)) {
        console.log(`Found city index at alternate path: ${altPath}`);
        dataPath = altPath;
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Search data not found',
            message: 'Could not locate the city index file' 
          })
        };
      }
    }
    
    // Read and parse the city data
    const cityData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Loaded ${cityData.length} cities for search`);
    
    // Filter results based on search query
    let results = cityData;
    
    // Apply text search if query exists
    if (query) {
      results = results.filter(city => {
        const cityName = (city.name || '').toLowerCase();
        const stateName = (city.state || '').toLowerCase();
        return cityName.includes(query) || stateName.includes(query);
      });
    }
    
    // Apply state filter if it exists
    if (stateFilter) {
      results = results.filter(city => {
        const stateName = (city.state || '').toLowerCase();
        return stateName === stateFilter.toLowerCase();
      });
    }
    
    // Get total count before pagination
    const total = results.length;
    console.log(`Found ${total} matching results`);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);
    
    // Format results for the frontend
    const formattedResults = paginatedResults.map(city => {
      // Extract cost data if available
      let assistedLivingCost = 0;
      let memoryCareCost = 0;
      let facilityCount = 0;
      
      // Note: This assumes a simple data structure - adjust if your data has more details
      if (city.costs) {
        assistedLivingCost = city.costs.assisted_living || 0;
        memoryCareCost = city.costs.memory_care || 0;
      }
      
      return {
        type: 'city',
        slug: city.slug,
        name: city.name,
        state: city.state,
        url: city.url,
        population: city.population || 0,
        assisted_living_cost: assistedLivingCost,
        memory_care_cost: memoryCareCost,
        facility_count: facilityCount
      };
    });
    
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
        results: formattedResults
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