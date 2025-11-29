import React, { useEffect, useState } from "react";

import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import {
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileExcelOutlined,
  ImportOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import ModalSaveMotorbike from "./ModalSaveMotorbike";
import {
  searchCars,
  getCarModels,
  getCarTypes,
  getCarConditions,
  getCarStatuses,
  saveCar,
  deleteCar,
  exportCarExcel,
  importCarExcel,
  downloadCarTemplate,
  getCarDetail,
  getAllCars,
  uploadCarImage,
} from "@/service/business/carMng/carMng.service";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import { CarSearchDTO, CarDTO } from "@/service/business/carMng/carMng.type";
import { BranchDTO } from "@/service/business/branchMng/branchMng.type";
import TModal from "@/component/common/modal/TModal";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import { useAlert } from "@/plugins/global";
// Status color mapping for motorbike status
const STATUS_COLOR_MAP: Record<string, { bg: string; color: string }> = {
  "Hoạt động": { bg: "#D6F5E6", color: "#22A06B" },
  "Đang bảo dưỡng": { bg: "#E6E8EA", color: "#6B7280" },
  "Không sẵn sàng": { bg: "#FFE066", color: "#B38600" },
  "Bị mất": { bg: "#FFD6D6", color: "#E14D4D" },
};

// Component hiển thị thông tin dạng label-value
const InfoRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
  <div style={{ 
    display: "flex", 
    alignItems: "flex-start",
    gap: 8,
    padding: "4px 0"
  }}>
    <span style={{ 
      minWidth: 140, 
      fontSize: 13, 
      color: "#666",
      fontWeight: 500
    }}>
      {label}:
    </span>
    <span style={{ 
      flex: 1, 
      fontSize: 13, 
      color: "#333",
      wordBreak: "break-word"
    }}>
      {value || "-"}
    </span>
  </div>
);

