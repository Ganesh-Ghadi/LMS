export interface Work {
  id: number;
  workName: string;
  rate: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface WorksResponse {
  data: Work[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
