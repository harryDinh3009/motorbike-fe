import http from "@/utils/http";
import { CarModelDTO, CarModelSaveDTO, ApiResponse } from "./carModelMng.type";

/**
 * Lấy danh sách mẫu xe (dùng cho dropdown, chỉ trả về tên)
 */
export const getCarModels = async (): Promise<ApiResponse<string[]>> => {
  const res = await http.get<ApiResponse<string[]>>("/a/car-mng/car-models");
  return res.data;
};

/**
 * Lấy toàn bộ thông tin mẫu xe (cho admin quản lý)
 */
export const getCarModelsForManage = async (): Promise<ApiResponse<CarModelDTO[]>> => {
  const res = await http.get<ApiResponse<CarModelDTO[]>>("/a/car-mng/car-models/manage");
  return res.data;
};

/**
 * Tạo mẫu xe mới
 */
export const createCarModel = async (data: CarModelSaveDTO): Promise<ApiResponse<CarModelDTO>> => {
  const res = await http.post<ApiResponse<CarModelDTO>>("/a/car-mng/car-models", data);
  return res.data;
};

/**
 * Cập nhật mẫu xe
 */
export const updateCarModel = async (id: string, data: CarModelSaveDTO): Promise<ApiResponse<CarModelDTO>> => {
  const res = await http.put<ApiResponse<CarModelDTO>>(`/a/car-mng/car-models/${id}`, data);
  return res.data;
};

/**
 * Xóa mẫu xe
 */
export const deleteCarModel = async (id: string): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(`/a/car-mng/car-models/${id}`);
  return res.data;
};
