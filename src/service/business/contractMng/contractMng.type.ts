export interface ContractSearchDTO {
  keyword?: string;
  startDateFrom?: Date; // ISO string
  startDateTo?: Date; // ISO string
  endDateFrom?: Date; // ISO string
  endDateTo?: Date; // ISO string
  pickupBranchId?: string;
  returnBranchId?: string;
  status?: string;
  source?: string;
  page?: number;
  size?: number;
}

/**
 * DTO tìm kiếm hợp đồng giao/nhận xe (tối ưu)
 */
export interface DeliveryPickupSearchDTO {
  keyword?: string;
  branchId?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  status?: string;    // "all" | "delivered"/"received" | "not_delivered"/"not_received"
  page?: number;
  size?: number;
}

export interface ContractCarDTO {
  id: string;
  contractId: string;
  carId: string;
  carModel: string;
  carType: string;
  licensePlate: string;
  dailyPrice?: number;
  hourlyPrice?: number;
  totalAmount?: number;
  startOdometer?: number;
  endOdometer?: number;
  currentOdometer?: number; // Odometer hiện tại của xe từ bảng car
  returnStatus?: string; // Trạng thái xe khi trả
  notes?: string;
}

export interface SurchargeDTO {
  id: string;
  contractId: string;
  surchargeTypeId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  notes?: string;
}

export interface PaymentTransactionDTO {
  id: string;
  transactionCode: string;
  contractId: string;
  paymentMethod?: string;
  amount?: number;
  paymentDate?: string;
  userId?: string;
  userName?: string;
  notes?: string;
  status?: string;
}

export interface ContractImageDTO {
  id: string;
  contractId: string;
  imageType: "DELIVERY" | "RETURN";
  imageUrl: string;
  displayOrder?: number;
  notes?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export type ContractStatus =
  | "CONFIRMED"
  | "DELIVERED"
  | "RETURNED"
  | "COMPLETED"
  | "CANCELLED";

export interface ContractCarSaveDTO {
  id?: string;
  carId: string;
  dailyPrice?: number;
  hourlyPrice?: number;
  totalAmount?: number;
  startOdometer?: number;
  endOdometer?: number;
  notes?: string;
  status?: string; // Thêm dòng này
}

export interface SurchargeSaveDTO {
  id?: string;
  contractId?: string;
  surchargeTypeId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  notes?: string;
}

export interface ContractSaveDTO {
  id?: string;
  customerId: string;
  source?: string;
  startDate: string;
  endDate: string;
  pickupBranchId?: string;
  returnBranchId?: string;
  pickupAddress?: string;
  returnAddress?: string;
  needPickupDelivery?: boolean;
  needReturnDelivery?: boolean;
  notes?: string;
  cars: ContractCarSaveDTO[];
  surcharges?: SurchargeSaveDTO[];
  discountType?: "PERCENTAGE" | "AMOUNT";
  discountValue?: number;
  depositAmount?: number;
  status?: ContractStatus;
}

export interface ContractDTO {
  // Basic Info
  id: string;
  contractCode: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  country?: string;
  citizenId?: string;
  customerAddress?: string;
  customerDateOfBirth?: string; // ISO string
  citizenIdIssuedDate?: string; // ISO string
  totalContracts?: number;

  // Contract Info
  source?: string;
  startDate?: string;
  endDate?: string;
  pickupBranchId?: string;
  pickupBranchName?: string;
  returnBranchId?: string;
  returnBranchName?: string;
  pickupAddress?: string;
  returnAddress?: string;
  needPickupDelivery?: boolean;
  needReturnDelivery?: boolean;
  notes?: string;
  createdDate?: string;

  // Financial Info
  totalRentalAmount?: number;
  totalSurcharge?: number;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  depositAmount?: number;
  finalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;

  // Status
  status?: ContractStatus;
  statusNm?: string;

