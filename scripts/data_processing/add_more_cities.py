#!/usr/bin/env python3
"""
Add more cities to the combined_data.json file for the Radiant Retirement website.
This script takes cities from a CSV file and adds them to the existing JSON data.
"""

import os
import json
import csv
import random
import copy
from datetime import datetime

# Configuration
NUM_CITIES_TO_ADD = 90  # Change this to add more or fewer cities
CSV_PATH = "D:\Part-Time Job-Related\Audiobook Proofreading (Hunter Haley)\Radiant Retirement\Radiant-Retirement-02-main - Copy\Radiant-Retirement-02-main\data\cities.csv"  # Path to your cities.csv file
COMBINED_DATA_PATH = "D:\Part-Time Job-Related\Audiobook Proofreading (Hunter Haley)\Radiant Retirement\Radiant-Retirement-02-main - Copy\Radiant-Retirement-02-main\data\combined_data.json"  # Path to your combined_data.json file
OUTPUT_PATH = "D:\Part-Time Job-Related\Audiobook Proofreading (Hunter Haley)\Radiant Retirement\Radiant-Retirement-02-main - Copy\Radiant-Retirement-02-main\data\combined_data.json"  # Where to save the expanded data

# Company names for generating facilities
COMPANY_NAMES = [
    "Sunrise Senior Living", "Holiday Retirement", "Brookdale Senior Living",
    "Atria Senior Living", "Five Star Senior Living", "Leisure Care",
    "Legend Senior Living", "Merrill Gardens", "Oakmont Senior Living",
    "Senior Lifestyle", "Silverado Senior Living", "Sunrise Villa",
    "The Arbor Company", "Watermark Retirement", "Life Care Services",
    "Elmcroft Senior Living", "Erickson Living", "Belmont Village",
    "Capital Senior Living", "Artis Senior Living"
]

# Facility types
FACILITY_TYPES = [
    "Assisted Living", "Memory Care", "Independent Living", "Skilled Nursing",
    "Rehabilitation", "Hospice Care", "Respite Care", 
    "Continuing Care Retirement Community"
]

# Facility features
FEATURES = [
    "Fitness Center", "Swimming Pool", "Library", "Movie Theater",
    "Walking Paths", "Game Room", "Beauty Salon", "Restaurant-style Dining",
    "Fine Dining", "Community Garden", "Pet Friendly", "Wellness Center",
    "Emergency Call System", "24-hour Staff", "24-hour Nursing",
    "Physical Therapy", "Arts & Crafts Studio", "Courtyard",
    "Social Activities", "Weekly Events", "Transportation Services",
    "Concierge Services", "Housekeeping", "Private Rooms", "Fitness Programs"
]

# Street types
STREET_TYPES = ["Main St", "Oak Ave", "Washington Blvd", "Maple Dr", "Lake St", "Park Rd"]

# Cost factors
COST_FACTORS = [
    "Premium staffing costs",
    "Various subsidy programs available",
    "Luxury facilities with premium amenities",
    "Resort-style services and accommodations",
    "More affordable options available",
    "Nonprofit facilities in the area",
    "Luxury amenities in many facilities",
    "Specialized medical staff on premises",
    "High urban property values"
]

def get_region_for_state(state_name):
    """Get the US region for a given state."""
    northeast = ["Connecticut", "Maine", "Massachusetts", "New Hampshire", 
                "New Jersey", "New York", "Pennsylvania", "Rhode Island", "Vermont"]
    
    midwest = ["Illinois", "Indiana", "Iowa", "Kansas", "Michigan", "Minnesota",
              "Missouri", "Nebraska", "North Dakota", "Ohio", "South Dakota", "Wisconsin"]
    
    south = ["Alabama", "Arkansas", "Delaware", "Florida", "Georgia", "Kentucky",
            "Louisiana", "Maryland", "Mississippi", "North Carolina", "Oklahoma",
            "South Carolina", "Tennessee", "Texas", "Virginia", "West Virginia", 
            "District of Columbia"]
    
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

def determine_avg_cost(state_name):
    """Determine average cost based on region and state."""
    region = get_region_for_state(state_name)
    
    # Base costs vary by region
    if region == "Northeast":
        base = random.randint(4800, 5800)
    elif region == "West":
        base = random.randint(4500, 5500)
    elif region == "South":
        base = random.randint(3500, 4300)
    elif region == "Midwest":
        base = random.randint(3800, 4600)
    else:
        base = random.randint(4000, 5000)
    
    # High-cost states get an additional premium
    high_cost_states = ["California", "New York", "Massachusetts", "Hawaii", 
                        "New Jersey", "Connecticut"]
    if state_name in high_cost_states:
        base += random.randint(300, 700)
    
    # Round to nearest hundred
    return round(base / 100) * 100

