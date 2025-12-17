import http from "@/utils/http";
import {
  BrandSearchDTO,
  BrandDTO,
  BrandSaveDTO,
  ApiResponse,
  PageableObject,
} from "./brandMng.type";

/**
 * Tìm kiếm hãng xe với phân trang
 */
export const searchBrands = async (
  params: BrandSearchDTO
): Promise<ApiResponse<PageableObject<BrandDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<BrandDTO>>>(
    "/a/brand-mng/list",
    params
  );
  return res.data;
};

/**
 * Lấy chi tiết hãng xe
 */
export const getBrandDetail = async (
  id: string
): Promise<ApiResponse<BrandDTO>> => {
  const res = await http.get<ApiResponse<BrandDTO>>(
    `/a/brand-mng/detail?id=${id}`
  );
  return res.data;
};

/**
 * Tạo mới hoặc cập nhật hãng xe
 */
export const saveBrand = async (
  data: BrandSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/brand-mng/save",
    data
  );
  return res.data;
};

/**
 * Xóa hãng xe
 */
export const deleteBrand = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/brand-mng/delete?id=${id}`
  );
  return res.data;
};

/**
 * Lấy tất cả hãng xe
 */
export const getAllBrands = async (): Promise<ApiResponse<BrandDTO[]>> => {
  const res = await http.get<ApiResponse<BrandDTO[]>>("/a/brand-mng/all");
  return res.data;
};

