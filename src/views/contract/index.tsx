import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import { HomeOutlined, CarOutlined } from "@ant-design/icons";
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
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
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
  };
  const [filter, setFilter] = useState<ContractSearchDTO>(defaultFilter);
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

  // Thêm state cho ngày thuê
  const [startDateFrom, setStartDateFrom] = useState<string | null>(null);
  const [startDateTo, setStartDateTo] = useState<string | null>(null);

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
      };
      const res = await searchContracts(cleanParams);
      // Lấy phân trang từ API
      setContracts(res.data.data);
      setTotal(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts(filter);
  }, [filter]);

  // Fetch branches and statuses for filters
  useEffect(() => {
    getAllActiveBranches().then((res) => {
      const branchList = (res.data || []).map((b: any) => ({
        value: b.id,
        label: b.name,
      }));
      setPickupBranchOptions([{ value: "", label: "Chi nhánh thuê" }, ...branchList]);
      setReturnBranchOptions([{ value: "", label: "Chi nhánh trả" }, ...branchList]);
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
  }, []);

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      startDateFrom: startDateFrom || null,
      startDateTo: startDateTo || null,
      page: 1,
    }));
    // eslint-disable-next-line
  }, [startDateFrom, startDateTo]);

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
      // Chuyển các filter rỗng/undefined về null
      const exportParams = {
        ...filter,
        keyword: filter.keyword ? filter.keyword : null,
        status: filter.status ? filter.status : null,
        source: filter.source ? filter.source : null,
        startDateFrom: filter.startDateFrom ? filter.startDateFrom : null,
        startDateTo: filter.startDateTo ? filter.startDateTo : null,
        pickupBranchId: filter.pickupBranchId ? filter.pickupBranchId : null,
        returnBranchId: filter.returnBranchId ? filter.returnBranchId : null,
        page: filter.page || 1,
        size: filter.size || 10,
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
        fetchContracts(filter);
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
    setFilter(defaultFilter);
    setStartDateFrom(null);
    setStartDateTo(null);
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        {loading && <LoadingIndicator />}
        <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />
        <ContainerBase>
          <div className="box_section" style={{ paddingBottom: 0 }}>
            <div
              className="dp_flex"
              style={{
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <InputBase
                modelValue={filter.keyword}
                placeholder="Tìm theo tên khách, SDT, số hợp đồng, biển số xe"
                prefixIcon="search"
                style={{ minWidth: 320, flex: 1 }}
                onChange={(val) =>
                  setFilter((prev) => ({
                    ...prev,
                    keyword: val as string,
                    page: 1,
                  }))
                }
              />
              {/* Chọn ngày thuê từ */}
              <DatePickerBase
                label="Chọn ngày thuê"
                value={startDateFrom}
                placeholder="Chọn ngày thuê"
                style={{ minWidth: 140 }}
                onChange={(val) => setStartDateFrom(val)}
              />
              {/* Chọn ngày thuê đến */}
              <DatePickerBase
                label="Chọn ngày trả"
                value={startDateTo}
                placeholder="Chọn ngày trả"
                style={{ minWidth: 140 }}
                onChange={(val) => setStartDateTo(val)}
              />
              <SelectboxBase
                value={filter.pickupBranchId}
                options={pickupBranchOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter((prev) => ({
                    ...prev,
                    pickupBranchId:
                      typeof val === "string" ? val : val[0] || "",
                    page: 1,
                  }))
                }
              />
              <SelectboxBase
                value={filter.returnBranchId}
                options={returnBranchOptions}
                style={{ minWidth: 140 }}
                onChange={(val) =>
                  setFilter((prev) => ({
                    ...prev,
                    returnBranchId:
                      typeof val === "string" ? val : val[0] || "",
                    page: 1,
                  }))
                }
              />
              <SelectboxBase
                value={filter.status}
                options={statusOptions}
                style={{ minWidth: 120 }}
                onChange={(val) =>
                  setFilter((prev) => ({
                    ...prev,
                    status: typeof val === "string" ? val : val[0] || "",
                    page: 1,
                  }))
                }
              />
              <ButtonBase
                label="Xuất Excel"
                className="btn_yellow"
                icon={<CarOutlined />}
                style={{ marginLeft: 8, minWidth: 120 }}
                onClick={handleExportExcel}
                loading={loading}
              />
              <ButtonBase
                label="Đặt lại bộ lọc"
                className="btn_gray"
                style={{ minWidth: 120 }}
                onClick={handleResetFilter}
                disabled={loading}
              />
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
            {/* Thêm scroll ngang cho table */}
            <div style={{ overflowX: "auto" }}>
              <TableBase
                data={contracts}
                columns={[
                  {
                    title: "Mã hợp đồng",
                    dataIndex: "contractCode",
                    key: "contractCode",
                    width: "7%",
                  },
                  {
                    title: "Nguồn",
                    dataIndex: "source",
                    key: "source",
                    width: "7%",
                  },
                  {
                    title: "Khách hàng",
                    dataIndex: "customerName",
                    key: "customerName",
                    width: "10%",
                  },
                  {
                    title: "Số điện thoại",
                    dataIndex: "phoneNumber",
                    key: "phoneNumber",
                    width: "10%",
                  },
                  {
                    title: "Xe thuê",
                    dataIndex: "cars",
                    key: "cars",
                    width: "13%",
                    render: (cars: any) =>
                      Array.isArray(cars)
                        ? cars
                            .map(
                              (c: any) => `${c.carModel} (${c.licensePlate})`
                            )
                            .join("; ")
                        : "",
                  },
                  {
                    title: "Ngày thuê",
                    dataIndex: "startDate",
                    key: "startDate",
                    width: "8%",
                    render: (val: string) =>
                      val ? new Date(val).toLocaleDateString() : "",
                  },
                  {
                    title: "Ngày trả",
                    dataIndex: "endDate",
                    key: "endDate",
                    width: "8%",
                    render: (val: string) =>
                      val ? new Date(val).toLocaleDateString() : "",
                  },
                  {
                    title: "Chi nhánh thuê",
                    dataIndex: "pickupBranchName",
                    key: "pickupBranchName",
                    width: "7%",
                  },
                  {
                    title: "Chi nhánh trả",
                    dataIndex: "returnBranchName",
                    key: "returnBranchName",
                    width: "7%",
                  },
                  {
                    title: "Tổng tiền",
                    dataIndex: "finalAmount",
                    key: "finalAmount",
                    width: "8%",
                    render: (val: number) => val?.toLocaleString(),
                  },
                  {
                    title: "Đã trả",
                    dataIndex: "paidAmount",
                    key: "paidAmount",
                    width: "8%",
                    render: (val: number) => val?.toLocaleString(),
                  },
                  {
                    title: "Còn lại",
                    dataIndex: "remainingAmount",
                    key: "remainingAmount",
                    width: "8%",
                    render: (val: number) => val?.toLocaleString(),
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "statusNm",
                    key: "statusNm",
                    width: "8%",
                    render: (val: string) => (
                      <span className={`contract-status ${val}`}>{val}</span>
                    ),
                  },
                  {
                    title: "Thao tác",
                    key: "actions",
                    width: "12%",
                    render: (_: any, record: ContractDTO) => (
                      <div className="dp_flex btn_group" style={{ gap: 8 }}>
                        <ButtonBase
                          icon={<EyeOutlined />}
                          className="btn_gray"
                          title="Xem"
                          onClick={() => {
                            navigate(`/contract/detail/${record.id}`);
                          }}
                        />
                        <ButtonBase
                          icon={<EditOutlined />}
                          className="btn_gray"
                          title="Sửa"
                          onClick={() => {
                            navigate(`/contract/create?id=${record.id}`);
                          }}
                        />
                        <ButtonBase
                          icon={<PrinterOutlined />}
                          className="btn_gray"
                          title="In hợp đồng"
                          onClick={() => handleDownloadPDF(record.id)}
                        />
                        <ButtonBase
                          icon={<DeleteOutlined />}
                          className="btn_gray"
                          title="Xóa"
                          onClick={() => handleDeleteContract(record.id)}
                        />
                      </div>
                    ),
                  },
                ]}
                pageSize={filter.size || 10}
                currentPage={filter.page || 1}
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
