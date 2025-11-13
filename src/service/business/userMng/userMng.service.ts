import http from "@/utils/http";
import {
  UserMngSearchDTO,
  UserMngListDTO,
  UserMngSaveDTO,
  ApiResponse,
  PageableObject,
} from "./userMng.type";

/**
 * Get Page User
 */
export const getPageUser = async (
  params: UserMngSearchDTO
): Promise<ApiResponse<PageableObject<UserMngListDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<UserMngListDTO>>>(
    "/a/user-mng/list",
    params
  );
  return res.data;
};

/**
 * Save User
 */
export const saveUser = async (
  data: UserMngSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/user-mng/save",
    data
  );
  return res.data;
};

/**
 * Detail User
 */
export const detailUser = async (
  id: string
): Promise<ApiResponse<UserMngSaveDTO>> => {
  const res = await http.get<ApiResponse<UserMngSaveDTO>>(
    `/a/user-mng/detail?id=${id}`
  );
  return res.data;
};

/**
 * Delete User
 */
export const deleteUser = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/user-mng/delete?id=${id}`
  );
  return res.data;
};

/**
 * Get Users by Branch
 */
export const getUsersByBranch = async (
  branchId: string
): Promise<ApiResponse<UserMngListDTO[]>> => {
  const res = await http.get<ApiResponse<UserMngListDTO[]>>(
    `/a/user-mng/by-branch?branchId=${branchId}`
  );
  return res.data;
};

/**
 * Get All Active Users
 */
export const getAllActiveUsers = async (): Promise<ApiResponse<UserMngListDTO[]>> => {
  const res = await http.get<ApiResponse<UserMngListDTO[]>>(
    "/a/user-mng/all-active"
  );
  return res.data;
};
