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
  completedContracts: number; // Số hợp đồng hoàn thành (theo completed_date)
  totalRevenue: number; // Doanh thu (theo completed_date, = rental + surcharge - discount)
  totalCars: number; // Số xe cho thuê (theo start_date, status <> CANCELLED)
  newCustomers: number; // Số khách hàng mới (theo created_date)
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

export interface ChartDataPointDTO {
  label: string;
  revenue: number;
}

export interface DashboardRevenueChartDTO {
  period: "7" | "30" | "year";
  data: ChartDataPointDTO[];
}
