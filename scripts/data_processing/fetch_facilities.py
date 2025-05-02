#!/usr/bin/env python3
"""
Fetch senior living facilities data using Google Maps API.
This script processes the list of cities and retrieves nearby senior living facilities
for each city, organizing them into a structured JSON format.
"""

import os
import json
import time
import pandas as pd
from tqdm import tqdm
import googlemaps
import random
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Search terms for senior living facilities
FACILITY_TYPES = [
    'assisted living',
    'senior living',
    'retirement home',
    'nursing home',
    'memory care',
    'senior community'
]

# For demo purposes - in production, this would be replaced with actual API calls
SAMPLE_FACILITY_NAMES = [
    "Sunrise Senior Living",
    "Brookdale Senior Living",
    "Atria Senior Living",
    "Leisure Care",
    "Holiday Retirement",
    "Life Care Services",
    "Five Star Senior Living",
    "Merrill Gardens",
    "Senior Lifestyle",
    "Capital Senior Living",
    "Elmcroft Senior Living",
    "Erickson Living",
    "Watermark Retirement",
    "Oakmont Senior Living",
    "Silverado Senior Living",
    "Belmont Village",
    "Artis Senior Living",
    "Legend Senior Living",
    "Sunrise Villa",
    "The Arbor Company"
]

# For demo - features that might be found at senior living facilities
SAMPLE_FEATURES = [
    "24-hour Staff",
    "Restaurant-style Dining",
    "Fitness Programs",
    "Transportation Services",
    "Housekeeping",
    "Swimming Pool",
    "Community Garden",
    "Library",
    "Weekly Events",
    "Pet Friendly",
    "24-hour Nursing",
    "Physical Therapy",
    "Private Rooms",
    "Arts & Crafts Studio",
    "Courtyard",
    "Fine Dining",
    "Concierge Services",
    "Fitness Center",
    "Social Activities",
    "Beauty Salon",
    "Movie Theater",
    "Game Room",
    "Walking Paths",
    "Wellness Center",
    "Emergency Call System"
]

# Types of care offered
CARE_TYPES = [
    "Independent Living",
    "Assisted Living",
    "Memory Care",
    "Skilled Nursing",
    "Rehabilitation",
    "Respite Care",
    "Continuing Care Retirement Community",
    "Hospice Care"
]


