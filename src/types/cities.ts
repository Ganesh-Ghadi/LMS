export interface City {
  id: number;
  city: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CitiesResponse {
  data: City[];
  page: number; 
  perPage: number; 
  total: number; 
  totalPages: number; 
}

export interface CreateCityData {
  city: string;
}

export interface UpdateCityData {
  city?: string;
}
