import React, { useState, useEffect } from "react";
import { Button, DatePicker, Select, Table, message } from "antd";
import { SearchOutlined, FilePdfOutlined } from "@ant-design/icons";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import dayjs from "dayjs";
import {
  getModelRentalData,
  exportModelRentalReport,
  ModelRentalRowDTO,
} from "@/service/business/contractMng/contractMng.service";
import { getAllActiveBranches, getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";

const { RangePicker } = DatePicker;

const ModelRentalReport: React.FC = () => {
  // Default date range: from first day of current month to today
  const getDefaultDateRange = (): [dayjs.Dayjs, dayjs.Dayjs] => {
    const startOfMonth = dayjs().startOf("month");
    const today = dayjs();
    return [startOfMonth, today];
  };

  // Filter states
  const [branchId, setBranchId] = useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>(getDefaultDateRange());

  // Options
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: string }[]>([]);

  // Data states
  const [rentalData, setRentalData] = useState<ModelRentalRowDTO[]>([]);
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
    if (!dateRange[0] || !dateRange[1]) {
      message.warning("Vui lòng chọn khoảng thời gian!");
      return;
    }

    setLoading(true);
    try {
      // startDate: 00:00:00, endDate: 23:59:59
      const res = await getModelRentalData({
        branchId: branchId || undefined,
        startDate: dateRange[0].startOf("day").format("YYYY-MM-DD"),
        endDate: dateRange[1].endOf("day").format("YYYY-MM-DD"),
      });

      setRentalData(res.data || []);
      setSearched(true);
      message.success("Đã tải dữ liệu thống kê");
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
  const totals = rentalData.reduce(
    (acc, row) => ({
      rentalCount: acc.rentalCount + row.rentalCount,
      rentalAmount: acc.rentalAmount + row.rentalAmount,
    }),
    {
      rentalCount: 0,
      rentalAmount: 0,
    }
  );

  // Table columns
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 70,
      align: "center" as const,
    },
    {
      title: "Mẫu xe",
      dataIndex: "modelName",
      key: "modelName",
      width: 250,
    },
    {
      title: "Số lượt thuê",
      dataIndex: "rentalCount",
      key: "rentalCount",
      width: 130,
      align: "center" as const,
    },
    {
      title: "Tiền thuê xe",
      dataIndex: "rentalAmount",
      key: "rentalAmount",
      width: 180,
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
    if (rentalData.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      message.warning("Vui lòng chọn khoảng thời gian!");
      return;
    }

    setLoading(true);
    try {
      // startDate: 00:00:00, endDate: 23:59:59
      const blob = await exportModelRentalReport({
        branchId: branchId || undefined,
        startDate: dateRange[0].startOf("day").format("YYYY-MM-DD"),
        endDate: dateRange[1].endOf("day").format("YYYY-MM-DD"),
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Thong_ke_luot_thue_theo_mau_xe_${dayjs().format("DDMMYYYY_HHmmss")}.pdf`;
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
        <ContainerBase id="model-rental-report">
          <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
            Thống kê lượt thuê theo mẫu xe
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
            <div style={{ flex: 2, minWidth: 280 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                Từ ngày - Đến ngày <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder={["Từ ngày", "Đến ngày"]}
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
              Xem thống kê
            </Button>
            {searched && rentalData.length > 0 && (
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
                background: rentalData.length > 0 ? "#f6ffed" : "#fff7e6",
                border: `1px solid ${rentalData.length > 0 ? "#b7eb8f" : "#ffd591"}`,
                borderRadius: 8,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              {rentalData.length > 0
                ? `✅ Tìm thấy ${rentalData.length} mẫu xe được thuê | Tổng ${totals.rentalCount} lượt thuê | Tiền thuê: ${formatCurrency(totals.rentalAmount)}`
                : "⚠️ Không có dữ liệu lượt thuê trong khoảng thời gian này"}
            </div>
          )}

          {/* Data table */}
          {searched && (
            <Table
              columns={columns}
              dataSource={rentalData}
              rowKey="stt"
              loading={loading}
              pagination={false}
              scroll={{ x: 700 }}
              bordered
              summary={() =>
                rentalData.length > 0 ? (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ background: "#fafafa", fontWeight: 600 }}>
                      <Table.Summary.Cell index={0} colSpan={2} align="center">
                        Tổng cộng
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="center">
                        {totals.rentalCount}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <span style={{ color: "#52c41a" }}>{formatCurrency(totals.rentalAmount)}</span>
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

export default ModelRentalReport;

