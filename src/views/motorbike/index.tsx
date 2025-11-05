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

const MotorbikeList = () => {
  const [filter, setFilter] = useState<any>({
    keyword: "",
    branchId: "",
    carType: "",
    condition: "",
    status: undefined,
    page: 1,
    size: 10,
  });
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
      setTotal(res.data.totalRecords || res.data.totalElements || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotorbikes(filter);
  }, [filter]);

  // Table pagination
  const handleTableChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({
      ...prev,
      page,
      size: pageSize,
    }));
  };

  // Xử lý nhập Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importCarExcel(file);
      fetchMotorbikes(filter);
    } finally {
      setImporting(false);
      e.target.value = "";
      setLoading(false);
    }
  };

  // Xuất Excel
  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const blob = await exportCarExcel(filter);
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

  // Xử lý xóa xe
  const handleDelete = async (id: string) => {
    setLoading(true);
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      setLoading(true);
      try {
        await deleteCar(id);
        fetchMotorbikes(filter);
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
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div
              className="dp_flex"
              style={{ gap: 16, alignItems: "center", flexWrap: "wrap" }}
            >
              <InputBase
                modelValue={filter.keyword}
                placeholder="Tìm theo tên xe, biển số"
                prefixIcon="search"
                style={{ minWidth: 320, flex: 1 }}
                onChange={(val) =>
                  setFilter({ ...filter, keyword: val as string, page: 1 })
                }
              />
              <SelectboxBase
                value={filter.branchId}
                options={branchOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter({
                    ...filter,
                    branchId: typeof val === "string" ? val : val[0] || "",
                    page: 1,
                  })
                }
              />
              <SelectboxBase
                value={filter.carType}
                options={typeOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter({
                    ...filter,
                    carType: typeof val === "string" ? val : val[0] || "",
                    page: 1,
                  })
                }
              />
              <SelectboxBase
                value={filter.condition}
                options={conditionOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter({
                    ...filter,
                    condition: typeof val === "string" ? val : val[0] || "",
                    page: 1,
                  })
                }
              />
              <SelectboxBase
                value={filter.status || ""}
                options={statusOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter({
                    ...filter,
                    status: val === "" ? undefined : val,
                    page: 1,
                  })
                }
              />
              <ButtonBase
                label="Xuất Excel"
                className="btn_yellow"
                icon={<FileExcelOutlined />}
                style={{ minWidth: 140 }}
                onClick={handleExportExcel}
                loading={loading}
              />
              <label style={{ minWidth: 140 }}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={handleImportExcel}
                  disabled={importing}
                />
                <ButtonBase
                  label={importing ? "Đang nhập..." : "Nhập Excel"}
                  className="btn_yellow"
                  icon={<ImportOutlined />}
                  style={{ minWidth: 140 }}
                  onClick={() => {}}
                  disabled={importing}
                />
              </label>
              <ButtonBase
                label="Tải file mẫu"
                className="btn_gray"
                style={{ minWidth: 140 }}
                onClick={handleDownloadTemplate}
                loading={loading}
              />
              <ButtonBase
                label="Thêm xe"
                className="btn_primary"
                icon={<PlusOutlined />}
                style={{ minWidth: 140 }}
                onClick={() => {
                  setEditMotorbike(null);
                  setShowModal(true);
                }}
              />
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section">
            <TableBase
              data={motorbikes}
              loading={loading}
              columns={[
                {
                  title: "STT",
                  dataIndex: "id",
                  key: "id",
                  width: 60,
                  render: (_: any, __: any, idx: number) =>
                    filter.page
                      ? (filter.page - 1) * (filter.size || 10) + idx + 1
                      : idx + 1,
                },
                { title: "Mẫu xe", dataIndex: "model", key: "model" },
                {
                  title: "Biển số",
                  dataIndex: "licensePlate",
                  key: "licensePlate",
                },
                { title: "Loại xe", dataIndex: "carType", key: "carType" },
                {
                  title: "Chi nhánh sở hữu",
                  dataIndex: "branchName",
                  key: "branchName",
                },
                {
                  title: "Giá ngày (Đ)",
                  dataIndex: "dailyPrice",
                  key: "dailyPrice",
                  render: (val: number) =>
                    val != null ? val.toLocaleString() : "",
                },
                {
                  title: "Giá giờ (Đ)",
                  dataIndex: "hourlyPrice",
                  key: "hourlyPrice",
                  render: (val: number) =>
                    val != null ? val.toLocaleString() : "",
                },
                {
                  title: "Tình trạng xe",
                  dataIndex: "condition",
                  key: "condition",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: 120,
                  render: (_: string, record: any) => (
                    <span
                      style={{
                        borderRadius: 8,
                        padding: "2px 12px",
                        fontWeight: 500,
                        fontSize: 14,
                        display: "inline-block",
                        minWidth: 100,
                        textAlign: "center",
                        background: "#f5f5f5",
                        color: "#333",
                      }}
                    >
                      {record.statusNm || record.status}
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
                        icon={<HomeOutlined />}
                        className="btn_gray"
                        onClick={() => handleViewDetail(record.id)}
                        title="Xem chi tiết"
                      />
                    </div>
                  ),
                },
              ]}
              pageSize={filter.size || 10}
              totalPages={Math.ceil(total / (filter.size || 10))}
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
            <div style={{ padding: 16 }}>
              <div>
                <b>Mẫu xe:</b> {detailMotorbike.model}
              </div>
              <div>
                <b>Biển số:</b> {detailMotorbike.licensePlate}
              </div>
              <div>
                <b>Loại xe:</b> {detailMotorbike.carType}
              </div>
              <div>
                <b>Chi nhánh sở hữu:</b> {detailMotorbike.branchName}
              </div>
              <div>
                <b>Giá ngày:</b> {detailMotorbike.dailyPrice?.toLocaleString()}
              </div>
              <div>
                <b>Giá giờ:</b> {detailMotorbike.hourlyPrice?.toLocaleString()}
              </div>
              <div>
                <b>Tình trạng xe:</b> {detailMotorbike.condition}
              </div>
              <div>
                <b>Odo hiện tại:</b>{" "}
                {detailMotorbike.currentOdometer?.toLocaleString()}
              </div>
              <div>
                <b>Năm sản xuất:</b> {detailMotorbike.yearOfManufacture}
              </div>
              <div>
                <b>Xuất xứ:</b> {detailMotorbike.origin}
              </div>
              <div>
                <b>Giá trị xe:</b> {detailMotorbike.value?.toLocaleString()}
              </div>
              <div>
                <b>Số khung:</b> {detailMotorbike.frameNumber}
              </div>
              <div>
                <b>Số máy:</b> {detailMotorbike.engineNumber}
              </div>
              <div>
                <b>Màu sắc:</b> {detailMotorbike.color}
              </div>
              <div>
                <b>Số giấy đăng ký:</b> {detailMotorbike.registrationNumber}
              </div>
              <div>
                <b>Chủ đăng ký:</b> {detailMotorbike.registeredOwnerName}
              </div>
              <div>
                <b>Nơi đăng ký:</b> {detailMotorbike.registrationPlace}
              </div>
              <div>
                <b>Số HĐ bảo hiểm:</b> {detailMotorbike.insuranceContractNumber}
              </div>
              <div>
                <b>Hạn bảo hiểm:</b> {detailMotorbike.insuranceExpiryDate}
              </div>
              <div>
                <b>Ghi chú:</b> {detailMotorbike.note}
              </div>
              <div>
                <b>Ảnh xe:</b>{" "}
                {detailMotorbike.imageUrl ? (
                  <img
                    src={detailMotorbike.imageUrl}
                    alt="Ảnh xe"
                    style={{
                      width: 120,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <span style={{ color: "#bbb" }}>Không có</span>
                )}
              </div>
              <div>
                <b>Trạng thái:</b>{" "}
                <span
                  style={{
                    borderRadius: 8,
                    padding: "2px 12px",
                    fontWeight: 500,
                    fontSize: 14,
                    display: "inline-block",
                    minWidth: 100,
                    textAlign: "center",
                    background: "#f5f5f5",
                    color: "#333",
                  }}
                >
                  {detailMotorbike.statusNm || detailMotorbike.status}
                </span>
              </div>
            </div>
          </TModal>
        )}
      </div>
    </div>
  );
};
export default MotorbikeList;
