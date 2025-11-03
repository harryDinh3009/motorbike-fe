export type CarStatus = "ACTIVE" | "INACTIVE" | "NOT_READY" | "LOST" | "BROKEN";

export interface CarSearchDTO {
  keyword?: string;
  branchId?: string;
  carType?: string;
  condition?: string;
  status?: CarStatus;
  page?: number;
  size?: number;
}

export interface CarDTO {
  id: string;
  model: string;
  licensePlate: string;
  carType: string;
  branchId: string;
  branchName: string;
  dailyPrice?: number;
  hourlyPrice?: number;
  condition?: string;
  currentOdometer?: number;
  status?: CarStatus;
  statusNm?: string;
  imageUrl?: string;
  note?: string;
  yearOfManufacture?: number;
  origin?: string;
  value?: number;
  frameNumber?: string;
  engineNumber?: string;
  color?: string;
  registrationNumber?: string;
  registeredOwnerName?: string;
  registrationPlace?: string;
  insuranceContractNumber?: string;
  insuranceExpiryDate?: string;
}

export interface CarSaveDTO {
  id?: string;
  model: string;
  licensePlate: string;
  carType: string;
  branchId: string;
  dailyPrice?: number;
  hourlyPrice?: number;
  condition?: string;
  currentOdometer?: number;
  status?: CarStatus;
  imageUrl?: string;
  note?: string;
  yearOfManufacture?: number;
  origin?: string;
  value?: number;
  frameNumber?: string;
  engineNumber?: string;
  color?: string;
  registrationNumber?: string;
  registeredOwnerName?: string;
  registrationPlace?: string;
  insuranceContractNumber?: string;
  insuranceExpiryDate?: string;
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

export interface CarImportResult {
  count: number;
  message: string;
}