  // Delivery & Return Info
  deliveryUserId?: string;
  deliveryUserName?: string;
  deliveryTime?: string;
  returnUserId?: string;
  returnUserName?: string;
  returnTime?: string;
  completedDate?: string;

  // Relationships
  cars?: ContractCarDTO[];
  surcharges?: SurchargeDTO[];
  payments?: PaymentTransactionDTO[];
  deliveryImages?: ContractImageDTO[];
  returnImages?: ContractImageDTO[];
}

export interface PageableObject<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ContractDeliveryDTO {
  contractId: string;
  cars: ContractCarSaveDTO[];
  surcharges?: SurchargeSaveDTO[];
  deliveryUserId: string;
  deliveryTime: string;
  pickupAddress?: string;
  updateRentalInfo?: boolean;
  newStartDate?: string;
  newEndDate?: string;
  newTotalAmount?: number;
}

export interface ContractReturnDTO {
  contractId: string;
  cars: ContractCarSaveDTO[];
  surcharges?: SurchargeSaveDTO[];
  returnUserId: string;
  returnTime: string;
  returnAddress?: string;
  updateRentalInfo?: boolean;
  newStartDate?: string;
  newEndDate?: string;
  newTotalAmount?: number;
}

export interface ContractCompleteDTO {
  contractId: string;
  completedDate: string;
  finalPaymentAmount?: number;
  paymentMethod?: string;
  paymentNotes?: string;
}

export interface PaymentTransactionSaveDTO {
  id?: string;
  contractId: string;
  paymentMethod: string;
  amount: number;
  paymentDate: string;
  userId?: string;
  notes?: string;
}

export interface UploadImageResponse {
  count: number;
  imageUrls: string[];
  message: string;
}

export interface ContractCarCreateDTO {
  contractId: string;
  carId: string;
  dailyPrice?: number;
  hourlyPrice?: number;
  totalAmount: number;
  startOdometer?: number;
  endOdometer?: number;
  notes?: string;
}

export interface ContractCarUpdateDTO {
  carId: string;
  dailyPrice?: number;
  hourlyPrice?: number;
  totalAmount?: number;
  startOdometer?: number;
  endOdometer?: number;
  notes?: string;
}

/**
 * Lịch đặt xe - Schedule
 */
export interface ContractScheduleRequestDTO {
  /**
   * ID chi nhánh thuê xe (null hoặc empty = tất cả chi nhánh)
   */
  branchId?: string | null;
  
  /**
   * Trạng thái hợp đồng (null hoặc empty = tất cả trạng thái)
   * CONFIRMED, DELIVERED, RETURNED, COMPLETED, CANCELLED
   */
  status?: string | null;
  
  /**
   * Ngày bắt đầu (đầu tháng) - format: YYYY-MM-DD
   */
  startDate: string;
  
  /**
   * Ngày kết thúc (cuối tháng) - format: YYYY-MM-DD
   */
  endDate: string;
}

export interface ContractScheduleItemDTO {
  /**
   * ID của contract_car (bản ghi xe trong hợp đồng)
   */
  contractCarId: string;
  
  /**
   * ID hợp đồng
   */
  contractId: string;
  
  /**
   * Mã hợp đồng (ví dụ: HD000123)
   */
  contractCode: string;
  
  /**
   * ID xe
   */
  carId: string;
  
  /**
   * Mẫu xe
   */
  carModel: string;
  
  /**
   * Biển số xe
   */
  licensePlate: string;
  
  /**
   * Tên khách hàng
   */
  customerName: string;
  
  /**
   * Số điện thoại khách hàng
   */
  customerPhone: string;
  
  /**
   * Ngày giờ bắt đầu thuê - format: yyyy-MM-dd HH:mm:ss
   */
  startDate: string;
  
  /**
   * Ngày giờ kết thúc thuê - format: yyyy-MM-dd HH:mm:ss
   */
  endDate: string;
  
  /**
   * Trạng thái hợp đồng
   */
  status: string;
  
  /**
   * ID chi nhánh nhận xe
   */
  pickupBranchId: string;
}