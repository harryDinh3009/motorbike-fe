import http from "@/utils/http";
import {
  ContractSearchDTO,
  ContractDTO,
  ApiResponse,
  ContractSaveDTO,
  PageableObject,
  ContractCarDTO,
  SurchargeDTO,
  SurchargeSaveDTO,
  PaymentTransactionDTO,
  PaymentTransactionSaveDTO,
  ContractDeliveryDTO,
  ContractReturnDTO,
  ContractCompleteDTO,
  UploadImageResponse,
  ContractCarCreateDTO,
  ContractCarUpdateDTO,
  ContractScheduleRequestDTO,
  ContractScheduleItemDTO,
  DeliveryPickupSearchDTO,
} from "./contractMng.type";

/**
 * Tìm kiếm hợp đồng với phân trang
 */
export const searchContracts = async (
  params: ContractSearchDTO
): Promise<ApiResponse<PageableObject<ContractDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<ContractDTO>>>(
    "/a/contract-mng/list",
    params
  );
  return res.data;
};

/**
 * Lấy chi tiết hợp đồng
 */
export const getContractDetail = async (
  id: string
): Promise<ApiResponse<ContractDTO>> => {
  const res = await http.get<ApiResponse<ContractDTO>>(
    `/a/contract-mng/detail/${id}`
  );
  return res.data;
};

/**
 * Tạo mới hoặc cập nhật hợp đồng
 */
export const saveContract = async (
  data: ContractSaveDTO
): Promise<ApiResponse<ContractDTO>> => {
  const res = await http.post<ApiResponse<ContractDTO>>(
    "/a/contract-mng/save",
    data
  );
  return res.data;
};

/**
 * Xóa hợp đồng
 */
export const deleteContract = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.put<ApiResponse<boolean>>(
    `/a/contract-mng/cancel/${id}`
  );
  return res.data;
};

/**
 * Lấy danh sách xe trong hợp đồng
 */
export const getContractCars = async (
  contractId: string
): Promise<ApiResponse<ContractCarDTO[]>> => {
  const res = await http.get<ApiResponse<ContractCarDTO[]>>(
    `/a/contract-mng/cars/${contractId}`
  );
  return res.data;
};

/**
 * Thêm phụ thu cho hợp đồng
 */
export const addSurcharge = async (
  data: SurchargeSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/contract-mng/surcharge/add",
    data
  );
  return res.data;
};

/**
 * Cập nhật phụ thu
 */
export const updateSurcharge = async (
  id: string,
  data: SurchargeSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.put<ApiResponse<boolean>>(
    `/a/contract-mng/surcharge/update/${id}`,
    data
  );
  return res.data;
};

/**
 * Xóa phụ thu
 */
export const deleteSurcharge = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/contract-mng/surcharge/delete/${id}`
  );
  return res.data;
};

/**
 * Lấy danh sách phụ thu theo hợp đồng
 */
export const getSurchargesByContractId = async (
  contractId: string
): Promise<ApiResponse<SurchargeDTO[]>> => {
  const res = await http.get<ApiResponse<SurchargeDTO[]>>(
    `/a/contract-mng/surcharge/list/${contractId}`
  );
  return res.data;
};

/**
 * Thêm thanh toán cho hợp đồng
 */
export const addPayment = async (
  data: PaymentTransactionSaveDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/contract-mng/payment/add",
    data
  );
  return res.data;
};

/**
 * Xóa thanh toán
 */
export const deletePayment = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/contract-mng/payment/delete/${id}`
  );
  return res.data;
};

/**
 * Lấy lịch sử thanh toán
 */
export const getPaymentHistory = async (
  contractId: string
): Promise<ApiResponse<PaymentTransactionDTO[]>> => {
  const res = await http.get<ApiResponse<PaymentTransactionDTO[]>>(
    `/a/contract-mng/payment/history/${contractId}`
  );
  return res.data;
};

/**
 * Cập nhật thông tin giao xe
 */
export const updateDelivery = async (
  data: ContractDeliveryDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/contract-mng/delivery/update",
    data
  );
  return res.data;
};

