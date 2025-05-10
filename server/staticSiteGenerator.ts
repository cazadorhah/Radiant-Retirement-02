import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import { generateFacilities } from './facilityGenerator';
import { getStateAbbreviation } from './cityGenerator';

// HTML Templates
const htmlTemplates = {
  head: (title: string, description: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <title>${title} | Radiant Retirement</title>
  
  <!-- Open Graph Tags for Social Media -->
  <meta property="og:title" content="${title} | Radiant Retirement">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://radiantretirement.netlify.app">
  
  <!-- Schema.org markup for Google -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Radiant Retirement",
    "url": "https://radiantretirement.netlify.app",
    "logo": "https://radiantretirement.netlify.app/img/logo.svg",
    "description": "Find senior living facilities across the United States",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-555-0000",
      "contactType": "customer service"
    }
  }
  </script>
  
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- Custom CSS -->
  <link href="/css/styles.css" rel="stylesheet">
  
  <!-- Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
  <!-- Navigation -->
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <a class="navbar-brand" href="/">
        <img src="/img/logo.svg" alt="Radiant Retirement Logo" width="40" height="40" class="d-inline-block align-text-top me-2">
        Radiant Retirement
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="/">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/browse">Browse by State</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/about">About Us</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/resources">Resources</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/contact">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
`,

  footer: `
  <!-- Footer -->
  <footer class="footer py-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-4 mb-lg-0">
          <h5>Radiant Retirement</h5>
          <p>Helping seniors and families find the perfect retirement community with comprehensive information and personalized guidance.</p>
          <div class="social-icons">
            <a href="#" class="me-2"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="me-2"><i class="fab fa-twitter"></i></a>
            <a href="#" class="me-2"><i class="fab fa-instagram"></i></a>
            <a href="#" class="me-2"><i class="fab fa-linkedin-in"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-md-4 mb-4 mb-md-0">
          <h5>Explore</h5>
          <ul class="list-unstyled">
            <li><a href="/">Home</a></li>
            <li><a href="/browse">Browse by State</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/resources">Resources</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-md-4 mb-4 mb-md-0">
          <h5>Resources</h5>
          <ul class="list-unstyled">
            <li><a href="/resources/senior-housing-guide">Senior Housing Guide</a></li>
            <li><a href="/resources/financing-options">Financing Options</a></li>
            <li><a href="/resources/care-types">Types of Care</a></li>
            <li><a href="/resources/faqs">FAQs</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>
        <div class="col-lg-4 col-md-4">
          <h5>Contact Us</h5>
          <address>
            <p><i class="fas fa-map-marker-alt me-2"></i> 123 Retirement Ave, Suite 100<br>Phoenix, AZ 85001</p>
            <p><i class="fas fa-phone me-2"></i> (800) 555-0000</p>
            <p><i class="fas fa-envelope me-2"></i> info@radiantretirement.com</p>
          </address>
        </div>
      </div>
      <hr>
      <div class="row">
        <div class="col-md-6 mb-3 mb-md-0">
          <p class="small mb-0">&copy; 2023 Radiant Retirement. All rights reserved.</p>
        </div>
        <div class="col-md-6 text-md-end">
          <p class="small mb-0">
            <a href="/privacy-policy">Privacy Policy</a> |
            <a href="/terms-of-service">Terms of Service</a> |
            <a href="/sitemap.xml">Sitemap</a>
          </p>
        </div>
      </div>
    </div>
  </footer>

  <!-- Bootstrap JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  
  <!-- Custom JavaScript -->
  <script src="/js/scripts.js"></script>