def generate_city_cost_data(city_name, state_name, avg_cost):
    """Generate synthetic cost data for a city."""
    # Base costs vary by region
    region = get_region_for_state(state_name)
    
    # Create cost multipliers based on care type
    memory_care_multiplier = 1.33
    independent_living_multiplier = 0.71
    nursing_home_multiplier = 1.89
    
    # Monthly average cost for assisted living
    assisted_living_monthly = avg_cost
    
    # Generate cost data
    costs = {
        "city": city_name,
        "state": state_name,
        "assisted_living": {
            "monthly_avg": assisted_living_monthly,
            "annual_avg": assisted_living_monthly * 12,
            "monthly_range": {
                "low": int(assisted_living_monthly * 0.75),
                "high": int(assisted_living_monthly * 1.45)
            }
        },
        "memory_care": {
            "monthly_avg": int(assisted_living_monthly * memory_care_multiplier),
            "annual_avg": int(assisted_living_monthly * memory_care_multiplier * 12),
            "monthly_range": {
                "low": assisted_living_monthly,
                "high": int(assisted_living_monthly * memory_care_multiplier * 1.45)
            }
        },
        "independent_living": {
            "monthly_avg": int(assisted_living_monthly * independent_living_multiplier),
            "annual_avg": int(assisted_living_monthly * independent_living_multiplier * 12),
            "monthly_range": {
                "low": int(assisted_living_monthly * independent_living_multiplier * 0.75),
                "high": int(assisted_living_monthly * independent_living_multiplier * 1.25)
            }
        },
        "nursing_home": {
            "monthly_avg": int(assisted_living_monthly * nursing_home_multiplier),
            "annual_avg": int(assisted_living_monthly * nursing_home_multiplier * 12),
            "monthly_range": {
                "low": int(assisted_living_monthly * nursing_home_multiplier * 0.85),
                "high": int(assisted_living_monthly * nursing_home_multiplier * 1.45)
            }
        },
        "cost_factors": random.sample(COST_FACTORS, random.randint(4, 6))
    }
    
    return costs

def generate_facility(city_name, state_name, city_slug, facility_number):
    """Generate a synthetic facility for a city."""
    # Pick a random company
    company_name = random.choice(COMPANY_NAMES)
    
    # Generate a random address
    street_number = random.randint(100, 9999)
    street_type = random.choice(STREET_TYPES)
    
    # Generate a random phone
    area_code = random.randint(200, 999)
    phone_suffix = random.randint(1000, 9999)
    
    # Generate a website URL
    website = f"https://www.{company_name.lower().replace(' ', '')}{city_name.lower().replace(' ', '')}.com"
    
    # Generate random coordinates (this would need to be more realistic in a real implementation)
    lat = random.uniform(24, 49)
    lng = random.uniform(-125, -65)
    
    # Select random facility types (1-3)
    facility_types = random.sample(FACILITY_TYPES, random.randint(1, 3))
    
    # Select random features (3-7)
    facility_features = random.sample(FEATURES, random.randint(3, 7))
    
    # Generate capacity
    capacity = random.randint(50, 250)
    
    # Generate ratings
    overall = round(random.uniform(3.5, 5.0), 1)
    care_quality = round(random.uniform(3.5, 5.0), 1)
    facilities_rating = round(random.uniform(3.5, 5.0), 1)
    staff = round(random.uniform(3.5, 5.0), 1)
    value = round(random.uniform(3.5, 5.0), 1)
    review_count = random.randint(10, 100)
    
    # Create facility object
    facility = {
        "id": f"fac_{city_slug}_{facility_number:03d}",
        "name": f"{company_name} of {city_name}",
        "address": f"{street_number} {street_type}",
        "city": city_name,
        "state": state_name,
        "zip_code": f"{random.randint(10000, 99999)}",
        "phone": f"({area_code}) 555-{phone_suffix}",
        "website": website,
        "coordinates": {
            "lat": lat,
            "lng": lng
        },
        "facility_type": facility_types,
        "features": facility_features,
        "capacity": capacity,
        "ratings": {
            "overall": overall,
            "care_quality": care_quality,
            "facilities": facilities_rating,
            "staff": staff,
            "value": value,
            "review_count": review_count
        },
        "city_slug": city_slug
    }
    
    return facility

