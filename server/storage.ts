import { users, type User, type InsertUser, type City, type Facility, type InsertCity } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // City methods
  getAllCities(): Promise<City[]>;
  getCityByNameAndState(name: string, state: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  getCitiesByState(state: string): Promise<City[]>;
  getAllStates(): Promise<string[]>;
  
  // Facility methods
  getFacilitiesByCity(cityName: string, stateName: string): Promise<Facility[]>;
  createFacility(facility: Facility): Promise<Facility>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cities: Map<number, City>;
  private cityNameMap: Map<string, City>; // Map city name + state to City object
  private facilities: Map<string, Facility>;
  private facilitiesByCity: Map<string, Facility[]>; // Map city+state to facilities
  currentId: number;
  cityId: number;

  constructor() {
    this.users = new Map();
    this.cities = new Map();
    this.cityNameMap = new Map(); // For fast lookups by name+state
    this.facilities = new Map();
    this.facilitiesByCity = new Map(); // For fast facility lookups by city
    this.currentId = 1;
    this.cityId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // City methods
  async getAllCities(): Promise<City[]> {
    return Array.from(this.cities.values());
  }
  
  async getCityByNameAndState(name: string, state: string): Promise<City | undefined> {
    // Use the cityNameMap for faster lookups
    const key = `${name.toLowerCase()}|${state.toLowerCase()}`;
    return this.cityNameMap.get(key);
  }
  
  async createCity(cityData: InsertCity): Promise<City> {
    // Check if city already exists to prevent duplicates
    const existingCity = await this.getCityByNameAndState(cityData.name, cityData.state);
    if (existingCity) {
      return existingCity;
    }
    
    const id = this.cityId++;
    const city: City = { 
      ...cityData, 
      id,
      stateName: cityData.stateName || null,
      slug: cityData.slug || `${cityData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cityData.state.toLowerCase()}` 
    };
    
    // Store city in both maps
    this.cities.set(id, city);
    const nameKey = `${city.name.toLowerCase()}|${city.state.toLowerCase()}`;
    this.cityNameMap.set(nameKey, city);
    
    return city;
  }
  
  async getCitiesByState(state: string): Promise<City[]> {
    // Optimizing this would require a stateMap index, but for now we'll filter
    return Array.from(this.cities.values()).filter(
      (city) => city.state.toLowerCase() === state.toLowerCase()
    );
  }
  
  async getAllStates(): Promise<string[]> {
    const states = new Set<string>();
    Array.from(this.cities.values()).forEach(city => {
      states.add(city.state);
    });
    return Array.from(states).sort();
  }
  
  // Facility methods
  async getFacilitiesByCity(cityName: string, stateName: string): Promise<Facility[]> {
    // Check the facilities by city map first
    const key = `${cityName.toLowerCase()}|${stateName.toLowerCase()}`;
    const facilities = this.facilitiesByCity.get(key);
    
    if (facilities) {
      return facilities;
    }
    
    // If not found, fall back to filtering all facilities
    return Array.from(this.facilities.values()).filter(
      (facility) => facility.city.toLowerCase() === cityName.toLowerCase() && 
                  facility.state.toLowerCase() === stateName.toLowerCase()
    );
  }
  
  async createFacility(facility: Facility): Promise<Facility> {
    this.facilities.set(facility.id, facility);
    
    // Add to facilitiesByCity map for faster lookups
    const key = `${facility.city.toLowerCase()}|${facility.state.toLowerCase()}`;
    if (!this.facilitiesByCity.has(key)) {
      this.facilitiesByCity.set(key, []);
    }
    
    const cityFacilities = this.facilitiesByCity.get(key) || [];
    cityFacilities.push(facility);
    this.facilitiesByCity.set(key, cityFacilities);
    
    return facility;
  }
}

export const storage = new MemStorage();