</body>
</html>
`,

  searchForm: `
  <!-- Search Form Component -->
  <div class="search-form p-4 bg-white rounded shadow">
    <h3 class="mb-3">Find Senior Living Facilities</h3>
    <form id="search-facilities-form" action="/search-results.html" method="get">
      <div class="row g-3">
        <div class="col-md-5">
          <label for="city-input" class="form-label">City</label>
          <input type="text" class="form-control" id="city-input" name="city" placeholder="Enter city name">
        </div>
        <div class="col-md-4">
          <label for="state-select" class="form-label">State</label>
          <select class="form-select" id="state-select" name="state">
            <option value="">Select state</option>
            <!-- State options will be dynamically generated -->
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button type="submit" class="btn btn-primary w-100">Search</button>
        </div>
      </div>
      <div class="mt-3">
        <div class="care-type-filters">
          <p class="mb-2">Care Type:</p>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="independent-living" name="care_type" value="Independent Living">
            <label class="form-check-label" for="independent-living">Independent Living</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="assisted-living" name="care_type" value="Assisted Living">
            <label class="form-check-label" for="assisted-living">Assisted Living</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="memory-care" name="care_type" value="Memory Care">
            <label class="form-check-label" for="memory-care">Memory Care</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="skilled-nursing" name="care_type" value="Nursing Care">
            <label class="form-check-label" for="skilled-nursing">Skilled Nursing</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="rehabilitation" name="care_type" value="Rehabilitation">
            <label class="form-check-label" for="rehabilitation">Rehabilitation</label>
          </div>
        </div>
      </div>
    </form>
  </div>
  `,

  contactForm: `
  <!-- Contact Form Component -->
  <div class="contact-form-container p-4 bg-white rounded shadow">
    <h3 class="mb-3">Contact Us About Senior Living Options</h3>
    <form id="contact-form" class="needs-validation" novalidate>
      <div class="row g-3">
        <div class="col-md-6">
          <label for="firstName" class="form-label">First Name*</label>
          <input type="text" class="form-control" id="firstName" name="firstName" required>
          <div class="invalid-feedback">
            Please provide your first name.
          </div>
        </div>
        <div class="col-md-6">
          <label for="lastName" class="form-label">Last Name</label>
          <input type="text" class="form-control" id="lastName" name="lastName">
        </div>
      </div>
      <div class="row g-3 mt-1">
        <div class="col-md-6">
          <label for="email" class="form-label">Email Address*</label>
          <input type="email" class="form-control" id="email" name="email" required>
          <div class="invalid-feedback">
            Please provide a valid email address.
          </div>
        </div>
        <div class="col-md-6">
          <label for="phone" class="form-label">Phone Number</label>
          <input type="tel" class="form-control" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
          <small class="form-text text-muted">Format: 123-456-7890</small>
        </div>
      </div>
      <div class="mt-3">
        <label for="message" class="form-label">Message*</label>
        <textarea class="form-control" id="message" name="message" rows="4" required></textarea>
        <div class="invalid-feedback">
          Please provide a message.
        </div>
      </div>
      <div class="mt-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="consent" name="consent" required>
          <label class="form-check-label" for="consent">
            I consent to having this website store my submitted information so they can respond to my inquiry.
          </label>
          <div class="invalid-feedback">
            You must consent to proceed.
          </div>
        </div>
      </div>
      <div class="mt-4">
        <button type="submit" class="btn btn-primary">Submit</button>
        <div class="mt-3 alert alert-success d-none" id="form-success">
          Thank you for contacting us! We'll be in touch with you shortly.
        </div>
        <div class="mt-3 alert alert-danger d-none" id="form-error">
          There was a problem submitting your form. Please try again.
        </div>
      </div>
    </form>
  </div>
  `,

  facilityCard: (facility: any) => `
  <!-- Facility Card Component -->
  <div class="facility-card card h-100 shadow-sm">
    <img src="${facility.imageUrl}" class="card-img-top" alt="${facility.name}" loading="lazy">
    <div class="card-body">
      <h3 class="card-title h5">${facility.name}</h3>
      <div class="facility-rating mb-2">
        ${generateStars(facility.rating)}
        <span class="text-muted ms-2">(${facility.reviewCount} reviews)</span>
      </div>
      <p class="facility-address mb-2 small">
        <i class="fas fa-map-marker-alt text-primary me-1"></i> ${facility.address}
      </p>
      <p class="facility-phone mb-2 small">
        <i class="fas fa-phone text-primary me-1"></i> ${facility.phone}
      </p>
      <div class="facility-amenities mb-3">
        <p class="mb-1 small fw-bold">Care Types:</p>
        <div class="d-flex flex-wrap gap-1">
          ${facility.amenities.map((amenity: string) => 
            `<span class="badge bg-secondary-light text-secondary small">${amenity}</span>`
          ).join('')}
        </div>
      </div>
    </div>
    <div class="card-footer bg-white border-top-0 pt-0">
      <div class="d-flex justify-content-between">
        <a href="${facility.website}" class="btn btn-outline-primary btn-sm" target="_blank">Visit Website</a>
        <a href="/facility/${facility.id}.html" class="btn btn-primary btn-sm">View Details</a>
      </div>
    </div>
  </div>
  `,

  homepage: (popularCities: any[]) => `
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="row align-items-center min-vh-75">
        <div class="col-lg-6">
          <h1 class="display-4 fw-bold text-white mb-4">Find the Perfect Senior Living Community</h1>
          <p class="lead text-white mb-5">Explore over 5,000 senior living facilities across 1,000 U.S. cities to find the right home for yourself or your loved ones.</p>
          <div class="search-container bg-white p-4 rounded shadow-lg">
            <!-- Search Form -->
            <!-- Use the searchForm template here -->
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features py-5">
    <div class="container">
      <div class="row text-center mb-5">
        <div class="col-12">
          <h2 class="section-title">Why Choose Radiant Retirement?</h2>
          <p class="section-subtitle">We help seniors and their families find the perfect retirement community with comprehensive information and tools.</p>
        </div>
      </div>
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="feature-card text-center p-4 h-100">
            <div class="icon-container mb-3">
              <i class="fas fa-search fa-3x text-primary"></i>
            </div>
            <h3 class="feature-title">Comprehensive Directory</h3>
            <p>Browse detailed listings of senior living facilities in over 1,000 U.S. cities with photos, amenities, and contact information.</p>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="feature-card text-center p-4 h-100">
            <div class="icon-container mb-3">
              <i class="fas fa-star fa-3x text-primary"></i>
            </div>
            <h3 class="feature-title">Verified Reviews</h3>
            <p>Read honest feedback from residents and families to make informed decisions about senior living communities.</p>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="feature-card text-center p-4 h-100">
            <div class="icon-container mb-3">
              <i class="fas fa-hands-helping fa-3x text-primary"></i>
            </div>
            <h3 class="feature-title">Expert Resources</h3>
            <p>Access guides and advice about senior living options, financing, and care planning to simplify your search.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Popular Cities Section -->
  <section class="popular-cities py-5 bg-light">
    <div class="container">
      <div class="row text-center mb-5">
        <div class="col-12">
          <h2 class="section-title">Popular Cities</h2>
          <p class="section-subtitle">Explore senior living options in these top destinations</p>
        </div>
      </div>
      <div class="row">
        ${popularCities.map(city => `
        <div class="col-md-4 mb-4">
          <div class="city-card card h-100 shadow-sm">
            <div class="card-body">
              <h3 class="card-title h5">${city.name}, ${city.state}</h3>
              <p class="text-muted mb-2">Population: ${city.population.toLocaleString()}</p>
              <p class="mb-3">Explore senior living options in ${city.name}, ${city.state}.</p>
              <div class="d-flex gap-3 small text-muted mb-3">
                <div>
                  <i class="fas fa-building me-1"></i> 5+ Facilities
                </div>
                <div>
                  <i class="fas fa-star me-1"></i> 4.3 Avg Rating
                </div>
              </div>
              <a href="/city/${city.slug}.html" class="btn btn-outline-primary stretched-link">View Facilities</a>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
      <div class="row mt-4">
        <div class="col-12 text-center">
          <a href="/browse/index.html" class="btn btn-primary">Browse All Cities by State</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Care Types Section -->
  <section class="care-types py-5">
    <div class="container">
      <div class="row text-center mb-5">
        <div class="col-12">
          <h2 class="section-title">Types of Senior Care</h2>
          <p class="section-subtitle">Understanding the different levels of care available for seniors</p>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 col-lg mb-4">
          <div class="care-type-card text-center p-4 h-100">
            <div class="icon-container mb-3">
              <i class="fas fa-home fa-2x text-primary"></i>
            </div>
            <h3 class="care-title h5">Independent Living</h3>
            <p class="small">For active seniors who can live independently but want community, amenities, and social activities.</p>
          </div>
        </div>
        <div class="col-md-6 col-lg mb-4">
          <div class="care-type-card text-center p-4 h-100">
            <div class="icon-container mb-3">
              <i class="fas fa-hand-holding-heart fa-2x text-primary"></i>
            </div>
            <h3 class="care-title h5">Assisted Living</h3>
            <p class="small">For seniors who need help with daily activities like bathing, dressing, medication management.</p>
          </div>
        </div>
        <div class="col-md-6 col-lg mb-4">
          <div class="care-type-card text-center p-4 h-100">
            <div class="icon-container mb-3">
              <i class="fas fa-brain fa-2x text-primary"></i>
            </div>
            <h3 class="care-title h5">Memory Care</h3>
            <p class="small">Specialized care for seniors with Alzheimer's, dementia, or other memory impairments.</p>
          </div>
        </div>
        <div class="col-md-6 col-lg mb-4">
          <div class="care-type-card text-center p-4 h-100">
            <div class="icon-container mb-3">
              <i class="fas fa-user-nurse fa-2x text-primary"></i>
            </div>
            <h3 class="care-title h5">Skilled Nursing</h3>
            <p class="small">24-hour nursing care for seniors with complex medical needs requiring professional attention.</p>
          </div>
        </div>
        <div class="col-md-6 col-lg mb-4">
          <div class="care-type-card text-center p-4 h-100">
            <div class="icon-container mb-3">
              <i class="fas fa-procedures fa-2x text-primary"></i>
            </div>
            <h3 class="care-title h5">Rehabilitation</h3>
            <p class="small">Short-term care to help seniors recover from surgery, injury, or illness before returning home.</p>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12 text-center">
          <a href="/resources/care-types.html" class="btn btn-outline-primary">Learn More About Care Types</a>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta py-5 bg-primary text-white">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-md-10 col-lg-8">
          <h2 class="mb-4">Need Help Finding Senior Living Options?</h2>
          <p class="lead mb-4">Our senior living advisors are ready to help you navigate all your options and find the perfect fit.</p>
          <div class="d-flex justify-content-center gap-3">
            <a href="/contact.html" class="btn btn-light btn-lg">Contact Us</a>
            <a href="tel:+18005550000" class="btn btn-outline-light btn-lg"><i class="fas fa-phone me-2"></i>Call (800) 555-0000</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
  
  cityPage: (city: any, facilities: any[]) => `
  <!-- City Hero Section -->
  <section class="city-hero py-5">
    <div class="container">
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">Home</a></li>
          <li class="breadcrumb-item"><a href="/browse/index.html">Browse Cities</a></li>
          <li class="breadcrumb-item"><a href="/browse/${city.state.toLowerCase()}.html">${city.stateName || city.state}</a></li>
          <li class="breadcrumb-item active" aria-current="page">${city.name}</li>
        </ol>
      </nav>
      <div class="row">
        <div class="col-lg-8">
          <h1 class="display-5 fw-bold mb-2">Senior Living in ${city.name}, ${city.state}</h1>
          <p class="lead mb-4">Explore assisted living, independent living, memory care, and nursing homes in ${city.name}. Find the perfect senior community for your needs.</p>
          
          <div class="city-stats d-flex flex-wrap gap-4 mb-4">
            <div class="stat-item">
              <div class="stat-value">${city.population.toLocaleString()}</div>
              <div class="stat-label">Population</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">5+</div>
              <div class="stat-label">Senior Living Facilities</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${calculateAverageRating(facilities).toFixed(1)}</div>
              <div class="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="search-sidebar p-4 bg-white rounded shadow">
            <h3 class="h5 mb-3">Find Facilities in ${city.name}</h3>
            <form id="filter-form">
              <div class="mb-3">
                <label class="form-label">Care Type</label>
                <div class="d-flex flex-column gap-2">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="Independent Living" id="filter-independent">
                    <label class="form-check-label" for="filter-independent">Independent Living</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="Assisted Living" id="filter-assisted">
                    <label class="form-check-label" for="filter-assisted">Assisted Living</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="Memory Care" id="filter-memory">
                    <label class="form-check-label" for="filter-memory">Memory Care</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="Nursing Care" id="filter-nursing">
                    <label class="form-check-label" for="filter-nursing">Skilled Nursing</label>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label for="rating-filter" class="form-label">Minimum Rating</label>
                <select class="form-select" id="rating-filter">
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-100">Apply Filters</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Map Section -->
  <section class="map-section py-4 bg-light">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="map-container p-3 bg-white rounded shadow">
            <h2 class="h4 mb-3">Senior Living Facilities in ${city.name}, ${city.state}</h2>
            <div id="facilities-map" class="city-map" style="height: 400px; background-color: #f0f0f0;">
              <!-- Map will be initialized with JavaScript -->
              <div class="d-flex justify-content-center align-items-center h-100">
                <p>Map loading... (This would be an interactive map with JavaScript)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Facilities Section -->
  <section class="facilities-section py-5">
    <div class="container">
      <h2 class="section-title mb-4">Senior Living Facilities in ${city.name}</h2>
      <div class="row">
        ${facilities.map(facility => `
        <div class="col-md-6 col-lg-4 mb-4 facility-item">
          ${htmlTemplates.facilityCard(facility)}
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- City Guide Section -->
  <section class="city-guide py-5 bg-light">
    <div class="container">
      <div class="row">
        <div class="col-lg-8">
          <h2 class="section-title mb-4">Senior Living Guide to ${city.name}, ${city.state}</h2>
          <div class="city-content">
            <h3 class="h5 mb-3">About ${city.name}</h3>
            <p>${city.name}, ${city.state} is a vibrant community with a population of ${city.population.toLocaleString()} residents. The city offers various senior living options to accommodate different needs and preferences, from independent living communities to full-service nursing care facilities.</p>
            
            <h3 class="h5 mb-3 mt-4">Senior Living Options in ${city.name}</h3>
            <p>Seniors in ${city.name} can choose from multiple care levels:</p>
            <ul>
              <li><strong>Independent Living:</strong> For active seniors who want a maintenance-free lifestyle with amenities and social activities.</li>
              <li><strong>Assisted Living:</strong> Provides help with daily activities while promoting independence.</li>
              <li><strong>Memory Care:</strong> Specialized programs for those with Alzheimer's disease and other forms of dementia.</li>
              <li><strong>Skilled Nursing:</strong> 24-hour medical care for those with complex health needs.</li>
            </ul>
            
            <h3 class="h5 mb-3 mt-4">Cost of Senior Living in ${city.name}</h3>
            <p>The cost of senior living in ${city.name} varies based on the level of care, amenities, and specific facility. On average, monthly costs range from:</p>
            <ul>
              <li>Independent Living: $1,500 - $4,000</li>
              <li>Assisted Living: $3,000 - $6,000</li>
              <li>Memory Care: $4,000 - $7,000</li>
              <li>Skilled Nursing: $6,000 - $12,000</li>
            </ul>
            <p>Many facilities accept long-term care insurance, VA benefits, and other payment options to help manage costs.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="contact-sidebar mt-5 mt-lg-0">
            <!-- Contact Form -->
            ${htmlTemplates.contactForm}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Related Cities Section -->
  <section class="related-cities py-5">
    <div class="container">
      <h2 class="section-title mb-4">Nearby Cities in ${city.stateName || city.state}</h2>
      <div class="row">
        <!-- This section would show nearby cities based on location -->
        <div class="col-12">
          <p>Explore senior living options in other cities in ${city.stateName || city.state}:</p>
          <div class="d-flex flex-wrap gap-2 mt-3">
            <a href="#" class="btn btn-outline-secondary btn-sm">Nearby City 1</a>
            <a href="#" class="btn btn-outline-secondary btn-sm">Nearby City 2</a>
            <a href="#" class="btn btn-outline-secondary btn-sm">Nearby City 3</a>
            <a href="#" class="btn btn-outline-secondary btn-sm">Nearby City 4</a>
            <a href="#" class="btn btn-outline-secondary btn-sm">Nearby City 5</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
  
  browseByStatePage: (states: string[]) => `
  <!-- Browse by State Hero Section -->
  <section class="browse-hero py-5">
    <div class="container">
      <h1 class="display-5 fw-bold mb-4">Browse Senior Living Facilities by State</h1>
      <p class="lead mb-5">Find senior living communities across the United States. Select a state to explore cities and facilities.</p>
      
      <div class="row">
        <div class="col-lg-8">
          <div class="row row-cols-2 row-cols-md-3 g-4">
            ${states.map(state => `
            <div class="col">
              <div class="state-card card h-100 shadow-sm">
                <div class="card-body">
                  <h2 class="card-title h5 mb-3">${state}</h2>
                  <a href="/browse/${state.toLowerCase()}.html" class="btn btn-outline-primary btn-sm stretched-link">View Cities</a>
                </div>
              </div>
            </div>
            `).join('')}
          </div>
        </div>
        <div class="col-lg-4 mt-5 mt-lg-0">
          <div class="search-sidebar p-4 bg-white rounded shadow">
            <h3 class="h5 mb-3">Find Senior Living Facilities</h3>
            <!-- Search form component -->
            <form>
              <div class="mb-3">
                <label for="state-select" class="form-label">Select a State</label>
                <select class="form-select" id="state-select">
                  <option value="">Choose a state...</option>
                  ${states.map(state => `<option value="${state.toLowerCase()}">${state}</option>`).join('')}
                </select>
              </div>
              <div class="mb-3">
                <label for="city-input" class="form-label">City (Optional)</label>
                <input type="text" class="form-control" id="city-input" placeholder="Enter city name">
              </div>
              <button type="submit" class="btn btn-primary w-100">Search</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Popular Cities Section -->
  <section class="popular-cities py-5 bg-light">
    <div class="container">
      <h2 class="section-title mb-4">Popular Cities for Senior Living</h2>
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <!-- Popular cities would be displayed here -->
        <div class="col">
          <div class="city-card card h-100 shadow-sm">
            <div class="card-body">
              <h3 class="card-title h5">Phoenix, AZ</h3>
              <p class="text-muted mb-2">Population: 1,513,367</p>
              <div class="d-flex gap-3 small text-muted mb-3">
                <div><i class="fas fa-building me-1"></i> 25+ Facilities</div>
                <div><i class="fas fa-star me-1"></i> 4.2 Avg Rating</div>
              </div>
              <a href="/city/phoenix-az.html" class="btn btn-outline-primary stretched-link">View Facilities</a>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="city-card card h-100 shadow-sm">
            <div class="card-body">
              <h3 class="card-title h5">Scottsdale, AZ</h3>
              <p class="text-muted mb-2">Population: 226,918</p>
              <div class="d-flex gap-3 small text-muted mb-3">
                <div><i class="fas fa-building me-1"></i> 18 Facilities</div>
                <div><i class="fas fa-star me-1"></i> 4.5 Avg Rating</div>
              </div>
              <a href="/city/scottsdale-az.html" class="btn btn-outline-primary stretched-link">View Facilities</a>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="city-card card h-100 shadow-sm">
            <div class="card-body">
              <h3 class="card-title h5">Mesa, AZ</h3>
              <p class="text-muted mb-2">Population: 457,587</p>
              <div class="d-flex gap-3 small text-muted mb-3">
                <div><i class="fas fa-building me-1"></i> 15+ Facilities</div>
                <div><i class="fas fa-star me-1"></i> 4.1 Avg Rating</div>
              </div>
              <a href="/city/mesa-az.html" class="btn btn-outline-primary stretched-link">View Facilities</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- About Radiant Retirement -->
  <section class="about-section py-5">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6 order-lg-2 mb-4 mb-lg-0">
          <img src="/img/senior-couple.jpg" alt="Senior couple enjoying retirement" class="img-fluid rounded shadow">
        </div>
        <div class="col-lg-6 order-lg-1">
          <h2 class="section-title mb-4">About Radiant Retirement</h2>
          <p class="mb-3">At Radiant Retirement, we understand that finding the perfect senior living community is an important and often emotional decision. Our comprehensive directory helps families navigate this process with confidence.</p>
          <p class="mb-3">We provide detailed information on thousands of senior living facilities across all 50 states, helping you compare options, understand costs, and find the right level of care for your unique situation.</p>
          <p class="mb-4">Our mission is to make the senior living search process easier, more transparent, and less stressful for seniors and their loved ones.</p>
          <a href="/about.html" class="btn btn-primary">Learn More About Us</a>
        </div>
      </div>
    </div>
  </section>
  `,
  
  stateListingPage: (state: string, stateName: string, cities: any[]) => `
  <!-- State Hero Section -->
  <section class="state-hero py-5">
    <div class="container">
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">Home</a></li>
          <li class="breadcrumb-item"><a href="/browse/index.html">Browse Cities</a></li>
          <li class="breadcrumb-item active" aria-current="page">${stateName}</li>
        </ol>
      </nav>
      
      <h1 class="display-5 fw-bold mb-3">Senior Living in ${stateName}</h1>
      <p class="lead mb-5">Explore assisted living, independent living, memory care, and nursing homes in ${stateName}. Find the perfect senior community for your needs.</p>
      
      <div class="row">
        <div class="col-lg-8">
          <div class="state-stats d-flex flex-wrap gap-4 mb-4">
            <div class="stat-item">
              <div class="stat-value">${cities.length}</div>
              <div class="stat-label">Cities</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${cities.length * 5}+</div>
              <div class="stat-label">Senior Living Facilities</div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="search-sidebar p-4 bg-white rounded shadow">
            <h3 class="h5 mb-3">Find Cities in ${stateName}</h3>
            <form>
              <div class="mb-3">
                <label for="city-search" class="form-label">City Name</label>
                <input type="text" class="form-control" id="city-search" placeholder="Enter city name">
              </div>
              <div class="mb-3">
                <label for="population-filter" class="form-label">Population</label>
                <select class="form-select" id="population-filter">
                  <option value="0">Any Population</option>
                  <option value="50000">50,000+</option>
                  <option value="100000">100,000+</option>
                  <option value="500000">500,000+</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-100">Filter Cities</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Cities Section -->
  <section class="cities-section py-5 bg-light">
    <div class="container">
      <h2 class="section-title mb-4">Cities in ${stateName}</h2>
      
      <div class="cities-grid">
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          ${cities.map(city => `
          <div class="col">
            <div class="city-card card h-100 shadow-sm">
              <div class="card-body">
                <h3 class="card-title h5">${city.name}, ${city.state}</h3>
                <p class="text-muted mb-2">Population: ${city.population.toLocaleString()}</p>
                <div class="d-flex gap-3 small text-muted mb-3">
                  <div><i class="fas fa-building me-1"></i> 5+ Facilities</div>
                </div>
                <a href="/city/${city.slug}.html" class="btn btn-outline-primary stretched-link">View Facilities</a>
              </div>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- State Guide Section -->
  <section class="state-guide py-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-8">
          <h2 class="section-title mb-4">Senior Living Guide to ${stateName}</h2>
          <div class="state-content">
            <h3 class="h5 mb-3">About Senior Living in ${stateName}</h3>
            <p>${stateName} offers a variety of senior living options to accommodate different needs and preferences, from independent living communities to full-service nursing care facilities.</p>
            
            <h3 class="h5 mb-3 mt-4">Senior Living Options in ${stateName}</h3>
            <p>Seniors in ${stateName} can choose from multiple care levels:</p>
            <ul>
              <li><strong>Independent Living:</strong> For active seniors who want a maintenance-free lifestyle with amenities and social activities.</li>
              <li><strong>Assisted Living:</strong> Provides help with daily activities while promoting independence.</li>
              <li><strong>Memory Care:</strong> Specialized programs for those with Alzheimer's disease and other forms of dementia.</li>
              <li><strong>Skilled Nursing:</strong> 24-hour medical care for those with complex health needs.</li>
            </ul>
            
            <h3 class="h5 mb-3 mt-4">Cost of Senior Living in ${stateName}</h3>
            <p>The cost of senior living in ${stateName} varies based on the level of care, amenities, and location. On average, monthly costs range from:</p>
            <ul>
              <li>Independent Living: $1,500 - $4,500</li>
              <li>Assisted Living: $3,000 - $6,500</li>
              <li>Memory Care: $4,000 - $7,500</li>
              <li>Skilled Nursing: $6,000 - $12,500</li>
            </ul>
            <p>Many facilities accept long-term care insurance, VA benefits, and other payment options to help manage costs.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="contact-sidebar mt-5 mt-lg-0">
            <!-- Contact Form -->
            ${htmlTemplates.contactForm}
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
  
  aboutPage: `
  <!-- About Hero Section -->
  <section class="about-hero py-5">
    <div class="container">
      <h1 class="display-5 fw-bold mb-4">About Radiant Retirement</h1>
      <p class="lead mb-5">We're on a mission to help seniors and their families find the perfect living solution with comprehensive information and personalized guidance.</p>
      
      <div class="row align-items-center">
        <div class="col-lg-6 mb-4 mb-lg-0">
          <img src="/img/about-team.jpg" alt="Radiant Retirement Team" class="img-fluid rounded shadow">
        </div>
        <div class="col-lg-6">
          <h2 class="section-title mb-3">Our Story</h2>
          <p>Radiant Retirement was founded in 2018 by a group of senior care professionals who recognized the challenges families face when searching for senior living options. After helping their own parents and grandparents through this process, they realized there was a need for a comprehensive, user-friendly resource.</p>
          <p>Today, our team continues to expand our directory of senior living facilities across all 50 states, providing detailed information, verified reviews, and expert resources to help seniors and their loved ones make informed decisions.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Our Mission Section -->
  <section class="mission-section py-5 bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8 text-center">
          <h2 class="section-title mb-4">Our Mission</h2>
          <p class="lead mb-5">To empower seniors and their families with comprehensive, accurate information that simplifies the process of finding the right senior living community.</p>
          
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="value-card p-4 h-100">
                <div class="icon-container mb-3">
                  <i class="fas fa-hand-holding-heart fa-3x text-primary"></i>
                </div>
                <h3 class="value-title h5">Compassion</h3>
                <p>We approach our work with empathy, understanding the emotional journey of finding senior care.</p>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="value-card p-4 h-100">
                <div class="icon-container mb-3">
                  <i class="fas fa-check-circle fa-3x text-primary"></i>
                </div>
                <h3 class="value-title h5">Integrity</h3>
                <p>We provide honest, unbiased information to help families make informed decisions.</p>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="value-card p-4 h-100">
                <div class="icon-container mb-3">
                  <i class="fas fa-lightbulb fa-3x text-primary"></i>
                </div>
                <h3 class="value-title h5">Innovation</h3>
                <p>We continuously improve our tools and resources to better serve seniors and their families.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Team Section -->
  <section class="team-section py-5">
    <div class="container">
      <h2 class="section-title text-center mb-5">Our Team</h2>
      
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <div class="col">
          <div class="team-card card h-100 shadow-sm text-center">
            <img src="/img/team-member-1.jpg" class="card-img-top" alt="Sarah Johnson">
            <div class="card-body">
              <h3 class="card-title h5">Sarah Johnson</h3>
              <p class="text-muted mb-2">Founder & CEO</p>
              <p class="small">Former senior care administrator with 15+ years of experience in retirement communities.</p>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="team-card card h-100 shadow-sm text-center">
            <img src="/img/team-member-2.jpg" class="card-img-top" alt="Michael Williams">
            <div class="card-body">
              <h3 class="card-title h5">Michael Williams</h3>
              <p class="text-muted mb-2">Senior Living Advisor</p>
              <p class="small">Certified gerontologist dedicated to helping families navigate senior living options.</p>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="team-card card h-100 shadow-sm text-center">
            <img src="/img/team-member-3.jpg" class="card-img-top" alt="Jennifer Chen">
            <div class="card-body">
              <h3 class="card-title h5">Jennifer Chen</h3>
              <p class="text-muted mb-2">Director of Research</p>
              <p class="small">Passionate about ensuring our directory contains accurate, up-to-date information.</p>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="team-card card h-100 shadow-sm text-center">
            <img src="/img/team-member-4.jpg" class="card-img-top" alt="David Rodriguez">
            <div class="card-body">
              <h3 class="card-title h5">David Rodriguez</h3>
              <p class="text-muted mb-2">Content Director</p>
              <p class="small">Creates educational resources to help families understand senior living options.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact CTA Section -->
  <section class="contact-cta py-5 bg-primary text-white">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8">
          <h2 class="mb-4">Have Questions About Senior Living?</h2>
          <p class="lead mb-4">Our team of experts is ready to assist you in finding the perfect senior living solution.</p>
          <a href="/contact.html" class="btn btn-light btn-lg">Contact Us Today</a>
        </div>
      </div>
    </div>
  </section>
  `,
  
  contactPage: `
  <!-- Contact Hero Section -->
  <section class="contact-hero py-5">
    <div class="container">
      <h1 class="display-5 fw-bold mb-4">Contact Us</h1>
      <p class="lead mb-5">Have questions about senior living options? Our team is here to help guide you through the process.</p>
      
      <div class="row">
        <div class="col-lg-6 mb-5 mb-lg-0">
          <div class="contact-info p-4 bg-white rounded shadow">
            <h2 class="h4 mb-4">Get in Touch</h2>
            
            <div class="d-flex mb-4">
              <div class="contact-icon me-3">
                <i class="fas fa-map-marker-alt fa-2x text-primary"></i>
              </div>
              <div>
                <h3 class="h6 mb-1">Our Office</h3>
                <p class="mb-0">123 Retirement Ave, Suite 100<br>Phoenix, AZ 85001</p>
              </div>
            </div>
            
            <div class="d-flex mb-4">
              <div class="contact-icon me-3">
                <i class="fas fa-phone fa-2x text-primary"></i>
              </div>
              <div>
                <h3 class="h6 mb-1">Phone</h3>
                <p class="mb-0"><a href="tel:+18005550000">(800) 555-0000</a></p>
                <p class="text-muted small mb-0">Monday-Friday, 8am-6pm EST</p>
              </div>
            </div>
            
            <div class="d-flex mb-4">
              <div class="contact-icon me-3">
                <i class="fas fa-envelope fa-2x text-primary"></i>
              </div>
              <div>
                <h3 class="h6 mb-1">Email</h3>
                <p class="mb-0"><a href="mailto:info@radiantretirement.com">info@radiantretirement.com</a></p>
                <p class="text-muted small mb-0">We'll respond within 24 hours</p>
              </div>
            </div>
            
            <div class="social-media mt-4">
              <h3 class="h6 mb-3">Follow Us</h3>
              <div class="social-icons">
                <a href="#" class="me-3"><i class="fab fa-facebook-f fa-lg"></i></a>
                <a href="#" class="me-3"><i class="fab fa-twitter fa-lg"></i></a>
                <a href="#" class="me-3"><i class="fab fa-instagram fa-lg"></i></a>
                <a href="#" class="me-3"><i class="fab fa-linkedin-in fa-lg"></i></a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-6">
          <div class="contact-form-container p-4 bg-white rounded shadow">
            <h2 class="h4 mb-4">Send Us a Message</h2>
            
            <!-- Contact Form -->
            <form id="contact-form" class="needs-validation" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name*</label>
                  <input type="text" class="form-control" id="firstName" name="firstName" required>
                  <div class="invalid-feedback">
                    Please provide your first name.
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input type="text" class="form-control" id="lastName" name="lastName">
                </div>
              </div>
              
              <div class="row g-3 mt-1">
                <div class="col-md-6">
                  <label for="email" class="form-label">Email Address*</label>
                  <input type="email" class="form-control" id="email" name="email" required>
                  <div class="invalid-feedback">
                    Please provide a valid email address.
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
                  <small class="form-text text-muted">Format: 123-456-7890</small>
                </div>
              </div>
              
              <div class="mt-3">
                <label for="subject" class="form-label">Subject*</label>
                <select class="form-select" id="subject" name="subject" required>
                  <option value="">Select a subject...</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Senior Living Advice">Senior Living Advice</option>
                  <option value="Facility Information">Facility Information</option>
                  <option value="Website Feedback">Website Feedback</option>
                  <option value="Other">Other</option>
                </select>
                <div class="invalid-feedback">
                  Please select a subject.
                </div>
              </div>
              
              <div class="mt-3">
                <label for="message" class="form-label">Message*</label>
                <textarea class="form-control" id="message" name="message" rows="5" required></textarea>
                <div class="invalid-feedback">
                  Please provide a message.
                </div>
              </div>
              
              <div class="mt-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="consent" name="consent" required>
                  <label class="form-check-label" for="consent">
                    I consent to having this website store my submitted information so they can respond to my inquiry.
                  </label>
                  <div class="invalid-feedback">
                    You must consent to proceed.
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <button type="submit" class="btn btn-primary">Submit Message</button>
                <div class="mt-3 alert alert-success d-none" id="form-success">
                  Thank you for contacting us! We'll be in touch with you shortly.
                </div>
                <div class="mt-3 alert alert-danger d-none" id="form-error">
                  There was a problem submitting your form. Please try again.
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Map Section -->
  <section class="map-section py-5 bg-light">
    <div class="container">
      <div class="map-container p-3 bg-white rounded shadow">
        <h2 class="h4 mb-3">Our Location</h2>
        <div id="contact-map" style="height: 400px; background-color: #f0f0f0;">
          <!-- Map will be initialized with JavaScript -->
          <div class="d-flex justify-content-center align-items-center h-100">
            <p>Map loading... (This would be an interactive map with JavaScript)</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="faq-section py-5">
    <div class="container">
      <h2 class="section-title text-center mb-5">Frequently Asked Questions</h2>
      
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="accordion" id="contactFAQ">
            <div class="accordion-item">
              <h3 class="accordion-header" id="headingOne">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                  How can Radiant Retirement help me find senior living options?
                </button>
              </h3>
              <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#contactFAQ">
                <div class="accordion-body">
                  Our comprehensive directory includes thousands of senior living facilities across the country. You can search by location, compare amenities, read reviews, and get detailed information about care types and costs. Our senior living advisors are also available to provide personalized guidance based on your specific needs and preferences.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h3 class="accordion-header" id="headingTwo">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                  Is there a cost for using your services?
                </button>
              </h3>
              <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#contactFAQ">
                <div class="accordion-body">
                  No, our directory and resources are completely free for seniors and their families. We're committed to providing accessible information to help you make informed decisions about senior living.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h3 class="accordion-header" id="headingThree">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                  How do I know if the information about facilities is accurate?
                </button>
              </h3>
              <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#contactFAQ">
                <div class="accordion-body">
                  We regularly update our database to ensure accuracy. Our team verifies facility information, including amenities, care types, and contact details. We also incorporate verified reviews from residents and their families to provide a comprehensive picture of each facility.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h3 class="accordion-header" id="headingFour">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                  Can you help me understand the different types of senior care?
                </button>
              </h3>
              <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#contactFAQ">
                <div class="accordion-body">
                  Yes! We provide detailed information about different care types, including independent living, assisted living, memory care, skilled nursing, and rehabilitation. Our resources explain what each care type includes, who it's best for, and typical costs. You can also speak with our senior living advisors for personalized guidance.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
  
  resourcesPage: `
  <!-- Resources Hero Section -->
  <section class="resources-hero py-5">
    <div class="container">
      <h1 class="display-5 fw-bold mb-4">Senior Living Resources</h1>
      <p class="lead mb-5">Explore our comprehensive guides and articles to help you navigate senior living options, financing, and care types.</p>
      
      <div class="row">
        <div class="col-lg-9">
          <div class="row row-cols-1 row-cols-md-3 g-4">
            <div class="col">
              <div class="resource-card card h-100 shadow-sm">
                <img src="/img/resource-guide.jpg" class="card-img-top" alt="Senior Housing Guide">
                <div class="card-body">
                  <h2 class="card-title h5">Senior Housing Guide</h2>
                  <p class="card-text">Understand different senior living options and how to choose the right one.</p>
                  <a href="/resources/senior-housing-guide.html" class="btn btn-outline-primary mt-3">Read Guide</a>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="resource-card card h-100 shadow-sm">
                <img src="/img/resource-financing.jpg" class="card-img-top" alt="Financing Options">
                <div class="card-body">
                  <h2 class="card-title h5">Financing Options</h2>
                  <p class="card-text">Learn about ways to pay for senior living, including insurance, VA benefits, and more.</p>
                  <a href="/resources/financing-options.html" class="btn btn-outline-primary mt-3">Read Guide</a>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="resource-card card h-100 shadow-sm">
                <img src="/img/resource-care-types.jpg" class="card-img-top" alt="Types of Care">
                <div class="card-body">
                  <h2 class="card-title h5">Types of Care</h2>
                  <p class="card-text">Explore different care levels from independent living to skilled nursing.</p>
                  <a href="/resources/care-types.html" class="btn btn-outline-primary mt-3">Read Guide</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 mt-4 mt-lg-0">
          <div class="resources-sidebar p-4 bg-white rounded shadow">
            <h3 class="h5 mb-3">Resource Categories</h3>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><a href="/resources/senior-housing-guide.html">Senior Housing Guide</a></li>
              <li class="list-group-item"><a href="/resources/financing-options.html">Financing Options</a></li>
              <li class="list-group-item"><a href="/resources/care-types.html">Types of Care</a></li>
              <li class="list-group-item"><a href="/resources/legal-planning.html">Legal Planning</a></li>
              <li class="list-group-item"><a href="/resources/caregiver-support.html">Caregiver Support</a></li>
              <li class="list-group-item"><a href="/resources/health-wellness.html">Health & Wellness</a></li>
              <li class="list-group-item"><a href="/resources/faqs.html">FAQs</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Articles Section -->
  <section class="featured-articles py-5 bg-light">
    <div class="container">
      <h2 class="section-title mb-4">Featured Articles</h2>
      
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col">
          <div class="article-card card h-100 shadow-sm">
            <div class="card-body">
              <span class="badge bg-primary mb-2">Assisted Living</span>
              <h3 class="card-title h5">10 Questions to Ask When Touring an Assisted Living Facility</h3>
              <p class="card-text">Essential questions to help you evaluate if a facility is the right fit for your loved one.</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="small text-muted">May 2, 2023</div>
                <a href="/resources/questions-assisted-living.html" class="btn btn-sm btn-outline-primary">Read More</a>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="article-card card h-100 shadow-sm">
            <div class="card-body">
              <span class="badge bg-primary mb-2">Financing</span>
              <h3 class="card-title h5">Understanding Medicare Coverage for Senior Living</h3>
              <p class="card-text">Learn what Medicare does and doesn't cover when it comes to senior living expenses.</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="small text-muted">April 15, 2023</div>
                <a href="/resources/medicare-coverage.html" class="btn btn-sm btn-outline-primary">Read More</a>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="article-card card h-100 shadow-sm">
            <div class="card-body">
              <span class="badge bg-primary mb-2">Memory Care</span>
              <h3 class="card-title h5">Signs It's Time to Consider Memory Care for Your Loved One</h3>
              <p class="card-text">Recognizing when specialized memory care might be needed for someone with dementia.</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="small text-muted">March 28, 2023</div>
                <a href="/resources/memory-care-signs.html" class="btn btn-sm btn-outline-primary">Read More</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-5">
        <a href="/blog" class="btn btn-primary">View All Articles</a>
      </div>
    </div>
  </section>

  <!-- Downloadable Resources Section -->
  <section class="downloadable-resources py-5">
    <div class="container">
      <h2 class="section-title mb-4">Free Downloadable Resources</h2>
      <p class="mb-5">Access our printable guides and checklists to help with your senior living search.</p>
      
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <div class="col">
          <div class="download-card card h-100 shadow-sm text-center">
            <div class="card-body">
              <div class="icon-container mb-3">
                <i class="fas fa-file-pdf fa-3x text-danger"></i>
              </div>
              <h3 class="card-title h5">Senior Living Comparison Worksheet</h3>
              <p class="small mb-3">Compare up to 4 facilities side-by-side with this printable worksheet.</p>
              <a href="/downloads/comparison-worksheet.pdf" class="btn btn-sm btn-outline-primary">Download PDF</a>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="download-card card h-100 shadow-sm text-center">
            <div class="card-body">
              <div class="icon-container mb-3">
                <i class="fas fa-file-pdf fa-3x text-danger"></i>
              </div>
              <h3 class="card-title h5">Facility Tour Checklist</h3>
              <p class="small mb-3">A comprehensive list of things to look for when touring senior living facilities.</p>
              <a href="/downloads/tour-checklist.pdf" class="btn btn-sm btn-outline-primary">Download PDF</a>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="download-card card h-100 shadow-sm text-center">
            <div class="card-body">
              <div class="icon-container mb-3">
                <i class="fas fa-file-pdf fa-3x text-danger"></i>
              </div>
              <h3 class="card-title h5">Cost Planning Guide</h3>
              <p class="small mb-3">Worksheets and tools to help estimate and plan for senior living costs.</p>
              <a href="/downloads/cost-planning.pdf" class="btn btn-sm btn-outline-primary">Download PDF</a>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="download-card card h-100 shadow-sm text-center">
            <div class="card-body">
              <div class="icon-container mb-3">
                <i class="fas fa-file-pdf fa-3x text-danger"></i>
              </div>
              <h3 class="card-title h5">Moving Day Checklist</h3>
              <p class="small mb-3">A helpful guide to make the transition to senior living smooth and organized.</p>
              <a href="/downloads/moving-checklist.pdf" class="btn btn-sm btn-outline-primary">Download PDF</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Expert Guidance CTA -->
  <section class="expert-cta py-5 bg-primary text-white">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8">
          <h2 class="mb-4">Need Personalized Guidance?</h2>
          <p class="lead mb-4">Our senior living advisors can help answer your specific questions and provide customized recommendations.</p>
          <div class="d-flex justify-content-center gap-3">
            <a href="/contact.html" class="btn btn-light btn-lg">Contact an Advisor</a>
            <a href="tel:+18005550000" class="btn btn-outline-light btn-lg"><i class="fas fa-phone me-2"></i>Call (800) 555-0000</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
};

// Helper functions
function generateStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let stars = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star text-warning"></i>';
  }
  
  // Half star
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt text-warning"></i>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star text-warning"></i>';
  }
  
  return stars;
}

function calculateAverageRating(facilities: any[]): number {
  if (facilities.length === 0) return 0;
  const sum = facilities.reduce((acc, facility) => acc + facility.rating, 0);
  return sum / facilities.length;
}

// Utility functions to create directories and files
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function writeFile(filePath: string, content: string) {
  await fs.writeFile(filePath, content, 'utf8');
}

// CSS styles
const cssStyles = `
/* Main Styles for Radiant Retirement */

:root {
  --primary: #2B6777;
  --primary-light: #C8D8E4;
  --primary-dark: #1F4D5A;
  --secondary: #52AB98;
  --accent: #F2B366;
  --light: #F2F2F2;
  --dark: #333333;
  --white: #FFFFFF;
  --gray-100: #F8F9FA;
  --gray-200: #E9ECEF;
  --gray-300: #DEE2E6;
  --gray-400: #CED4DA;
  --gray-500: #ADB5BD;
  --gray-600: #6C757D;
  --gray-700: #495057;
  --gray-800: #343A40;
  --gray-900: #212529;
  --font-family-sans-serif: 'Nunito', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-family-heading: 'Poppins', sans-serif;
}

/* Typography */
body {
  font-family: var(--font-family-sans-serif);
  color: var(--gray-800);
  line-height: 1.7;
  background-color: var(--white);
}

h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
  font-family: var(--font-family-heading);
  font-weight: 600;
  color: var(--dark);
}

.section-title {
  position: relative;
  padding-bottom: 15px;
  margin-bottom: 30px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: var(--primary);
}

.text-center .section-title::after {
  left: 50%;
  transform: translateX(-50%);
}

.section-subtitle {
  color: var(--gray-600);
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
}

.lead {
  font-size: 1.25rem;
  font-weight: 300;
}

/* Buttons and Links */
.btn-primary {
  background-color: var(--primary);
  border-color: var(--primary);
}

.btn-primary:hover, .btn-primary:focus {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.btn-outline-primary {
  color: var(--primary);
  border-color: var(--primary);
}

.btn-outline-primary:hover, .btn-outline-primary:focus {
  background-color: var(--primary);
  border-color: var(--primary);
}

a {
  color: var(--primary);
  text-decoration: none;
}

a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Layout Components */
.navbar {
  background-color: var(--primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-dark .navbar-nav .nav-link {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.navbar-dark .navbar-nav .nav-link:hover {
  color: rgba(255, 255, 255, 1);
}

.footer {
  background-color: var(--primary-dark);
  color: var(--white);
}

.footer h5 {
  color: var(--white);
  font-weight: 600;
  margin-bottom: 15px;
}

.footer a {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s;
}

.footer a:hover {
  color: var(--white);
  text-decoration: none;
}

.social-icons a {
  color: var(--white);
  margin-right: 10px;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.social-icons a:hover {
  color: var(--accent);
}

/* Hero Sections */
.hero {
  background: linear-gradient(rgba(43, 103, 119, 0.8), rgba(43, 103, 119, 0.9)), url('/img/hero-background.jpg');
  background-size: cover;
  background-position: center;
  color: var(--white);
  padding: 80px 0;
}

.city-hero, .state-hero, .browse-hero, .about-hero, .contact-hero, .resources-hero {
  background: linear-gradient(rgba(43, 103, 119, 0.8), rgba(43, 103, 119, 0.9)), url('/img/page-header-bg.jpg');
  background-size: cover;
  background-position: center;
  color: var(--white);
  padding: 60px 0;
}

.min-vh-75 {
  min-height: 75vh;
}

/* Cards and Containers */
.card {
  border: none;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.feature-card, .care-type-card, .value-card, .city-card, .facility-card {
  border-radius: 0.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.feature-card:hover, .care-type-card:hover, .value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-card .icon-container, .care-type-card .icon-container, .value-card .icon-container {
  width: 80px;
  height: 80px;
  background-color: rgba(43, 103, 119, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.search-container, .search-form, .search-sidebar {
  border-radius: 0.5rem;
}

.facility-rating {
  color: var(--gray-700);
}

.facility-amenities .badge {
  font-weight: 400;
  padding: 0.35em 0.65em;
}

.bg-secondary-light {
  background-color: rgba(82, 171, 152, 0.1);
}

.text-secondary {
  color: var(--secondary) !important;
}

/* City Page Specific */
.city-stats {
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--white);
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.map-container {
  border-radius: 0.5rem;
}

/* Forms */
.form-control, .form-select {
  border-radius: 0.25rem;
  border: 1px solid var(--gray-300);
  padding: 0.75rem 1rem;
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 0.25rem rgba(43, 103, 119, 0.25);
}

.contact-form-container {
  border-radius: 0.5rem;
}

/* Breadcrumbs */
.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin-bottom: 1.5rem;
}

.breadcrumb-item, .breadcrumb-item a {
  color: rgba(255, 255, 255, 0.7);
}

.breadcrumb-item.active {
  color: var(--white);
}

.breadcrumb-item + .breadcrumb-item::before {
  color: rgba(255, 255, 255, 0.5);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .hero, .city-hero, .state-hero, .browse-hero, .about-hero, .contact-hero, .resources-hero {
    padding: 40px 0;
  }
  
  .section-title {
    margin-bottom: 20px;
  }
  
  .stat-item {
    flex: 0 0 calc(50% - 0.5rem);
    margin-bottom: 1rem;
  }
}
`;

// JavaScript functionality
const jsScripts = `
// Main JavaScript for Radiant Retirement

document.addEventListener('DOMContentLoaded', function() {
  // Enable Bootstrap tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Enable Bootstrap popovers
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
  
  // Form validation
  var forms = document.querySelectorAll('.needs-validation');
  
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        event.preventDefault();
        
        // Simulate form submission
        var success = Math.random() > 0.1; // 90% success rate for demo
        
        setTimeout(function() {
          if (success) {
            document.getElementById('form-success').classList.remove('d-none');
            form.reset();
          } else {
            document.getElementById('form-error').classList.remove('d-none');
          }
          
          // Hide alert after 5 seconds
          setTimeout(function() {
            document.getElementById('form-success').classList.add('d-none');
            document.getElementById('form-error').classList.add('d-none');
          }, 5000);
        }, 1000);
      }
      
      form.classList.add('was-validated');
    }, false);
  });
  
  // Facility filtering
  const filterForm = document.getElementById('filter-form');
  
  if (filterForm) {
    filterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const careTypeFilters = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
      const ratingFilter = parseFloat(document.getElementById('rating-filter').value);
      
      const facilities = document.querySelectorAll('.facility-item');
      
      facilities.forEach(facility => {
        const facilityElement = facility;
        let matchesCareType = true;
        let matchesRating = true;
        
        // This is a simplified example - in a real implementation, we would need to store 
        // facility data in data attributes or JavaScript objects
        
        // For demo purposes, just show/hide random facilities
        if (careTypeFilters.length > 0 && Math.random() > 0.7) {
          matchesCareType = false;
        }
        
        if (ratingFilter > 0 && Math.random() > 0.8) {
          matchesRating = false;
        }
        
        if (matchesCareType && matchesRating) {
          facilityElement.style.display = 'block';
        } else {
          facilityElement.style.display = 'none';
        }
      });
    });
  }
  
  // Search functionality
  const searchForm = document.getElementById('search-facilities-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      // In a real implementation, this would submit to search-results.html
      // For demo, we'll just handle it here
      e.preventDefault();
      
      const city = document.getElementById('city-input').value;
      const state = document.getElementById('state-select').value;
      
      if (!city && !state) {
        alert('Please enter a city or select a state to search.');
        return;
      }
      
      // Redirect to a city page if we have both city and state
      if (city && state) {
        window.location.href = '/city/' + city.toLowerCase() + '-' + state.toLowerCase() + '.html';
      } else if (state) {
        // Just state, go to state page
        window.location.href = '/browse/' + state.toLowerCase() + '.html';
      }
    });
  }
});
`;

// Logo SVG generation
const logoSvg = `<svg width="160" height="50" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="50" height="50" rx="25" fill="#2B6777"/>
  <path d="M15 15 L35 15 L25 5 Z" fill="#F2B366"/>
  <path d="M15 20 L35 20 L35 35 L15 35 Z" fill="#C8D8E4"/>
  <path d="M20 20 L20 35 L30 35 L30 20 Z" fill="#52AB98"/>
  <text x="60" y="22" font-family="Poppins, sans-serif" font-weight="600" font-size="18" fill="#2B6777">Radiant</text>
  <text x="60" y="38" font-family="Poppins, sans-serif" font-weight="400" font-size="15" fill="#52AB98">Retirement</text>
</svg>`;

// Main function to generate the static site
async function generateStaticSite() {
  try {
    console.log('Starting static site generation...');
    
    // Create base directories
    const staticDir = path.join(process.cwd(), 'static-site');
    await ensureDirectoryExists(staticDir);
    
    // Create subdirectories
    const dirs = [
      'css',
      'js',
      'img',
      'downloads',
      'city',
      'browse',
      'resources',
      'facility'
    ];
    
    for (const dir of dirs) {
      await ensureDirectoryExists(path.join(staticDir, dir));
    }
    
    // Write CSS and JS files
    await writeFile(path.join(staticDir, 'css', 'styles.css'), cssStyles);
    await writeFile(path.join(staticDir, 'js', 'scripts.js'), jsScripts);
    
    // Create logo and placeholder images
    await writeFile(path.join(staticDir, 'img', 'logo.svg'), logoSvg);
    
    // Generate fake images for placeholders
    
    // Process cities data
    console.log('Processing cities data...');
    const citiesData: any[] = [];
    const statesMap = new Map<string, string>();
    
    // Read the CSV data
    const csvPath = path.join(process.cwd(), 'data', 'cities.csv');
    
    // Use a promise to handle the CSV reading
    const cities = await new Promise<any[]>((resolve) => {
      const citiesArray: any[] = [];
      
      createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
          const city = {
            name: data.city,
            state: data.state,
            population: parseInt(data.population?.replace(/,/g, '') || '0', 10),
            stateName: data.state_name || null,
            slug: data.slug || `${data.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${(data.state || '').toLowerCase()}`
          };
          
          citiesArray.push(city);
          
          // Track states for the browse by state page
          if (data.state_name) {
            statesMap.set(data.state, data.state_name);
          }
        })
        .on('end', () => {
          resolve(citiesArray);
        });
    });
    
    console.log(`Loaded ${cities.length} cities from CSV`);
    
    // Sort cities by population (largest first)
    cities.sort((a, b) => b.population - a.population);
    
    // Get a list of states
    const states = Array.from(statesMap.values()).sort();
    console.log(`Found ${states.length} unique states`);
    
    // Generate homepage
    console.log('Generating homepage...');
    const popularCities = cities.slice(0, 6); // Top 6 cities by population
    const homepage = htmlTemplates.head('Find Senior Living Facilities Near You', 'Explore top-rated senior living facilities across 1,000 U.S. cities. Find assisted living, independent living, memory care, and nursing homes.') +
      htmlTemplates.homepage(popularCities).replace('<!-- Use the searchForm template here -->', htmlTemplates.searchForm) +
      htmlTemplates.footer;
    
    await writeFile(path.join(staticDir, 'index.html'), homepage);
    
    // Generate About, Contact, and Resources pages
    console.log('Generating informational pages...');
    const aboutPage = htmlTemplates.head('About Us', 'Learn about Radiant Retirement and our mission to help seniors find the perfect living community.') +
      htmlTemplates.aboutPage +
      htmlTemplates.footer;
    
    const contactPage = htmlTemplates.head('Contact Us', 'Get in touch with our senior living advisors for personalized assistance finding the right senior community.') +
      htmlTemplates.contactPage +
      htmlTemplates.footer;
    
    const resourcesPage = htmlTemplates.head('Senior Living Resources', 'Access guides, articles, and tools to help you navigate senior living options, financing, and care types.') +
      htmlTemplates.resourcesPage +
      htmlTemplates.footer;
    
    await writeFile(path.join(staticDir, 'about.html'), aboutPage);
    await writeFile(path.join(staticDir, 'contact.html'), contactPage);
    await writeFile(path.join(staticDir, 'resources.html'), resourcesPage);
    
    // Generate Browse by State page
    console.log('Generating browse by state page...');
    const browsePage = htmlTemplates.head('Browse Senior Living by State', 'Find senior living facilities by state. Explore cities and senior communities across the United States.') +
      htmlTemplates.browseByStatePage(states) +
      htmlTemplates.footer;
    
    await writeFile(path.join(staticDir, 'browse', 'index.html'), browsePage);
    
    // Generate State pages
    console.log('Generating state pages...');
    const stateGroups = new Map<string, any[]>();
    
    // Group cities by state
    cities.forEach(city => {
      if (!stateGroups.has(city.state)) {
        stateGroups.set(city.state, []);
      }
      stateGroups.get(city.state)?.push(city);
    });
    
    // Create a page for each state
    const statePromises = Array.from(stateGroups.entries()).map(async ([stateCode, stateCities]) => {
      const stateName = statesMap.get(stateCode) || stateCode;
      const statePage = htmlTemplates.head(`Senior Living in ${stateName}`, `Find senior living facilities in ${stateName}. Browse cities and explore senior communities.`) +
        htmlTemplates.stateListingPage(stateCode, stateName, stateCities) +
        htmlTemplates.footer;
      
      await writeFile(path.join(staticDir, 'browse', `${stateCode.toLowerCase()}.html`), statePage);
      return stateCode;
    });
    
    await Promise.all(statePromises);
    
    // Generate City pages (limit to 100 for this demo to avoid too many files)
    console.log('Generating city pages...');
    const maxCities = 100;
    const citiesToGenerate = cities.slice(0, maxCities);
    
    const cityPromises = citiesToGenerate.map(async (city, index) => {
      // Generate 5 facilities for each city
      const facilities = generateFacilities(city.name, city.state);
      
      const cityPage = htmlTemplates.head(`Senior Living in ${city.name}, ${city.state}`, `Explore senior living facilities in ${city.name}, ${city.state}. Find assisted living, independent living, memory care, and nursing homes.`) +
        htmlTemplates.cityPage(city, facilities) +
        htmlTemplates.footer;
      
      await writeFile(path.join(staticDir, 'city', `${city.slug}.html`), cityPage);
      
      if ((index + 1) % 10 === 0) {
        console.log(`Generated ${index + 1}/${maxCities} city pages`);
      }
      
      return city.name;
    });
    
    await Promise.all(cityPromises);
    
    // Create sitemap.xml
    console.log('Generating sitemap...');
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add main pages
    sitemap += `  <url>\n    <loc>https://radiantretirement.netlify.app/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>https://radiantretirement.netlify.app/about.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>https://radiantretirement.netlify.app/contact.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>https://radiantretirement.netlify.app/resources.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>https://radiantretirement.netlify.app/browse/index.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    
    // Add state pages
    Array.from(stateGroups.keys()).forEach(stateCode => {
      sitemap += `  <url>\n    <loc>https://radiantretirement.netlify.app/browse/${stateCode.toLowerCase()}.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });
    
    // Add city pages (limited to the 100 we generated)
    citiesToGenerate.forEach(city => {
      sitemap += `  <url>\n    <loc>https://radiantretirement.netlify.app/city/${city.slug}.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });
    
    sitemap += '</urlset>';
    
    await writeFile(path.join(staticDir, 'sitemap.xml'), sitemap);
    
    // Create robots.txt
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://radiantretirement.netlify.app/sitemap.xml`;
    
    await writeFile(path.join(staticDir, 'robots.txt'), robotsTxt);
    
    console.log('Static site generation complete!');
    return staticDir;
  } catch (error) {
    console.error('Error generating static site:', error);
    throw error;
  }
}

// Function to generate a Node.js script that will run the static site generator
async function createGeneratorScript() {
  try {
    // Create a simple script that calls the static site generator
    const generatorScript = `
const { generateStaticSite } = require('./staticSiteGenerator');

// Run the generator
generateStaticSite()
  .then(outputDir => {
    console.log(\`Static site generated successfully in \${outputDir}\`);
    console.log('You can now deploy these files to Netlify or any static hosting service.');
  })
  .catch(error => {
    console.error('Error generating static site:', error);
    process.exit(1);
  });
`;

    await writeFile(path.join(process.cwd(), 'generateSite.js'), generatorScript);
    console.log('Generator script created at generateSite.js');
  } catch (error) {
    console.error('Error creating generator script:', error);
    throw error;
  }
}

// Export the function
export { generateStaticSite };

// If this script is run directly, execute the generator
if (require.main === module) {
  generateStaticSite()
    .then(outputDir => {
      console.log(`Static site generated successfully in ${outputDir}`);
      console.log('You can now deploy these files to Netlify or any static hosting service.');
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}