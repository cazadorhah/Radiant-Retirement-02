#!/usr/bin/env python3
"""
Generate individual city pages for the Radiant Retirement website.
"""

import os
import json
import logging
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
import concurrent.futures

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

def generate_city_page(city_slug, city_data, all_cities, env, output_dir):
    """
    Generate a single city page.
    
    Args:
        city_slug: Slug for the city
        city_data: Data for the city
        all_cities: All city data (for related cities)
        env: Jinja2 environment
        output_dir: Directory where generated pages will be saved
    """
    try:
        template = env.get_template('city.html')
        
        # Get the city's state for finding related cities
        state_name = city_data['city_info']['state']
        
        # Find related cities in the same state (up to 4)
        related_cities = []
        for related_slug, related_data in all_cities.items():
            if related_slug != city_slug and related_data['city_info']['state'] == state_name:
                related_cities.append({
                    'slug': related_slug,
                    'name': related_data['city_info']['name'],
                    'state': related_data['city_info']['state'],
                    'state_abbr': get_state_abbreviation(related_data['city_info']['state']),
                    'population': related_data['city_info']['population'],
                    'avg_cost': related_data['costs'].get('assisted_living', {}).get('monthly_avg', 0)
                })
                
                if len(related_cities) >= 4:
                    break
        
        # If we don't have enough related cities in the same state, add some popular cities
        if len(related_cities) < 4:
            # Sort all cities by population to find popular ones
            popular_cities = []
            for pop_slug, pop_data in all_cities.items():
                if pop_slug != city_slug and pop_data['city_info']['state'] != state_name:
                    popular_cities.append({
                        'slug': pop_slug,
                        'name': pop_data['city_info']['name'],
                        'state': pop_data['city_info']['state'],
                        'state_abbr': get_state_abbreviation(pop_data['city_info']['state']),
                        'population': pop_data['city_info']['population'],
                        'avg_cost': pop_data['costs'].get('assisted_living', {}).get('monthly_avg', 0)
                    })
            
            # Sort by population (descending)
            popular_cities.sort(key=lambda x: x['population'], reverse=True)
            
            # Add top cities to related_cities until we have 4
            for pop_city in popular_cities:
                if len(related_cities) >= 4:
                    break
                related_cities.append(pop_city)
        
        # Render the template
        context = {
            'city': city_data,
            'related_cities': related_cities,
            'current_year': datetime.now().year
        }
        
        output = template.render(**context)
        
        # Create output directory
        city_output_dir = os.path.join(output_dir, 'city', city_slug)
        os.makedirs(city_output_dir, exist_ok=True)
        
        # Write the rendered HTML to file
        output_path = os.path.join(city_output_dir, 'index.html')
        with open(output_path, 'w') as f:
            f.write(output)
        
        logger.info(f"Generated city page for {city_data['city_info']['name']} at {output_path}")
        return True
    
    except Exception as e:
        logger.error(f"Error generating page for {city_slug}: {str(e)}")
        return False

def generate_all_city_pages(combined_data_path, template_dir, output_dir, max_workers=8):
    """
    Generate all city pages using the combined data and templates.
    
    Args:
        combined_data_path: Path to the combined data JSON
        template_dir: Directory containing Jinja2 templates
        output_dir: Directory where the generated HTML will be saved
        max_workers: Maximum number of worker threads for parallel processing
    """
    # Load combined data
    with open(combined_data_path, 'r') as f:
        data = json.load(f)
    
    all_cities = data['cities']
    
    # Set up Jinja2 environment
    env = Environment(loader=FileSystemLoader(template_dir))
    
    # Create city directory
    city_dir = os.path.join(output_dir, 'city')
    os.makedirs(city_dir, exist_ok=True)
    
    # Generate pages in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Create a list of future results
        future_results = {}
        
        for city_slug, city_data in all_cities.items():
            future = executor.submit(
                generate_city_page,
                city_slug,
                city_data,
                all_cities,
                env,
                output_dir
            )
            future_results[future] = city_slug
        
        # Process results as they complete
        completed = 0
        failed = 0
        for future in concurrent.futures.as_completed(future_results):
            city_slug = future_results[future]
            try:
                if future.result():
                    completed += 1
                else:
                    failed += 1
            except Exception as e:
                logger.error(f"Exception processing {city_slug}: {str(e)}")
                failed += 1
            
            # Log progress every 100 cities
            if (completed + failed) % 100 == 0:
                logger.info(f"Progress: {completed + failed}/{len(all_cities)} cities processed")
    
    logger.info(f"City page generation complete. Generated {completed} pages. Failed: {failed}")

if __name__ == "__main__":
    # Define paths
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_dir = os.path.join(project_root, 'data')
    template_dir = os.path.join(project_root, 'templates')
    output_dir = os.path.join(project_root, 'public')
    
    combined_data_path = os.path.join(data_dir, 'combined_data.json')
    
    # Generate all city pages
    generate_all_city_pages(combined_data_path, template_dir, output_dir)