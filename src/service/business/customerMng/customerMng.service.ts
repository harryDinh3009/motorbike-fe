import http from "@/utils/http";
import {
  CustomerSearchDTO,
  CustomerDTO,
  CustomerSaveDTO,
  ApiResponse,
  PageableObject,
} from "./customerMng.type";

/**
 * Tìm kiếm khách hàng với phân trang
 */
export const searchCustomers = async (
  params: CustomerSearchDTO
): Promise<ApiResponse<PageableObject<CustomerDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<CustomerDTO>>>(
    "/a/customer-mng/list",
    params
  );
  return res.data;
};

/**
 * Lấy chi tiết khách hàng
 */
export const getCustomerDetail = async (
  id: string
): Promise<ApiResponse<CustomerDTO>> => {
  const res = await http.get<ApiResponse<CustomerDTO>>(
    `/a/customer-mng/detail?id=${id}`
  );
  return res.data;
};

/**
 * Tạo mới hoặc cập nhật khách hàng
 */
export const saveCustomer = async (
  data: CustomerSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/customer-mng/save",
    data
  );
  return res.data;
};

/**
 * Xóa khách hàng
 */
export const deleteCustomer = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/customer-mng/delete?id=${id}`
  );
  return res.data;
};

/**
 * Lấy tất cả khách hàng
 */
export const getAllCustomers = async (): Promise<ApiResponse<CustomerDTO[]>> => {
  const res = await http.get<ApiResponse<CustomerDTO[]>>("/a/customer-mng/all");
  return res.data;
};

/**
 * Upload ảnh CCCD/CMND cho khách hàng
 */
export const uploadCitizenIdImage = async (
  customerId: string,
  file: File
): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("customerId", customerId);
  formData.append("file", file);
  const res = await http.post<ApiResponse<string>>(
    "/a/customer-mng/upload-citizen-id",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

/**
 * Upload ảnh bằng lái xe cho khách hàng
 */
export const uploadDriverLicenseImage = async (
  customerId: string,
  file: File
): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("customerId", customerId);
  formData.append("file", file);
  const res = await http.post<ApiResponse<string>>(
    "/a/customer-mng/upload-driver-license",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

/**
 * Upload ảnh hộ chiếu cho khách hàng
 */
export const uploadPassportImage = async (
  customerId: string,
  file: File
): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("customerId", customerId);
  formData.append("file", file);
  const res = await http.post<ApiResponse<string>>(
    "/a/customer-mng/upload-passport",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};
