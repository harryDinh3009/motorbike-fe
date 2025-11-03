import http from "@/utils/http";
import {
  BranchSearchDTO,
  BranchDTO,
  BranchSaveDTO,
  ApiResponse,
  PageableObject,
} from "./branchMng.type";

/**
 * Tìm kiếm chi nhánh với phân trang
 */
export const searchBranches = async (
  params: BranchSearchDTO
): Promise<ApiResponse<PageableObject<BranchDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<BranchDTO>>>(
    "/a/branch-mng/list",
    params
  );
  return res.data;
};

/**
 * Lấy chi tiết chi nhánh
 */
export const getBranchDetail = async (
  id: string
): Promise<ApiResponse<BranchDTO>> => {
  const res = await http.get<ApiResponse<BranchDTO>>(
    `/a/branch-mng/detail?id=${id}`
  );
  return res.data;
};

/**
 * Tạo mới hoặc cập nhật chi nhánh
 */
export const saveBranch = async (
  data: BranchSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/branch-mng/save",
    data
  );
  return res.data;
};

/**
 * Xóa chi nhánh
 */
export const deleteBranch = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/branch-mng/delete?id=${id}`
  );
  return res.data;
};

/**
 * Lấy tất cả chi nhánh đang hoạt động
 */
export const getAllActiveBranches = async (): Promise<ApiResponse<BranchDTO[]>> => {
  const res = await http.get<ApiResponse<BranchDTO[]>>("/a/branch-mng/active-list");
  return res.data;
};
