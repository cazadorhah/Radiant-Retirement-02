#!/usr/bin/env python3
"""
Generate the homepage for the Radiant Retirement website.
"""

import os
import json
import logging
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
import random

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def generate_home_page(combined_data_path, template_dir, output_dir):
    """
    Generate the homepage using the combined data and templates.
    
    Args:
        combined_data_path: Path to the combined data JSON
        template_dir: Directory containing Jinja2 templates
        output_dir: Directory where the generated HTML will be saved
    """
    # Load combined data
    with open(combined_data_path, 'r') as f:
        data = json.load(f)
    
    # Set up Jinja2 environment
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('home.html')
    
    # Prepare data for the template
    
    # 1. Get featured cities (select 8 cities with highest populations)
    city_data = []
    for city_slug, city_info in data['cities'].items():
        city_data.append({
            'slug': city_slug,
            'name': city_info['city_info']['name'],
            'state': city_info['city_info']['state'],
            'state_abbr': get_state_abbreviation(city_info['city_info']['state']),
            'population': city_info['city_info']['population'],
            'avg_cost': city_info['costs'].get('assisted_living', {}).get('monthly_avg', 0),
            'facility_count': city_info['meta']['facility_count']
        })
    
    # Sort by population, descending
    city_data.sort(key=lambda x: x['population'], reverse=True)
    
    # Take the top 8 cities as featured
    featured_cities = city_data[:8]
    
    # Render the template
    context = {
        'featured_cities': featured_cities,
        'current_year': datetime.now().year
    }
    
    output = template.render(**context)
    
    # Write to file
    output_path = os.path.join(output_dir, 'index.html')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        f.write(output)
    
    logger.info(f"Homepage generated at {output_path}")

def get_state_abbreviation(state_name):
    """
    Get the two-letter abbreviation for a state name.
    """
    state_abbrs = {
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
    }
    
    return state_abbrs.get(state_name, state_name)

if __name__ == "__main__":
    # Define paths
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_dir = os.path.join(project_root, 'data')
    template_dir = os.path.join(project_root, 'templates')
    output_dir = os.path.join(project_root, 'public')
    
    combined_data_path = os.path.join(data_dir, 'combined_data.json')
    
    # Generate the home page
    generate_home_page(combined_data_path, template_dir, output_dir)