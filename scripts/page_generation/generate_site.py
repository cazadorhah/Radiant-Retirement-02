#!/usr/bin/env python3
"""
Main script to generate the entire Radiant Retirement website.
This script runs all the page generation scripts in the correct order.
"""

import os
import sys
import time
import logging
import subprocess
from concurrent.futures import ThreadPoolExecutor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_generator_script(script_name, script_path):
    """
    Run a single generator script and log the result.
    
    Args:
        script_name: Display name of the script
        script_path: Path to the script file
        
    Returns:
        Boolean indicating success or failure
    """
    logger.info(f"Running {script_name} generator...")
    start_time = time.time()
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            check=True,
            capture_output=True,
            text=True
        )
        
        elapsed_time = time.time() - start_time
        logger.info(f"{script_name} generation completed in {elapsed_time:.2f} seconds")
        return True
    
    except subprocess.CalledProcessError as e:
        logger.error(f"{script_name} generation failed: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False

def generate_site(script_dir, parallel=True, max_workers=4):
    """
    Generate the entire site by running all page generation scripts.
    
    Args:
        script_dir: Directory containing the page generation scripts
        parallel: Whether to run scripts in parallel (when possible)
        max_workers: Maximum number of worker threads for parallel execution
        
    Returns:
        Boolean indicating overall success or failure
    """
    # Define scripts to run in order
    # Format: (name, script_path, can_run_parallel)
    generation_scripts = [
        ("Home Page", os.path.join(script_dir, "generate_home.py"), True),
        ("Browse Page", os.path.join(script_dir, "generate_browse.py"), True),
        ("About Page", os.path.join(script_dir, "generate_about.py"), True),
        ("Search Page", os.path.join(script_dir, "generate_search.py"), True),
        ("City Pages", os.path.join(script_dir, "generate_city_pages.py"), False)
    ]
    
    # Check that all scripts exist
    for _, script_path, _ in generation_scripts:
        if not os.path.exists(script_path):
            logger.error(f"Script not found: {script_path}")
            return False
    
    start_time = time.time()
    logger.info("Starting website generation...")
    
    success = True
    
    # First run scripts that can be parallelized
    parallel_scripts = [(name, path) for name, path, can_parallel in generation_scripts if can_parallel]
    sequential_scripts = [(name, path) for name, path, can_parallel in generation_scripts if not can_parallel]
    
    if parallel and parallel_scripts:
        logger.info("Running parallel scripts...")
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {}
            for name, path in parallel_scripts:
                futures[executor.submit(run_generator_script, name, path)] = name
            
            for future in futures:
                if not future.result():
                    success = False
    else:
        # Run all scripts sequentially if parallel is disabled
        for name, path, _ in generation_scripts:
            if not run_generator_script(name, path):
                success = False
                # Continue with other scripts even if one fails
    
    # Now run sequential scripts
    if parallel and sequential_scripts and success:
        logger.info("Running sequential scripts...")
        for name, path in sequential_scripts:
            if not run_generator_script(name, path):
                success = False
                break
    
    elapsed_time = time.time() - start_time
    
    if success:
        logger.info(f"Website generation completed successfully in {elapsed_time:.2f} seconds")
    else:
        logger.error(f"Website generation completed with errors in {elapsed_time:.2f} seconds")
    
    return success

if __name__ == "__main__":
    # Parse command line arguments
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate the Radiant Retirement website')
    parser.add_argument('--sequential', action='store_true', help='Run all generation scripts sequentially')
    parser.add_argument('--workers', type=int, default=4, help='Maximum number of worker threads for parallel execution')
    args = parser.parse_args()
    
    # Define paths
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    script_dir = os.path.dirname(__file__)
    
    # Generate the site
    success = generate_site(
        script_dir=script_dir,
        parallel=not args.sequential,
        max_workers=args.workers
    )
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)