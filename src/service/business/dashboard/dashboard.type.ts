export interface DashboardRevenueBlockDTO {
  contractAmount: number;
  rentalAmount: number;
  surchargeAmount: number;
  totalAmount: number;
}

export interface DashboardRevenueOverviewDTO {
  today: DashboardRevenueBlockDTO;
  thisMonth: DashboardRevenueBlockDTO;
  lastMonth: DashboardRevenueBlockDTO;
}

export interface DashboardPerformanceDTO {
  totalContracts: number;
  totalCars: number;
  totalRevenue: number;
}

export interface DashboardDailyRevenueDTO {
  date: string; // ISO date string
  contractAmount: number;
  rentalAmount: number;
  surchargeAmount: number;
  totalAmount: number;
}

export interface TopCarDTO {
  rank: number;
  model: string;
  rentalCount: number;
  revenue: number;
}

export interface DashboardResponseDTO {
  performance: DashboardPerformanceDTO;
  revenueOverview: DashboardRevenueOverviewDTO;
  dailyRevenue: DashboardDailyRevenueDTO[];
  topCars?: TopCarDTO[];
}
