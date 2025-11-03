import http from "@/utils/http";
import {
  SurchargeTypeSearchDTO,
  SurchargeTypeDTO,
  SurchargeTypeSaveDTO,
  ApiResponse,
  PageableObject,
} from "./surchargeTypeMng.type";

/**
 * Tìm kiếm danh sách phụ thu với phân trang
 */
export const searchSurchargeTypes = async (
  params: SurchargeTypeSearchDTO
): Promise<ApiResponse<PageableObject<SurchargeTypeDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<SurchargeTypeDTO>>>(
    "/a/surcharge-type-mng/list",
    params
  );
  return res.data;
};

/**
 * Lấy chi tiết một phụ thu
 */
export const getSurchargeTypeDetail = async (
  id: string
): Promise<ApiResponse<SurchargeTypeDTO>> => {
  const res = await http.get<ApiResponse<SurchargeTypeDTO>>(
    `/a/surcharge-type-mng/detail/${id}`
  );
  return res.data;
};

/**
 * Thêm mới hoặc cập nhật phụ thu
 */
export const saveSurchargeType = async (
  data: SurchargeTypeSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/surcharge-type-mng/save",
    data
  );
  return res.data;
};

/**
 * Xóa phụ thu
 */
export const deleteSurchargeType = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/surcharge-type-mng/delete/${id}`
  );
  return res.data;
};

/**
 * Lấy tất cả phụ thu đang active
 */
export const getAllActiveSurchargeTypes = async (): Promise<ApiResponse<SurchargeTypeDTO[]>> => {
  const res = await http.get<ApiResponse<SurchargeTypeDTO[]>>(
    "/a/surcharge-type-mng/all-active"
  );
  return res.data;
};
