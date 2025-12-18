import http from "@/utils/http";

export interface UserCurrentRoleDTO {
  rlId: number;
  rlCd: string;
  rlNm: string;
  category: string;
}

export interface UserCurrentInfoDTO {
  id: string;
  email: string;
  fullName: string;
  userName: string;
  roles: UserCurrentRoleDTO[];
  branchId?: string;
  avatar?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  status?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const getUserCurrentInfo = async (): Promise<ApiResponse<UserCurrentInfoDTO>> => {
  const res = await http.get("/cmn/user/current");
  return res.data;
};

