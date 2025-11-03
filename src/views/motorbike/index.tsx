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
} from "@/service/business/carMng/carMng.service";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import { CarSearchDTO, CarDTO } from "@/service/business/carMng/carMng.type";
import { BranchDTO } from "@/service/business/branchMng/branchMng.type";

const statusMap: Record<string, { label: string; color: string; bg: string }> =
  {
    ACTIVE: { label: "Hoạt động", color: "#27ae60", bg: "#eafbe7" },
    AVAILABLE: { label: "Hoạt động", color: "#27ae60", bg: "#eafbe7" },
    NOT_READY: { label: "Không sẵn sàng", color: "#f5a623", bg: "#fffbe6" },
    LOST: { label: "Bị mất", color: "#ff4d4f", bg: "#fff1f0" },
    BROKEN: { label: "Hỏng hóc", color: "#ff4d4f", bg: "#fff1f0" },
    INACTIVE: { label: "Ngừng hoạt động", color: "#bdbdbd", bg: "#f5f5f5" },
  };

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
        branchId: params.branchId || undefined,
        carType: params.carType || undefined,
        condition: params.condition || undefined,
        status: params.status || undefined,
      };
      const res = await searchCars(cleanParams);
      setMotorbikes(res.data.data);
      setTotal(res.data.totalElements);
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

  // Xử lý nhập Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importCarExcel(file);
      fetchMotorbikes(filter);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  // Xử lý xóa xe
  const handleDelete = async (id: string) => {
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

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
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
                  render: (val: string, record: any) => (
                    <span
                      style={{
                        background: statusMap[val]?.bg,
                        color: statusMap[val]?.color,
                        borderRadius: 8,
                        padding: "2px 12px",
                        fontWeight: 500,
                        fontSize: 14,
                        display: "inline-block",
                        minWidth: 100,
                        textAlign: "center",
                      }}
                    >
                      {record.statusNm || statusMap[val]?.label || val}
                    </span>
                  ),
                },
                {
                  title: "Hành động",
                  key: "actions",
                  width: 100,
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
                    </div>
                  ),
                },
              ]}
              pageSize={filter.size || 10}
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
            // Chuẩn hóa dữ liệu trước khi gửi
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
              status: motorbike.status || "ACTIVE",
              imageUrl: motorbike.image,
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
          }}
        />
      </div>
    </div>
  );
};
export default MotorbikeList;
