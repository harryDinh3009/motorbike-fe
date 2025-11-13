export interface UserMngSearchDTO {
  keyword?: string;
  role?: string;
  status?: string;
  branchId?: string;
  page?: number;
  size?: number;
}

export interface UserMngListDTO {
  rowNum?: number;
  id: string;
  userName: string;
  fullName: string;
  email?: string;
  genderNm?: string;
  roleNm?: string;
  phoneNumber?: string;
  address?: string;
  branchId?: string;
  branchName?: string;
  statusNm?: string;
  avatar?: string;
}

export interface UserMngSaveDTO {
  id?: string;
  username: string;
  fullName: string;
  email?: string;
  password?: string;
  roleCd?: string;
  genderCd?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  branchId?: string;
  statusCd?: string;
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
