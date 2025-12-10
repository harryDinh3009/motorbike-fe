import React, { useState, useEffect } from "react";
import { Button, DatePicker, Select, Table, message } from "antd";
import { SearchOutlined, FilePdfOutlined } from "@ant-design/icons";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import dayjs from "dayjs";
import { searchAvailableCars, exportRentableCarsReport } from "@/service/business/carMng/carMng.service";
import { getAllActiveBranches, getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";
import { getCarModels } from "@/service/business/carMng/carModelMng.service";
import { getCarTypes } from "@/service/business/carMng/carMng.service";
import { CarDTO } from "@/service/business/carMng/carMng.type";

const { RangePicker } = DatePicker;

const RentableCarReport: React.FC = () => {
  // Default date range: today 0:00 to 23:59
  const getDefaultDateRange = (): [dayjs.Dayjs, dayjs.Dayjs] => {
    const startOfToday = dayjs().startOf("day"); // 0:00 hôm nay
    const endOfToday = dayjs().endOf("day"); // 23:59:59 hôm nay
    return [startOfToday, endOfToday];
  };

  // Filter states
  const [branchId, setBranchId] = useState<string>("");
  const [modelName, setModelName] = useState<string>("");
  const [carType, setCarType] = useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>(getDefaultDateRange());

  // Options
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: string }[]>([]);
  const [carTypeOptions, setCarTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]);

  // Data states
  const [carList, setCarList] = useState<CarDTO[]>([]);
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
    getCarTypes().then((res) => {
      setCarTypeOptions([
        { label: "Tất cả", value: "" },
        ...(res.data || []).map((t: string) => ({ label: t, value: t })),
      ]);
    });
    getCarModels().then((res) => {
      setModelOptions([
        { label: "Tất cả", value: "" },
        ...(res.data || []).map((m: string) => ({ label: m, value: m })),
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
      message.warning("Vui lòng chọn thời gian thuê!");
      return;
    }

    setLoading(true);
    try {
      // startDate: 00:00:00, endDate: 23:59:59
      const res = await searchAvailableCars({
        branchId: branchId || undefined,
        modelName: modelName || undefined,
        carType: carType || undefined,
        startDate: dateRange[0].startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        endDate: dateRange[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        page: 1,
        size: 10000,
      });

      const allCars = res.data.data || [];
      // Filter only AVAILABLE cars (not struck through in contract modal)
      const availableCars = allCars.filter((car) => car.status === "AVAILABLE");
      setCarList(availableCars);
      setSearched(true);
      message.success(`Đã tìm thấy ${availableCars.length} xe có thể thuê`);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "";
    return value.toLocaleString("vi-VN") + " đ";
  };

  // Table columns
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mẫu xe",
      dataIndex: "model",
      key: "model",
      width: 150,
    },
    {
      title: "Biển số",
      dataIndex: "licensePlate",
      key: "licensePlate",
      width: 120,
    },
    {
      title: "Chi nhánh",
      dataIndex: "branchName",
      key: "branchName",
      width: 150,
    },
    {
      title: "Loại xe",
      dataIndex: "carType",
      key: "carType",
      width: 100,
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
    },
    {
      title: "Giá ngày",
      dataIndex: "dailyPrice",
      key: "dailyPrice",
      width: 120,
      align: "right" as const,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Giá giờ",
      dataIndex: "hourlyPrice",
      key: "hourlyPrice",
      width: 120,
      align: "right" as const,
      render: (val: number) => formatCurrency(val),
    },
  ];

  // Export PDF using BE API
  const handleExportPdf = async () => {
    if (carList.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      message.warning("Vui lòng chọn thời gian thuê!");
      return;
    }

    setLoading(true);
    try {
      // startDate: 00:00:00, endDate: 23:59:59
      const blob = await exportRentableCarsReport({
        branchId: branchId || undefined,
        modelName: modelName || undefined,
        carType: carType || undefined,
        startDate: dateRange[0].startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        endDate: dateRange[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_cao_xe_co_the_thue_${dayjs().format("DDMMYYYY_HHmmss")}.pdf`;
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
        <ContainerBase id="rentable-car-report">
          <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
            Thống kê xe khả dụng
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
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Tên mẫu xe</label>
              <Select
                value={modelName}
                onChange={setModelName}
                options={modelOptions}
                style={{ width: "100%" }}
                placeholder="Tất cả"
                showSearch
                allowClear
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Loại xe</label>
              <Select
                value={carType}
                onChange={setCarType}
                options={carTypeOptions}
                style={{ width: "100%" }}
                placeholder="Tất cả"
                showSearch
                allowClear
              />
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                Thời gian thuê <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                showTime={{ format: "HH:mm" }}
                placeholder={["Từ ngày giờ", "Đến ngày giờ"]}
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
            {searched && carList.length > 0 && (
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
                background: carList.length > 0 ? "#f6ffed" : "#fff7e6",
                border: `1px solid ${carList.length > 0 ? "#b7eb8f" : "#ffd591"}`,
                borderRadius: 8,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              {carList.length > 0
                ? `✅ Đã tìm thấy ${carList.length} xe khả dụng`
                : "⚠️ Không tìm thấy xe nào khả dụng trong khoảng thời gian này"}
            </div>
          )}

          {/* Data table */}
          {searched && (
            <Table
              columns={columns}
              dataSource={carList}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1000 }}
              bordered
            />
          )}
        </ContainerBase>
      </div>
    </div>
  );
};

export default RentableCarReport;

