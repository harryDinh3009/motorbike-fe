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

// ======================= DATA MOCK =========================
const revenueToday = [
  { label: "Tiền hợp đồng", value: 5200000 },
  { label: "Tiền thuê xe", value: 4800000 },
  { label: "Tiền phụ thu", value: 400000 },
];
const revenueMonth = [
  { label: "Tiền hợp đồng", value: 156000000 },
  { label: "Tiền thuê xe", value: 144000000 },
  { label: "Tiền phụ thu", value: 12000000 },
];
const revenuePrevMonth = [
  { label: "Tiền hợp đồng", value: 142300000 },
  { label: "Tiền thuê xe", value: 131800000 },
  { label: "Tiền phụ thu", value: 10500000 },
];

const performanceIndicators = [
  { label: "Số hợp đồng", value: 42, change: "+12% so với kỳ trước" },
  { label: "Số xe đã thuê", value: 38, change: "+8% so với kỳ trước" },
  {
    label: "Tổng doanh thu",
    value: 156000000,
    change: "+9.5% so với kỳ trước",
  },
];

const chartData = {
  labels: Array.from(
    { length: 22 },
    (_, i) => `${(i + 1).toString().padStart(2, "0")}/10`
  ),
  datasets: [
    {
      label: "Doanh thu",
      data: [
        5, 7, 6, 8, 9, 10, 8, 7, 9, 11, 12, 10, 9, 8, 10, 11, 13, 12, 14, 13,
        15, 16,
      ],
      backgroundColor: "#53CEC7",
    },
  ],
};

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

const tableData = [
  { stt: 1, model: "Honda Vision 110", count: 28, revenue: "12,400,000đ" },
  { stt: 2, model: "Yamaha Sirius", count: 24, revenue: "10,800,000đ" },
  { stt: 3, model: "Air Blade 125", count: 21, revenue: "9,900,000đ" },
  { stt: 4, model: "Wave Alpha", count: 20, revenue: "9,000,000đ" },
  { stt: 5, model: "SH Mode", count: 18, revenue: "8,600,000đ" },
];

// ======================= COMPONENTS =========================
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

// ======================= MAIN DASHBOARD =========================
const Dashboard: React.FC = () => {
  const pageTitle = "Thống kê / Báo cáo";
  return (
    <div className="content_wrap dashboard-page">
      <div id="content" className="grid_content dashboard-grid">
        {" "}
        <BreadcrumbBase title={pageTitle} items={[]} />
        {/* ========== Tổng quan doanh thu ========== */}
        <div className="dashboard-section box_section dashboard-revenue">
          <div className="dashboard-row">
            <div className="box_title_custom">Tổng quan doanh thu</div>
          </div>
          <div className="dashboard-revenue__grid">
            {/* Cột hôm nay */}
            <div className="dashboard-revenue__col">
              <div className="dashboard-revenue__title">Hôm nay</div>
              <ul className="dashboard-revenue__list">
                {revenueToday.map((item) => (
                  <li key={item.label} className="dashboard-revenue__item">
                    <span className="dashboard-revenue__icon">📄</span>
                    <span className="dashboard-revenue__label">
                      {item.label}
                    </span>
                    <span className="dashboard-revenue__value">
                      <AnimatedCounter value={item.value} formatAsCurrency />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột tháng này */}
            <div className="dashboard-revenue__col">
              <div className="dashboard-revenue__title">Tháng này</div>
              <ul className="dashboard-revenue__list">
                {revenueMonth.map((item) => (
                  <li key={item.label} className="dashboard-revenue__item">
                    <span className="dashboard-revenue__icon">📄</span>
                    <span className="dashboard-revenue__label">
                      {item.label}
                    </span>
                    <span className="dashboard-revenue__value">
                      <AnimatedCounter value={item.value} formatAsCurrency />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột tháng trước */}
            <div className="dashboard-revenue__col">
              <div className="dashboard-revenue__title">Tháng trước</div>
              <ul className="dashboard-revenue__list">
                {revenuePrevMonth.map((item) => (
                  <li key={item.label} className="dashboard-revenue__item">
                    <span className="dashboard-revenue__icon">📄</span>
                    <span className="dashboard-revenue__label">
                      {item.label}
                    </span>
                    <span className="dashboard-revenue__value">
                      <AnimatedCounter value={item.value} formatAsCurrency />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter button */}
            <div className="dashboard-revenue__filter">
              <ButtonBase label="1 ngày qua" className="btn_lightgray" />
            </div>
          </div>
        </div>
        {/* ========== Chỉ số hiệu suất ========== */}
        <div className="dashboard-section box_section dashboard-performance">
          <div className="dashboard-row">
            <div className="box_title_custom" style={{ fontSize: "2.6rem" }}>
              Chỉ số hiệu suất
            </div>
          </div>
          <div className="dashboard-performance__grid">
            {performanceIndicators.map((item, idx) => (
              <div key={item.label} className="dashboard-performance__card">
                <div
                  className="dashboard-performance__label"
                  style={{ marginBottom: "16px", fontSize: "1.7rem" }}
                >
                  {item.label}
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
                      value={item.value}
                      formatAsCurrency={idx === 2}
                    />
                  </div>
                  <div
                    className={`dashboard-performance__change${
                      idx === 2 ? " highlight" : ""
                    }`}
                    style={{ fontSize: "1.3rem" }}
                  >
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
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
            data={tableData}
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
