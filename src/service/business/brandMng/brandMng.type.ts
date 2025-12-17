export interface BrandSearchDTO {
  keyword?: string;
  page?: number;
  size?: number;
}

export interface BrandDTO {
  id: string;
  name: string;
  description?: string;
}

export interface BrandSaveDTO {
  id?: string;
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface PageableObject<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

