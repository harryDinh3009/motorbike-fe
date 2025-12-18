import { getUserInfo } from "./storage";

export interface UserRole {
  rlId: number;
  rlCd: string;
  rlNm: string;
  category: string;
}

export const getUserRoles = (): UserRole[] => {
  const userInfoStr = getUserInfo();
  if (!userInfoStr) return [];
  
  try {
    const userInfo = JSON.parse(userInfoStr);
    // Lấy roles từ userCurrent.roles
    return userInfo.userCurrent?.roles || [];
  } catch {
    return [];
  }
};

export const hasRole = (roleCode: string): boolean => {
  const roles = getUserRoles();
  return roles.some(role => role.rlCd === roleCode) || isAdmin();
};

export const isAdmin = (): boolean => {
  const roles = getUserRoles();
  return roles.some(role => role.rlCd === "ADMIN");
};

export const isEmployee = (): boolean => {
  return hasRole("EMPLOYEE");
};

// Các hàm kiểm tra quyền cụ thể
export const canManageBrand = (): boolean => {
  return isAdmin() || isEmployee();
};

export const canManageCarModel = (): boolean => {
  return isAdmin() || isEmployee();
};

export const canManageEmployee = (): boolean => {
  return isAdmin();
};

export const canManageBranch = (): boolean => {
  return isAdmin();
};

