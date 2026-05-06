export interface Service {
  id: number;
  serviceName: string;
  rate: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicesResponse {
  data: Service[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
