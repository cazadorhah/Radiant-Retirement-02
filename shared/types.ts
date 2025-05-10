export interface User {
  id: number;
  username: string;
  password: string;
}

export interface City {
  id: number;
  name: string;
  state: string;
  population: number;
  stateName: string | null;
  slug: string | null;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  imageUrl?: string;
  facilityType?: string;
}
