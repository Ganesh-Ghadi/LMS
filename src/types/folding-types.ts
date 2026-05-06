export interface FoldingType {
  id: number;
  foldingTypeName: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoldingTypesResponse {
  data: FoldingType[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CreateFoldingTypeData {
  foldingTypeName: string;
  price: number;
}

export interface UpdateFoldingTypeData {
  foldingTypeName?: string;
  price?: number;
}
