import { Facility } from '@shared/types';
import { faker } from '@faker-js/faker';

// Senior living facility name parts
const facilityNamePrefixes = [
  'Sunrise', 'Golden', 'Heritage', 'Serenity', 'Harmony', 'Tranquil', 'Evergreen', 'Silver', 'Majestic', 'Radiant',
  'Peaceful', 'Pleasant', 'Willow', 'Cedar', 'Magnolia', 'Maple', 'Oak', 'Pine', 'Rosewood', 'Autumn',
  'Spring', 'Summer', 'Winter', 'Meadows', 'Vista', 'Harbor', 'Valley', 'Gardens', 'Pines', 'Hills'
];

const facilityNameTypes = [
  'Estates', 'Gardens', 'Meadows', 'Towers', 'Oaks', 'Pines', 'Manor', 'Terrace', 'Heights', 'Commons',
  'Plaza', 'Villas', 'Village', 'House', 'Center', 'Residence', 'Retreat', 'Haven', 'Lodge', 'Suites',
  'Court', 'Place', 'Pointe', 'Springs', 'Hills', 'Park', 'Glen', 'Ridge', 'View', 'Community'
];

const facilityAmenities = [
  'Independent Living', 'Assisted Living', 'Memory Care', 'Nursing Care', 'Pet Friendly',
  'Fine Dining', 'Fitness Center', 'Swimming Pool', 'Garden Areas', 'Transportation Services',
  'Recreational Activities', 'Wellness Programs', 'Housekeeping', '24-hour Staff', 'Physical Therapy',
  'Hair Salon', 'Library', 'Computer Lab', 'Arts & Crafts Studio', 'Movie Theater',
  'Community Kitchen', 'Private Dining Room', 'Bistro', 'Walking Paths', 'Billiards Room',
  'Chapel', 'Rooftop Terrace', 'Concierge Service', 'Laundry Service', 'Medication Management'
];

const streetTypes = [
  'Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Road', 'Way', 'Place', 'Court', 'Circle',
  'Terrace', 'Parkway', 'Highway', 'Trail', 'Path'
];

// Generate a facility name
function generateFacilityName(): string {
  const prefix = facilityNamePrefixes[Math.floor(Math.random() * facilityNamePrefixes.length)];
  const type = facilityNameTypes[Math.floor(Math.random() * facilityNameTypes.length)];
  return `${prefix} ${type}`;
}

// Generate a realistic address in the given city
function generateAddress(city: string, state: string): string {
  const streetNumber = Math.floor(Math.random() * 9000) + 1000;
  const streetName = faker.location.street();
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  const zipCode = faker.location.zipCode('#####');
  return `${streetNumber} ${streetName} ${streetType}, ${city}, ${state} ${zipCode}`;
}

// Generate a phone number
function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

// Generate a website URL
function generateWebsite(facilityName: string, city: string): string {
  const formattedName = facilityName.toLowerCase().replace(/ /g, '');
  const formattedCity = city.toLowerCase().replace(/ /g, '');
  const domains = ['.com', '.org', '.net'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `https://www.${formattedName}-${formattedCity}${domain}`;
}

// Generate random amenities (3-5)
function generateAmenities(): string[] {
  const shuffled = [...facilityAmenities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
}

// Generate a rating between 3.0 and 5.0
function generateRating(): number {
  return parseFloat((Math.random() * 2 + 3).toFixed(1));
}

// Generate review count between 10 and 150
function generateReviewCount(): number {
  return Math.floor(Math.random() * 140) + 10;
}

// Generate facility type
function generateFacilityType(): string {
  const facilityTypes = [
    'Independent Living',
    'Assisted Living',
    'Memory Care',
    'Skilled Nursing',
    'Continuing Care Retirement Community'
  ];
  
  return facilityTypes[Math.floor(Math.random() * facilityTypes.length)];
}

// Generate 5 facilities for a city
export function generateFacilities(cityName: string, stateName: string): Facility[] {
  const facilities: Facility[] = [];
  
  for (let i = 0; i < 5; i++) {
    const name = generateFacilityName();
    const facility: Facility = {
      id: `${cityName}-${stateName}-${i + 1}`,
      name,
      address: generateAddress(cityName, stateName),
      city: cityName,
      state: stateName,
      phone: generatePhoneNumber(),
      website: generateWebsite(name, cityName),
      rating: generateRating(),
      reviewCount: generateReviewCount(),
      amenities: generateAmenities(),
      facilityType: generateFacilityType()
    };
    
    facilities.push(facility);
  }
  
  return facilities;
}
