import type { Express, NextFunction, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as fs from 'fs/promises';
import * as path from 'path';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import { generateFacilities } from './facilityGenerator';
import { processAndSaveCitiesData, getStateAbbreviation } from './cityGenerator';
import { City, InsertCity } from "@shared/schema";
import { z } from "zod";
import { sendContactFormEmail } from './email';

// State abbreviation mapping
const stateAbbreviations: Record<string, string> = {
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
};

// Helper function to get state abbreviation from full name
function getStateAbbreviationFromName(stateName: string | undefined): string {
  if (!stateName) return '';
  return stateAbbreviations[stateName] || stateName.substring(0, 2).toUpperCase();
}

// Contact form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters long" }),
  cityName: z.string().optional(),
  stateName: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the city data when the server starts
  await initializeData();

  // Get all cities
  app.get('/api/cities', async (req, res) => {
    try {
      const cities = await storage.getAllCities();
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ message: 'Failed to fetch cities' });
    }
  });

  // Get all states
  app.get('/api/states', async (req, res) => {
    try {
      const states = await storage.getAllStates();
      res.json(states);
    } catch (error) {
      console.error('Error fetching states:', error);
      res.status(500).json({ message: 'Failed to fetch states' });
    }
  });

  // Get cities by state
  app.get('/api/states/:state/cities', async (req, res) => {
    try {
      const state = req.params.state;
      const cities = await storage.getCitiesByState(state);
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities by state:', error);
      res.status(500).json({ message: 'Failed to fetch cities by state' });
    }
  });

  // Get specific city by name-state
  app.get('/api/cities/:cityNameState', async (req, res) => {
    try {
      const cityNameState = decodeURIComponent(req.params.cityNameState);
      const [cityName, stateName] = cityNameState.split('-');
      
      if (!cityName || !stateName) {
        return res.status(400).json({ message: 'Invalid city name format. Use CityName-State' });
      }
      
      const city = await storage.getCityByNameAndState(cityName, stateName);
      
      if (!city) {
        return res.status(404).json({ message: 'City not found' });
      }
      
      res.json(city);
    } catch (error) {
      console.error('Error fetching city:', error);
      res.status(500).json({ message: 'Failed to fetch city' });
    }
  });

  // Get facilities for a specific city
  app.get('/api/cities/:cityNameState/facilities', async (req, res) => {
    try {
      const cityNameState = decodeURIComponent(req.params.cityNameState);
      const [cityName, stateName] = cityNameState.split('-');
      
      if (!cityName || !stateName) {
        return res.status(400).json({ message: 'Invalid city name format. Use CityName-State' });
      }
      
      const city = await storage.getCityByNameAndState(cityName, stateName);
      
      if (!city) {
        return res.status(404).json({ message: 'City not found' });
      }
      
      const facilities = await storage.getFacilitiesByCity(cityName, stateName);
      res.json(facilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      res.status(500).json({ message: 'Failed to fetch facilities' });
    }
  });
  
  // Handle contact form submissions
  app.post('/api/contact', async (req, res) => {
    try {
      // Validate the form data
      const result = contactFormSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid form data', 
          errors: result.error.format() 
        });
      }
      
      const formData = result.data;
      
      // Log the form submission
      console.log('Contact form submission:', {
        from: `${formData.firstName} ${formData.lastName || ''}`,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        message: formData.message,
        city: formData.cityName || 'Not specified',
        state: formData.stateName || 'Not specified'
      });
      
      // Send email using our email service
      // If we don't have a SendGrid API key, it will simulate success and log the email
      await sendContactFormEmail({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        cityName: formData.cityName,
        stateName: formData.stateName
      });
      
      // Return success response
      res.status(200).json({ 
        message: 'Contact form submitted successfully',
        success: true
      });
    } catch (error) {
      console.error('Error processing contact form:', error);
      res.status(500).json({ message: 'Failed to process contact form submission' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeData() {
  try {
    // Check if we've already loaded the cities
    const cities = await storage.getAllCities();
    
    // Always regenerate for this session
    if (true) {
      console.log('Initializing cities and facilities data...');
      
      // Process the CSV file and generate city data
      const csvPath = path.join(process.cwd(), 'data', 'cities.csv');
      
      // Always regenerate the cities.csv file from the uploaded CSV
      console.log('Regenerating cities data from uploaded CSV...');
      try {
        await processAndSaveCitiesData();
      } catch (error) {
        console.error('Error processing cities data:', error);
      }
      
      // Read and process the CSV file
      return new Promise<void>((resolve, reject) => {
        const citiesArray: InsertCity[] = [];
        
        createReadStream(csvPath)
          .pipe(csv())
          .on('data', (data) => {
            // Check if we have all the expected fields
            if (data.city && data.state) {
              // Handle both file formats (with or without state_name and slug)
              const cityData: InsertCity = {
                name: data.city,
                state: data.state || getStateAbbreviationFromName(data.state_name),
                population: parseInt(data.population?.replace(/,/g, '') || '0', 10),
                stateName: data.state_name || null,
                slug: data.slug || `${data.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${(data.state || '').toLowerCase()}`
              };
              citiesArray.push(cityData);
            }
          })
          .on('end', async () => {
            console.log(`Loaded ${citiesArray.length} cities from CSV`);
            
            try {
              // Store cities in memory
              let completedCities = 0;
              const totalCities = citiesArray.length;
              const batchSize = 50; // Process cities in batches to improve performance
              
              // Process cities in batches
              for (let i = 0; i < totalCities; i += batchSize) {
                const batch = citiesArray.slice(i, i + batchSize);
                
                // Process each city in the batch
                await Promise.all(batch.map(async (city) => {
                  const createdCity = await storage.createCity(city);
                  
                  // Generate facilities for each city
                  const facilities = generateFacilities(city.name, city.state);
                  await Promise.all(facilities.map(facility => storage.createFacility(facility)));
                  
                  return createdCity;
                }));
                
                completedCities += batch.length;
                console.log(`Processed ${completedCities}/${totalCities} cities`);
              }
              
              console.log('Finished loading cities and generating facilities');
              resolve();
            } catch (error) {
              console.error('Error storing cities and facilities:', error);
              reject(error);
            }
          })
          .on('error', (error) => {
            console.error('Error reading CSV:', error);
            reject(error);
          });
      });
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}
