#!/usr/bin/env python3
"""
Main build script for the senior living directory website.
This script orchestrates the entire build process, from data processing
to page generation, creating a complete static website ready for deployment.
"""

import os
import sys
import json
import time
import shutil
import logging
import argparse
import subprocess
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the project root directory
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))

# Define paths
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
SCRIPTS_DIR = os.path.join(PROJECT_ROOT, 'scripts')
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')
TEMPLATES_DIR = os.path.join(PROJECT_ROOT, 'templates')


def ensure_directories():
    """Create necessary directories if they don't exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(os.path.join(PUBLIC_DIR, 'city'), exist_ok=True)
    os.makedirs(os.path.join(PUBLIC_DIR, 'css'), exist_ok=True)
    os.makedirs(os.path.join(PUBLIC_DIR, 'js'), exist_ok=True)
    os.makedirs(os.path.join(PUBLIC_DIR, 'images'), exist_ok=True)


def check_data_files():
    """Check if required data files exist, return True if all exist."""
    required_files = [
        os.path.join(DATA_DIR, 'cities.csv')
    ]
    
    for file_path in required_files:
        if not os.path.exists(file_path):
            logger.error(f"Missing required data file: {file_path}")
            return False
    
    return True


def copy_static_assets():
    """Copy static assets to the public directory."""
    static_dir = os.path.join(PROJECT_ROOT, 'static')
    
    if os.path.exists(static_dir):
        # Copy CSS
        css_src = os.path.join(static_dir, 'css')
        css_dest = os.path.join(PUBLIC_DIR, 'css')
        if os.path.exists(css_src):
            for file in os.listdir(css_src):
                shutil.copy2(os.path.join(css_src, file), css_dest)
        
        # Copy JavaScript
        js_src = os.path.join(static_dir, 'js')
        js_dest = os.path.join(PUBLIC_DIR, 'js')
        if os.path.exists(js_src):
            for file in os.listdir(js_src):
                shutil.copy2(os.path.join(js_src, file), js_dest)
        
        # Copy images
        img_src = os.path.join(static_dir, 'images')
        img_dest = os.path.join(PUBLIC_DIR, 'images')
        if os.path.exists(img_src):
            for file in os.listdir(img_src):
                shutil.copy2(os.path.join(img_src, file), img_dest)
        
        logger.info("Static assets copied to public directory")
    else:
        logger.warning("Static directory not found")


def run_data_processing():
    """Run data processing scripts to prepare data for page generation."""
    start_time = time.time()
    logger.info("Starting data processing...")
    
    # Process cities.csv to create processed_cities.json
    process_cities_script = os.path.join(SCRIPTS_DIR, 'data_processing', 'process_cities.py')
    logger.info("Processing cities data...")
    result = subprocess.run([sys.executable, process_cities_script], check=True)
    if result.returncode != 0:
        logger.error("City processing failed")
        return False
    
    # Fetch or generate facility data
    fetch_facilities_script = os.path.join(SCRIPTS_DIR, 'data_processing', 'fetch_facilities.py')
    logger.info("Fetching facility data...")
    result = subprocess.run([sys.executable, fetch_facilities_script], check=True)
    if result.returncode != 0:
        logger.error("Facility data processing failed")
        return False
    
    # Generate cost data
    cost_estimator_script = os.path.join(SCRIPTS_DIR, 'data_processing', 'cost_estimator.py')
    logger.info("Generating cost data...")
    result = subprocess.run([sys.executable, cost_estimator_script], check=True)
    if result.returncode != 0:
        logger.error("Cost data generation failed")
        return False
    
    # Combine all data sources
    data_combiner_script = os.path.join(SCRIPTS_DIR, 'data_processing', 'data_combiner.py')
    logger.info("Combining all data sources...")
    result = subprocess.run([sys.executable, data_combiner_script], check=True)
    if result.returncode != 0:
        logger.error("Data combination failed")
        return False
    
    elapsed_time = time.time() - start_time
    logger.info(f"Data processing completed in {elapsed_time:.2f} seconds")
    return True


def run_page_generation():
    """Run page generation scripts to create HTML pages."""
    start_time = time.time()
    logger.info("Starting page generation...")
    
    # Check if page generation scripts exist
    page_gen_dir = os.path.join(SCRIPTS_DIR, 'page_generation')
    home_gen_script = os.path.join(page_gen_dir, 'generate_home.py')
    city_gen_script = os.path.join(page_gen_dir, 'generate_city_pages.py')
    search_gen_script = os.path.join(page_gen_dir, 'generate_search.py')
    
    # If page generation scripts don't exist yet, create placeholder HTML
    if not (os.path.exists(home_gen_script) and 
            os.path.exists(city_gen_script) and 
            os.path.exists(search_gen_script)):
        logger.warning("Page generation scripts not found. Creating placeholder HTML.")
        create_placeholder_html()
        return True
    
    # Generate home page
    logger.info("Generating home page...")
    result = subprocess.run([sys.executable, home_gen_script], check=True)
    if result.returncode != 0:
        logger.error("Home page generation failed")
        return False
    
    # Generate city pages
    logger.info("Generating city pages...")
    result = subprocess.run([sys.executable, city_gen_script], check=True)
    if result.returncode != 0:
        logger.error("City page generation failed")
        return False
    
    # Generate search page
    logger.info("Generating search page...")
    result = subprocess.run([sys.executable, search_gen_script], check=True)
    if result.returncode != 0:
        logger.error("Search page generation failed")
        return False
    
    elapsed_time = time.time() - start_time
    logger.info(f"Page generation completed in {elapsed_time:.2f} seconds")
    return True


def create_placeholder_html():
    """Create placeholder HTML files for testing until proper templates are created."""
    # Create index.html
    index_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Senior Living Directory</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        .card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
        .search-box { padding: 10px; width: 100%; font-size: 16px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Senior Living Directory</h1>
    <p>Find senior living options across the 1,000 largest U.S. cities.</p>
    
    <div>
        <input type="text" class="search-box" placeholder="Search for a city or facility...">
    </div>
    
    <h2>Featured Cities</h2>
    <div class="card">
        <h3>New York, New York</h3>
        <p>Population: 8,804,190</p>
        <p>Average Assisted Living Cost: $6,200/month</p>
        <a href="/city/new-york-ny">View Details</a>
    </div>
    
    <div class="card">
        <h3>Los Angeles, California</h3>
        <p>Population: 3,898,747</p>
        <p>Average Assisted Living Cost: $5,300/month</p>
        <a href="/city/los-angeles-ca">View Details</a>
    </div>
    
    <div class="card">
        <h3>Chicago, Illinois</h3>
        <p>Population: 2,746,388</p>
        <p>Average Assisted Living Cost: $4,800/month</p>
        <a href="/city/chicago-il">View Details</a>
    </div>
    
    <footer>
        <p>This is a placeholder page. The final site will include a search engine and comprehensive data on senior living options.</p>
    </footer>
</body>
</html>"""
    
    # Create sample city page
    city_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Senior Living in CITY_NAME, STATE_NAME</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #2c3e50; }
        .section { margin-bottom: 30px; }
        .facility { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
        .cost-table { width: 100%; border-collapse: collapse; }
        .cost-table th, .cost-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .nearby { display: inline-block; margin-right: 15px; margin-bottom: 15px; }
    </style>
</head>
<body>
    <h1>Senior Living in CITY_NAME, STATE_NAME</h1>
    <p>Population: POPULATION</p>
    
    <div class="section">
        <h2>Average Costs</h2>
        <table class="cost-table">
            <tr>
                <th>Care Type</th>
                <th>Monthly Average</th>
                <th>Annual Average</th>
            </tr>
            <tr>
                <td>Assisted Living</td>
                <td>$ASSISTED_COST/month</td>
                <td>$ASSISTED_ANNUAL/year</td>
            </tr>
            <tr>
                <td>Memory Care</td>
                <td>$MEMORY_COST/month</td>
                <td>$MEMORY_ANNUAL/year</td>
            </tr>
            <tr>
                <td>Independent Living</td>
                <td>$INDEPENDENT_COST/month</td>
                <td>$INDEPENDENT_ANNUAL/year</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>Top-Rated Facilities</h2>
        <div class="facility">
            <h3>FACILITY_NAME_1</h3>
            <p>Rating: RATING_1/5.0</p>
            <p>Address: ADDRESS_1</p>
            <p>Care Types: CARE_TYPES_1</p>
        </div>
        
        <div class="facility">
            <h3>FACILITY_NAME_2</h3>
            <p>Rating: RATING_2/5.0</p>
            <p>Address: ADDRESS_2</p>
            <p>Care Types: CARE_TYPES_2</p>
        </div>
    </div>
    
    <div class="section">
        <h2>Nearby Cities</h2>
        <div class="nearby">
            <a href="/city/NEARBY_SLUG_1">NEARBY_CITY_1</a> (NEARBY_DISTANCE_1 miles)
        </div>
        <div class="nearby">
            <a href="/city/NEARBY_SLUG_2">NEARBY_CITY_2</a> (NEARBY_DISTANCE_2 miles)
        </div>
        <div class="nearby">
            <a href="/city/NEARBY_SLUG_3">NEARBY_CITY_3</a> (NEARBY_DISTANCE_3 miles)
        </div>
    </div>
    
    <footer>
        <p>This is a placeholder page. The final site will include comprehensive data on senior living options in CITY_NAME.</p>
        <p><a href="/">Back to Home</a></p>
    </footer>
</body>
</html>"""
    
    # Create search page
    search_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Senior Living Options</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        .search-box { padding: 10px; width: 100%; font-size: 16px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .result { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Search Senior Living Options</h1>
    
    <div>
        <input type="text" class="search-box" placeholder="Search for a city or facility...">
    </div>
    
    <h2>Search Results</h2>
    <p>This is a placeholder search page. The final site will include a functional search engine.</p>
    
    <div class="result">
        <h3>New York, New York</h3>
        <p>Population: 8,804,190</p>
        <p>Average Assisted Living Cost: $6,200/month</p>
        <a href="/city/new-york-ny">View Details</a>
    </div>
    
    <div class="result">
        <h3>Sunrise Senior Living of New York</h3>
        <p>Location: New York, NY</p>
        <p>Rating: 4.7/5.0</p>
        <a href="/city/new-york-ny">View City Page</a>
    </div>
    
    <footer>
        <p><a href="/">Back to Home</a></p>
    </footer>
</body>
</html>"""
    
    # Write files
    with open(os.path.join(PUBLIC_DIR, 'index.html'), 'w') as f:
        f.write(index_html)
    
    # Create city directory if it doesn't exist
    city_dir = os.path.join(PUBLIC_DIR, 'city')
    os.makedirs(city_dir, exist_ok=True)
    
    # Create sample city directories and pages
    sample_cities = [
        ('new-york-ny', 'New York', 'New York', '8,804,190', '6,200', '74,400', '8,500', '102,000', '4,800', '57,600'),
        ('los-angeles-ca', 'Los Angeles', 'California', '3,898,747', '5,300', '63,600', '7,200', '86,400', '4,100', '49,200'),
        ('chicago-il', 'Chicago', 'Illinois', '2,746,388', '4,800', '57,600', '6,500', '78,000', '3,700', '44,400')
    ]
    
    for city in sample_cities:
        slug, name, state, pop, al_cost, al_annual, mc_cost, mc_annual, il_cost, il_annual = city
        
        # Create city directory
        os.makedirs(os.path.join(city_dir, slug), exist_ok=True)
        
        # Replace placeholders in the template
        city_content = city_html.replace('CITY_NAME', name)
        city_content = city_content.replace('STATE_NAME', state)
        city_content = city_content.replace('POPULATION', pop)
        city_content = city_content.replace('ASSISTED_COST', al_cost)
        city_content = city_content.replace('ASSISTED_ANNUAL', al_annual)
        city_content = city_content.replace('MEMORY_COST', mc_cost)
        city_content = city_content.replace('MEMORY_ANNUAL', mc_annual)
        city_content = city_content.replace('INDEPENDENT_COST', il_cost)
        city_content = city_content.replace('INDEPENDENT_ANNUAL', il_annual)
        
        # Add sample facility data
        city_content = city_content.replace('FACILITY_NAME_1', f"Sunrise Senior Living of {name}")
        city_content = city_content.replace('RATING_1', '4.7')
        city_content = city_content.replace('ADDRESS_1', f"123 Main St, {name}, {state}")
        city_content = city_content.replace('CARE_TYPES_1', 'Assisted Living, Memory Care')
        
        city_content = city_content.replace('FACILITY_NAME_2', f"Golden Years Retirement in {name}")
        city_content = city_content.replace('RATING_2', '4.3')
        city_content = city_content.replace('ADDRESS_2', f"456 Oak Ave, {name}, {state}")
        city_content = city_content.replace('CARE_TYPES_2', 'Independent Living, Assisted Living')
        
        # Add nearby city data
        # Using the other sample cities as "nearby" for demonstration
        nearby = [c for c in sample_cities if c[0] != slug]
        
        for i, near_city in enumerate(nearby):
            near_slug, near_name, near_state, _, _, _, _, _, _, _ = near_city
            city_content = city_content.replace(f'NEARBY_SLUG_{i+1}', near_slug)
            city_content = city_content.replace(f'NEARBY_CITY_{i+1}', f"{near_name}, {near_state}")
            city_content = city_content.replace(f'NEARBY_DISTANCE_{i+1}', str(20 * (i+1)))
        
        # Write the file
        with open(os.path.join(city_dir, slug, 'index.html'), 'w') as f:
            f.write(city_content)
    
    # Write search page
    with open(os.path.join(PUBLIC_DIR, 'search.html'), 'w') as f:
        f.write(search_html)
    
    logger.info("Created placeholder HTML files")


def generate_sitemap():
    """Generate a sitemap.xml file for the website."""
    base_url = "https://seniorlivingdirectory.com"  # Replace with your actual domain
    
    # Start the sitemap XML content
    sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
"""
    
    # Add homepage
    sitemap_content += f"""    <url>
        <loc>{base_url}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{base_url}/search.html</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
"""
    
    # Add city pages
    city_dir = os.path.join(PUBLIC_DIR, 'city')
    if os.path.exists(city_dir):
        for city_slug in os.listdir(city_dir):
            if os.path.isdir(os.path.join(city_dir, city_slug)):
                sitemap_content += f"""    <url>
        <loc>{base_url}/city/{city_slug}/</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
"""
    
    # Close the sitemap XML
    sitemap_content += "</urlset>"
    
    # Write the sitemap file
    with open(os.path.join(PUBLIC_DIR, 'sitemap.xml'), 'w') as f:
        f.write(sitemap_content)
    
    logger.info("Generated sitemap.xml")


def generate_robots_txt():
    """Generate a robots.txt file for the website."""
    base_url = "https://seniorlivingdirectory.com"  # Replace with your actual domain
    
    robots_content = f"""User-agent: *
Allow: /

Sitemap: {base_url}/sitemap.xml
"""
    
    # Write the robots.txt file
    with open(os.path.join(PUBLIC_DIR, 'robots.txt'), 'w') as f:
        f.write(robots_content)
    
    logger.info("Generated robots.txt")


def main():
    """Main function to run the build process."""
    parser = argparse.ArgumentParser(description="Build the senior living directory website")
    parser.add_argument("--skip-data", action="store_true", help="Skip data processing")
    parser.add_argument("--skip-pages", action="store_true", help="Skip page generation")
    args = parser.parse_args()
    
    # Record the overall start time
    start_time = time.time()
    logger.info("Starting build process...")
    
    # Ensure directories exist
    ensure_directories()
    
    # Check for required data files
    if not check_data_files():
        logger.error("Missing required data files. Exiting.")
        return 1
    
    # Run data processing
    if not args.skip_data:
        if not run_data_processing():
            logger.error("Data processing failed. Exiting.")
            return 1
    else:
        logger.info("Skipping data processing as requested")
    
    # Run page generation
    if not args.skip_pages:
        if not run_page_generation():
            logger.error("Page generation failed. Exiting.")
            return 1
    else:
        logger.info("Skipping page generation as requested")
    
    # Copy static assets
    copy_static_assets()
    
    # Generate sitemap and robots.txt
    generate_sitemap()
    generate_robots_txt()
    
    # Calculate and log total time
    elapsed_time = time.time() - start_time
    logger.info(f"Build completed successfully in {elapsed_time:.2f} seconds")
    return 0


if __name__ == "__main__":
    sys.exit(main())
