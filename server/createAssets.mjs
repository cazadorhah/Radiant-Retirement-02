import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Create necessary directories for static site assets
const staticDir = path.join(rootDir, 'static-site');
const imgDir = path.join(staticDir, 'img');

// Create directories if they don't exist
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Create placeholder images for the static site
function createPlaceholderImages() {
  ensureDirExists(imgDir);
  
  // Simple SVG placeholders
  const heroBackground = `<svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="600" fill="#2B6777"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Hero Background Image</text>
  </svg>`;
  
  const pageHeaderBg = `<svg width="1200" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="300" fill="#2B6777"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Page Header Background</text>
  </svg>`;
  
  const seniorCouple = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#C8D8E4"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">Senior Couple Image</text>
  </svg>`;
  
  const aboutTeam = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#C8D8E4"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">Team Image</text>
  </svg>`;
  
  // Create team member placeholders
  for (let i = 1; i <= 4; i++) {
    const teamMember = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#DEE2E6"/>
      <circle cx="200" cy="150" r="100" fill="#ADB5BD"/>
      <rect x="150" y="260" width="100" height="20" fill="#6C757D"/>
      <rect x="120" y="290" width="160" height="15" fill="#6C757D"/>
      <text x="50%" y="50%" font-family="Arial" font-size="18" fill="#333" text-anchor="middle">Team Member ${i}</text>
    </svg>`;
    
    fs.writeFileSync(path.join(imgDir, `team-member-${i}.jpg`), teamMember);
  }
  
  // Resource images
  const resourceTypes = ['guide', 'financing', 'care-types'];
  resourceTypes.forEach(type => {
    const resourceImg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#DEE2E6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">${type.replace('-', ' ')} Resource</text>
    </svg>`;
    
    fs.writeFileSync(path.join(imgDir, `resource-${type}.jpg`), resourceImg);
  });
  
  // Write main placeholder images
  fs.writeFileSync(path.join(imgDir, 'hero-background.jpg'), heroBackground);
  fs.writeFileSync(path.join(imgDir, 'page-header-bg.jpg'), pageHeaderBg);
  fs.writeFileSync(path.join(imgDir, 'senior-couple.jpg'), seniorCouple);
  fs.writeFileSync(path.join(imgDir, 'about-team.jpg'), aboutTeam);
  
  console.log('Created placeholder images in the img directory');
}

// Create dummy PDF downloads
function createDummyPDFs() {
  const downloadsDir = path.join(staticDir, 'downloads');
  ensureDirExists(downloadsDir);
  
  const pdfFiles = [
    'comparison-worksheet.pdf',
    'tour-checklist.pdf',
    'cost-planning.pdf',
    'moving-checklist.pdf'
  ];
  
  // Simple text content to represent PDF
  const pdfPlaceholder = 'This is a placeholder for a PDF file. In a production environment, this would be an actual PDF document.';
  
  pdfFiles.forEach(file => {
    fs.writeFileSync(path.join(downloadsDir, file), pdfPlaceholder);
  });
  
  console.log('Created dummy PDF files in the downloads directory');
}

// Run the asset creation
function createAllAssets() {
  ensureDirExists(staticDir);
  createPlaceholderImages();
  createDummyPDFs();
  console.log('All asset directories and placeholder files created successfully');
}

createAllAssets();