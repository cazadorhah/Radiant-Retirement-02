#!/usr/bin/env python3
"""
Process city data from CSV to prepare for page generation.
- Enriches city data with additional information
- Calculates nearby cities for each city
- Prepares data structure for page generation
"""

import os
import json
import pandas as pd
from geopy.distance import geodesic
import tqdm

# For demonstration purposes - in a real implementation, you would
# use an actual geocoding service or have coordinates in your data
SAMPLE_COORDINATES = {
    "new-york-ny": (40.7128, -74.0060),
    "los-angeles-ca": (34.0522, -118.2437),
    "chicago-il": (41.8781, -87.6298),
    "houston-tx": (29.7604, -95.3698),
    "phoenix-az": (33.4484, -112.0740),
    "philadelphia-pa": (39.9526, -75.1652),
    "san-antonio-tx": (29.4241, -98.4936),
    "san-diego-ca": (32.7157, -117.1611),
    "dallas-tx": (32.7767, -96.7970),
    "san-jose-ca": (37.3382, -121.8863)
}

# Average costs by state - in a real implementation, this would be more detailed
# and possibly from a real data source
SAMPLE_COSTS = {
    "New York": 5500,
    "California": 5000,
    "Illinois": 4500,
    "Texas": 3800,
    "Arizona": 3900,
    "Pennsylvania": 4200
}

def find_nearby_cities(cities_df, max_nearby=5, max_distance_miles=50):
    """Find nearby cities for each city based on geographical proximity."""
    city_dict = {}
    
    # In a real implementation, you would use actual coordinates
    # For demo, we'll use our sample coordinates
    
    for idx, row in tqdm.tqdm(cities_df.iterrows(), total=len(cities_df), desc="Finding nearby cities"):
        slug = row['slug']
        if slug in SAMPLE_COORDINATES:
            city_coords = SAMPLE_COORDINATES[slug]
            
            # Find distances to all other cities
            distances = []
            for other_slug, other_coords in SAMPLE_COORDINATES.items():
                if other_slug != slug:
                    distance = geodesic(city_coords, other_coords).miles
                    if distance <= max_distance_miles:
                        distances.append((other_slug, distance))
            
            # Sort by distance and take top N
            distances.sort(key=lambda x: x[1])
            nearby = distances[:max_nearby]
            
            # Get city info for nearby cities
            nearby_cities = []
            for near_slug, distance in nearby:
                near_city = cities_df[cities_df['slug'] == near_slug]
                if not near_city.empty:
                    nearby_cities.append({
                        'name': near_city.iloc[0]['city'],
                        'state': near_city.iloc[0]['state_name'],
                        'slug': near_slug,
                        'distance': round(distance, 1)
                    })
            
            # Add to dictionary
            city_dict[slug] = {
                'name': row['city'],
                'state': row['state_name'],
                'population': row['population'],
                'slug': slug,
                'nearby_cities': nearby_cities,
                'avg_cost': SAMPLE_COSTS.get(row['state_name'], 4000)  # Default if state not found
            }
    
    return city_dict

def process_cities(input_csv, output_json):
    """Process city CSV data and output enriched JSON."""
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    
    # Read CSV
    cities_df = pd.read_csv(input_csv)
    print(f"Processing {len(cities_df)} cities...")
    
    # Find nearby cities
    city_data = find_nearby_cities(cities_df)
    
    # Write to JSON
    with open(output_json, 'w') as f:
        json.dump(city_data, f, indent=2)
    
    print(f"Processed data written to {output_json}")
    return city_data

if __name__ == "__main__":
    # Define paths
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
    input_csv = os.path.join(data_dir, 'cities.csv')
    output_json = os.path.join(data_dir, 'processed_cities.json')
    
    # Process cities
    process_cities(input_csv, output_json)