export interface CarModelDTO {
  id: string;
  name: string;
  brandId?: string;
  brandName?: string;
  description?: string;
  baseDailyPrice?: number;
  baseHourlyPrice?: number;
  active: boolean;
  carCount?: number; // Số lượng xe của mẫu xe này
}

export interface CarModelSaveDTO {
  name: string;
  brandId?: string;
  description?: string;
  baseDailyPrice?: number;
  baseHourlyPrice?: number;
  active: boolean;
}

export interface CarModelInfoDTO {
  brandId?: string;
  brandName?: string;
  baseDailyPrice?: number;
  baseHourlyPrice?: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
