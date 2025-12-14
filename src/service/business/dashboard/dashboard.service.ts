import http from "@/utils/http";
import { DashboardResponseDTO, DashboardRevenueChartDTO } from "./dashboard.type";
import { ApiResponse } from "@/service/business/contractMng/contractMng.type";

export const getDashboard = async (branchId?: string): Promise<ApiResponse<DashboardResponseDTO>> => {
  const res = await http.get<ApiResponse<DashboardResponseDTO>>(
    "/a/dashboard" + (branchId ? `?branchId=${branchId}` : "")
  );
  return res.data;
};

export const getRevenueChart = async (
  branchId?: string,
  period: "7" | "30" | "year" = "30"
): Promise<ApiResponse<DashboardRevenueChartDTO>> => {
  const params = new URLSearchParams();
  if (branchId) params.append("branchId", branchId);
  params.append("period", period);
  
  const res = await http.get<ApiResponse<DashboardRevenueChartDTO>>(
    `/a/dashboard/revenue-chart?${params.toString()}`
  );
  return res.data;
};
