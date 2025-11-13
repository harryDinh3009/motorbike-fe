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
): Promise<ApiResponse<boolean>> => {
  const res = await http.post<ApiResponse<boolean>>(
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
  const res = await http.delete<ApiResponse<boolean>>(
    `/a/contract-mng/delete/${id}`
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
export const downloadContractPDF = async (
  id: string
): Promise<Blob> => {
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
