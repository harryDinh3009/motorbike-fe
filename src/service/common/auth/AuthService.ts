import http from "@/utils/http";

export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
}

/**
 * Login Admin Basic
 * @param data LoginRequestDTO
 * @returns ApiResponse<LoginResponseDTO>
 */
export const loginBasicAdmin = async (data: LoginRequestDTO) => {
  const res = await http.post("/auth/login/a/b", data);
  return res.data;
};
