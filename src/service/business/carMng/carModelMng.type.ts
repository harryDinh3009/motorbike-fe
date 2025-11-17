export interface CarModelDTO {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface CarModelSaveDTO {
  name: string;
  description: string;
  active: boolean;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
