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
import {
  searchContracts,
  deleteContract,
  downloadContractPDF,
  exportContractsToExcel,
} from "@/service/business/contractMng/contractMng.service";
import {
  ContractSearchDTO,
  ContractDTO,
} from "@/service/business/contractMng/contractMng.type";

const statusList = [
  { value: "DRAFT", label: "Nháp" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "DELIVERED", label: "Đã giao xe" },
  { value: "RETURNED", label: "Đã trả xe" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const branchList = [
  { value: "CN1", label: "Chi nhánh 1" },
  { value: "CN2", label: "Chi nhánh 2" },
  { value: "CN3", label: "Chi nhánh 3" },
];

const dateTypeList = [
  { value: "startDate", label: "Ngày thuê" },
  { value: "endDate", label: "Ngày trả" },
];

const statusMap: Record<string, string> = {
  DRAFT: "Nháp",
  CONFIRMED: "Đã xác nhận",
  DELIVERED: "Đã giao xe",
  RETURNED: "Đã trả xe",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã huỷ",
};

const ContractComponent = () => {
  const pageTitle = "Quản lý hợp đồng";
  const breadcrumbItems = [
    { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
    { label: "Quản lý hợp đồng", path: "/contract" },
  ];

  const navigate = useNavigate();

  // State filter
  const [filter, setFilter] = useState<ContractSearchDTO>({
    keyword: "",
    pickupBranchId: "",
    returnBranchId: "",
    status: "",
    page: 1,
    size: 10,
  });
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<ContractDTO[]>([]);
  const [total, setTotal] = useState(0);

  // Fetch contract list
  const fetchContracts = async (params: ContractSearchDTO) => {
    setLoading(true);
    try {
      const res = await searchContracts(params);
      setContracts(res.data.data);
      setTotal(res.data.totalElements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts(filter);
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
      const blob = await exportContractsToExcel(filter);
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
              <SelectboxBase
                value={filter.pickupBranchId}
                options={[
                  { value: "", label: "Chi nhánh thuê" },
                  ...branchList,
                ]}
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
                options={[{ value: "", label: "Chi nhánh trả" }, ...branchList]}
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
                options={[{ value: "", label: "Trạng thái" }, ...statusList]}
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
            <TableBase
              data={contracts}
              loading={loading}
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
                          .map((c: any) => `${c.carModel} (${c.licensePlate})`)
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
                  dataIndex: "status",
                  key: "status",
                  width: "8%",
                  render: (val: string) => (
                    <span className={`contract-status ${val}`}>
                      {statusMap[val] || val}
                    </span>
                  ),
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: "12%",
                  render: (_: any, record: ContractDTO) => (
                    <div className="dp_flex btn_group">
                      <ButtonBase
                        label="Xem"
                        className="btn_gray mg_r10"
                        onClick={() => {
                          navigate(`/contract/detail/${record.id}`);
                        }}
                      />
                      <ButtonBase
                        label="In"
                        className="btn_gray mg_r10"
                        onClick={() => handleDownloadPDF(record.id)}
                      />
                      {record.status !== "CANCELLED" && (
                        <>
                          <ButtonBase
                            label="Chỉnh sửa"
                            className="btn_gray mg_r10"
                            onClick={() => {
                              navigate(`/contract/edit/${record.id}`);
                            }}
                          />
                          <ButtonBase
                            label="Hủy"
                            className="btn_gray mg_r10"
                            onClick={() => handleDeleteContract(record.id)}
                          />
                          <ButtonBase
                            label="Thanh toán"
                            className="btn_gray"
                            onClick={() => {
                              navigate(`/contract/payment/${record.id}`);
                            }}
                          />
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
              pageSize={filter.size || 10}
              currentPage={filter.page || 1}
              total={total}
              onPageChange={handleTableChange}
            />
          </div>
        </ContainerBase>
      </div>
    </div>
  );
};

export default ContractComponent;
