import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import { Tabs, Input, Select, Button, DatePicker } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { CustomerDTO } from "@/service/business/customerMng/customerMng.type";
import { getCustomerDetail } from "@/service/business/customerMng/customerMng.service";
import { searchContractsLight, getContractStatuses } from "@/service/business/contractMng/contractMng.service";
import { ContractDTO, ContractSearchDTO } from "@/service/business/contractMng/contractMng.type";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import { BranchDTO } from "@/service/business/branchMng/branchMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import TableBase from "@/component/common/table/TableBase";
import type { ColumnsType } from "antd/es/table";
import { formatDateDMY } from "@/utils/common";

const { RangePicker } = DatePicker;

const { TabPane } = Tabs;

interface Props {
  open: boolean;
  customerId: string | null;
  onClose: () => void;
}

const ModalViewCustomer = ({ open, customerId, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  // Contract history state
  const [contracts, setContracts] = useState<ContractDTO[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractFilter, setContractFilter] = useState<ContractSearchDTO>({
    customerId: customerId || undefined,
    keyword: "",
    pickupBranchId: "",
    page: 1,
    size: 10,
  });
  const [appliedContractFilter, setAppliedContractFilter] = useState<ContractSearchDTO>({
    customerId: customerId || undefined,
    page: 1,
    size: 10,
  });
  const [contractTotal, setContractTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [branches, setBranches] = useState<BranchDTO[]>([]);
  const [contractsLoaded, setContractsLoaded] = useState(false);
  const [statusOptions, setStatusOptions] = useState([
    { value: "", label: "Trạng thái" },
  ]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerDetail();
      fetchBranches();
      // Reset filters when customerId changes
      const resetFilter: ContractSearchDTO = {
        customerId: customerId,
        keyword: "",
        pickupBranchId: "",
        status: "",
        createdDateFrom: undefined,
        createdDateTo: undefined,
        page: 1,
        size: 10,
      };
      setContractFilter(resetFilter);
      setAppliedContractFilter(resetFilter);
      setContractsLoaded(false); // Reset flag khi mở modal mới
      setContracts([]);
      setContractTotal(0);
      setTotalPages(0);
      setTotalAmount(0);
      setDateRange([null, null]);
    } else {
      setCustomer(null);
      setContracts([]);
      setContractTotal(0);
      setTotalPages(0);
      setTotalAmount(0);
      setContractsLoaded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerId]);

  // Load contracts khi filter thay đổi (chỉ nếu đang ở tab history và đã load lần đầu)
  useEffect(() => {
    if (activeTab === "history" && customerId && open && contractsLoaded && appliedContractFilter.customerId) {
      fetchContracts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedContractFilter]);

  // Load contracts khi appliedContractFilter.customerId được set (cho trường hợp handleTabChange set customerId)
  useEffect(() => {
    if (activeTab === "history" && customerId && open && !contractsLoaded && appliedContractFilter.customerId === customerId) {
      fetchContracts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedContractFilter.customerId]);

  const fetchCustomerDetail = async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerDetail(customerId);
      console.log("Detail customer response:", res); // Debug log
      if (res && res.data) {
        setCustomer(res.data);
      } else {
        console.error("Invalid response structure:", res);
        setError("Không thể tải thông tin khách hàng");
      }
    } catch (err: any) {
      console.error("Failed to fetch customer detail:", err);
      setError(err?.response?.data?.message || "Không thể tải thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await getAllActiveBranches();
      setBranches(res.data || []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  };

  // Fetch status options
  useEffect(() => {
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

  const fetchContracts = async () => {
    if (!customerId) return;
    setContractsLoading(true);
    try {
      // Clean up empty strings và convert thành undefined
      const cleanFilter: ContractSearchDTO = {
        customerId: customerId,
        page: appliedContractFilter.page || 1,
        size: appliedContractFilter.size || 10,
      };
      
      // Chỉ thêm các field có giá trị (không phải empty string)
      if (appliedContractFilter.keyword && appliedContractFilter.keyword.trim() !== "") {
        cleanFilter.keyword = appliedContractFilter.keyword;
      }
      if (appliedContractFilter.pickupBranchId && appliedContractFilter.pickupBranchId.trim() !== "") {
        cleanFilter.pickupBranchId = appliedContractFilter.pickupBranchId;
      }
      if (appliedContractFilter.status && appliedContractFilter.status.trim() !== "") {
        cleanFilter.status = appliedContractFilter.status;
      }
      if (appliedContractFilter.createdDateFrom) {
        cleanFilter.createdDateFrom = appliedContractFilter.createdDateFrom;
      }
      if (appliedContractFilter.createdDateTo) {
        cleanFilter.createdDateTo = appliedContractFilter.createdDateTo;
      }
      
      console.log("Fetching contracts with params:", cleanFilter); // Debug
      const res = await searchContractsLight(cleanFilter);
      console.log("Contract response:", res.data); // Debug
      console.log("Total amount:", res.data.totalAmount); // Debug
      setContracts(res.data.data || []);
      setContractTotal(res.data.totalRecords || res.data.totalElements || 0);
      setTotalPages(res.data.totalPages || 0);
      // Xử lý totalAmount - có thể là number hoặc string từ BigDecimal
      const amount = res.data.totalAmount;
      if (amount != null) {
        const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
        setTotalAmount(isNaN(numAmount) ? 0 : numAmount);
      } else {
        setTotalAmount(0);
      }
      setContractsLoaded(true);
    } catch (err: any) {
      console.error("Failed to fetch contracts:", err);
      console.error("Error details:", err?.response?.data); // Debug
      setContracts([]);
      setContractTotal(0);
      setTotalPages(0);
      setTotalAmount(0);
    } finally {
      setContractsLoading(false);
    }
  };

  // Handler khi đổi tab
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Chỉ load contracts khi click vào tab history lần đầu
    if (key === "history" && customerId && !contractsLoaded && open) {
      // Đảm bảo appliedContractFilter đã có customerId trước khi fetch
      if (!appliedContractFilter.customerId) {
        setAppliedContractFilter({
          ...appliedContractFilter,
          customerId: customerId,
        });
      } else {
        fetchContracts();
      }
    }
  };

  const handleContractSearch = () => {
    const newFilter: ContractSearchDTO = {
      ...contractFilter,
      customerId: customerId || undefined,
      page: 1,
      size: 10,
      // Đảm bảo các field rỗng được set thành undefined
      keyword: contractFilter.keyword || undefined,
      pickupBranchId: contractFilter.pickupBranchId || undefined,
      status: contractFilter.status || undefined,
      createdDateFrom: contractFilter.createdDateFrom || undefined,
      createdDateTo: contractFilter.createdDateTo || undefined,
    };
    setAppliedContractFilter(newFilter);
  };

  const handleContractReset = () => {
    const resetFilter: ContractSearchDTO = {
      customerId: customerId || undefined,
      keyword: "",
      pickupBranchId: "",
      status: "",
      createdDateFrom: undefined,
      createdDateTo: undefined,
      page: 1,
      size: 10,
    };
    setContractFilter(resetFilter);
    setAppliedContractFilter(resetFilter);
    setDateRange([null, null]);
  };

  const handleContractTableChange = (page: number, pageSize: number) => {
    setAppliedContractFilter({
      ...appliedContractFilter,
      page,
      size: pageSize,
    });
  };

  const contractColumns: ColumnsType<ContractDTO> = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: any, idx: number) =>
        ((appliedContractFilter.page || 1) - 1) * (appliedContractFilter.size || 10) + idx + 1,
    },
    {
      title: "Mã hợp đồng",
      dataIndex: "contractCode",
      key: "contractCode",
      render: (val: string) => val || "-",
    },
    {
      title: "Chi nhánh thuê",
      dataIndex: "pickupBranchName",
      key: "pickupBranchName",
      render: (val: string) => val || "-",
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (val: string) => (val ? formatDateDMY(val) : "-"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalAmount",
      key: "finalAmount",
      align: "right" as const,
      render: (val: number) => (val != null ? val.toLocaleString("vi-VN") + " đ" : "-"),
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      align: "right" as const,
      render: (val: number) => (val != null ? val.toLocaleString("vi-VN") + " đ" : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "statusNm",
      key: "statusNm",
      render: (val: string) => {
        const STATUS_COLOR_MAP: Record<string, { bg: string; color: string }> = {
          "Đã xác nhận": { bg: "#FFD600", color: "#222" },
          "Đã giao xe": { bg: "#345FCE", color: "#fff" },
          "Đã trả xe": { bg: "#FF8C00", color: "#fff" },
          "Hoàn thành": { bg: "#26D02E", color: "#fff" },
          "Đã hủy": { bg: "#F33232", color: "#fff" },
        };
        const label = val || "-";
        const colorObj = STATUS_COLOR_MAP[label] || {
          bg: "#E0E0E0",
          color: "#222",
        };
        return (
          <span
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
  ];

  const genderMap: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Chi tiết khách hàng"
      width={1000}
      hideOkButton={true}
      hideCancelButton={false}
    >
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <div style={{ padding: 20, textAlign: "center", color: "#ff4d4f" }}>
          {error}
        </div>
      ) : customer ? (
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Thông tin khách hàng" key="info">
            <div style={{ padding: "20px 0" }}>
          {/* Thông tin cơ bản */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1677ff" }}>
              Thông tin cơ bản
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 32px",
              }}
            >
              {[
                { label: "Họ tên", value: customer.fullName, bold: true },
                { label: "Số điện thoại", value: customer.phoneNumber },
                { label: "Email", value: customer.email || "-" },
                {
                  label: "Ngày sinh",
                  value: customer.dateOfBirth ? formatDateDMY(customer.dateOfBirth) : "-",
                },
                {
                  label: "Giới tính",
                  value: customer.gender ? (genderMap[customer.gender] || customer.gender) : "-",
                },
                { label: "Quốc gia", value: customer.country || "-" },
                { label: "Địa chỉ", value: customer.address || "-" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    paddingBottom: idx < 7 ? 12 : 0,
                    borderBottom: idx < 7 ? "1px solid #e8e8e8" : "none",
                  }}
                >
                  <div style={{ minWidth: 120, color: "#666", fontSize: 14, fontWeight: 500 }}>
                    {item.label}:
                  </div>
                  <div
                    style={{
                      flex: 1,
                      color: "#222",
                      fontSize: 14,
                      fontWeight: item.bold ? 600 : 400,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Giấy tờ tùy thân */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1677ff" }}>
              Giấy tờ tùy thân
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 32px",
              }}
            >
              {[
                { label: "Căn cước/CCCD/CMND", value: customer.citizenId || "-" },
                { label: "Giấy phép lái xe", value: customer.driverLicense || "-" },
                { label: "Hộ chiếu", value: customer.passport || "-" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    paddingBottom: idx < 2 ? 12 : 0,
                    borderBottom: idx < 2 ? "1px solid #e8e8e8" : "none",
                  }}
                >
                  <div style={{ minWidth: 150, color: "#666", fontSize: 14, fontWeight: 500 }}>
                    {item.label}:
                  </div>
                  <div
                    style={{
                      flex: 1,
                      color: "#222",
                      fontSize: 14,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Ảnh giấy tờ */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* CCCD mặt trước */}
                {customer.citizenIdFrontImageUrl && (
                  <div>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 14, fontWeight: 500 }}>
                      Căn cước/CCCD/CMND (Mặt trước):
                    </div>
                    <img
                      src={customer.citizenIdFrontImageUrl}
                      alt="CCCD mặt trước"
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        height: "auto",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  </div>
                )}
                {/* CCCD mặt sau */}
                {customer.citizenIdBackImageUrl && (
                  <div>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 14, fontWeight: 500 }}>
                      Căn cước/CCCD/CMND (Mặt sau):
                    </div>
                    <img
                      src={customer.citizenIdBackImageUrl}
                      alt="CCCD mặt sau"
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        height: "auto",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  </div>
                )}
                {/* Giấy phép lái xe */}
                {customer.driverLicenseImageUrl && (
                  <div>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 14, fontWeight: 500 }}>
                      Giấy phép lái xe:
                    </div>
                    <img
                      src={customer.driverLicenseImageUrl}
                      alt="Giấy phép lái xe"
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        height: "auto",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  </div>
                )}
                {/* Hộ chiếu */}
                {customer.passportImageUrl && (
                  <div>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 14, fontWeight: 500 }}>
                      Hộ chiếu:
                    </div>
                    <img
                      src={customer.passportImageUrl}
                      alt="Hộ chiếu"
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        height: "auto",
                        borderRadius: 8,
                        border: "1px solid #e8e8e8",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {customer.note && (
            <div
              style={{
                background: "#fafafa",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#1677ff" }}>
                Ghi chú
              </div>
              <div
                style={{
                  color: "#222",
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {customer.note}
              </div>
            </div>
          )}
            </div>
          </TabPane>

          <TabPane tab="Lịch sử thuê" key="history">
            <div style={{ padding: "20px 0" }}>
              {/* Filter section */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                }}
              >
                <Input
                  placeholder="Tìm theo mã hợp đồng"
                  value={contractFilter.keyword || ""}
                  onChange={(e) =>
                    setContractFilter({ ...contractFilter, keyword: e.target.value })
                  }
                  style={{ width: 200 }}
                  onPressEnter={handleContractSearch}
                />
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => {
                    setDateRange(dates);
                    if (dates && dates[0] && dates[1]) {
                      setContractFilter({
                        ...contractFilter,
                        createdDateFrom: dates[0].startOf('day').toDate(),
                        createdDateTo: dates[1].endOf('day').toDate(),
                      });
                    } else {
                      setContractFilter({
                        ...contractFilter,
                        createdDateFrom: undefined,
                        createdDateTo: undefined,
                      });
                    }
                  }}
                  format="DD/MM/YYYY"
                  style={{ width: 250 }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
                <Select
                  placeholder="Chi nhánh thuê"
                  value={contractFilter.pickupBranchId || undefined}
                  onChange={(val) =>
                    setContractFilter({ ...contractFilter, pickupBranchId: val || "" })
                  }
                  style={{ width: 200 }}
                  allowClear
                >
                  {branches.map((branch) => (
                    <Select.Option key={branch.id} value={branch.id}>
                      {branch.name}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder="Trạng thái"
                  value={contractFilter.status || undefined}
                  onChange={(val) =>
                    setContractFilter({ ...contractFilter, status: val || "" })
                  }
                  style={{ width: 150 }}
                  allowClear
                >
                  {statusOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleContractSearch}
                >
                  Tìm kiếm
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleContractReset}
                >
                  Đặt lại
                </Button>
              </div>

              {/* Statistics */}
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  gap: 24,
                  fontSize: 14,
                  color: "#666",
                  padding: "12px 16px",
                  background: "#f5f5f5",
                  borderRadius: 8,
                }}
              >
                <div>
                  Tổng số hợp đồng: <strong style={{ color: "#1677ff" }}>{contractTotal}</strong>
                </div>
                <div>
                  Tổng tiền: <strong style={{ color: "#52c41a" }}>{totalAmount.toLocaleString()} đ</strong>
                </div>
              </div>

              {/* Contract table */}
              <TableBase
                data={contracts}
                columns={contractColumns}
                paginationType="BE"
                pageSize={appliedContractFilter.size || 10}
                totalRecords={contractTotal}
                onPageChange={handleContractTableChange}
                loading={contractsLoading}
              />
            </div>
          </TabPane>
        </Tabs>
      ) : (
        <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
          Không tìm thấy thông tin khách hàng
        </div>
      )}
    </TModal>
  );
};

export default ModalViewCustomer;

