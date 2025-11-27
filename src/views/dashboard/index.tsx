import React, { useEffect, useRef, useState } from "react";
import DefaultLayout from "../../layouts/DefaultLayout";
import ButtonBase from "../../component/common/button/ButtonBase";
import TableBase from "../../component/common/table/TableBase";
import BarChartBase from "../../component/common/chart/BarChartBase";
import type { ColumnsType } from "antd/es/table";
import "../../assets/css/dl_layout.css";
import "../../assets/css/dl_custom.css";
import "./dashboard.css";
import { HomeOutlined } from "@ant-design/icons";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import { getDashboard } from "@/service/business/dashboard/dashboard.service";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import {
  DashboardResponseDTO,
  TopCarDTO,
} from "@/service/business/dashboard/dashboard.type";
import { BranchDTO } from "@/service/business/branchMng/branchMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";

const tableColumns: ColumnsType<{
  stt: number;
  model: string;
  count: number;
  revenue: string;
}> = [
  { title: "STT", dataIndex: "stt", key: "stt", width: 60, align: "center" },
  { title: "Mẫu xe", dataIndex: "model", key: "model" },
  { title: "Số lượt thuê", dataIndex: "count", key: "count", align: "center" },
  {
    title: "Doanh thu mang lại",
    dataIndex: "revenue",
    key: "revenue",
    align: "right",
  },
];

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

const Dashboard: React.FC = () => {
  const pageTitle = "Thống kê / Báo cáo";
  const [dashboard, setDashboard] = useState<DashboardResponseDTO | null>(null);
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [branchId, setBranchId] = useState<string>(""); // "" = tất cả chi nhánh
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    getDashboard(branchId)
      .then((res) => {
        setDashboard(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [branchId]);

  // Chart data
  const chartData = {
    labels: (dashboard?.dailyRevenue || []).map((d) =>
      d.date
        ? new Date(d.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          })
        : ""
    ),
    datasets: [
      {
        label: "Doanh thu",
        data: (dashboard?.dailyRevenue || []).map((d) => d.totalAmount || 0),
        backgroundColor: "#53CEC7",
      },
    ],
  };

  // Top 5 xe thuê nhiều nhất
  const topCars: TopCarDTO[] = dashboard?.topCars || [];

  return (
    <div className="content_wrap dashboard-page">
      <div id="content" className="grid_content dashboard-grid">
        <BreadcrumbBase title={pageTitle} items={[]} />
        {/* Filter chi nhánh */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            style={{
              minWidth: 180,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #eee",
              fontSize: 16,
              fontWeight: 500,
              background: "#fff",
            }}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        {loading && <LoadingIndicator />}
        {/* ========== Chỉ số hiệu suất ========== */}
        <div className="dashboard-section box_section dashboard-performance">
          <div className="dashboard-row">
            <div className="box_title_custom" style={{ fontSize: "2.6rem" }}>
              Chỉ số hiệu suất
            </div>
          </div>
          <div className="dashboard-performance__grid">
            <div className="dashboard-performance__card">
              <div
                className="dashboard-performance__label"
                style={{ marginBottom: "16px", fontSize: "1.7rem" }}
              >
                Số hợp đồng
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  className="dashboard-performance__value"
                  style={{ marginBottom: "10px", fontSize: "3.6rem" }}
                >
                  <AnimatedCounter
                    value={dashboard?.performance?.totalContracts || 0}
                  />
                </div>
              </div>
            </div>
            <div className="dashboard-performance__card">
              <div
                className="dashboard-performance__label"
                style={{ marginBottom: "16px", fontSize: "1.7rem" }}
              >
                Số xe đã thuê
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  className="dashboard-performance__value"
                  style={{ marginBottom: "10px", fontSize: "3.6rem" }}
                >
                  <AnimatedCounter
                    value={dashboard?.performance?.totalCars || 0}
                  />
                </div>
              </div>
            </div>
            <div className="dashboard-performance__card">
              <div
                className="dashboard-performance__label"
                style={{ marginBottom: "16px", fontSize: "1.7rem" }}
              >
                Tổng doanh thu
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  className="dashboard-performance__value"
                  style={{ marginBottom: "10px", fontSize: "3.6rem" }}
                >
                  <AnimatedCounter
                    value={dashboard?.performance?.totalRevenue || 0}
                    formatAsCurrency
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ========== Tổng quan doanh thu ========== */}
        <div className="dashboard-section box_section dashboard-revenue">
          <div className="dashboard-row">
            <div className="box_title_custom">Tổng quan doanh thu</div>
          </div>
          <div className="dashboard-revenue__grid">
            {/* Hôm nay */}
            <div className="dashboard-revenue__col">
              <div className="dashboard-revenue__title">Hôm nay</div>
              <ul className="dashboard-revenue__list">
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">
                    Tiền hợp đồng
                  </span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.today?.contractAmount || 0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">Tiền thuê xe</span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.today?.rentalAmount || 0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">Tiền phụ thu</span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.today?.surchargeAmount || 0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
              </ul>
            </div>
            {/* Tháng này */}
            <div className="dashboard-revenue__col">
              <div className="dashboard-revenue__title">Tháng này</div>
              <ul className="dashboard-revenue__list">
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">
                    Tiền hợp đồng
                  </span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.thisMonth?.contractAmount ||
                        0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">Tiền thuê xe</span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.thisMonth?.rentalAmount || 0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">Tiền phụ thu</span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.thisMonth
                          ?.surchargeAmount || 0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
              </ul>
            </div>
            {/* Tháng trước */}
            <div className="dashboard-revenue__col">
              <div className="dashboard-revenue__title">Tháng trước</div>
              <ul className="dashboard-revenue__list">
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">
                    Tiền hợp đồng
                  </span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.lastMonth?.contractAmount ||
                        0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">Tiền thuê xe</span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.lastMonth?.rentalAmount || 0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
                <li className="dashboard-revenue__item">
                  <span className="dashboard-revenue__icon">📄</span>
                  <span className="dashboard-revenue__label">Tiền phụ thu</span>
                  <span className="dashboard-revenue__value">
                    <AnimatedCounter
                      value={
                        dashboard?.revenueOverview?.lastMonth
                          ?.surchargeAmount || 0
                      }
                      formatAsCurrency
                    />
                  </span>
                </li>
              </ul>
            </div>
            {/* Filter button (placeholder) */}
            <div className="dashboard-revenue__filter"></div>
          </div>
        </div>
        {/* ========== Doanh thu theo ngày ========== */}
        <div className="dashboard-section box_section dashboard-chart">
          <div className="dashboard-row">
            <div className="box_title_custom">
              Doanh thu theo ngày trong tháng này
            </div>
          </div>
          <div
            className="dashboard-chart__wrap"
            style={{ width: "100%", overflowX: "auto" }}
          >
            <BarChartBase
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
              width={"100%"}
              height={320}
            />
          </div>
        </div>
        {/* ========== Top 5 xe thuê nhiều nhất ========== */}
        <div className="dashboard-section box_section dashboard-table">
          <div className="dashboard-row">
            <div className="box_title_custom">Top 5 xe thuê nhiều nhất</div>
          </div>
          <TableBase
            columns={tableColumns}
            data={topCars.map((car) => ({
              stt: car.rank,
              model: car.model,
              count: car.rentalCount,
              revenue: car.revenue?.toLocaleString("vi-VN") + "đ",
            }))}
            pageSize={5}
            paginationType="FE"
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px 0 rgba(34,34,34,0.04)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
