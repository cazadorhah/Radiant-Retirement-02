#!/usr/bin/env python3
"""
Combine all data sources into a single comprehensive dataset for page generation.
This script merges city data, facility information, and cost estimates into
a unified structure that can be used to generate the website pages.
"""

import os
import json
import pandas as pd
from tqdm import tqdm
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_data_files(cities_file, facilities_file, costs_file):
    """
    Load all data files into memory.
    
    Args:
        cities_file: Path to processed cities JSON
        facilities_file: Path to facilities JSON
        costs_file: Path to cost data JSON
        
    Returns:
        Tuple of (cities_data, facilities_data, costs_data)
    """
    # Load cities data
    with open(cities_file, 'r') as f:
        cities_data = json.load(f)
    
    # Load facilities data
    with open(facilities_file, 'r') as f:
        facilities_data = json.load(f)
    
    # Load cost data
    with open(costs_file, 'r') as f:
        costs_data = json.load(f)
    
    logger.info(f"Loaded data: {len(cities_data)} cities, "
                f"{len(facilities_data['facilities'])} facilities, "
                f"{len(costs_data['cities'])} city cost records")
    
    return cities_data, facilities_data, costs_data


def combine_data(cities_data, facilities_data, costs_data):
    """
    Combine all data sources into a unified structure.
    
    Args:
        cities_data: Dictionary of city information
        facilities_data: Dictionary of facility information
        costs_data: Dictionary of cost information
        
    Returns:
        Combined data dictionary
    """
    # Initialize the combined data dictionary
    combined_data = {}
    
    # Organize facilities by city slug for easier access
    facilities_by_city = {}
    for facility in facilities_data['facilities']:
        city_slug = facility['city_slug']
        if city_slug not in facilities_by_city:
            facilities_by_city[city_slug] = []
        facilities_by_city[city_slug].append(facility)
    
    # Process each city
    for city_slug, city_info in tqdm(cities_data.items(), desc="Combining data"):
        # Get cost data for this city
        city_costs = costs_data['cities'].get(city_slug, {})
        
        # Get facilities for this city
        city_facilities = facilities_by_city.get(city_slug, [])
        
        # Sort facilities by overall rating (highest first)
        city_facilities.sort(key=lambda x: x['ratings']['overall'], reverse=True)
        
        # Create combined entry
        combined_data[city_slug] = {
            'city_info': city_info,
            'costs': city_costs,
            'facilities': city_facilities,
            'meta': {
                'facility_count': len(city_facilities),
                'has_cost_data': bool(city_costs),
                'has_nearby_cities': bool(city_info.get('nearby_cities')),
                'last_updated': pd.Timestamp.now().strftime("%Y-%m-%d")
            }
        }
    
    return combined_data


def add_seo_metadata(combined_data):
    """
    Add SEO-specific metadata to each city.
    
    Args:
        combined_data: Combined data dictionary
        
    Returns:
        Data with added SEO metadata
    """
    care_types = ["assisted living", "memory care", "independent living", "nursing home"]
    
    for city_slug, city_data in tqdm(combined_data.items(), desc="Adding SEO metadata"):
        city_name = city_data['city_info']['name']
        state_name = city_data['city_info']['state']
        
        # Generate SEO keywords
        keywords = [
            f"{city_name} senior living",
            f"senior living in {city_name}",
            f"assisted living {city_name}",
            f"{city_name} {state_name} assisted living",
            f"best senior homes in {city_name}",
            f"retirement communities in {city_name}",
            f"{city_name} elder care",
            f"senior care options in {city_name} {state_name}",
            f"memory care in {city_name}",
            f"cost of assisted living in {city_name}"
        ]
        
        # Generate SEO titles and descriptions
        titles = {
            "main": f"Senior Living Options in {city_name}, {state_name} | Cost & Facility Guide",
            "cost": f"Cost of Assisted Living in {city_name}, {state_name} (2025 Guide)",
            "facilities": f"Top-Rated Senior Living Facilities in {city_name}, {state_name}",
            "nearby": f"Senior Living Near {city_name} | Nearby Cities & Options"
        }
        
        descriptions = {
            "main": (f"Comprehensive guide to senior living options in {city_name}, {state_name}. "
                    f"Compare costs, read reviews of top facilities, and find the right care level."),
            "cost": (f"Average cost of assisted living in {city_name} is "
                    f"${city_data['costs'].get('assisted_living', {}).get('monthly_avg', 0):,}/month. "
                    f"Learn about pricing factors and compare costs across care types."),
            "facilities": (f"Discover the top-rated senior living facilities in {city_name}, {state_name}. "
                          f"Compare amenities, care levels, and reviews to find the perfect home."),
            "nearby": (f"Explore senior living options in and around {city_name}, {state_name}. "
                      f"Find nearby communities with our comprehensive directory.")
        }
        
        # Add to combined data
        city_data['seo'] = {
            'keywords': keywords,
            'titles': titles,
            'descriptions': descriptions,
            'care_types': care_types,
            'location_info': {
                'city': city_name,
                'state': state_name,
                'region': get_region_for_state(state_name)
            }
        }
    
    return combined_data