def generate_city_seo_data(city_name, state_name, monthly_avg_cost):
    """Generate SEO data for a city."""
    region = get_region_for_state(state_name)
    
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
    
    # Generate SEO titles
    titles = {
        "main": f"Senior Living Options in {city_name}, {state_name} | Cost & Facility Guide",
        "cost": f"Cost of Assisted Living in {city_name}, {state_name} (2025 Guide)",
        "facilities": f"Top-Rated Senior Living Facilities in {city_name}, {state_name}",
        "nearby": f"Senior Living Near {city_name} | Nearby Cities & Options"
    }
    
    # Format the monthly cost with commas
    formatted_cost = f"${monthly_avg_cost:,}"
    
    # Generate SEO descriptions
    descriptions = {
        "main": (f"Comprehensive guide to senior living options in {city_name}, {state_name}. "
                f"Compare costs, read reviews of top facilities, and find the right care level."),
        "cost": (f"Average cost of assisted living in {city_name} is "
                f"{formatted_cost}/month. "
                f"Learn about pricing factors and compare costs across care types."),
        "facilities": (f"Discover the top-rated senior living facilities in {city_name}, {state_name}. "
                      f"Compare amenities, care levels, and reviews to find the perfect home."),
        "nearby": (f"Explore senior living options in and around {city_name}, {state_name}. "
                  f"Find nearby communities with our comprehensive directory.")
    }
    
    # Create SEO data object
    seo_data = {
        "keywords": keywords,
        "titles": titles,
        "descriptions": descriptions,
        "care_types": ["assisted living", "memory care", "independent living", "nursing home"],
        "location_info": {
            "city": city_name,
            "state": state_name,
            "region": region
        }
    }
    
    return seo_data

def create_city_entry(city_data):
    """Create a complete city entry for the combined data."""
    city_name = city_data["name"]
    state_name = city_data["state"]
    city_slug = city_data["slug"]
    population = city_data["population"]
    avg_cost = city_data["avg_cost"]
    
    # Generate facilities for this city
    num_facilities = random.randint(5, 10)
    facilities = []
    for i in range(1, num_facilities + 1):
        facility = generate_facility(city_name, state_name, city_slug, i)
        facilities.append(facility)
    
    # Sort facilities by overall rating (highest first)
    facilities.sort(key=lambda x: x["ratings"]["overall"], reverse=True)
    
    # Generate cost data
    cost_data = generate_city_cost_data(city_name, state_name, avg_cost)
    
    # Generate SEO data
    seo_data = generate_city_seo_data(city_name, state_name, cost_data["assisted_living"]["monthly_avg"])
    
    # Create the city entry
    city_entry = {
        "city_info": {
            "name": city_name,
            "state": state_name,
            "population": population,
            "slug": city_slug,
            "nearby_cities": [],
            "avg_cost": avg_cost
        },
        "costs": cost_data,
        "facilities": facilities,
        "meta": {
            "facility_count": len(facilities),
            "has_cost_data": True,
            "has_nearby_cities": False,
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        },
        "seo": seo_data
    }
    
    return city_entry

def main():
    """Main function to add cities to the combined data."""
    print(f"Adding {NUM_CITIES_TO_ADD} cities to the combined data...")
    
    # Load the existing combined data
    with open(COMBINED_DATA_PATH, 'r') as f:
        combined_data = json.load(f)
    
    # Get existing city slugs
    existing_slugs = set(combined_data["cities"].keys())
    print(f"Found {len(existing_slugs)} existing cities in the combined data.")
    
    # Load the cities from the CSV file
    cities_to_add = []
    with open(CSV_PATH, 'r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip cities that already exist
            if row["slug"] in existing_slugs:
                continue
            
            # Create a city data object
            city_data = {
                "name": row["city"],
                "state": row["state_name"],
                "population": int(row["population"]),
                "slug": row["slug"],
                "avg_cost": determine_avg_cost(row["state_name"])
            }
            
            cities_to_add.append(city_data)
    
    print(f"Found {len(cities_to_add)} new cities in the CSV file.")
    
    # Sort cities by population (descending)
    cities_to_add.sort(key=lambda x: x["population"], reverse=True)
    
    # Take the top N cities to add
    cities_to_add = cities_to_add[:NUM_CITIES_TO_ADD]
    
    # Create city entries
    new_cities = {}
    total_new_facilities = 0
    
    print(f"Creating entries for {len(cities_to_add)} cities...")
    for city_data in cities_to_add:
        city_entry = create_city_entry(city_data)
        new_cities[city_data["slug"]] = city_entry
        total_new_facilities += len(city_entry["facilities"])
    
    # Update the combined data
    combined_data["cities"].update(new_cities)
    
    # Update the metadata
    combined_data["meta"]["total_cities"] = len(combined_data["cities"])
    combined_data["meta"]["total_facilities"] += total_new_facilities
    combined_data["meta"]["last_updated"] = datetime.now().strftime("%Y-%m-%d")
    
    # Save the expanded data
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(combined_data, f, indent=2)
    
    print(f"Done! Added {len(new_cities)} cities with {total_new_facilities} facilities.")
    print(f"Total cities in the expanded data: {combined_data['meta']['total_cities']}")
    print(f"Total facilities in the expanded data: {combined_data['meta']['total_facilities']}")
    print(f"Saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()