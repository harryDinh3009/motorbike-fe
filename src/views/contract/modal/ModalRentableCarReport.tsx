import React, { useState, useEffect } from "react";
import { Button, DatePicker, Select, Table, message, Tooltip } from "antd";
import { SearchOutlined, FilePdfOutlined, InfoCircleOutlined } from "@ant-design/icons";
import TModal from "@/component/common/modal/TModal";
import dayjs from "dayjs";
import { searchAvailableCars, exportRentableCarsReport, getConflictingContracts } from "@/service/business/carMng/carMng.service";
import { getAllActiveBranches, getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";
import { getCarModels } from "@/service/business/carMng/carModelMng.service";
import { getCarTypes } from "@/service/business/carMng/carMng.service";
import { CarDTO, ConflictingContractDTO } from "@/service/business/carMng/carMng.type";
import { formatDateDMY } from "@/utils/common";

// Helper function to format date from backend (handles both ISO and dd/MM/yyyy HH:mm formats)
const formatContractDate = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  
  // If already in dd/MM/yyyy HH:mm format (from backend), return as is
  if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Otherwise, use formatDateDMY for ISO format
  return formatDateDMY(dateStr);
};

const { RangePicker } = DatePicker;

interface ModalRentableCarReportProps {
  visible: boolean;
  onClose: () => void;
}