function getStatusStyle(status: string): React.CSSProperties {
  const s = STATUS_COLOR_MAP[status?.trim() || ""];
  if (s) {
    return {
      background: s.bg,
      color: s.color,
      borderRadius: "16px",
      padding: "2px 16px",
      fontWeight: 500,
      fontSize: 14,
      display: "inline-block",
      minWidth: "100px",
      textAlign: "center" as const,
      margin: "2px 0",
      whiteSpace: "nowrap" as const,
    };
  }
  return {
    background: "#f5f5f5",
    color: "#333",
    borderRadius: "8px",
    padding: "2px 12px",
    fontWeight: 500,
    fontSize: 14,
    display: "inline-block",
    minWidth: "100px",
    textAlign: "center" as const,
    margin: "2px 0",
  };
}
const MotorbikeList = () => {
  const defaultFilter = {
    keyword: "",
    branchId: "",
    carType: "",
    condition: "",
    status: undefined,
    page: 1,
    size: 10,
  };
  // Filter input (chưa áp dụng) - để người dùng nhập/chọn
  const [filterInput, setFilterInput] = useState<any>(defaultFilter);
  // Applied filter (đang áp dụng) - để gọi API
  const [appliedFilter, setAppliedFilter] = useState<any>(defaultFilter);
  const [loading, setLoading] = useState(false);
  const [motorbikes, setMotorbikes] = useState<CarDTO[]>([]);
  const [total, setTotal] = useState(0);

  // Filter options state
  const [branchOptions, setBranchOptions] = useState([
    { value: "", label: "Chi nhánh" },
  ]);
  const [typeOptions, setTypeOptions] = useState([
    { value: "", label: "Loại xe" },
  ]);
  const [conditionOptions, setConditionOptions] = useState([
    { value: "", label: "Tình trạng xe" },
  ]);
  const [statusOptions, setStatusOptions] = useState([
    { value: "", label: "Trạng thái" },
  ]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editMotorbike, setEditMotorbike] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    count: number;
    message: string;
  } | null>(null);
  const [importFileName, setImportFileName] = useState<string>("");

  // Detail motorbike state
  const [detailMotorbike, setDetailMotorbike] = useState<CarDTO | null>(null);

  // Fetch filter options
  useEffect(() => {
    getAllActiveBranches().then((res) => {
      setBranchOptions([
        { value: "", label: "Chi nhánh" },
        ...(res.data || []).map((b: BranchDTO) => ({
          value: b.id,
          label: b.name,
        })),
      ]);
    });
    getCarTypes().then((res) => {
      setTypeOptions([
        { value: "", label: "Loại xe" },
        ...(res.data || []).map((t: string) => ({
          value: t,
          label: t,
        })),
      ]);
    });
    getCarConditions().then((res) => {
      setConditionOptions([
        { value: "", label: "Tình trạng xe" },
        ...(res.data || []).map((c: string) => ({
          value: c,
          label: c,
        })),
      ]);
    });
    getCarStatuses().then((res) => {
      setStatusOptions([
        { value: "", label: "Trạng thái" },
        ...(res.data || []).map((s: any) => ({
          value: s.code,
          label: s.name,
        })),
      ]);
    });
  }, []);

  // Fetch list
  const fetchMotorbikes = async (params: any) => {
    setLoading(true);
    try {
      // Convert empty string to undefined for API
      const cleanParams: CarSearchDTO = {
        ...params,
        keyword: params.keyword?.trim() ? params.keyword : undefined,
        branchId: params.branchId === "" ? undefined : params.branchId,
        carType: params.carType === "" ? undefined : params.carType,
        condition: params.condition === "" ? undefined : params.condition,
        status: params.status === "" ? undefined : params.status,
      };
      const res = await searchCars(cleanParams);
      setMotorbikes(res.data.data);
      setTotal(res.data.totalRecords);
    } finally {
      setLoading(false);
    }
  };

  // Chỉ gọi API khi appliedFilter thay đổi
  useEffect(() => {
    fetchMotorbikes(appliedFilter);
  }, [appliedFilter]);

  // Table pagination
  const handleTableChange = (page: number, pageSize: number) => {
    setAppliedFilter((prev: typeof appliedFilter) => ({
      ...prev,
      page,
      size: pageSize,
    }));
  };

  // Hàm tìm kiếm: áp dụng filterInput vào appliedFilter
  const handleSearch = () => {
    setAppliedFilter({
      ...filterInput,
      page: 1, // Reset về trang 1 khi tìm kiếm
    });
  };

  // Reset all filters
  const handleResetFilter = () => {
    setFilterInput(defaultFilter);
    setAppliedFilter(defaultFilter);
  };

  // Xử lý nhập Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setLoading(true);
    setImporting(true);
    try {
      const res = await importCarExcel(file);
      setImportResult(res.data);
      fetchMotorbikes(appliedFilter);
      alert(`Nhập xe thành công!\n${res.data.message || ""}`);
    } catch (err: any) {
      alert(
        "Có lỗi khi nhập file Excel. Vui lòng kiểm tra lại file hoặc liên hệ quản trị viên."
      );
    } finally {
      setImporting(false);
      setImportFileName("");
      e.target.value = "";
      setLoading(false);
    }
  };

  // Xuất Excel
  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const blob = await exportCarExcel(appliedFilter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "danh_sach_xe.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  // Tải file mẫu Excel
  const handleDownloadTemplate = async () => {
    setLoading(true);
    try {
      const blob = await downloadCarTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mau_nhap_xe.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };
  const { alert } = useAlert() || {};
  // Xử lý xóa xe
  const handleDelete = async (id: string) => {
    setLoading(true);
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      setLoading(true);
      try {
        await deleteCar(id);
        fetchMotorbikes(appliedFilter);
      } catch (err: any) {
        alert(err?.response?.data?.message || "Xóa xe thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Xử lý sửa xe
  const handleEdit = (record: any) => {
    setEditMotorbike({
      ...record,
      license: record.licensePlate,
      branch: record.branchId,
      year: record.yearOfManufacture,
      odometer: record.currentOdometer,
      image: record.imageUrl,
      value: record.value,
      frameNo: record.frameNumber,
      engineNo: record.engineNumber,
      regNo: record.registrationNumber,
      regName: record.registeredOwnerName,
      regPlace: record.registrationPlace,
      insuranceNo: record.insuranceContractNumber,
      insuranceExpire: record.insuranceExpiryDate,
      carType: record.carType,
      dailyPrice: record.dailyPrice,
      hourlyPrice: record.hourlyPrice,
      status: record.status,
    });
    setShowModal(true);
  };

  // Xem chi tiết xe
  const handleViewDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await getCarDetail(id);
      setDetailMotorbike(res.data);
    } finally {
      setLoading(false);
    }
  };

  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setDetailMotorbike(null);
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        {loading && <LoadingIndicator />}
        <BreadcrumbBase
          title="Danh sách xe"
          items={[
            { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
            { label: "Danh sách xe", path: "/motorbike" },
          ]}
        />
        <ContainerBase>
          <div
            className="box_section"
            style={{ paddingBottom: 0, position: "relative" }}
          >
            <div
              className="dp_flex"
              style={{
                gap: 12,
                alignItems: "flex-end",
                flexWrap: "nowrap",
                position: "relative",
                overflowX: "auto",
              }}
            >
              <div style={{ minWidth: 200, flex: 1, flexShrink: 0 }}>
                <InputBase
                  modelValue={filterInput.keyword}
                  placeholder="Tìm theo tên xe, biển số"
                  prefixIcon="search"
                  style={{ width: "100%" }}
                  onChange={(val) =>
                    setFilterInput({ ...filterInput, keyword: val as string })
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <SelectboxBase
                label="Chi nhánh"
                value={filterInput.branchId}
                options={branchOptions}
                style={{ minWidth: 130, flexShrink: 0 }}
                onChange={(val) =>
                  setFilterInput({
                    ...filterInput,
                    branchId: typeof val === "string" ? val : val[0] || "",
                  })
                }
              />
              <SelectboxBase
                label="Loại xe"
                value={filterInput.carType}
                options={typeOptions}
                style={{ minWidth: 130, flexShrink: 0 }}
                onChange={(val) =>
                  setFilterInput({
                    ...filterInput,
                    carType: typeof val === "string" ? val : val[0] || "",
                  })
                }
              />
              <SelectboxBase
                label="Tình trạng xe"
                value={filterInput.condition}
                options={conditionOptions}
                style={{ minWidth: 130, flexShrink: 0 }}
                onChange={(val) =>
                  setFilterInput({
                    ...filterInput,
                    condition: typeof val === "string" ? val : val[0] || "",
                  })
                }
              />
              <SelectboxBase
                label="Trạng thái"
                value={filterInput.status || ""}
                options={statusOptions}
                style={{ minWidth: 130, flexShrink: 0 }}
                onChange={(val) =>
                  setFilterInput({
                    ...filterInput,
                    status: val === "" ? undefined : val,
                  })
                }
              />
              <ButtonBase
                label="Tìm kiếm"
                className="btn_primary"
                icon={<SearchOutlined />}
                style={{ minWidth: 120, whiteSpace: "nowrap", flexShrink: 0 }}
                onClick={handleSearch}
                loading={loading}
              />
              <ButtonBase
                label="Đặt lại"
                className="btn_lightgray"
                style={{ minWidth: 100, whiteSpace: "nowrap", flexShrink: 0 }}
                onClick={handleResetFilter}
              />
            </div>
            <div
              className="dp_flex"
              style={{ gap: 12, alignItems: "center", marginTop: 16 }}
            >
              <ButtonBase
                label="Xuất Excel"
                className="btn_yellow"
                icon={<FileExcelOutlined />}
                style={{ 
                  minWidth: 140,
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  color: "#fff"
                }}
                onClick={handleExportExcel}
              />
              <ButtonBase
                label="Tải file mẫu"
                className="btn_gray"
                style={{ minWidth: 140 }}
                onClick={handleDownloadTemplate}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: 220,
                  gap: 8,
                }}
              >
                <label style={{ minWidth: 0 }}>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: "none" }}
                    onChange={handleImportExcel}
                    disabled={importing}
                    id="import-excel-input"
                  />
                  <ButtonBase
                    label={importing ? "Đang nhập..." : "Chọn file Excel"}
                    className="btn_yellow"
                    icon={<ImportOutlined />}
                    style={{ 
                      minWidth: 140,
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                      color: "#fff"
                    }}
                    onClick={() => {
                      const input = document.getElementById(
                        "import-excel-input"
                      ) as HTMLInputElement;
                      if (input) input.click();
                    }}
                    disabled={importing}
                  />
                </label>
                {importFileName && (
                  <span
                    style={{
                      fontSize: 13,
                      color: "#333",
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {importFileName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section" style={{ position: "relative" }}>
            <div
              className="dp_flex"
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <p className="box_title_sm" style={{ marginBottom: 0 }}>
                Danh sách xe
              </p>
              <ButtonBase
                label="Thêm xe"
                className="btn_primary"
                icon={<PlusOutlined />}
                style={{ minWidth: 120, whiteSpace: "nowrap" }}
                onClick={() => {
                  setEditMotorbike(null);
                  setShowModal(true);
                }}
              />
            </div>
            <TableBase
              data={motorbikes}
              columns={[
                {
                  title: "STT",
                  dataIndex: "id",
                  key: "id",
                  width: 60,
                  render: (_: any, __: any, idx: number) =>
                    appliedFilter.page
                      ? (appliedFilter.page - 1) * (appliedFilter.size || 10) + idx + 1
                      : idx + 1,
                },
                {
                  title: "Mẫu xe",
                  dataIndex: "model",
                  key: "model",
                  render: (val: string) => (val ? val : "-"),
                },
                {
                  title: "Biển số",
                  dataIndex: "licensePlate",
                  key: "licensePlate",
                  render: (val: string) => (val ? val : "-"),
                },
                {
                  title: "Loại xe",
                  dataIndex: "carType",
                  key: "carType",
                  render: (val: string) => (val ? val : "-"),
                },
                {
                  title: "Chi nhánh sở hữu",
                  dataIndex: "branchName",
                  key: "branchName",
                  render: (val: string) => (val ? val : "-"),
                },
                {
                  title: "Giá ngày (Đ)",
                  dataIndex: "dailyPrice",
                  key: "dailyPrice",
                  render: (val: number) =>
                    val != null ? val.toLocaleString() : "-",
                },
                {
                  title: "Giá giờ (Đ)",
                  dataIndex: "hourlyPrice",
                  key: "hourlyPrice",
                  render: (val: number) =>
                    val != null ? val.toLocaleString() : "-",
                },
                {
                  title: "Tình trạng xe",
                  dataIndex: "condition",
                  key: "condition",
                  render: (val: string) => (val ? val : "-"),
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: 120,
                  render: (_: string, record: any) => (
                    <span
                      style={getStatusStyle(
                        (record.statusNm || record.status || "") + ""
                      )}
                    >
                      {record.statusNm || record.status || "-"}
                    </span>
                  ),
                },
                {
                  title: "Hành động",
                  key: "actions",
                  width: 140,
                  render: (_: any, record: any) => (
                    <div className="dp_flex" style={{ gap: 8 }}>
                      <ButtonBase
                        label=""
                        icon={<EditOutlined />}
                        className="btn_gray"
                        onClick={() => handleEdit(record)}
                        title="Sửa"
                      />
                      <ButtonBase
                        label=""
                        icon={<DeleteOutlined />}
                        className="btn_gray"
                        onClick={() => handleDelete(record.id)}
                        title="Xóa"
                      />
                      <ButtonBase
                        label=""
                        icon={<EyeOutlined />}
                        className="btn_gray"
                        onClick={() => handleViewDetail(record.id)}
                        title="Xem chi tiết"
                      />
                    </div>
                  ),
                },
              ]}
              pageSize={appliedFilter.size || 10}
              totalPages={total}
              onPageChange={handleTableChange}
            />
          </div>
        </ContainerBase>
        <ModalSaveMotorbike
          open={showModal}
          motorbike={editMotorbike}
          onClose={() => {
            setShowModal(false);
            setEditMotorbike(null);
          }}
          onSave={async (motorbike) => {
            setLoading(true);
            try {
              const payload = {
                ...(editMotorbike?.id ? { id: editMotorbike.id } : {}),
                model: motorbike.model,
                licensePlate: motorbike.license,
                carType: motorbike.carType,
                branchId: motorbike.branch,
                dailyPrice: motorbike.dailyPrice
                  ? Number(motorbike.dailyPrice)
                  : undefined,
                hourlyPrice: motorbike.hourlyPrice
                  ? Number(motorbike.hourlyPrice)
                  : undefined,
                condition: motorbike.condition,
                currentOdometer: motorbike.odometer
                  ? Number(motorbike.odometer)
                  : undefined,
                status: motorbike.status,
                imageUrl: motorbike.imageUrl,
                note: motorbike.note,
                yearOfManufacture: motorbike.year
                  ? Number(motorbike.year)
                  : undefined,
                origin: motorbike.origin,
                value: motorbike.value ? Number(motorbike.value) : undefined,
                frameNumber: motorbike.frameNo,
                engineNumber: motorbike.engineNo,
                color: motorbike.color,
                registrationNumber: motorbike.regNo,
                registeredOwnerName: motorbike.regName,
                registrationPlace: motorbike.regPlace,
                insuranceContractNumber: motorbike.insuranceNo,
                insuranceExpiryDate: motorbike.insuranceExpire || undefined,
              };
              await saveCar(payload);
              setShowModal(false);
              setEditMotorbike(null);
              fetchMotorbikes(filter);
            } finally {
              setLoading(false);
            }
          }}
        />
        {/* Hiển thị kết quả import nếu có */}
        {importResult && (
          <TModal
            title="Kết quả nhập xe từ Excel"
            visible={!!importResult}
            onCancel={() => setImportResult(null)}
            width={500}
            centered
            footer={
              <ButtonBase
                label="Đóng"
                className="btn_lightgray"
                onClick={() => setImportResult(null)}
              />
            }
          >
            <div style={{ padding: 16 }}>
              <div>
                <b>Số lượng xe nhập:</b> {importResult.count}
              </div>
              <div style={{ marginTop: 8 }}>
                <b>Thông báo:</b> {importResult.message}
              </div>
            </div>
          </TModal>
        )}
        {/* Modal chi tiết xe */}
        {detailMotorbike && (
          <TModal
            title="Chi tiết xe"
            visible={!!detailMotorbike}
            onCancel={handleCloseDetail}
            width={700}
            centered
            footer={
              <ButtonBase
                label="Đóng"
                className="btn_lightgray"
                onClick={handleCloseDetail}
              />
            }
          >
            <div style={{ padding: "20px 24px" }}>
              {/* Ảnh xe và thông tin cơ bản */}
              <div style={{ 
                display: "flex", 
                gap: 24, 
                marginBottom: 24,
                paddingBottom: 24,
                borderBottom: "1px solid #f0f0f0"
              }}>
                <div style={{ flexShrink: 0 }}>
                  {detailMotorbike.imageUrl ? (
                    <img
                      src={detailMotorbike.imageUrl}
                      alt="Ảnh xe"
                      style={{
                        width: 200,
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 200,
                      height: 150,
                      borderRadius: 8,
                      border: "1px solid #e8e8e8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      color: "#999"
                    }}>
                      Không có ảnh
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: "#1677ff", marginBottom: 4 }}>
                      {detailMotorbike.model || "-"}
                    </div>
                    <div style={{ fontSize: 16, color: "#666", marginBottom: 12 }}>
                      {detailMotorbike.licensePlate || "-"}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <span
                        style={getStatusStyle(
                          (detailMotorbike.statusNm || detailMotorbike.status || "") + ""
                        )}
                      >
                        {detailMotorbike.statusNm || detailMotorbike.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết - Layout 2 cột */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "16px 32px"
              }}>
                {/* Cột 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: "#333",
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: "1px solid #f0f0f0"
                  }}>
                    Thông tin cơ bản
                  </div>
                  <InfoRow label="Loại xe" value={detailMotorbike.carType} />
                  <InfoRow label="Chi nhánh sở hữu" value={detailMotorbike.branchName} />
                  <InfoRow label="Tình trạng xe" value={detailMotorbike.condition} />
                  <InfoRow label="Màu sắc" value={detailMotorbike.color} />
                  <InfoRow label="Năm sản xuất" value={detailMotorbike.yearOfManufacture} />
                  <InfoRow label="Xuất xứ" value={detailMotorbike.origin} />
                  <InfoRow label="Odo hiện tại" value={detailMotorbike.currentOdometer?.toLocaleString("vi-VN")} />
                </div>

                {/* Cột 2 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: "#333",
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: "1px solid #f0f0f0"
                  }}>
                    Giá và thông tin tài chính
                  </div>
                  <InfoRow 
                    label="Giá ngày" 
                    value={detailMotorbike.dailyPrice ? `${detailMotorbike.dailyPrice.toLocaleString("vi-VN")} đ` : "-"} 
                  />
                  <InfoRow 
                    label="Giá giờ" 
                    value={detailMotorbike.hourlyPrice ? `${detailMotorbike.hourlyPrice.toLocaleString("vi-VN")} đ` : "-"} 
                  />
                  <InfoRow 
                    label="Giá trị xe" 
                    value={detailMotorbike.value ? `${detailMotorbike.value.toLocaleString("vi-VN")} đ` : "-"} 
                  />
                </div>
              </div>

              {/* Thông tin đăng ký và bảo hiểm */}
              <div style={{ 
                marginTop: 24,
                paddingTop: 24,
                borderTop: "1px solid #f0f0f0"
              }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: "#333",
                  marginBottom: 16
                }}>
                  Thông tin đăng ký và bảo hiểm
                </div>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "16px 32px"
                }}>
                  <InfoRow label="Số khung" value={detailMotorbike.frameNumber} />
                  <InfoRow label="Số máy" value={detailMotorbike.engineNumber} />
                  <InfoRow label="Số giấy đăng ký" value={detailMotorbike.registrationNumber} />
                  <InfoRow label="Chủ đăng ký" value={detailMotorbike.registeredOwnerName} />
                  <InfoRow label="Nơi đăng ký" value={detailMotorbike.registrationPlace} />
                  <InfoRow label="Số HĐ bảo hiểm" value={detailMotorbike.insuranceContractNumber} />
                  <InfoRow label="Hạn bảo hiểm" value={detailMotorbike.insuranceExpiryDate} />
                </div>
              </div>

              {/* Ghi chú */}
              {detailMotorbike.note && (
                <div style={{ 
                  marginTop: 24,
                  paddingTop: 24,
                  borderTop: "1px solid #f0f0f0"
                }}>
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: "#333",
                    marginBottom: 8
                  }}>
                    Ghi chú
                  </div>
                  <div style={{ 
                    padding: 12,
                    backgroundColor: "#fafafa",
                    borderRadius: 6,
                    color: "#666",
                    lineHeight: 1.6
                  }}>
                    {detailMotorbike.note}
                  </div>
                </div>
              )}
            </div>
          </TModal>
        )}
      </div>
    </div>
  );
};
export default MotorbikeList;
