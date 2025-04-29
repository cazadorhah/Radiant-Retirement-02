#!/usr/bin/env python3
"""
Generate the browse cities page for the Radiant Retirement website.
This page will display all cities organized by state/region.
"""

import os
import json
import logging
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from collections import defaultdict

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def generate_browse_page(combined_data_path, template_dir, output_dir):
    """
    Generate the browse cities page using the combined data and templates.
    
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
    template = env.get_template('browse.html')
    
    # Organize cities by state
    cities_by_state = defaultdict(list)
    
    for city_slug, city_data in data['cities'].items():
        state_name = city_data['city_info']['state']
        
        cities_by_state[state_name].append({
            'slug': city_slug,
            'name': city_data['city_info']['name'],
            'population': city_data['city_info']['population'],
            'avg_cost': city_data['costs'].get('assisted_living', {}).get('monthly_avg', 0),
            'facility_count': city_data['meta']['facility_count']
        })
    
    # Sort cities within each state by population (descending)
    for state in cities_by_state:
        cities_by_state[state].sort(key=lambda x: x['population'], reverse=True)
    
    # Organize states by region
    regions = {
        'Northeast': ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 
                    'New Jersey', 'New York', 'Pennsylvania', 'Rhode Island', 'Vermont'],
        'Midwest': ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota',
                   'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin'],
        'South': ['Alabama', 'Arkansas', 'Delaware', 'Florida', 'Georgia', 'Kentucky',
                 'Louisiana', 'Maryland', 'Mississippi', 'North Carolina', 'Oklahoma',
                 'South Carolina', 'Tennessee', 'Texas', 'Virginia', 'West Virginia', 'District of Columbia'],
        'West': ['Alaska', 'Arizona', 'California', 'Colorado', 'Hawaii', 'Idaho',
                'Montana', 'Nevada', 'New Mexico', 'Oregon', 'Utah', 'Washington', 'Wyoming']
    }
    
    # Create a dictionary of regions with their states and cities
    region_data = {}
    
    for region_name, states_list in regions.items():
        region_data[region_name] = {}
        
        for state_name in states_list:
            if state_name in cities_by_state:
                region_data[region_name][state_name] = cities_by_state[state_name]
    
    # Get total counts for each region
    region_counts = {}
    
    for region_name, states_dict in region_data.items():
        total_cities = 0
        total_facilities = 0
        
        for state_name, cities_list in states_dict.items():
            total_cities += len(cities_list)
            total_facilities += sum(city['facility_count'] for city in cities_list)
        
        region_counts[region_name] = {
            'cities': total_cities,
            'facilities': total_facilities
        }
    
    # Render the template
    context = {
        'region_data': region_data,
        'region_counts': region_counts,
        'regions': list(regions.keys()),
        'current_year': datetime.now().year
    }
    
    output = template.render(**context)
    
    # Write to file
    output_path = os.path.join(output_dir, 'browse-cities.html')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        f.write(output)
    
    logger.info(f"Browse cities page generated at {output_path}")

if __name__ == "__main__":
    # Define paths
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_dir = os.path.join(project_root, 'data')
    template_dir = os.path.join(project_root, 'templates')
    output_dir = os.path.join(project_root, 'public')
    
    combined_data_path = os.path.join(data_dir, 'combined_data.json')
    
    # Generate the browse cities page
    generate_browse_page(combined_data_path, template_dir, output_dir)