const ModalRentableCarReport: React.FC<ModalRentableCarReportProps> = ({
  visible,
  onClose,
}) => {
  // Default date range: today 0:00 to 23:59
  const getDefaultDateRange = (): [dayjs.Dayjs, dayjs.Dayjs] => {
    const startOfToday = dayjs().startOf("day");
    const endOfToday = dayjs().endOf("day");
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
  const [conflictingContracts, setConflictingContracts] = useState<Map<string, ConflictingContractDTO[]>>(new Map());
  const [loadingContracts, setLoadingContracts] = useState<Set<string>>(new Set());

  // Load options on mount
  useEffect(() => {
    if (!visible) return;

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
  }, [visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setCarList([]);
      setSearched(false);
      setBranchId("");
      setModelName("");
      setCarType("");
      setDateRange(getDefaultDateRange());
      setConflictingContracts(new Map());
      setLoadingContracts(new Set());
    }
  }, [visible]);

  // Hàm lấy thông tin hợp đồng conflict cho xe
  const fetchConflictingContracts = async (carId: string) => {
    if (!dateRange[0] || !dateRange[1]) return;
    
    if (loadingContracts.has(carId) || conflictingContracts.has(carId)) {
      return; // Đã load rồi hoặc đang load
    }

    setLoadingContracts(prev => new Set([...prev, carId]));
    
    try {
      const res = await getConflictingContracts(
        carId,
        dateRange[0].startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        dateRange[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss")
      );

      setConflictingContracts(prev => {
        const newMap = new Map(prev);
        newMap.set(carId, res.data || []);
        return newMap;
      });
    } catch (err) {
      console.error("Failed to fetch conflicting contracts:", err);
      message.error("Không thể tải thông tin hợp đồng");
    } finally {
      setLoadingContracts(prev => {
        const newSet = new Set(prev);
        newSet.delete(carId);
        return newSet;
      });
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning("Vui lòng chọn thời gian thuê!");
      return;
    }

    setLoading(true);
    try {
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
      // Không filter nữa - backend đã filter chỉ lấy xe có status = 'AVAILABLE' ban đầu
      // Backend sẽ tự động set status = 'NOT_AVAILABLE' nếu xe đã được đặt trong khoảng thời gian
      setCarList(allCars);
      setSearched(true);
      
      const availableCount = allCars.filter(c => c.status === "AVAILABLE").length;
      const rentedCount = allCars.filter(c => c.status === "NOT_AVAILABLE").length;
      if (rentedCount > 0) {
        message.success(`Đã tìm thấy ${availableCount} xe khả dụng và ${rentedCount} xe đã đặt thuê`);
      } else {
        message.success(`Đã tìm thấy ${availableCount} xe khả dụng`);
      }
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

  // Table columns (không có cột Chi nhánh)
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
      title: "Loại xe",
      dataIndex: "carType",
      key: "carType",
      width: 100,
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
    {
      title: "Kết quả",
      key: "result",
      width: 150,
      align: "center" as const,
      render: (_: any, record: CarDTO) => {
        const isNotAvailable = record.status === "NOT_AVAILABLE";
        const contracts = conflictingContracts.get(record.id) || [];
        const isLoading = loadingContracts.has(record.id);
        
        const tooltipContent = isLoading ? (
          <div style={{ padding: "8px 0", color: "#fff" }}>Đang tải thông tin hợp đồng...</div>
        ) : contracts.length > 0 ? (
          <div style={{ maxWidth: 550 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#fff" }}>
              Hợp đồng đã đặt ({contracts.length}):
            </div>
            {contracts.map((contract) => (
              <div key={contract.id} style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.6, paddingBottom: 12, borderBottom: contracts.indexOf(contract) < contracts.length - 1 ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                <div style={{ fontWeight: 500, color: "#fff", marginBottom: 6 }}>
                  {contract.contractCode || `HĐ-${contract.id.slice(0, 8)}`}
                </div>
                <div style={{ color: "#d9d9d9", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>Ngày thuê:</span> {formatContractDate(contract.startDate)}
                </div>
                <div style={{ color: "#d9d9d9", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>Ngày trả:</span> {formatContractDate(contract.endDate)}
                </div>
                {contract.customerName && (
                  <div style={{ color: "#d9d9d9", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>KH:</span> {contract.customerName}
                  </div>
                )}
                {contract.statusNm && (
                  <div style={{ color: "#d9d9d9", fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>TT:</span> {contract.statusNm}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "8px 0", color: "#fff" }}>Không có hợp đồng conflict</div>
        );

        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ 
              color: isNotAvailable ? "#ff4d4f" : "#52c41a", 
              fontWeight: 500 
            }}>
              {isNotAvailable ? "Đã đặt thuê" : "Khả dụng"}
            </span>
            {isNotAvailable && (
              <Tooltip 
                title={tooltipContent}
                placement="left"
                trigger="click"
                onOpenChange={(open) => {
                  if (open && contracts.length === 0 && !isLoading) {
                    fetchConflictingContracts(record.id);
                  }
                }}
              >
                <InfoCircleOutlined 
                  style={{ 
                    color: "#ff4d4f", 
                    fontSize: 16,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
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
    <TModal
      visible={visible}
      onCancel={onClose}
      title="Quản lý xe khả dụng cho thuê"
      width={1200}
      hideOkButton={true}
      hideCancelButton={true}
      footer={null}
    >
      <div style={{ padding: "8px 0" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={{ width: 200 }}>
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
          <div style={{ width: 200 }}>
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
          <div style={{ width: 200 }}>
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
          <div style={{ width: 380 }}>
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
            Tìm xe
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
            {carList.length > 0 ? (
              <>
                ✅ Đã tìm thấy {carList.filter(c => c.status === "AVAILABLE").length} xe khả dụng
                {carList.filter(c => c.status === "NOT_AVAILABLE").length > 0 && (
                  <span style={{ marginLeft: 8 }}>
                    và {carList.filter(c => c.status === "NOT_AVAILABLE").length} xe đã đặt thuê
                  </span>
                )}
              </>
            ) : (
              "⚠️ Không tìm thấy xe nào trong khoảng thời gian này"
            )}
          </div>
        )}

        {/* Data table */}
        {searched && (
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Table
              columns={columns}
              dataSource={carList}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1000 }}
              bordered
            />
          </div>
        )}
      </div>
    </TModal>
  );
};

export default ModalRentableCarReport;

