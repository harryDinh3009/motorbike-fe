import React, { useState, useEffect } from "react";
import { Button, DatePicker, Select, Table, message } from "antd";
import { SearchOutlined, FilePdfOutlined } from "@ant-design/icons";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import dayjs from "dayjs";
import {
  getMonthlyRevenueData,
  exportMonthlyRevenueReport,
  MonthlyRevenueRowDTO,
} from "@/service/business/contractMng/contractMng.service";
import { getAllActiveBranches, getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";

const MonthlyRevenueReport: React.FC = () => {
  // Filter states
  const [branchId, setBranchId] = useState<string>("");
  const [year, setYear] = useState<dayjs.Dayjs | null>(dayjs());

  // Options
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: string }[]>([]);

  // Data states
  const [revenueData, setRevenueData] = useState<MonthlyRevenueRowDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load options on mount
  useEffect(() => {
    getAllActiveBranches().then((res) => {
      setBranchOptions([
        { label: "Tất cả", value: "" },
        ...(res.data || []).map((b: any) => ({ label: b.name, value: b.id })),
      ]);
    });
    // Lấy chi nhánh hiện tại của user và set mặc định
    getBranchByCurrentUser()
      .then((res) => {
        const userBranchId = res.data?.id || "";
        setBranchId(userBranchId);
      })
      .catch(() => {
        console.error("Failed to fetch current user's branch.");
      });
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!year) {
      message.warning("Vui lòng chọn năm!");
      return;
    }

    setLoading(true);
    try {
      const res = await getMonthlyRevenueData({
        year: year.year(),
        branchId: branchId || undefined,
      });

      setRevenueData(res.data || []);
      setSearched(true);
      message.success("Đã tải dữ liệu báo cáo");
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "0 đ";
    return value.toLocaleString("vi-VN") + " đ";
  };

  // Calculate totals
  const totals = revenueData.reduce(
    (acc, row) => ({
      contractCount: acc.contractCount + row.contractCount,
      rentalAmount: acc.rentalAmount + row.rentalAmount,
      surchargeAmount: acc.surchargeAmount + row.surchargeAmount,
      discountAmount: acc.discountAmount + row.discountAmount,
      revenue: acc.revenue + row.revenue,
    }),
    {
      contractCount: 0,
      rentalAmount: 0,
      surchargeAmount: 0,
      discountAmount: 0,
      revenue: 0,
    }
  );

  // Table columns
  const columns = [
    {
      title: "Tháng",
      dataIndex: "month",
      key: "month",
      width: 80,
      align: "center" as const,
      render: (val: number) => `Tháng ${val}`,
    },
    {
      title: "Số HĐ hoàn thành",
      dataIndex: "contractCount",
      key: "contractCount",
      width: 130,
      align: "right" as const,
    },
    {
      title: "Tiền thuê xe",
      dataIndex: "rentalAmount",
      key: "rentalAmount",
      width: 150,
      align: "right" as const,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Tiền phụ thu",
      dataIndex: "surchargeAmount",
      key: "surchargeAmount",
      width: 150,
      align: "right" as const,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
      width: 130,
      align: "right" as const,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      width: 150,
      align: "right" as const,
      render: (val: number) => (
        <span style={{ fontWeight: 600, color: "#52c41a" }}>
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  // Export PDF using BE API
  const handleExportPdf = async () => {
    if (revenueData.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    if (!year) {
      message.warning("Vui lòng chọn năm!");
      return;
    }

    setLoading(true);
    try {
      const blob = await exportMonthlyRevenueReport({
        year: year.year(),
        branchId: branchId || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_cao_doanh_thu_thang_${year.year()}_${dayjs().format("DDMMYYYY_HHmmss")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success("Xuất PDF thành công!");
    } catch (err) {
      message.error("Xuất PDF thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <ContainerBase id="monthly-revenue-report">
          <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
            Báo cáo doanh thu theo tháng
          </h2>

          {/* Filters */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Chi nhánh</label>
              <Select
                value={branchId}
                onChange={setBranchId}
                options={branchOptions}
                style={{ width: "100%" }}
                placeholder="Tất cả"
                showSearch
                allowClear
              />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                Năm <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <DatePicker
                picker="year"
                value={year}
                onChange={setYear}
                style={{ width: "100%" }}
                placeholder="Chọn năm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
              size="large"
            >
              Xem báo cáo
            </Button>
            {searched && revenueData.length > 0 && (
              <Button
                type="default"
                icon={<FilePdfOutlined />}
                onClick={handleExportPdf}
                size="large"
                style={{ background: "#52c41a", color: "#fff", borderColor: "#52c41a" }}
              >
                In PDF
              </Button>
            )}
          </div>

          {/* Result message */}
          {searched && (
            <div
              style={{
                padding: "12px 16px",
                background: revenueData.some((r) => r.contractCount > 0) ? "#f6ffed" : "#fff7e6",
                border: `1px solid ${revenueData.some((r) => r.contractCount > 0) ? "#b7eb8f" : "#ffd591"}`,
                borderRadius: 8,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              {revenueData.some((r) => r.contractCount > 0)
                ? `✅ Tổng ${totals.contractCount} hợp đồng hoàn thành | Doanh thu: ${formatCurrency(totals.revenue)}`
                : "⚠️ Không có hợp đồng hoàn thành trong năm này"}
            </div>
          )}

          {/* Data table */}
          {searched && (
            <Table
              columns={columns}
              dataSource={revenueData}
              rowKey="month"
              loading={loading}
              pagination={false}
              scroll={{ x: 900 }}
              bordered
              summary={() =>
                revenueData.length > 0 ? (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ background: "#fafafa", fontWeight: 600 }}>
                      <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        {totals.contractCount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        {formatCurrency(totals.rentalAmount)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        {formatCurrency(totals.surchargeAmount)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        {formatCurrency(totals.discountAmount)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        <span style={{ color: "#52c41a" }}>{formatCurrency(totals.revenue)}</span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                ) : null
              }
            />
          )}
        </ContainerBase>
      </div>
    </div>
  );
};

export default MonthlyRevenueReport;
