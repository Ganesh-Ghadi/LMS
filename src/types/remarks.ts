export interface Remark {
  id: number;
  remarkName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemarksResponse {
  data: Remark[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
