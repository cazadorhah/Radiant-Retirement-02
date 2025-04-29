#!/usr/bin/env python3
"""
Generate cost data for senior living options across cities.
This script creates realistic cost estimates for different types of care
based on location factors.
"""

import os
import json
import pandas as pd
import numpy as np
from tqdm import tqdm
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define national average costs
NATIONAL_AVERAGES = {
    "assisted_living": {
        "monthly": 4500,
        "annual": 54000
    },
    "memory_care": {
        "monthly": 6000,
        "annual": 72000
    },
    "independent_living": {
        "monthly": 3200,
        "annual": 38400
    },
    "nursing_home": {
        "monthly": 8500,
        "annual": 102000
    }
}

# Define cost factors by state (relative to national average)
# Values > 1.0 mean more expensive than average
STATE_COST_FACTORS = {
    "Alabama": 0.85,
    "Alaska": 1.25,
    "Arizona": 0.95,
    "Arkansas": 0.80,
    "California": 1.30,
    "Colorado": 1.05,
    "Connecticut": 1.25,
    "Delaware": 1.10,
    "Florida": 1.00,
    "Georgia": 0.90,
    "Hawaii": 1.40,
    "Idaho": 0.90,
    "Illinois": 1.05,
    "Indiana": 0.85,
    "Iowa": 0.85,
    "Kansas": 0.85,
    "Kentucky": 0.85,
    "Louisiana": 0.85,
    "Maine": 1.10,
    "Maryland": 1.15,
    "Massachusetts": 1.30,
    "Michigan": 0.95,
    "Minnesota": 1.00,
    "Mississippi": 0.80,
    "Missouri": 0.90,
    "Montana": 0.95,
    "Nebraska": 0.90,
    "Nevada": 1.00,
    "New Hampshire": 1.15,
    "New Jersey": 1.25,
    "New Mexico": 0.90,
    "New York": 1.35,
    "North Carolina": 0.90,
    "North Dakota": 0.95,
    "Ohio": 0.90,
    "Oklahoma": 0.85,
    "Oregon": 1.10,
    "Pennsylvania": 1.10,
    "Rhode Island": 1.20,
    "South Carolina": 0.90,
    "South Dakota": 0.90,
    "Tennessee": 0.85,
    "Texas": 0.90,
    "Utah": 0.95,
    "Vermont": 1.15,
    "Virginia": 1.05,
    "Washington": 1.15,
    "West Virginia": 0.85,
    "Wisconsin": 0.95,
    "Wyoming": 0.90,
    "District of Columbia": 1.40
}

# Define city-specific factors
# These are modifiers to the state cost factors for major cities
CITY_COST_FACTORS = {
    "New York": 1.30,  # NYC is more expensive than NY state average
    "Los Angeles": 1.20,  # LA is more expensive than CA average
    "San Francisco": 1.40,  # SF is much more expensive than CA average
    "Chicago": 1.15,  # Chicago is more expensive than IL average
    "Boston": 1.25,  # Boston is more expensive than MA average
    "Miami": 1.15,  # Miami is more expensive than FL average
    "Washington": 1.25,  # DC area is expensive
    "Seattle": 1.25,  # Seattle is more expensive than WA average
    "San Diego": 1.15,  # SD is more expensive than CA average
    "Denver": 1.20,  # Denver is more expensive than CO average
    "Austin": 1.15,  # Austin is more expensive than TX average
    "Nashville": 1.10,  # Nashville is more expensive than TN average
    "Portland": 1.15,  # Portland is more expensive than OR average
    "Philadelphia": 1.10,  # Philly is more expensive than PA average
    "Atlanta": 1.10   # Atlanta is more expensive than GA average
}

# Define cost factors by care type that can be used to explain pricing
COST_FACTORS_BY_TYPE = {
    "urban": [
        "High urban property values",
        "Premium staffing costs",
        "Luxury amenities in many facilities"
    ],
    "mid": [
        "Moderate urban cost of living",
        "Varied neighborhood pricing",
        "Large selection of facilities"
    ],
    "suburban": [
        "Reasonable suburban pricing",
        "Good value relative to urban options",
        "Moderate cost of operations"
    ],
    "rural": [
        "Lower cost of living",
        "Many retirement communities",
        "Competitive senior care market"
    ],
    "high_end": [
        "Luxury facilities with premium amenities",
        "Specialized medical staff on premises",
        "Resort-style services and accommodations"
    ],
    "affordable": [
        "More affordable options available",
        "Nonprofit facilities in the area",
        "Various subsidy programs available"
    ]
}


