import React, { useEffect, useRef, useState } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import { getDashboard, getRevenueChart } from "@/service/business/dashboard/dashboard.service";
import { getAllActiveBranches, getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";
import {
  DashboardResponseDTO,
  DashboardRevenueChartDTO,
  TopCarDTO,
} from "@/service/business/dashboard/dashboard.type";
import { BranchDTO } from "@/service/business/branchMng/branchMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import BarChartBase from "@/component/common/chart/BarChartBase";
import TableBase from "@/component/common/table/TableBase";
import type { ColumnsType } from "antd/es/table";
import "../../assets/css/dl_layout.css";
import "../../assets/css/dl_custom.css";
import "./dashboard-new.css";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatAsCurrency?: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1200,
  formatAsCurrency = false,
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    let start = 0;
    const end = value || 0;
    const step = Math.max(1, Math.floor(end / (duration / 16)));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  const format = (val: number) =>
    formatAsCurrency
      ? val.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : val.toLocaleString("vi-VN");

  return <span>{format(count)}</span>;
};

const DashboardNew: React.FC = () => {
  const pageTitle = "Dashboard";
  const [dashboard, setDashboard] = useState<DashboardResponseDTO | null>(null);
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [branchId, setBranchId] = useState<string>(""); // "" = tất cả chi nhánh
  const [loading, setLoading] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState<"7" | "30" | "year">("30");
  const [revenueChartData, setRevenueChartData] = useState<DashboardRevenueChartDTO | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    // Lấy danh sách chi nhánh và branch của user hiện tại
    Promise.all([
      getAllActiveBranches(),
      getBranchByCurrentUser(),
    ]).then(([branchesRes, currentBranchRes]) => {
      const branchesList = [
        {
          id: "",
          name: "Tất cả chi nhánh",
          phoneNumber: "",
          address: "",
          status: 1,
        },
        ...(branchesRes.data || []),
      ];
      setBranches(branchesList);
      
      // Set giá trị mặc định là branch của user hiện tại
      if (currentBranchRes.data?.id) {
        setBranchId(currentBranchRes.data.id);
      } else {
        // Nếu user không có branch, mặc định là "Tất cả chi nhánh"
        setBranchId("");
      }
    }).catch(() => {
      // Nếu có lỗi, vẫn load danh sách branches và set mặc định "Tất cả chi nhánh"
      getAllActiveBranches().then((res) => {
        setBranches([
          {
            id: "",
            name: "Tất cả chi nhánh",
            phoneNumber: "",
            address: "",
            status: 1,
          },
          ...(res.data || []),
        ]);
        setBranchId("");
      });
    });
  }, []);

  useEffect(() => {
    // Chỉ gọi API khi đã có danh sách branches (để đảm bảo branchId đã được set)
    if (branches.length === 0) {
      return;
    }
    
    setLoading(true);
    // Khi chọn "Tất cả chi nhánh" (branchId = ""), gửi undefined để backend lấy tất cả
    // Khi chọn một chi nhánh cụ thể, gửi branchId đó
    const branchIdToSend = branchId === "" ? undefined : branchId;
    getDashboard(branchIdToSend)
      .then((res) => {
        setDashboard(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [branchId, branches.length]);

  // Load revenue chart data
  useEffect(() => {
    if (branches.length === 0) return;
    
    setChartLoading(true);
    const branchIdToSend = branchId === "" ? undefined : branchId;
    getRevenueChart(branchIdToSend, revenuePeriod)
      .then((res) => {
        setRevenueChartData(res.data);
        setChartLoading(false);
      })
      .catch(() => setChartLoading(false));
  }, [branchId, branches.length, revenuePeriod]);

  const kpiData = dashboard?.performance;


  // Prepare chart data
  const chartData = revenueChartData ? {
    labels: revenueChartData.data.map(d => d.label),
    datasets: [{
      label: "Doanh thu",
      data: revenueChartData.data.map(d => d.revenue),
      backgroundColor: "#10b981",
      borderColor: "#10b981",
      borderRadius: 6,
    }]
  } : null;

  // Table columns cho Top 5 xe
  const topCarColumns: ColumnsType<TopCarDTO> = [
    {
      title: "STT",
      dataIndex: "rank",
      key: "rank",
      width: 60,
      align: "center",
    },
    {
      title: "Mẫu xe",
      dataIndex: "model",
      key: "model",
      ellipsis: true,
    },
    {
      title: "Số lượt thuê",
      dataIndex: "rentalCount",
      key: "rentalCount",
      width: 120,
      align: "right",
      render: (value: number) => value?.toLocaleString("vi-VN") || "0",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      width: 150,
      align: "right",
      render: (value: number) => 
        value ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "0 đ",
    },
  ];

  return (
    <div className="content_wrap dashboard-new-page">
      <div id="content" className="grid_content dashboard-new-grid">
        {/* Header với filter chi nhánh */}
        <div className="dashboard-new-header">
          <div>
            <h1 className="dashboard-new-title">{pageTitle}</h1>
            <p style={{ margin: "8px 0 0 0", fontSize: "16px", color: "#585d72", fontWeight: 400 }}>
              Cùng nhìn lại tình hình kinh doanh tháng này!
            </p>
          </div>
          <div className="dashboard-new-filter">
            <label htmlFor="branch-select" className="filter-label">
              Chi nhánh:
            </label>
            <select
              id="branch-select"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="branch-select"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <LoadingIndicator />}

        {/* 4 KPI Cards */}
        <div className="dashboard-kpi-row">
          {/* KPI 1: Số hợp đồng hoàn thành */}
          <div className="kpi-card kpi-card-blue">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Số hợp đồng hoàn thành</div>
              <div className="kpi-value">
                <AnimatedCounter value={kpiData?.completedContracts || 0} />
              </div>
            </div>
          </div>

          {/* KPI 2: Doanh thu */}
          <div className="kpi-card kpi-card-green">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Doanh thu</div>
              <div className="kpi-value">
                <AnimatedCounter 
                  value={kpiData?.totalRevenue || 0} 
                  formatAsCurrency 
                />
              </div>
            </div>
          </div>

          {/* KPI 3: Số xe cho thuê */}
          <div className="kpi-card kpi-card-purple">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 17H16M8 17C8 18.6569 6.65685 20 5 20C3.34315 20 2 18.6569 2 17C2 15.3431 3.34315 14 5 14C6.65685 14 8 15.3431 8 17ZM22 17C22 18.6569 20.6569 20 19 20C17.3431 20 16 18.6569 16 17C16 15.3431 17.3431 14 19 14C20.6569 14 22 15.3431 22 17ZM8 17L16 17M8 17L8 7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Số xe cho thuê</div>
              <div className="kpi-value">
                <AnimatedCounter value={kpiData?.totalCars || 0} />
              </div>
            </div>
          </div>

          {/* KPI 4: Số khách hàng mới */}
          <div className="kpi-card kpi-card-orange">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Khách hàng mới</div>
              <div className="kpi-value">
                <AnimatedCounter value={kpiData?.newCustomers || 0} />
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="dashboard-chart-section">
          <div className="revenue-chart-container">
            <div className="chart-header">
              <h2 className="chart-title">Báo cáo doanh thu</h2>
              <div className="chart-filters">
                <button
                  className={`filter-btn ${revenuePeriod === "7" ? "active" : ""}`}
                  onClick={() => setRevenuePeriod("7")}
                >
                  7 ngày qua
                </button>
                <button
                  className={`filter-btn ${revenuePeriod === "30" ? "active" : ""}`}
                  onClick={() => setRevenuePeriod("30")}
                >
                  30 ngày qua
                </button>
                <button
                  className={`filter-btn ${revenuePeriod === "year" ? "active" : ""}`}
                  onClick={() => setRevenuePeriod("year")}
                >
                  Năm qua
                </button>
              </div>
            </div>
            <div className="chart-content">
              {chartLoading && <LoadingIndicator />}
              {chartData && !chartLoading && (
                <BarChartBase
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "x",
                    layout: {
                      padding: {
                        right: 0
                      }
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context: any) => {
                            return new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(context.parsed.y);
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 0
                        }
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          display: true
                        },
                        ticks: {
                          callback: (value: any) => {
                            return new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                              notation: 'compact'
                            }).format(value);
                          }
                        }
                      }
                    }
                  }}
                  height={400}
                />
              )}
            </div>
          </div>
          {/* Bảng Top 5 xe bên cạnh chart */}
          <div className="dashboard-right-section">
            <div className="contract-table-card">
              <div className="table-header">
                <h3 className="table-title">Top 10 mẫu xe thuê nhiều nhất</h3>
              </div>
              <div className="table-content">
                {loading && <LoadingIndicator />}
                {!loading && (!dashboard?.topCars || dashboard.topCars.length === 0) && (
                  <div style={{ padding: "40px", textAlign: "center", color: "#898d9c" }}>
                    Không có dữ liệu
                  </div>
                )}
                {!loading && dashboard?.topCars && dashboard.topCars.length > 0 && (
                  <TableBase
                    columns={topCarColumns}
                    data={dashboard.topCars.map((car) => ({
                      key: car.rank,
                      rank: car.rank,
                      model: car.model,
                      rentalCount: car.rentalCount || 0,
                      revenue: car.revenue || 0,
                    }))}
                    paginationType="FE"
                    pageSize={10}
                    scroll={{ y: 500, x: 'max-content' }}
                    size="small"
                    hidePagination={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;

