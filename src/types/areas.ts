export interface Area {
  id: number;
  name: string;
  cityId: number;
  city?: {
    id: number;
    city: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AreasResponse {
  data: Area[];
  page: number; 
  perPage: number; 
  total: number; 
  totalPages: number; 
}

export interface CreateAreaData {
  name: string;
  cityId: number;
}

export interface UpdateAreaData {
  name?: string;
  cityId?: number;
}
