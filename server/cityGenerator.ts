import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream } from 'fs';
import csv from 'csv-parser';

// Map of state abbreviations to full state names
const stateAbbreviations = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

// Function to get state abbreviation from full name
export const getStateAbbreviation = (stateName: string): string => {
  const entries = Object.entries(stateAbbreviations);
  const match = entries.find(([_, name]) => name === stateName);
  return match ? match[0] : stateName.substring(0, 2).toUpperCase();
};

export async function processAndSaveCitiesData() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Check if the user-provided CSV file exists
    const providedCsvPath = path.join(process.cwd(), 'attached_assets', 'top_1000_cities.csv');
    const destinationCsvPath = path.join(dataDir, 'cities.csv');
    
    // First, check if a CSV file already exists in the data directory
    try {
      await fs.access(destinationCsvPath);
      console.log('Cities CSV file already exists, checking if it needs to be updated');
      
      // Read the first line to check if it contains state_name and slug
      const existingContent = await fs.readFile(destinationCsvPath, 'utf8');
      const headerLine = existingContent.split('\n')[0];
      
      if (headerLine.includes('state_name') && headerLine.includes('slug')) {
        console.log('Cities CSV file is already in the right format');
        return destinationCsvPath;
      } else {
        console.log('Cities CSV file needs to be updated with new format');
        // Continue to recreate the file
      }
    } catch (error) {
      console.log('No existing cities CSV file found, creating one');
    }
    
    try {
      await fs.access(providedCsvPath);
      console.log('Found provided cities CSV file, using it');
      
      // Process the user-provided CSV file
      const cities: Array<{
        city: string;
        state: string;
        state_name: string;
        population: number;
        slug: string;
      }> = [];
      
      return new Promise<string>((resolve, reject) => {
        createReadStream(providedCsvPath)
          .pipe(csv())
          .on('data', (data) => {
            // Handle both formats
            // Some CSV files might have 'state' directly, others might have 'state_name'
            const stateName = data.state_name;
            const stateCode = data.state || getStateAbbreviation(stateName);
            const cityName = data.city;
            const population = parseInt((data.population || '0').replace(/,/g, ''), 10);
            const slug = data.slug || `${cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${stateCode.toLowerCase()}`;
            
            cities.push({
              city: cityName,
              state: stateCode,
              state_name: stateName,
              population: population,
              slug: slug
            });
          })
          .on('end', async () => {
            console.log(`Processed ${cities.length} cities from provided CSV`);
            
            // Create a new CSV in the right format
            let csvContent = 'city,state,population,state_name,slug\n';
            cities.forEach(city => {
              csvContent += `${city.city},${city.state},${city.population},${city.state_name},${city.slug}\n`;
            });
            
            // Save to CSV file
            await fs.writeFile(destinationCsvPath, csvContent);
            console.log(`Saved ${cities.length} cities to ${destinationCsvPath}`);
            resolve(destinationCsvPath);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.log('No provided CSV file found, using fallback data');
      
      // Create a basic CSV with just a few cities in case the provided file isn't found
      const fallbackCities = [
        { city: 'New York', state: 'NY', population: 8405837, state_name: 'New York', slug: 'new-york-ny' },
        { city: 'Los Angeles', state: 'CA', population: 3884307, state_name: 'California', slug: 'los-angeles-ca' },
        { city: 'Chicago', state: 'IL', population: 2718782, state_name: 'Illinois', slug: 'chicago-il' },
        { city: 'Houston', state: 'TX', population: 2195914, state_name: 'Texas', slug: 'houston-tx' },
        { city: 'Phoenix', state: 'AZ', population: 1513367, state_name: 'Arizona', slug: 'phoenix-az' }
      ];
      
      let csvContent = 'city,state,population,state_name,slug\n';
      fallbackCities.forEach(city => {
        csvContent += `${city.city},${city.state},${city.population},${city.state_name},${city.slug}\n`;
      });
      
      await fs.writeFile(destinationCsvPath, csvContent);
      console.log(`Created fallback cities CSV at ${destinationCsvPath}`);
      return destinationCsvPath;
    }
  } catch (error) {
    console.error('Error processing cities data:', error);
    throw error;
  }
}
