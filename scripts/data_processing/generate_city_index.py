#!/usr/bin/env python3
"""
Generate a city index JSON file for autocomplete functionality.
"""

import os
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def generate_city_index():
    """
    Generate a JSON file with city data for autocomplete functionality.
    """
    try:
        # Define paths based on the project structure
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Navigate to the project root from scripts/data_processing
        project_root = os.path.dirname(os.path.dirname(script_dir))
        
        # Define other paths
        data_dir = os.path.join(project_root, 'data')
        public_dir = os.path.join(project_root, 'public')
        
        # Create the output directory structure
        public_data_dir = os.path.join(public_dir, 'data')
        os.makedirs(public_data_dir, exist_ok=True)
        
        # Path to combined data
        combined_data_path = os.path.join(data_dir, 'combined_data.json')
        
        logger.info(f"Looking for combined data at: {combined_data_path}")
        
        if not os.path.exists(combined_data_path):
            logger.error(f"Combined data file not found at {combined_data_path}")
            return False
        
        # Load combined data
        with open(combined_data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        all_cities = data.get('cities', {})
        logger.info(f"Found {len(all_cities)} cities in combined data")
        
        # Create city index array for autocomplete
        city_index = []
        
        for city_slug, city_data in all_cities.items():
            city_info = city_data.get('city_info', {})
            
            # Add basic city info needed for autocomplete
            city_index.append({
                'slug': city_slug,
                'name': city_info.get('name', ''),
                'state': city_info.get('state', ''),
                'url': f"/city/{city_slug}/",
                'population': city_info.get('population', 0)
            })
        
        # Write the city index to a JSON file
        output_path = os.path.join(public_data_dir, 'city-index.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(city_index, f)
        
        logger.info(f"Generated city index at {output_path}")
        logger.info(f"Generated {len(city_index)} city entries")
        return True
    
    except Exception as e:
        logger.error(f"Error generating city index: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    # Run the generator
    success = generate_city_index()
    if success:
        logger.info("City index generation completed successfully")
    else:
        logger.error("City index generation failed")
        exit(1)