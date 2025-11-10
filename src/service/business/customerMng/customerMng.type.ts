export interface CustomerSearchDTO {
  keyword?: string;
  country?: string;
  page?: number;
  size?: number;
}

export interface CustomerDTO {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  address?: string;
  citizenId?: string;
  citizenIdFrontImageUrl?: string;
  citizenIdBackImageUrl?: string;
  driverLicense?: string;
  driverLicenseImageUrl?: string;
  passport?: string;
  passportImageUrl?: string;
  note?: string;
  totalSpent?: number;
}

export interface CustomerSaveDTO {
  id?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  address?: string;
  citizenId?: string;
  citizenIdFrontImageUrl?: string;
  citizenIdBackImageUrl?: string;
  driverLicense?: string;
  driverLicenseImageUrl?: string;
  passport?: string;
  passportImageUrl?: string;
  note?: string;
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