/**
 * Upload ảnh giao xe (nhiều ảnh)
 */
export const uploadDeliveryImages = async (
  contractId: string,
  files: File[]
): Promise<ApiResponse<UploadImageResponse>> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await http.post<ApiResponse<UploadImageResponse>>(
    `/a/contract-mng/delivery/upload-images/${contractId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

/**
 * Cập nhật thông tin nhận xe
 */
/**
 * Kiểm tra quyền trả xe
 */
export const checkReturnPermission = async (
  contractId: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.get<ApiResponse<boolean>>(
    `/a/contract-mng/return/check-permission/${contractId}`
  );
  return res.data;
};

/**
 * Kiểm tra quyền giao xe
 */
export const checkDeliveryPermission = async (
  contractId: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.get<ApiResponse<boolean>>(
    `/a/contract-mng/delivery/check-permission/${contractId}`
  );
  return res.data;
};

export const updateReturn = async (
  data: ContractReturnDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/contract-mng/return/update",
    data
  );
  return res.data;
};

/**
 * Upload ảnh nhận xe (nhiều ảnh)
 */
export const uploadReturnImages = async (
  contractId: string,
  files: File[]
): Promise<ApiResponse<UploadImageResponse>> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await http.post<ApiResponse<UploadImageResponse>>(
    `/a/contract-mng/return/upload-images/${contractId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

/**
 * Đóng hợp đồng (hoàn thành thanh toán)
 */
export const completeContract = async (
  data: ContractCompleteDTO
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
    "/a/contract-mng/complete",
    data
  );
  return res.data;
};

/**
 * Tải xuống file PDF hợp đồng
 */
export const downloadContractPDF = async (id: string): Promise<Blob> => {
  const res = await http.get(`/a/contract-mng/download-pdf/${id}`, {
    responseType: "blob",
  });
  return res.data;
};

/**
 * Xuất danh sách hợp đồng ra Excel
 */
export const exportContractsToExcel = async (
  params: ContractSearchDTO
): Promise<Blob> => {
  const res = await http.post("/a/contract-mng/export-excel", params, {
    responseType: "blob",
  });
  return res.data;
};

/**
 * Lấy danh sách trạng thái hợp đồng
 */
export const getContractStatuses = async (): Promise<
  ApiResponse<{ code: string; name: string }[]>
> => {
  const res = await http.get<ApiResponse<{ code: string; name: string }[]>>(
    "/a/contract-mng/contract-statuses"
  );
  return res.data;
};

/**
 * Thêm xe vào hợp đồng
 */
export const addContractCar = async (
  data: ContractCarCreateDTO
): Promise<ApiResponse<ContractCarDTO>> => {
  const res = await http.post<ApiResponse<ContractCarDTO>>(
    "/a/contract-mng/cars",
    data
  );
  return res.data;
};

/**
 * Cập nhật xe trong hợp đồng
 */
export const updateContractCar = async (
  id: string,
  data: ContractCarUpdateDTO
): Promise<ApiResponse<ContractCarDTO>> => {
  const res = await http.put<ApiResponse<ContractCarDTO>>(
    `/a/contract-mng/cars/${id}`,
    data
  );
  return res.data;
};

/**
 * Xóa xe khỏi hợp đồng
 */
export const deleteContractCar = async (
  id: string
): Promise<ApiResponse<boolean>> => {
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/contract-mng/cars/${id}`
  );
  return res.data;
};
/**
 * Báo cáo doanh thu theo tháng
 */
export interface MonthlyRevenueReportRequestDTO {
  year: number;
  branchId?: string;
}

export interface MonthlyRevenueRowDTO {
  month: number;
  contractCount: number;
  rentalAmount: number;
  surchargeAmount: number;
  discountAmount: number;
  revenue: number;
}

export const getMonthlyRevenueData = async (
  params: MonthlyRevenueReportRequestDTO
): Promise<ApiResponse<MonthlyRevenueRowDTO[]>> => {
  const res = await http.post<ApiResponse<MonthlyRevenueRowDTO[]>>(
    "/a/contract-mng/revenue/monthly-data",
    params
  );
  return res.data;
};

export const exportMonthlyRevenueReport = async (
  params: MonthlyRevenueReportRequestDTO
): Promise<Blob> => {
  const res = await http.post(
    "/a/contract-mng/revenue/monthly-report",
    params,
    {
      responseType: "blob",
    }
  );
  return res.data;
};

/**
 * Export biên nhận trả xe (PDF)
 */
export interface ContractReceiptRequestDTO {
  contractId: string;
}

export const exportContractReceipt = async (
  params: ContractReceiptRequestDTO
): Promise<Blob> => {
  const res = await http.post("/a/contract-mng/receipt/export", params, {
    responseType: "blob",
  });
  return res.data;
};

/**
 * Báo cáo doanh thu theo ngày
 */
export interface DailyRevenueReportRequestDTO {
  branchId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface DailyRevenueRowDTO {
  date: string;
  contractCount: number;
  rentalAmount: number;
  surchargeAmount: number;
  discountAmount: number;
  revenue: number;
}

export const getDailyRevenueData = async (
  params: DailyRevenueReportRequestDTO
): Promise<ApiResponse<DailyRevenueRowDTO[]>> => {
  const res = await http.post<ApiResponse<DailyRevenueRowDTO[]>>(
    "/a/contract-mng/revenue/daily-data",
    params
  );
  return res.data;
};

export const exportDailyRevenueReport = async (
  params: DailyRevenueReportRequestDTO
): Promise<Blob> => {
  const res = await http.post("/a/contract-mng/revenue/daily-report", params, {
    responseType: "blob",
  });
  return res.data;
};

/**
 * Thống kê lượt thuê theo mẫu xe
 */
export interface ModelRentalReportRequestDTO {
  branchId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface ModelRentalRowDTO {
  stt: number;
  modelName: string;
  rentalCount: number;
  rentalAmount: number;
}

export const getModelRentalData = async (
  params: ModelRentalReportRequestDTO
): Promise<ApiResponse<ModelRentalRowDTO[]>> => {
  const res = await http.post<ApiResponse<ModelRentalRowDTO[]>>(
    "/a/contract-mng/rental/model-data",
    params
  );
  return res.data;
};

export const exportModelRentalReport = async (
  params: ModelRentalReportRequestDTO
): Promise<Blob> => {
  const res = await http.post("/a/contract-mng/rental/model-report", params, {
    responseType: "blob",
  });
  return res.data;
};

/**
 * Lấy dữ liệu lịch đặt xe
 */
export const getContractSchedule = async (
  params: ContractScheduleRequestDTO
): Promise<ApiResponse<ContractScheduleItemDTO[]>> => {
  const res = await http.post<ApiResponse<ContractScheduleItemDTO[]>>(
    "/a/contract-mng/schedule",
    params
  );
  return res.data;
};

/**
 * Check availability của nhiều xe cùng lúc
 */
export interface CheckCarsAvailabilityDTO {
  carIds: string[];
  startDate: string;
  endDate: string;
  excludeContractId?: string;
}

export const checkCarsAvailability = async (
  params: CheckCarsAvailabilityDTO
): Promise<ApiResponse<Record<string, boolean>>> => {
  const res = await http.post<ApiResponse<Record<string, boolean>>>(
    "/a/contract-mng/check-cars-availability",
    params
  );
  return res.data;
};

/**
 * Tìm kiếm hợp đồng chờ giao xe (tối ưu)
 */
export const searchDeliveryContracts = async (
  params: DeliveryPickupSearchDTO
): Promise<ApiResponse<PageableObject<ContractDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<ContractDTO>>>(
    "/a/contract-mng/delivery/list",
    params
  );
  return res.data;
};

/**
 * Tìm kiếm hợp đồng chờ nhận xe (tối ưu)
 */
export const searchPickupContracts = async (
  params: DeliveryPickupSearchDTO
): Promise<ApiResponse<PageableObject<ContractDTO>>> => {
  const res = await http.post<ApiResponse<PageableObject<ContractDTO>>>(
    "/a/contract-mng/pickup/list",
    params
  );
  return res.data;
};