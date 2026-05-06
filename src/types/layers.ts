export interface Layer {
  id: number;
  name: string;
  description: string | null;
  ironingRate: number | string;
  dryCleaningRate: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface LayersResponse {
  data: Layer[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
