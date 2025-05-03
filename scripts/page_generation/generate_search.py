#!/usr/bin/env python3
"""
Generate the search page for the Radiant Retirement website.
This page will include the search form and Javascript functionality
for client-side searching of senior living options.
"""

import os
import json
import logging
from datetime import datetime
from jinja2 import Environment, FileSystemLoader

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def generate_search_page(combined_data_path, template_dir, output_dir):
    """
    Generate the search page using the combined data and templates.
    
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
    template = env.get_template('search.html')
    
    # Create a list of all states and their abbreviations
    states = {}
    for city_slug, city_data in data['cities'].items():
        state_name = city_data['city_info']['state']
        state_abbr = get_state_abbreviation(state_name)
        states[state_abbr] = state_name
    
    # Sort states alphabetically by name
    sorted_states = {k: v for k, v in sorted(states.items(), key=lambda item: item[1])}
    
    # Prepare sample search results for initial page
    # In a real implementation, this would be empty until the user searches
    # For this static demo, we'll include some sample results
    sample_results = prepare_sample_results(data['cities'])
    
    # Prepare helper functions for the template
    def remove_filter_url(filter_name):
        """Helper function to generate URL for removing a filter"""
        return f"javascript:void(0);"  # This would be implemented client-side
    
    def pagination_url(page):
        """Helper function to generate URL for pagination"""
        return f"javascript:void(0);"  # This would be implemented client-side
    
    # Render the template
    context = {
        'query': '',  # Empty initial query
        'care_type': '',  # No care type filter
        'state': '',  # No state filter
        'cost_range': '',  # No cost filter
        'results': sample_results,
        'states': sorted_states,
        'current_page': 1,
        'page_count': 1,
        'remove_filter_url': remove_filter_url,
        'pagination_url': pagination_url,
        'current_year': datetime.now().year
    }
    
    output = template.render(**context)
    
    # Write to file
    output_path = os.path.join(output_dir, 'search.html')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)
    
    logger.info(f"Search page generated at {output_path}")
    
    # Generate search data files
    generate_search_data(data['cities'], output_dir)
    generate_city_index(data['cities'], output_dir)

def generate_city_index(cities_data, output_dir):
    """
    Generate a simplified JSON file for autocomplete in the /data directory.
    
    Args:
        cities_data: Dictionary of city data
        output_dir: Directory where the JSON file will be saved
    """
    city_index = []
    
    # Extract city data for autocomplete
    for city_slug, city_data in cities_data.items():
        city_index.append({
            'slug': city_slug,
            'name': city_data['city_info']['name'],
            'state': city_data['city_info']['state'],
            'url': f"/city/{city_slug}/"
        })
    
    # Create data directory
    data_dir = os.path.join(output_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # Save to JSON file
    output_path = os.path.join(data_dir, 'city-index.json')
    
    with open(output_path, 'w') as f:
        json.dump(city_index, f)
    
    logger.info(f"City index for autocomplete generated at {output_path} with {len(city_index)} cities")

def generate_search_data(cities_data, output_dir):
    """
    Generate a JSON file with search data for client-side searching.
    
    Args:
        cities_data: Dictionary of city data
        output_dir: Directory where the JSON file will be saved
    """
    search_data = {
        'cities': [],
        'facilities': []
    }
    
    # Extract searchable city data
    for city_slug, city_data in cities_data.items():
        search_data['cities'].append({
            'slug': city_slug,
            'name': city_data['city_info']['name'],
            'state': city_data['city_info']['state'],
            'state_abbr': get_state_abbreviation(city_data['city_info']['state']),
            'population': city_data['city_info']['population'],
            'assisted_living_cost': city_data['costs'].get('assisted_living', {}).get('monthly_avg', 0),
            'memory_care_cost': city_data['costs'].get('memory_care', {}).get('monthly_avg', 0),
            'facility_count': city_data['meta']['facility_count']
        })
        
        # Extract searchable facility data
        for facility in city_data['facilities']:
            search_data['facilities'].append({
                'id': facility['id'],
                'name': facility['name'],
                'city': facility['city'],
                'state': facility['state'],
                'address': facility['address'],
                'city_slug': city_slug,
                'rating': facility['ratings']['overall'],
                'care_types': facility['facility_type'],
                'features': facility['features']
            })
    
    # Save to JSON file
    output_path = os.path.join(output_dir, 'js', 'search-data.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(search_data, f)
    
    logger.info(f"Search data JSON generated at {output_path}")

def prepare_sample_results(cities_data):
    """
    Prepare sample search results for the initial search page.
    
    Args:
        cities_data: Dictionary of city data
        
    Returns:
        List of sample search results
    """
    results = []
    
    # Add a few cities to the results
    city_count = 0
    for city_slug, city_data in cities_data.items():
        if city_count >= 5:  # Limit to 5 sample cities
            break
            
        results.append({
            'type': 'city',
            'slug': city_slug,
            'name': city_data['city_info']['name'],
            'state': city_data['city_info']['state'],
            'population': city_data['city_info']['population'],
            'assisted_living_cost': city_data['costs'].get('assisted_living', {}).get('monthly_avg', 0),
            'memory_care_cost': city_data['costs'].get('memory_care', {}).get('monthly_avg', 0),
            'facility_count': city_data['meta']['facility_count']
        })
        
        city_count += 1
        
        # Add a couple of facilities from this city
        facility_count = 0
        for facility in city_data['facilities']:
            if facility_count >= 2:  # Limit to 2 facilities per city
                break
                
            results.append({
                'type': 'facility',
                'id': facility['id'],
                'name': facility['name'],
                'city': facility['city'],
                'state': facility['state'],
                'address': facility['address'],
                'city_slug': city_slug,
                'rating': facility['ratings']['overall'],
                'care_types': facility['facility_type']
            })
            
            facility_count += 1
    
    return results

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
    
    # Generate the search page
    generate_search_page(combined_data_path, template_dir, output_dir)
