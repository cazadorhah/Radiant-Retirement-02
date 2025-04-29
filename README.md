# Senior Living Directory

A programmatic-SEO directory that helps families locate senior-living options across the 1,000 largest U.S. cities.

## Project Overview

This website provides a searchable directory of senior living facilities across the United States, with detailed city pages that include:
- Local population statistics
- Average costs of assisted living
- Top-rated senior-living facilities
- Nearby cities for easy navigation

## Development Setup

### Prerequisites
- Python 3.8+
- Git
- Visual Studio Code (recommended)

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/senior-living-directory.git
   cd senior-living-directory
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Data Setup

The project uses several data sources:
- `cities.csv`: Top 1000 U.S. cities with population data
- `facilities.json`: Information about senior living facilities
- `cost_data.json`: Cost information by location

### Building the Site

To build the site locally:

```
python scripts/build.py
```

This will:
1. Process the city data
2. Fetch or use existing facility data
3. Generate cost estimates where needed
4. Build all HTML pages
5. Output the site to the `public/` directory

### Local Development

To view the site locally after building:

```
cd public
python -m http.server
```

Then visit `http://localhost:8000` in your browser.

## Deployment

This site is configured for deployment on Netlify. Push changes to the main branch to trigger a new build and deployment.

## Project Structure

- `data/`: CSV and JSON data files
- `scripts/`: Python scripts for data processing and site generation
- `templates/`: HTML templates using Jinja2
- `static/`: CSS, JavaScript, and image files
- `public/`: Generated site (not committed to Git)