def fetch_facilities_for_city(city_data, gmaps_client, max_results=1000):
    """
    Fetch senior living facilities for a given city using Google Maps API.
    
    In a production environment, this would make actual API calls.
    For this demo, it generates sample data.
    
    Args:
        city_data: Dictionary containing city information
        gmaps_client: Google Maps API client
        max_results: Maximum number of facilities to return per city
        
    Returns:
        List of facilities for the city
    """
    city_name = city_data['name']
    state_name = city_data['state']
    city_slug = city_data['slug']
    
    logger.info(f"Fetching facilities for {city_name}, {state_name}")
    
    # In a real implementation, you would use the Google Maps API to search
    # for senior living facilities near the city. For demo purposes, we'll
    # generate some sample data.
    
    # Normally you'd do something like:
    # facilities = []
    # for facility_type in FACILITY_TYPES:
    #     query = f"{facility_type} in {city_name}, {state_name}"
    #     results = gmaps_client.places(query=query, location=coordinates, radius=25000)
    #     facilities.extend(results['results'])
    
    # Generate some random sample data instead
    num_facilities = random.randint(5, max_results)
    facilities = []
    
    for i in range(num_facilities):
        # Generate a random facility
        facility_name = f"{random.choice(SAMPLE_FACILITY_NAMES)} of {city_name}"
        facility_id = f"fac_{city_data['slug']}_{i+1:03d}"
        
        # Random coordinates near the city center
        # In production, these would come from Google Maps API
        lat_offset = random.uniform(-0.05, 0.05)
        lng_offset = random.uniform(-0.05, 0.05)
        lat = 0.0  # This would be city_data['coordinates']['lat']
        lng = 0.0  # This would be city_data['coordinates']['lng']
        
        # For demo purposes, let's just add some sample coordinates
        # These would actually be calculated based on the city location
        if city_slug == "new-york-ny":
            lat, lng = 40.7128, -74.0060
        elif city_slug == "los-angeles-ca":
            lat, lng = 34.0522, -118.2437
        elif city_slug == "chicago-il":
            lat, lng = 41.8781, -87.6298
        elif city_slug == "houston-tx":
            lat, lng = 29.7604, -95.3698
        elif city_slug == "phoenix-az":
            lat, lng = 33.4484, -112.0740
        elif city_slug == "philadelphia-pa":
            lat, lng = 39.9526, -75.1652
        else:
            # Generate random plausible US coordinates
            lat, lng = random.uniform(24, 49), random.uniform(-125, -66)
        
        # Add the offset to make each facility in a slightly different location
        facility_lat = lat + lat_offset
        facility_lng = lng + lng_offset
        
        # Generate random address components
        street_number = random.randint(100, 9999)
        streets = ["Main St", "Oak Ave", "Maple Dr", "Washington Blvd", "Park Rd", "Lake St"]
        street = random.choice(streets)
        zip_code = f"{random.randint(10000, 99999)}"
        
        # Choose 1-3 random care types
        num_care_types = random.randint(1, 3)
        facility_care_types = random.sample(CARE_TYPES, num_care_types)
        
        # Choose 3-7 random features
        num_features = random.randint(3, 7)
        facility_features = random.sample(SAMPLE_FEATURES, num_features)
        
        # Generate random rating data
        overall_rating = round(random.uniform(3.5, 5.0), 1)
        care_quality = round(random.uniform(3.5, 5.0), 1)
        facilities_rating = round(random.uniform(3.5, 5.0), 1)
        staff_rating = round(random.uniform(3.5, 5.0), 1)
        value_rating = round(random.uniform(3.5, 5.0), 1)
        review_count = random.randint(10, 100)
        
        facility = {
            "id": facility_id,
            "name": facility_name,
            "address": f"{street_number} {street}",
            "city": city_name,
            "state": state_name,
            "zip_code": zip_code,
            "phone": f"({random.randint(200, 999)}) 555-{random.randint(1000, 9999)}",
            "website": f"https://www.{facility_name.lower().replace(' ', '')}.com".replace("of", "").replace(",", ""),
            "coordinates": {
                "lat": facility_lat,
                "lng": facility_lng
            },
            "facility_type": facility_care_types,
            "features": facility_features,
            "capacity": random.randint(50, 250),
            "ratings": {
                "overall": overall_rating,
                "care_quality": care_quality,
                "facilities": facilities_rating,
                "staff": staff_rating,
                "value": value_rating,
                "review_count": review_count
            },
            "city_slug": city_slug
        }
        
        facilities.append(facility)
        
    return facilities


def fetch_all_facilities(cities_file, output_file, google_api_key=None):
    """
    Fetch facilities for all cities and save to a JSON file.
    
    Args:
        cities_file: Path to processed cities JSON file
        output_file: Path to save facilities JSON
        google_api_key: Google Maps API key (optional for demo)
    """
    # Set up Google Maps client if API key is provided
    gmaps_client = None
    if google_api_key:
        gmaps_client = googlemaps.Client(key=google_api_key)
    
    # Load processed cities data
    with open(cities_file, 'r') as f:
        cities_data = json.load(f)
    
    logger.info(f"Loaded {len(cities_data)} cities from {cities_file}")
    
    # Initialize facilities list
    all_facilities = []
    cities_covered = 0
    
    # Process each city
    for city_slug, city_data in tqdm(cities_data.items(), desc="Fetching facilities"):
        # Fetch facilities for this city
        city_facilities = fetch_facilities_for_city(city_data, gmaps_client)
        
        # Add to master list
        all_facilities.extend(city_facilities)
        
        # Update count of cities with facilities
        if city_facilities:
            cities_covered += 1
        
        # Sleep to avoid hitting API rate limits (if using actual API)
        if google_api_key:
            time.sleep(0.5)
    
    # Create output dictionary
    facilities_data = {
        "facilities": all_facilities,
        "meta": {
            "total_count": len(all_facilities),
            "cities_covered": cities_covered,
            "last_updated": pd.Timestamp.now().isoformat()
        }
    }
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Save to JSON file
    with open(output_file, 'w') as f:
        json.dump(facilities_data, f, indent=2)
    
    logger.info(f"Saved {len(all_facilities)} facilities covering {cities_covered} cities to {output_file}")
    
    return facilities_data


if __name__ == "__main__":
    # Define paths
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
    cities_file = os.path.join(data_dir, 'processed_cities.json')
    output_file = os.path.join(data_dir, 'facilities.json')
    
    # Read API key from environment variable (or use None for demo)
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    
    # Fetch facilities
    fetch_all_facilities(cities_file, output_file, api_key)