def get_region_for_state(state_name):
    """
    Get the US region for a given state.
    Used for SEO region targeting.
    """
    northeast = ["Connecticut", "Maine", "Massachusetts", "New Hampshire", 
                "New Jersey", "New York", "Pennsylvania", "Rhode Island", "Vermont"]
    
    midwest = ["Illinois", "Indiana", "Iowa", "Kansas", "Michigan", "Minnesota",
              "Missouri", "Nebraska", "North Dakota", "Ohio", "South Dakota", "Wisconsin"]
    
    south = ["Alabama", "Arkansas", "Delaware", "Florida", "Georgia", "Kentucky",
            "Louisiana", "Maryland", "Mississippi", "North Carolina", "Oklahoma",
            "South Carolina", "Tennessee", "Texas", "Virginia", "West Virginia", "District of Columbia"]
    
    west = ["Alaska", "Arizona", "California", "Colorado", "Hawaii", "Idaho",
           "Montana", "Nevada", "New Mexico", "Oregon", "Utah", "Washington", "Wyoming"]
    
    if state_name in northeast:
        return "Northeast"
    elif state_name in midwest:
        return "Midwest"
    elif state_name in south:
        return "South"
    elif state_name in west:
        return "West"
    else:
        return "Unknown"


def combine_all_data(cities_file, facilities_file, costs_file, output_file):
    """
    Combine all data sources and save to a single JSON file.
    
    Args:
        cities_file: Path to processed cities JSON
        facilities_file: Path to facilities JSON
        costs_file: Path to cost data JSON
        output_file: Path to save combined data JSON
    """
    # Load data
    cities_data, facilities_data, costs_data = load_data_files(
        cities_file, facilities_file, costs_file
    )
    
    # Combine data
    combined_data = combine_data(cities_data, facilities_data, costs_data)
    
    # Add SEO metadata
    combined_data = add_seo_metadata(combined_data)
    
    # Create metadata
    metadata = {
        "total_cities": len(combined_data),
        "total_facilities": len(facilities_data['facilities']),
        "care_types": ["Assisted Living", "Memory Care", "Independent Living", "Nursing Home"],
        "last_updated": pd.Timestamp.now().strftime("%Y-%m-%d"),
        "sources": costs_data['meta']['sources']
    }
    
    # Create final structure
    final_data = {
        "cities": combined_data,
        "meta": metadata
    }
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Save to JSON file
    with open(output_file, 'w') as f:
        json.dump(final_data, f, indent=2)
    
    logger.info(f"Saved combined data for {len(combined_data)} cities to {output_file}")
    
    return final_data


if __name__ == "__main__":
    # Define paths
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
    cities_file = os.path.join(data_dir, 'processed_cities.json')
    facilities_file = os.path.join(data_dir, 'facilities.json')
    costs_file = os.path.join(data_dir, 'cost_data.json')
    output_file = os.path.join(data_dir, 'combined_data.json')
    
    # Combine all data
    combine_all_data(cities_file, facilities_file, costs_file, output_file)
