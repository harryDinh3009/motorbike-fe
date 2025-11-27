import http from "@/utils/http";
import { DashboardResponseDTO } from "./dashboard.type";
import { ApiResponse } from "@/service/business/contractMng/contractMng.type";

export const getDashboard = async (branchId?: string): Promise<ApiResponse<DashboardResponseDTO>> => {
  const res = await http.get<ApiResponse<DashboardResponseDTO>>(
    "/a/dashboard" + (branchId ? `?branchId=${branchId}` : "")
  );
  return res.data;
};
