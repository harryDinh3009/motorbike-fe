export interface SurchargeTypeSearchDTO {
  keyword?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface SurchargeTypeDTO {
  id: string;
  name: string;
  price: number;
  description?: string;
  status: number;
}

export interface SurchargeTypeSaveDTO {
  id?: string;
  name: string;
  price: number;
  description?: string;
  status: number;
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
