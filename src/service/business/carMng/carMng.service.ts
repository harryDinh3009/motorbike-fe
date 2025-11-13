import http from "@/utils/http";
import {
  CarSearchDTO,
  CarDTO,
  CarSaveDTO,
  ApiResponse,
  PageableObject,
  CarImportResult,
} from "./carMng.type";

/**
 * Tìm kiếm xe với phân trang
 */
export const searchCars = async (
  params: CarSearchDTO
): Promise<ApiResponse<PageableObject<CarDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<CarDTO>>>(
    "/a/car-mng/list",
    params
  );
  return res.data;
};

/**
 * Lấy chi tiết xe
 */
export const getCarDetail = async (
  id: string
): Promise<ApiResponse<CarDTO>> => {
  const res = await http.get<ApiResponse<CarDTO>>(`/a/car-mng/detail?id=${id}`);
  return res.data;
};

/**
 * Tạo mới hoặc cập nhật xe
 */
export const saveCar = async (
  data: CarSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>("/a/car-mng/save", data);
  return res.data;
};

/**
 * Xóa xe
 */
export const deleteCar = async (id: string): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/car-mng/delete?id=${id}`
  );
  return res.data;
};

/**
 * Lấy tất cả xe
 */
export const getAllCars = async (): Promise<ApiResponse<CarDTO[]>> => {
  const res = await http.get<ApiResponse<CarDTO[]>>("/a/car-mng/all");
  return res.data;
};

/**
 * Upload ảnh xe
 */
export const uploadCarImage = async (
  carId: string,
  file: File
): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("carId", carId);
  formData.append("file", file);
  const res = await http.post<ApiResponse<string>>(
    "/a/car-mng/upload-image",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

/**
 * Lấy danh sách mẫu xe
 */
export const getCarModels = async (): Promise<ApiResponse<string[]>> => {
  const res = await http.get<ApiResponse<string[]>>("/a/car-mng/car-models");
  return res.data;
};

/**
 * Lấy danh sách loại xe
 */
export const getCarTypes = async (): Promise<ApiResponse<string[]>> => {
  const res = await http.get<ApiResponse<string[]>>("/a/car-mng/car-types");
  return res.data;
};

/**
 * Lấy danh sách tình trạng xe
 */
export const getCarConditions = async (): Promise<ApiResponse<string[]>> => {
  const res = await http.get<ApiResponse<string[]>>(
    "/a/car-mng/car-conditions"
  );
  return res.data;
};

/**
 * Lấy danh sách màu sắc xe
 */
export const getCarColors = async (): Promise<ApiResponse<string[]>> => {
  const res = await http.get<ApiResponse<string[]>>("/a/car-mng/car-colors");
  return res.data;
};

/**
 * Lấy danh sách trạng thái xe
 */
export const getCarStatuses = async (): Promise<
  ApiResponse<{ code: string; name: string }[]>
> => {
  const res = await http.get<ApiResponse<{ code: string; name: string }[]>>(
    "/a/car-mng/car-statuses"
  );
  return res.data;
};

/**
 * Tải xuống file Excel mẫu
 */
export const downloadCarTemplate = async (): Promise<Blob> => {
  const res = await http.get("/a/car-mng/download-template", {
    responseType: "blob",
  });
  return res.data;
};

/**
 * Import dữ liệu từ file Excel
 */
export const importCarExcel = async (
  file: File
): Promise<ApiResponse<CarImportResult>> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await http.post<ApiResponse<CarImportResult>>(
    "/a/car-mng/import-excel",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

/**
 * Export danh sách xe ra file Excel
 */
export const exportCarExcel = async (params: CarSearchDTO): Promise<Blob> => {
  const res = await http.post("/a/car-mng/export-excel", params, {
    responseType: "blob",
  });
  return res.data;
};
