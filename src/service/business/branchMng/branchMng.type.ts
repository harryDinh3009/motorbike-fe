export interface BranchSearchDTO {
  keyword?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface BranchDTO {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  note?: string;
  status: number;
}

export interface BranchSaveDTO {
  id?: string;
  name: string;
  phoneNumber: string;
  address: string;
  note?: string;
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
