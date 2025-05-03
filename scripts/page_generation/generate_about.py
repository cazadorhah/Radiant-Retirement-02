#!/usr/bin/env python3
"""
Generate the about page for the Radiant Retirement website.
"""

import os
import logging
from datetime import datetime
from jinja2 import Environment, FileSystemLoader

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def generate_about_page(template_dir, output_dir):
    """
    Generate the about page using the templates.
    
    Args:
        template_dir: Directory containing Jinja2 templates
        output_dir: Directory where the generated HTML will be saved
    """
    # Set up Jinja2 environment
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('about.html')
    
    # Define the about page content
    about_sections = [
        {
            'title': 'About Radiant Retirement',
            'content': """
                <p>Radiant Retirement is a comprehensive online directory helping families 
                find the best senior living options across the United States. We provide 
                detailed information on assisted living, memory care, independent living, 
                and nursing home facilities in the 1,000 largest U.S. cities.</p>
                
                <p>Our mission is to make the process of finding senior care as seamless 
                and transparent as possible. We understand that choosing the right 
                senior living option is one of the most important decisions families face, 
                and we're here to provide the information you need to make an informed choice.</p>
            """
        },
        {
            'title': 'Our Data',
            'content': """
                <p>Radiant Retirement aggregates data from multiple reliable sources to provide 
                the most accurate and up-to-date information on senior living options including:</p>
                
                <ul>
                    <li>Comprehensive facility information including amenities, care types, and contact details</li>
                    <li>Cost data for different types of care across all major U.S. cities</li>
                    <li>Population statistics and demographic information</li>
                    <li>Ratings and reviews from residents and family members</li>
                </ul>
                
                <p>We regularly update our database to ensure that you have access to the most 
                current information available.</p>
            """
        },
        {
            'title': 'How to Use This Website',
            'content': """
                <p>Radiant Retirement makes it easy to find senior living options in your area:</p>
                
                <ol>
                    <li><strong>Search by city or facility name</strong> using our search box on the homepage</li>
                    <li><strong>Browse cities</strong> by region and state to explore options in different areas</li>
                    <li><strong>Compare costs</strong> for different types of care across multiple locations</li>
                    <li><strong>Review facility details</strong> including care types, amenities, and contact information</li>
                    <li><strong>Explore nearby cities</strong> to find additional options in surrounding areas</li>
                </ol>
                
                <p>Each city page includes detailed information on local senior living costs, 
                top-rated facilities, and population statistics to help you make an informed decision.</p>
            """
        },
        {
            'title': 'Contact Us',
            'content': """
                <p>Have questions or need assistance? We're here to help!</p>
                
                <p>Email: <a href="mailto:info@radiantretirement.com">info@radiantretirement.com</a></p>
                <p>Phone: (800) 555-1234</p>
                <p>Hours: Monday-Friday, 9am-5pm EST</p>
                
                <p>If you're a senior living facility looking to update your information or 
                if you notice any inaccuracies on our site, please don't hesitate to reach out.</p>
            """
        }
    ]
    
    # Additional stats to display
    site_stats = {
        'cities': 1000,
        'facilities': 15000,  # Example number
        'states': 50,
        'care_types': 4
    }
    
    # Render the template
    context = {
        'about_sections': about_sections,
        'site_stats': site_stats,
        'current_year': datetime.now().year
    }
    
    output = template.render(**context)
    
    # Write to file
    output_path = os.path.join(output_dir, 'about.html')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        f.write(output)
    
    logger.info(f"About page generated at {output_path}")

if __name__ == "__main__":
    # Define paths
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    template_dir = os.path.join(project_root, 'templates')
    output_dir = os.path.join(project_root, 'public')
    
    # Generate the about page
    generate_about_page(template_dir, output_dir)
