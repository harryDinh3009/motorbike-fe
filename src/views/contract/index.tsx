import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import { HomeOutlined, CarOutlined, SearchOutlined } from "@ant-design/icons";
import ButtonBase from "@/component/common/button/ButtonBase";
import TableBase from "@/component/common/table/TableBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import InputBase from "@/component/common/input/InputBase";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import {
  searchContracts,
  deleteContract,
  downloadContractPDF,
  exportContractsToExcel,
  getContractStatuses,
} from "@/service/business/contractMng/contractMng.service";
import { getAllActiveBranches, getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";
import {
  ContractSearchDTO,
  ContractDTO,
} from "@/service/business/contractMng/contractMng.type";
import {
  EyeOutlined,
  EditOutlined,
  PrinterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { formatDateDMY } from "@/utils/common";

const ContractComponent = () => {
  const pageTitle = "Quản lý hợp đồng";
  const breadcrumbItems = [
    { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
    { label: "Quản lý hợp đồng", path: "/contract" },
  ];

  const navigate = useNavigate();

  // State filter
  const defaultFilter: ContractSearchDTO = {
    keyword: "",
    pickupBranchId: "",
    returnBranchId: "",
    status: "",
    page: 1,
    size: 10,
    startDateFrom: null,
    startDateTo: null,
    endDateFrom: null,
    endDateTo: null,
  };
  // Filter input (chưa áp dụng) - để người dùng nhập/chọn
  const [filterInput, setFilterInput] = useState<ContractSearchDTO>(defaultFilter);
  // Applied filter (đang áp dụng) - để gọi API
  const [appliedFilter, setAppliedFilter] = useState<ContractSearchDTO>(defaultFilter);
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<ContractDTO[]>([]);
  const [total, setTotal] = useState(0);

  // Filter options state
  const [pickupBranchOptions, setPickupBranchOptions] = useState([
    { value: "", label: "Chi nhánh thuê" },
  ]);
  const [returnBranchOptions, setReturnBranchOptions] = useState([
    { value: "", label: "Chi nhánh trả" },
  ]);
  const [statusOptions, setStatusOptions] = useState([
    { value: "", label: "Trạng thái" },
  ]);

  // Thêm state cho ngày thuê và ngày trả (input)
  const [startDateFrom, setStartDateFrom] = useState<string | null>(null);
  const [startDateTo, setStartDateTo] = useState<string | null>(null);
  const [endDateFrom, setEndDateFrom] = useState<string | null>(null);
  const [endDateTo, setEndDateTo] = useState<string | null>(null);

  // Fetch contract list
  const fetchContracts = async (params: ContractSearchDTO) => {
    setLoading(true);
    try {
      // Chuyển "" thành null cho các filter
      const cleanParams: ContractSearchDTO = {
        ...params,
        pickupBranchId:
          params.pickupBranchId === "" ? null : params.pickupBranchId,
        returnBranchId:
          params.returnBranchId === "" ? null : params.returnBranchId,
        status: params.status === "" ? null : params.status,
        startDateFrom: params.startDateFrom ?? null,
        startDateTo: params.startDateTo ?? null,
        endDateFrom: params.endDateFrom ?? null,
        endDateTo: params.endDateTo ?? null,
      };
      const res = await searchContracts(cleanParams);
      // Lấy phân trang từ API
      setContracts(res.data.data);
      setTotal(res.data.totalRecords);
    } finally {
      setLoading(false);
    }
  };

  // Chỉ gọi API khi appliedFilter thay đổi
  useEffect(() => {
    fetchContracts(appliedFilter);
  }, [appliedFilter]);

  // Fetch branches and statuses for filters
  useEffect(() => {
    getAllActiveBranches().then((res) => {
      const branchList = (res.data || []).map((b: any) => ({
        value: b.id,
        label: b.name,
      }));
      setPickupBranchOptions([
        { value: "", label: "Chi nhánh thuê" },
        ...branchList,
      ]);
      setReturnBranchOptions([
        { value: "", label: "Chi nhánh trả" },
        ...branchList,
      ]);
    });
    getContractStatuses().then((res) => {
      setStatusOptions([
        { value: "", label: "Trạng thái" },
        ...(res.data || []).map((s: any) => ({
          value: s.code,
          label: s.name,
        })),
      ]);
    });
    
    // Lấy chi nhánh của user hiện tại và set vào filter "Chi nhánh thuê"
    getBranchByCurrentUser()
      .then((res) => {
        const currentBranchId = res.data?.id || "";
        if (currentBranchId) {
          setFilterInput((prev) => ({
            ...prev,
            pickupBranchId: currentBranchId,
          }));
          setAppliedFilter((prev) => ({
            ...prev,
            pickupBranchId: currentBranchId,
          }));
        }
      })
      .catch(() => {
        // Nếu không lấy được chi nhánh thì giữ nguyên filter mặc định
      });
  }, []);

  // Table pagination
  const handleTableChange = (page: number, pageSize: number) => {
    setAppliedFilter((prev) => ({
      ...prev,
      page,
      size: pageSize,
    }));
  };

  // Hàm tìm kiếm: áp dụng filterInput vào appliedFilter
  const handleSearch = () => {
    setAppliedFilter({
      ...filterInput,
      startDateFrom: startDateFrom || null,
      startDateTo: startDateTo || null,
      endDateFrom: endDateFrom || null,
      endDateTo: endDateTo || null,
      page: 1, // Reset về trang 1 khi tìm kiếm
    });
  };

  // Xuất Excel
  const handleExportExcel = async () => {
    setLoading(true);
    try {
      // Chuyển các filter rỗng/undefined về null
      const exportParams = {
        ...appliedFilter,
        keyword: appliedFilter.keyword ? appliedFilter.keyword : null,
        status: appliedFilter.status ? appliedFilter.status : null,
        source: appliedFilter.source ? appliedFilter.source : null,
        startDateFrom: appliedFilter.startDateFrom ? appliedFilter.startDateFrom : null,
        startDateTo: appliedFilter.startDateTo ? appliedFilter.startDateTo : null,
        endDateFrom: appliedFilter.endDateFrom ? appliedFilter.endDateFrom : null,
        endDateTo: appliedFilter.endDateTo ? appliedFilter.endDateTo : null,
        pickupBranchId: appliedFilter.pickupBranchId ? appliedFilter.pickupBranchId : null,
        returnBranchId: appliedFilter.returnBranchId ? appliedFilter.returnBranchId : null,
        page: appliedFilter.page || 1,
        size: appliedFilter.size || 10,
      };
      const blob = await exportContractsToExcel(exportParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Danh_Sach_Hop_Dong.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  // Xóa hợp đồng
  const handleDeleteContract = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy hợp đồng này?")) {
      setLoading(true);
      try {
        await deleteContract(id);
        fetchContracts(appliedFilter);
      } finally {
        setLoading(false);
      }
    }
  };

  // Tải PDF hợp đồng
  const handleDownloadPDF = async (id: string) => {
    setLoading(true);
    try {
      const blob = await downloadContractPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hop-dong-thue-xe-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilter = () => {
    setFilterInput(defaultFilter);
    setStartDateFrom(null);
    setStartDateTo(null);
    setEndDateFrom(null);
    setEndDateTo(null);
    setAppliedFilter(defaultFilter);
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        {loading && <LoadingIndicator />}
        <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />
        <ContainerBase>
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Hàng 1: Input search và 4 date picker */}
              <div
                className="dp_flex"
                style={{
                  alignItems: "flex-end",
                  flexWrap: "nowrap",
                  gap: 12,
                  overflowX: "auto",
                }}
              >
                <div style={{ minWidth: 200, flex: 1, flexShrink: 0 }}>
                  <InputBase
                    modelValue={filterInput.keyword}
                    placeholder="Tìm theo tên khách, SDT, số hợp đồng, biển số xe"
                    prefixIcon="search"
                    style={{ width: "100%" }}
                    onChange={(val) =>
                      setFilterInput((prev) => ({
                        ...prev,
                        keyword: val as string,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                {/* Chọn ngày thuê từ */}
                <DatePickerBase
                  label="Ngày thuê từ"
                  value={startDateFrom}
                  placeholder="Ngày thuê từ"
                  style={{ minWidth: 140, flexShrink: 0 }}
                  picker="date"
                  showTime={false}
                  dateOnly={true}
                  onChange={(val) => setStartDateFrom(val)}
                />
                {/* Chọn ngày thuê đến */}
                <DatePickerBase
                  label="Ngày thuê đến"
                  value={startDateTo}
                  placeholder="Ngày thuê đến"
                  style={{ minWidth: 140, flexShrink: 0 }}
                  picker="date"
                  showTime={false}
                  dateOnly={true}
                  onChange={(val) => setStartDateTo(val)}
                />
                {/* Chọn ngày trả từ */}
                <DatePickerBase
                  label="Ngày trả từ"
                  value={endDateFrom}
                  placeholder="Ngày trả từ"
                  style={{ minWidth: 140, flexShrink: 0 }}
                  picker="date"
                  showTime={false}
                  dateOnly={true}
                  onChange={(val) => setEndDateFrom(val)}
                />
                {/* Chọn ngày trả đến */}
                <DatePickerBase
                  label="Ngày trả đến"
                  value={endDateTo}
                  placeholder="Ngày trả đến"
                  style={{ minWidth: 140, flexShrink: 0 }}
                  picker="date"
                  showTime={false}
                  dateOnly={true}
                  onChange={(val) => setEndDateTo(val)}
                />
              </div>
              {/* Hàng 2: 3 dropdown và 2 button */}
              <div
                className="dp_flex"
                style={{
                  alignItems: "flex-end",
                  flexWrap: "nowrap",
                  gap: 12,
                  overflowX: "auto",
                }}
              >
                <SelectboxBase
                  label="Chi nhánh thuê"
                  value={filterInput.pickupBranchId}
                  options={pickupBranchOptions}
                  style={{ minWidth: 140, flexShrink: 0 }}
                  onChange={(val) =>
                    setFilterInput((prev) => ({
                      ...prev,
                      pickupBranchId:
                        typeof val === "string" ? val : val[0] || "",
                    }))
                  }
                />
                <SelectboxBase
                  label="Chi nhánh trả"
                  value={filterInput.returnBranchId}
                  options={returnBranchOptions}
                  style={{ minWidth: 140, flexShrink: 0 }}
                  onChange={(val) =>
                    setFilterInput((prev) => ({
                      ...prev,
                      returnBranchId:
                        typeof val === "string" ? val : val[0] || "",
                    }))
                  }
                />
                <SelectboxBase
                  label="Trạng thái"
                  value={filterInput.status}
                  options={statusOptions}
                  style={{ minWidth: 140, flexShrink: 0 }}
                  onChange={(val) =>
                    setFilterInput((prev) => ({
                      ...prev,
                      status: typeof val === "string" ? val : val[0] || "",
                    }))
                  }
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-end",
                    marginLeft: "auto",
                    flexShrink: 0,
                  }}
                >
                  <ButtonBase
                    label="Tìm kiếm"
                    className="btn_primary"
                    icon={<SearchOutlined />}
                    style={{ minWidth: 120, whiteSpace: "nowrap" }}
                    onClick={handleSearch}
                    loading={loading}
                  />
                  <ButtonBase
                    label="Xuất Excel"
                    className="btn_yellow"
                    icon={<CarOutlined />}
                    style={{ 
                      minWidth: 120, 
                      whiteSpace: "nowrap",
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                      color: "#fff"
                    }}
                    onClick={handleExportExcel}
                    loading={loading}
                  />
                  <ButtonBase
                    label="Đặt lại bộ lọc"
                    className="btn_gray"
                    style={{ minWidth: 120, whiteSpace: "nowrap" }}
                    onClick={handleResetFilter}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </ContainerBase>
        <ContainerBase>
          <div className="box_section">
            <div
              className="dp_flex dp_space_between mg_b15"
              style={{ alignItems: "center" }}
            >
              <p className="box_title_sm" style={{ marginBottom: 0 }}>
                Danh sách hợp đồng
              </p>
              <ButtonBase
                label="Thêm hợp đồng"
                className="btn_primary"
                onClick={() => navigate("/contract/create")}
                style={{ marginLeft: "auto" }}
              />
            </div>
            {/* Thêm scroll ngang cho table - scroll bar luôn hiển thị ở đầu */}
            <div 
              style={{ 
                overflowX: "scroll",
                overflowY: "auto",
                position: "relative",
                width: "100%",
                maxHeight: "calc(100vh - 300px)",
                minHeight: 380
              }}
            >
              <TableBase
                data={contracts}
                columns={[
                  {
                    title: "Mã hợp đồng",
                    dataIndex: "contractCode",
                    key: "contractCode",
                    width: "7%",
                    render: (val: string, record: ContractDTO) =>
                      val ? (
                        <a
                          href="#"
                          style={{
                            color: "#1677ff",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/contract/detail/${record.id}`);
                          }}
                        >
                          {val}
                        </a>
                      ) : (
                        "-"
                      ),
                  },
                  {
                    title: "Nguồn",
                    dataIndex: "source",
                    key: "source",
                    width: "7%",
                    render: (val: string) => val || "-",
                  },
                  {
                    title: "Khách hàng",
                    dataIndex: "customerName",
                    key: "customerName",
                    width: "10%",
                    render: (val: string) => val || "-",
                  },
                  {
                    title: "Số điện thoại",
                    dataIndex: "phoneNumber",
                    key: "phoneNumber",
                    width: "10%",
                    render: (val: string) => val || "-",
                  },
                  {
                    title: "Xe thuê",
                    dataIndex: "cars",
                    key: "cars",
                    width: "15%",
                    render: (cars: any) => {
                      if (!Array.isArray(cars) || cars.length === 0) {
                        return "-";
                      }
                      const maxDisplay = 3;
                      const displayCars = cars.slice(0, maxDisplay);
                      const remainingCount = cars.length - maxDisplay;
                      
                      return (
                        <div style={{ 
                          display: "flex", 
                          flexDirection: "column",
                          gap: 2,
                          lineHeight: 1.5
                        }}>
                          {displayCars.map((c: any, idx: number) => (
                            <div 
                              key={idx} 
                              style={{ 
                                display: "block",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {c.carModel || "-"} ({c.licensePlate || "-"}){idx < displayCars.length - 1 ? ";" : ""}
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <div style={{ 
                              color: "#1677ff", 
                              fontWeight: 500, 
                              marginTop: 4,
                              whiteSpace: "nowrap"
                            }}>
                              +{remainingCount} xe
                            </div>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    title: "Ngày thuê",
                    dataIndex: "startDate",
                    key: "startDate",
                    width: "8%",
                    render: (val: string) => (
                      <span style={{ whiteSpace: "nowrap" }}>
                        {formatDateDMY(val)}
                      </span>
                    ),
                  },
                  {
                    title: "Ngày trả",
                    dataIndex: "endDate",
                    key: "endDate",
                    width: "8%",
                    render: (val: string) => (
                      <span style={{ whiteSpace: "nowrap" }}>
                        {formatDateDMY(val)}
                      </span>
                    ),
                  },
                  {
                    title: "Chi nhánh thuê",
                    dataIndex: "pickupBranchName",
                    key: "pickupBranchName",
                    width: "7%",
                    render: (val: string) => val || "-",
                  },
                  {
                    title: "Chi nhánh trả",
                    dataIndex: "returnBranchName",
                    key: "returnBranchName",
                    width: "7%",
                    render: (val: string) => val || "-",
                  },
                  {
                    title: "Tổng tiền",
                    key: "finalAmount",
                    width: "12%",
                    align: "right" as const,
                    render: (_: any, record: any) => {
                      // Tính tổng tiền thuê xe giống detail
                      const rentalStart = record.startDate;
                      const rentalEnd = record.endDate;
                      const carRentalList = (record.cars || []).map(
                        (c: any) => {
                          let total = 0;
                          let ms = 0;
                          let days = 0;
                          let extraHours = 0;
                          if (
                            rentalStart &&
                            rentalEnd &&
                            (c.dailyPrice || c.hourlyPrice)
                          ) {
                            ms =
                              new Date(rentalEnd).getTime() -
                              new Date(rentalStart).getTime();
                            if (ms > 0) {
                              let totalHours = Math.ceil(ms / (1000 * 60 * 60));
                              if (c.dailyPrice) {
                                days = Math.floor(totalHours / 24);
                                extraHours = totalHours % 24;
                                if (days === 0) {
                                  days = 1;
                                  extraHours = 0;
                                } else {
                                  if (extraHours > 8) {
                                    days += 1;
                                    extraHours = 0;
                                  }
                                }
                                const msMod = ms % (1000 * 60 * 60);
                                if (
                                  days > 0 &&
                                  msMod > 0 &&
                                  msMod <= 1000 * 60 * 30 &&
                                  extraHours > 0
                                ) {
                                  extraHours -= 1;
                                  if (extraHours < 0) extraHours = 0;
                                }
                                total =
                                  (c.dailyPrice || 0) * days +
                                  (c.hourlyPrice || 0) * extraHours;
                              } else if (c.hourlyPrice) {
                                total = (c.hourlyPrice || 0) * totalHours;
                              }
                            }
                          }
                          return total;
                        }
                      );
                      const totalCar = carRentalList.reduce(
                        (sum: number, t: number) => sum + t,
                        0
                      );
                      // Lấy đúng tổng phụ thu từ trường totalSurcharge nếu có, nếu không thì tính lại từ surcharges
                      let totalSurcharge = 0;
                      if (typeof record.totalSurcharge === "number") {
                        totalSurcharge = record.totalSurcharge;
                      } else if (Array.isArray(record.surcharges)) {
                        totalSurcharge = record.surcharges.reduce(
                          (sum: number, s: any) => sum + (s.amount || 0),
                          0
                        );
                      }
                      const discount = record.discountAmount || 0;
                      // Tổng tiền = Tiền thuê xe + Tiền phụ thu - Giảm giá
                      const total = totalCar + totalSurcharge - discount;
                      return (
                        <span style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                          {total.toLocaleString("vi-VN")} đ
                        </span>
                      );
                    },
                  },
                  {
                    title: "Đã trả",
                    key: "paidAmount",
                    width: "12%",
                    align: "right" as const,
                    render: (_: any, record: any) => {
                      // Tổng các lần thanh toán (nếu có)
                      let paid = 0;
                      if (
                        Array.isArray(record.payments) &&
                        record.payments.length > 0
                      ) {
                        paid = record.payments.reduce(
                          (sum: number, p: any) => sum + (p.amount || 0),
                          0
                        );
                      } else {
                        paid = record.paidAmount || 0;
                      }
                      return (
                        <span style={{ whiteSpace: "nowrap" }}>
                          {paid.toLocaleString("vi-VN")} đ
                        </span>
                      );
                    },
                  },
                  {
                    title: "Còn lại",
                    key: "remainingAmount",
                    width: "12%",
                    align: "right" as const,
                    render: (_: any, record: any) => {
                      // Tính lại giống detail: Còn lại = Tổng tiền - Đã trả
                      const rentalStart = record.startDate;
                      const rentalEnd = record.endDate;
                      const carRentalList = (record.cars || []).map(
                        (c: any) => {
                          let total = 0;
                          let ms = 0;
                          let days = 0;
                          let extraHours = 0;
                          if (
                            rentalStart &&
                            rentalEnd &&
                            (c.dailyPrice || c.hourlyPrice)
                          ) {
                            ms =
                              new Date(rentalEnd).getTime() -
                              new Date(rentalStart).getTime();
                            if (ms > 0) {
                              let totalHours = Math.ceil(ms / (1000 * 60 * 60));
                              if (c.dailyPrice) {
                                days = Math.floor(totalHours / 24);
                                extraHours = totalHours % 24;
                                if (days === 0) {
                                  days = 1;
                                  extraHours = 0;
                                } else {
                                  if (extraHours > 8) {
                                    days += 1;
                                    extraHours = 0;
                                  }
                                }
                                const msMod = ms % (1000 * 60 * 60);
                                if (
                                  days > 0 &&
                                  msMod > 0 &&
                                  msMod <= 1000 * 60 * 30 &&
                                  extraHours > 0
                                ) {
                                  extraHours -= 1;
                                  if (extraHours < 0) extraHours = 0;
                                }
                                total =
                                  (c.dailyPrice || 0) * days +
                                  (c.hourlyPrice || 0) * extraHours;
                              } else if (c.hourlyPrice) {
                                total = (c.hourlyPrice || 0) * totalHours;
                              }
                            }
                          }
                          return total;
                        }
                      );
                      const totalCar = carRentalList.reduce(
                        (sum: number, t: number) => sum + t,
                        0
                      );
                      // Lấy đúng tổng phụ thu từ trường totalSurcharge nếu có, nếu không thì tính lại từ surcharges
                      let totalSurcharge = 0;
                      if (typeof record.totalSurcharge === "number") {
                        totalSurcharge = record.totalSurcharge;
                      } else if (Array.isArray(record.surcharges)) {
                        totalSurcharge = record.surcharges.reduce(
                          (sum: number, s: any) => sum + (s.amount || 0),
                          0
                        );
                      }
                      const discount = record.discountAmount || 0;
                      const total = totalCar + totalSurcharge - discount;
                      let paid = 0;
                      if (
                        Array.isArray(record.payments) &&
                        record.payments.length > 0
                      ) {
                        paid = record.payments.reduce(
                          (sum: number, p: any) => sum + (p.amount || 0),
                          0
                        );
                      } else {
                        paid = record.paidAmount || 0;
                      }
                      const remain = total - paid;
                      return (
                        <span style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                          {remain.toLocaleString("vi-VN")} đ
                        </span>
                      );
                    },
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "statusNm",
                    key: "statusNm",
                    width: "8%",
                    render: (val: string, record: any) => {
                      // Status color mapping
                      const STATUS_COLOR_MAP: Record<
                        string,
                        { bg: string; color: string }
                      > = {
                        "Đã xác nhận": { bg: "#FFD600", color: "#222" }, // yellow
                        "Đã giao xe": { bg: "#345FCE", color: "#fff" }, // blue
                        "Đã trả xe": { bg: "#FF8C00", color: "#fff" }, // orange
                        "Hoàn thành": { bg: "#26D02E", color: "#fff" }, // green
                        "Đã hủy": { bg: "#F33232", color: "#fff" }, // red
                      };
                      const label = val || "-";
                      const colorObj = STATUS_COLOR_MAP[label] || {
                        bg: "#E0E0E0",
                        color: "#222",
                      };
                      return (
                        <span
                          className="contract-status"
                          style={{
                            background: colorObj.bg,
                            color: colorObj.color,
                            borderRadius: 6,
                            padding: "2px 12px",
                            fontWeight: 600,
                            fontSize: 14,
                            display: "inline-block",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </span>
                      );
                    },
                  },
                  {
                    title: "Thao tác",
                    key: "actions",
                    width: "12%",
                    render: (_: any, record: ContractDTO) => (
                      <div className="dp_flex btn_group" style={{ gap: 8 }}>
                        <ButtonBase
                          label=""
                          icon={<EyeOutlined />}
                          className="btn_gray"
                          title="Xem"
                          onClick={() => {
                            navigate(`/contract/detail/${record.id}`);
                          }}
                        />
                        {/* Đã xóa các nút Sửa, In hợp đồng, Xóa */}
                      </div>
                    ),
                  },
                ]}
                pageSize={appliedFilter.size || 10}
                // currentPage removed to fix lint error
                totalPages={total}
                paginationType="BE"
                onPageChange={handleTableChange}
                style={{ minWidth: 1400 }}
              />
            </div>
          </div>
        </ContainerBase>
      </div>
    </div>
  );
};

export default ContractComponent;