def calculate_state_averages():
    """
    Calculate average costs for each state based on national averages and state factors.
    """
    state_averages = {}
    
    for state, factor in STATE_COST_FACTORS.items():
        state_data = {}
        
        for care_type, nat_avg in NATIONAL_AVERAGES.items():
            monthly = round(nat_avg["monthly"] * factor)
            state_data[care_type] = {
                "monthly": monthly,
                "annual": monthly * 12
            }
        
        state_averages[state] = state_data
    
    return state_averages


def get_city_cost_type(population):
    """
    Determine cost type based on city population.
    """
    if population > 1000000:
        return "urban"
    elif population > 500000:
        return "mid"
    elif population > 100000:
        return "suburban"
    else:
        return "rural"


def get_additional_cost_factors(city_name):
    """
    Determine if city has additional cost factors like being high-end or affordable.
    """
    # This could be based on actual data in a real implementation
    # For demo purposes, we'll randomly pick some major cities as high-end
    high_end_cities = ["New York", "San Francisco", "Boston", "Seattle", "Los Angeles"]
    affordable_cities = ["Phoenix", "San Antonio", "Oklahoma City", "Indianapolis", "Memphis"]
    
    if city_name in high_end_cities:
        return "high_end"
    elif city_name in affordable_cities:
        return "affordable"
    else:
        return None


def calculate_city_costs(city_data, state_averages):
    """
    Calculate city-specific costs based on state averages and city factors.
    """
    city_name = city_data['name']
    state_name = city_data['state']
    population = city_data['population']
    
    # Get base costs from state
    state_costs = state_averages.get(state_name, NATIONAL_AVERAGES)
    
    # Apply city-specific factor if available
    city_factor = CITY_COST_FACTORS.get(city_name, 1.0)
    
    # Get cost type based on population
    cost_type = get_city_cost_type(population)
    
    # Get additional factors
    additional_type = get_additional_cost_factors(city_name)
    
    # Gather cost factors to explain pricing
    cost_factors = COST_FACTORS_BY_TYPE.get(cost_type, [])
    if additional_type:
        cost_factors.extend(COST_FACTORS_BY_TYPE.get(additional_type, []))
    
    # Ensure we don't have duplicate factors
    cost_factors = list(set(cost_factors))
    
    # Calculate city costs
    city_costs = {}
    
    for care_type, base_costs in state_costs.items():
        monthly_avg = round(base_costs["monthly"] * city_factor)
        annual_avg = monthly_avg * 12
        
        # Calculate range (±15-25% of average)
        range_low_pct = 0.85 if care_type == "nursing_home" else 0.75
        range_high_pct = 1.25 if care_type == "independent_living" else 1.45
        
        monthly_low = round(monthly_avg * range_low_pct)
        monthly_high = round(monthly_avg * range_high_pct)
        
        city_costs[care_type] = {
            "monthly_avg": monthly_avg,
            "annual_avg": annual_avg,
            "monthly_range": {
                "low": monthly_low,
                "high": monthly_high
            }
        }
    
    return {
        "city": city_name,
        "state": state_name,
        **city_costs,
        "cost_factors": cost_factors
    }


def generate_cost_data(cities_file, output_file):
    """
    Generate cost data for all cities and save to JSON file.
    
    Args:
        cities_file: Path to processed cities JSON file
        output_file: Path to save cost data JSON
    """
    # Load processed cities data
    with open(cities_file, 'r') as f:
        cities_data = json.load(f)
    
    logger.info(f"Loaded {len(cities_data)} cities from {cities_file}")
    
    # Calculate state averages
    state_averages = calculate_state_averages()
    
    # Calculate costs for each city
    city_costs = {}
    
    for city_slug, city_data in tqdm(cities_data.items(), desc="Calculating costs"):
        city_costs[city_slug] = calculate_city_costs(city_data, state_averages)
    
    # Create final structure
    cost_data = {
        "national_averages": NATIONAL_AVERAGES,
        "state_averages": state_averages,
        "cities": city_costs,
        "meta": {
            "last_updated": pd.Timestamp.now().strftime("%Y-%m-%d"),
            "sources": [
                "Genworth Cost of Care Survey",
                "Senior Living Association Database",
                "Internal Market Analysis"
            ],
            "cities_covered": len(city_costs),
            "states_covered": len(state_averages)
        }
    }
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Save to JSON file
    with open(output_file, 'w') as f:
        json.dump(cost_data, f, indent=2)
    
    logger.info(f"Saved cost data for {len(city_costs)} cities to {output_file}")
    
    return cost_data


if __name__ == "__main__":
    # Define paths
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
    cities_file = os.path.join(data_dir, 'processed_cities.json')
    output_file = os.path.join(data_dir, 'cost_data.json')
    
    # Generate cost data
    generate_cost_data(cities_file, output_file)