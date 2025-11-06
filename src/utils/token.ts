import { ACCESS_TOKEN } from "@/constants/common.const";
import { jwtDecode } from "jwt-decode";

export const getToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decodedToken: { exp?: number } = jwtDecode(token);
    if (decodedToken.exp === undefined) {
      return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  } catch (error) {
    return true;
  }
};
