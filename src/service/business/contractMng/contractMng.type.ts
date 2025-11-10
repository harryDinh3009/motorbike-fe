export interface ContractSearchDTO {
  keyword?: string;
  startDateFrom?: string; // ISO string
  startDateTo?: string; // ISO string
  pickupBranchId?: string;
  returnBranchId?: string;
  status?: string;
  source?: string;
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
  notes?: string;
}

export interface SurchargeDTO {
  id: string;
  contractId: string;
  description?: string;
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
  description?: string;
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
  createdDate?: string; // Thêm dòng này nếu chưa có

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
