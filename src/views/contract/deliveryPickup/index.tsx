import React, { useState, useEffect } from "react";
import { Tabs, Table, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import { HomeOutlined } from "@ant-design/icons";
import ButtonBase from "@/component/common/button/ButtonBase";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import InputBase from "@/component/common/input/InputBase";
import { searchDeliveryContracts, searchPickupContracts } from "@/service/business/contractMng/contractMng.service";
import { getAllActiveBranches, getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";
import { ContractDTO, DeliveryPickupSearchDTO } from "@/service/business/contractMng/contractMng.type";
import { formatDateDMY } from "@/utils/common";
import ModalUpdateInfoDelivery from "../modal/ModalUpdateInfoDelivery";
import ModalUpdateInfoPickup from "../modal/ModalUpdateInfoPickup";
import { 
  getContractDetail, 
  updateDelivery, 
  updateReturn,
  checkDeliveryPermission,
  checkReturnPermission 
} from "@/service/business/contractMng/contractMng.service";
import { ContractCarSaveDTO } from "@/service/business/contractMng/contractMng.type";
import { getUserInfo } from "@/utils/storage";
import { SCREEN } from "@/router/screen";
import dayjs from "dayjs";

const DeliveryPickupPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("delivery");
  const [loading, setLoading] = useState(false);
  
  // Helper function để lấy đầu tháng và cuối tháng hiện tại
  const getCurrentMonthRange = (): [string, string] => {
    const startOfMonth = dayjs().startOf('month').startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endOfMonth = dayjs().endOf('month').endOf('day').format('YYYY-MM-DD HH:mm:ss');
    return [startOfMonth, endOfMonth];
  };
  
  // Filter states cho tab Chờ giao xe
  const [deliveryKeyword, setDeliveryKeyword] = useState<string>("");
  const [deliveryBranchId, setDeliveryBranchId] = useState<string>("");
  const [deliveryDateRange, setDeliveryDateRange] = useState<[string | null, string | null]>(
    getCurrentMonthRange() // Set default = tháng hiện tại
  );
  const [deliveryStatus, setDeliveryStatus] = useState<string>(""); // "all" | "delivered" | "not_delivered"
  
  // Filter states cho tab Chờ nhận xe
  const [pickupKeyword, setPickupKeyword] = useState<string>("");
  const [pickupBranchId, setPickupBranchId] = useState<string>("");
  const [pickupDateRange, setPickupDateRange] = useState<[string | null, string | null]>(
    getCurrentMonthRange() // Set default = tháng hiện tại
  );
  const [pickupStatus, setPickupStatus] = useState<string>(""); // "all" | "received" | "not_received"
  
  // Data states
  const [deliveryContracts, setDeliveryContracts] = useState<ContractDTO[]>([]);
  const [pickupContracts, setPickupContracts] = useState<ContractDTO[]>([]);
  const [deliveryTotal, setDeliveryTotal] = useState(0);
  const [pickupTotal, setPickupTotal] = useState(0);
  
  // Pagination states
  const [deliveryPagination, setDeliveryPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  
  const [pickupPagination, setPickupPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  
  // Options
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: string }[]>([]);
  
  // Modal states
  const [showModalDelivery, setShowModalDelivery] = useState(false);
  const [showModalPickup, setShowModalPickup] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractDTO | null>(null);
  const [deliveryDefault, setDeliveryDefault] = useState<{ staff: string; time: string }>({ staff: "", time: "" });
  const [pickupDefault, setPickupDefault] = useState<{ staff: string; time: string }>({ staff: "", time: "" });
  
  // User info
  let currentUser: any = getUserInfo();
  if (typeof currentUser === "string") {
    try {
      currentUser = JSON.parse(currentUser);
    } catch {
      currentUser = {};
    }
  }
  
  const staffOptions: { value: string; label: string }[] =
    currentUser?.userCurrent
      ? [
          {
            value: currentUser.userCurrent.id,
            label:
              currentUser.userCurrent.fullName ||
              currentUser.userCurrent.userName ||
              currentUser.userCurrent.username ||
              "Nhân viên",
          },
        ]
      : [];

  // Load branches
  useEffect(() => {
    getAllActiveBranches().then((res) => {
      setBranchOptions([
        { label: "Tất cả", value: "" },
        ...(res.data || []).map((b: any) => ({ label: b.name, value: b.id })),
      ]);
    });
    
    getBranchByCurrentUser().then((res) => {
      const branchId = res.data?.id || "";
      setDeliveryBranchId(branchId);
      setPickupBranchId(branchId);
    });
  }, []);

  // Fetch delivery contracts
  const fetchDeliveryContracts = async (page: number = deliveryPagination.current, pageSize: number = deliveryPagination.pageSize) => {
    setLoading(true);
    try {
      // Extract date only (YYYY-MM-DD) from datetime string for backend
      const dateFrom = deliveryDateRange[0] ? deliveryDateRange[0].split(' ')[0] : undefined;
      const dateTo = deliveryDateRange[1] ? deliveryDateRange[1].split(' ')[0] : undefined;
      
      const params: DeliveryPickupSearchDTO = {
        keyword: deliveryKeyword || undefined,
        branchId: deliveryBranchId || undefined,
        dateFrom: dateFrom,
        dateTo: dateTo,
        status: deliveryStatus || undefined,
        page: page,
        size: pageSize, // Giảm từ 100 xuống 20 để tối ưu với pagination
      };
      
      const res = await searchDeliveryContracts(params);
      const contracts = res.data.data || [];
      
      setDeliveryContracts(contracts);
      setDeliveryTotal(res.data.totalRecords || 0);
      setDeliveryPagination({
        current: page,
        pageSize: pageSize,
        total: res.data.totalRecords || 0,
      });
    } catch (err) {
      message.error("Lỗi khi tải danh sách hợp đồng chờ giao xe!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pickup contracts
  const fetchPickupContracts = async (page: number = pickupPagination.current, pageSize: number = pickupPagination.pageSize) => {
    setLoading(true);
    try {
      // Extract date only (YYYY-MM-DD) from datetime string for backend
      const dateFrom = pickupDateRange[0] ? pickupDateRange[0].split(' ')[0] : undefined;
      const dateTo = pickupDateRange[1] ? pickupDateRange[1].split(' ')[0] : undefined;
      
      const params: DeliveryPickupSearchDTO = {
        keyword: pickupKeyword || undefined,
        branchId: pickupBranchId || undefined,
        dateFrom: dateFrom,
        dateTo: dateTo,
        status: pickupStatus || undefined,
        page: page,
        size: pageSize, // Giảm từ 100 xuống 20 để tối ưu với pagination
      };
      
      const res = await searchPickupContracts(params);
      const contracts = res.data.data || [];
      
      setPickupContracts(contracts);
      setPickupTotal(res.data.totalRecords || 0);
      setPickupPagination({
        current: page,
        pageSize: pageSize,
        total: res.data.totalRecords || 0,
      });
    } catch (err) {
      message.error("Lỗi khi tải danh sách hợp đồng chờ nhận xe!");
    } finally {
      setLoading(false);
    }
  };

  // Handler cho pagination delivery
  const handleDeliveryTableChange = (page: number, pageSize: number) => {
    fetchDeliveryContracts(page, pageSize);
  };

  // Handler cho pagination pickup
  const handlePickupTableChange = (page: number, pageSize: number) => {
    fetchPickupContracts(page, pageSize);
  };

  // Load data khi tab thay đổi (không tự động load khi filter thay đổi)
  useEffect(() => {
    if (activeTab === "delivery") {
      fetchDeliveryContracts(1, deliveryPagination.pageSize); // Reset về trang 1 khi chuyển tab
    } else {
      fetchPickupContracts(1, pickupPagination.pageSize); // Reset về trang 1 khi chuyển tab
    }
  }, [activeTab]);

  // Handler giao xe
  const handleShowDeliveryModal = async (contract: ContractDTO) => {
    if (!contract.id) return;
    
    try {
      await checkDeliveryPermission(contract.id);
      
      // Load chi tiết hợp đồng để lấy đầy đủ thông tin xe
      const detailRes = await getContractDetail(contract.id);
      const contractDetail = detailRes.data;
      
      let defaultTime = "";
      if (contractDetail?.deliveryTime) {
        defaultTime = dayjs(contractDetail.deliveryTime).subtract(7, 'hour').format("YYYY-MM-DDTHH:mm:ss");
      } else if (contractDetail?.startDate) {
        defaultTime = dayjs(contractDetail.startDate).subtract(7, 'hour').format("YYYY-MM-DDTHH:mm:ss");
      } else {
        defaultTime = dayjs().format("YYYY-MM-DDTHH:mm:ss");
      }
      
      setDeliveryDefault({
        staff: currentUser?.userCurrent?.id || "",
        time: defaultTime,
      });
      setSelectedContract(contractDetail);
      setShowModalDelivery(true);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Lỗi không xác định khi kiểm tra quyền giao xe.";
      message.error(errorMessage);
    }
  };

  // Handler trả xe
  const handleShowPickupModal = async (contract: ContractDTO) => {
    if (!contract.id) return;
    
    try {
      await checkReturnPermission(contract.id);
      
      // Load chi tiết hợp đồng để lấy đầy đủ thông tin xe
      const detailRes = await getContractDetail(contract.id);
      const contractDetail = detailRes.data;
      
      let defaultTime = "";
      if (contractDetail?.returnTime) {
        defaultTime = dayjs(contractDetail.returnTime).subtract(7, 'hour').format("YYYY-MM-DDTHH:mm:ss");
      } else if (contractDetail?.endDate) {
        defaultTime = dayjs(contractDetail.endDate).subtract(7, 'hour').format("YYYY-MM-DDTHH:mm:ss");
      } else {
        defaultTime = dayjs().format("YYYY-MM-DDTHH:mm:ss");
      }
      
      setPickupDefault({
        staff: currentUser?.userCurrent?.id || "",
        time: defaultTime,
      });
      setSelectedContract(contractDetail);
      setShowModalPickup(true);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Lỗi không xác định khi kiểm tra quyền trả xe.";
      message.error(errorMessage);
    }
  };

  // Handler save delivery
  const handleDeliverySave = async (data: any) => {
    if (!selectedContract) return;
    
    const cars: ContractCarSaveDTO[] = (selectedContract.cars || []).map((c: any) => ({
      id: c.id,
      carId: c.carId || c.id,
      dailyPrice: c.dailyPrice,
      hourlyPrice: c.hourlyPrice,
      totalAmount: c.totalAmount,
      startOdometer: c.startOdometer,
      notes: c.notes,
    }));
    
    await updateDelivery({
      contractId: selectedContract.id,
      cars,
      deliveryUserId: data.staff,
      deliveryUserName:
        currentUser?.userCurrent?.fullName ||
        currentUser?.userCurrent?.userName ||
        currentUser?.userCurrent?.username ||
        "",
      deliveryTime: data.time,
    });
    
    setShowModalDelivery(false);
    setSelectedContract(null);
    message.success("Giao xe thành công!");
    fetchDeliveryContracts();
  };

  // Handler save pickup
  const handlePickupSave = async (data: any) => {
    if (!selectedContract) return;
    
    try {
      const cars: ContractCarSaveDTO[] = (data.cars || selectedContract.cars || []).map(
        (c: any) => ({
          id: c.id,
          carId: c.carId || c.id,
          endOdometer: c.endOdometer,
          notes: c.notes,
          status: c.status,
        })
      );

      await updateReturn({
        contractId: selectedContract.id,
        cars,
        returnUserId: data.staff,
        returnUserName:
          currentUser?.userCurrent?.fullName ||
          currentUser?.userCurrent?.userName ||
          currentUser?.userCurrent?.username ||
          "",
        returnTime: data.time,
      });
      
      message.success("Trả xe thành công!");
      setShowModalPickup(false);
      setSelectedContract(null);
      fetchPickupContracts();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Trả xe thất bại!";
      message.error(errorMessage);
    }
  };

  // Tính tổng tiền thuê xe cho hợp đồng
  const calculateTotalCar = (contract: ContractDTO) => {
    if (!contract.startDate || !contract.endDate) return 0;
    
    const ms = new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime();
    if (ms <= 0) return 0;
    
    let total = 0;
    (contract.cars || []).forEach((car: any) => {
      let totalHours = Math.ceil(ms / (1000 * 60 * 60));
      if (car.dailyPrice) {
        let days = Math.floor(totalHours / 24);
        let extraHours = totalHours % 24;
        if (days === 0) {
          days = 1;
          extraHours = 0;
        } else {
          if (extraHours > 8) {
            days += 1;
            extraHours = 0;
          }
        }
        total += (car.dailyPrice || 0) * days + (car.hourlyPrice || 0) * extraHours;
      } else if (car.hourlyPrice) {
        total += (car.hourlyPrice || 0) * totalHours;
      }
    });
    
    return total;
  };

  // Tính tổng phụ thu
  const calculateTotalSurcharge = (contract: ContractDTO) => {
    if (typeof contract.totalSurcharge === "number") {
      return contract.totalSurcharge;
    }
    if (Array.isArray(contract.surcharges)) {
      return contract.surcharges.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
    }
    return 0;
  };

  // Flatten contracts - mỗi hợp đồng 1 dòng
  const flattenDeliveryContracts = () => {
    return deliveryContracts.map((contract) => ({
      key: `contract-${contract.id}`,
      contract,
    }));
  };

  const flattenPickupContracts = () => {
    return pickupContracts.map((contract) => ({
      key: `contract-${contract.id}`,
      contract,
    }));
  };

  // Columns cho tab Chờ giao xe
  const deliveryColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mã hợp đồng",
      key: "contractCode",
      width: 120,
      render: (_: any, record: any) => {
        const contractCode = record.contract.contractCode || `HĐ-${record.contract.id.slice(0, 8)}`;
        return (
          <span
            style={{
              fontWeight: 500,
              color: "#1677ff",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate(SCREEN.contractDetail.path.replace(":id", record.contract.id))}
          >
            {contractCode}
          </span>
        );
      },
    },
    {
      title: "Tên khách hàng",
      key: "customerName",
      width: 150,
      render: (_: any, record: any) => {
        return record.contract.customerName || record.contract.customer?.fullName || "-";
      },
    },
    {
      title: "Số điện thoại",
      key: "phoneNumber",
      width: 120,
      render: (_: any, record: any) => {
        return record.contract.phoneNumber || "-";
      },
    },
    {
      title: "Địa điểm giao xe",
      key: "pickupAddress",
      width: 200,
      render: (_: any, record: any) => {
        return record.contract.pickupAddress || "-";
      },
    },
    {
      title: "Xe thuê",
      key: "cars",
      width: 300,
      render: (_: any, record: any) => {
        if (!record.contract.cars || record.contract.cars.length === 0) {
          return "-";
        }
        const carList = record.contract.cars
          .map((car: any) => `${car.carModel || "-"} (${car.licensePlate || "-"})`)
          .join("; ");
        return carList;
      },
    },
    {
      title: "Ngày thuê",
      key: "startDate",
      width: 150,
      render: (_: any, record: any) => {
        return record.contract.startDate ? formatDateDMY(record.contract.startDate) : "-";
      },
    },
    {
      title: "Trạng thái giao",
      key: "deliveryStatus",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => {
        const isDelivered = !!record.contract.deliveryTime;
        return (
          <span style={{ 
            color: isDelivered ? "#52c41a" : "#ff4d4f", 
            fontWeight: 500 
          }}>
            {isDelivered ? "Đã giao" : "Chưa giao"}
          </span>
        );
      },
    },
    {
      title: "Hoạt động",
      key: "action",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => {
        const isDelivered = !!record.contract.deliveryTime;
        return (
          <ButtonBase
            label="Giao xe"
            className="btn_primary"
            onClick={() => handleShowDeliveryModal(record.contract)}
            disabled={isDelivered}
            style={{ 
              minWidth: 100,
              opacity: isDelivered ? 0.5 : 1,
              cursor: isDelivered ? "not-allowed" : "pointer"
            }}
          />
        );
      },
    },
  ];

  // Columns cho tab Chờ nhận xe
  const pickupColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Mã hợp đồng",
      key: "contractCode",
      width: 120,
      render: (_: any, record: any) => {
        const contractCode = record.contract.contractCode || `HĐ-${record.contract.id.slice(0, 8)}`;
        return (
          <span
            style={{
              fontWeight: 500,
              color: "#1677ff",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate(SCREEN.contractDetail.path.replace(":id", record.contract.id))}
          >
            {contractCode}
          </span>
        );
      },
    },
    {
      title: "Tên khách hàng",
      key: "customerName",
      width: 150,
      render: (_: any, record: any) => {
        return record.contract.customerName || record.contract.customer?.fullName || "-";
      },
    },
    {
      title: "Số điện thoại",
      key: "phoneNumber",
      width: 120,
      render: (_: any, record: any) => {
        return record.contract.phoneNumber || "-";
      },
    },
    {
      title: "Địa điểm nhận xe",
      key: "returnAddress",
      width: 200,
      render: (_: any, record: any) => {
        return record.contract.returnAddress || "-";
      },
    },
    {
      title: "Xe thuê",
      key: "cars",
      width: 300,
      render: (_: any, record: any) => {
        if (!record.contract.cars || record.contract.cars.length === 0) {
          return "-";
        }
        const carList = record.contract.cars
          .map((car: any) => `${car.carModel || "-"} (${car.licensePlate || "-"})`)
          .join("; ");
        return carList;
      },
    },
    {
      title: "Ngày trả",
      key: "endDate",
      width: 150,
      render: (_: any, record: any) => {
        return record.contract.endDate ? formatDateDMY(record.contract.endDate) : "-";
      },
    },
    {
      title: "Trạng thái nhận",
      key: "returnStatus",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => {
        const isReceived = !!record.contract.returnTime;
        return (
          <span style={{ 
            color: isReceived ? "#52c41a" : "#ff4d4f", 
            fontWeight: 500 
          }}>
            {isReceived ? "Đã nhận" : "Chưa nhận"}
          </span>
        );
      },
    },
    {
      title: "Hoạt động",
      key: "action",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => {
        const isReceived = !!record.contract.returnTime;
        return (
          <ButtonBase
            label="Trả xe"
            className="btn_primary"
            onClick={() => handleShowPickupModal(record.contract)}
            disabled={isReceived}
            style={{ 
              minWidth: 100,
              opacity: isReceived ? 0.5 : 1,
              cursor: isReceived ? "not-allowed" : "pointer"
            }}
          />
        );
      },
    },
  ];

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        {loading && <LoadingIndicator />}
        <BreadcrumbBase
          title="Quản lý giao - nhận xe"
          items={[
            { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
            { label: "Quản lý hợp đồng", path: "/contract" },
            { label: "Giao nhận xe", path: "/contract/delivery-pickup" },
          ]}
        />

        <ContainerBase>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 24 }}
            items={[
              {
                key: "delivery",
                label: "Chờ giao xe",
                children: (
                  <div>
                    {/* Filters */}
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16, flexWrap: "nowrap" }}>
                      <div style={{ flex: 1, minWidth: 250 }}>
                        <InputBase
                          modelValue={deliveryKeyword}
                          placeholder="Tìm theo Mã HĐ, Tên KH, SĐT"
                          prefixIcon="search"
                          style={{ width: "100%" }}
                          onChange={(val) => setDeliveryKeyword(val as string)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              fetchDeliveryContracts();
                            }
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 180 }}>
                        <SelectboxBase
                          label="Chi nhánh thuê"
                          value={deliveryBranchId}
                          options={branchOptions}
                          onChange={(val) =>
                            setDeliveryBranchId(typeof val === "string" ? val : val[0] || "")
                          }
                          style={{ width: "100%" }}
                        />
                      </div>
                      <div style={{ minWidth: 280 }}>
                        <DatePickerBase
                          label="Ngày thuê từ"
                          value={deliveryDateRange[0]}
                          placeholder="Ngày thuê từ"
                          style={{ width: "100%" }}
                          onChange={(val) => {
                            // Set time = 00:00:00 cho ngày "từ"
                            const dateStr = val ? dayjs(val).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
                            setDeliveryDateRange([dateStr, deliveryDateRange[1]]);
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 280 }}>
                        <DatePickerBase
                          label="Ngày thuê đến"
                          value={deliveryDateRange[1]}
                          placeholder="Ngày thuê đến"
                          style={{ width: "100%" }}
                          onChange={(val) => {
                            // Set time = 23:59:59 cho ngày "đến"
                            const dateStr = val ? dayjs(val).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
                            setDeliveryDateRange([deliveryDateRange[0], dateStr]);
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 150 }}>
                        <SelectboxBase
                          label="Trạng thái giao"
                          value={deliveryStatus}
                          options={[
                            { label: "Tất cả", value: "" },
                            { label: "Đã giao", value: "delivered" },
                            { label: "Chưa giao", value: "not_delivered" },
                          ]}
                          onChange={(val) =>
                            setDeliveryStatus(typeof val === "string" ? val : val[0] || "")
                          }
                          style={{ width: "100%" }}
                        />
                      </div>
                      <ButtonBase
                        label="Tìm kiếm"
                        className="btn_primary"
                        icon={<SearchOutlined />}
                        onClick={() => fetchDeliveryContracts(1, deliveryPagination.pageSize)} // Reset về trang 1 khi tìm kiếm
                        loading={loading}
                      />
                    </div>

                    {/* Thống kê */}
                    <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 500, color: "#1677ff" }}>
                      Có {deliveryTotal} hợp đồng
                    </div>

                    {/* Table */}
                    <Table
                      columns={deliveryColumns}
                      dataSource={flattenDeliveryContracts()}
                      loading={loading}
                      pagination={{
                        current: deliveryPagination.current,
                        pageSize: deliveryPagination.pageSize,
                        total: deliveryPagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} hợp đồng`,
                        pageSizeOptions: ['20', '50', '100'],
                        onChange: handleDeliveryTableChange,
                        onShowSizeChange: handleDeliveryTableChange,
                      }}
                      scroll={{ x: 1200 }}
                      bordered
                    />
                  </div>
                ),
              },
              {
                key: "pickup",
                label: "Chờ nhận xe",
                children: (
                  <div>
                    {/* Filters */}
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16, flexWrap: "nowrap" }}>
                      <div style={{ flex: 1, minWidth: 250 }}>
                        <InputBase
                          modelValue={pickupKeyword}
                          placeholder="Tìm theo Mã HĐ, Tên KH, SĐT"
                          prefixIcon="search"
                          style={{ width: "100%" }}
                          onChange={(val) => setPickupKeyword(val as string)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              fetchPickupContracts();
                            }
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 180 }}>
                        <SelectboxBase
                          label="Chi nhánh trả"
                          value={pickupBranchId}
                          options={branchOptions}
                          onChange={(val) =>
                            setPickupBranchId(typeof val === "string" ? val : val[0] || "")
                          }
                          style={{ width: "100%" }}
                        />
                      </div>
                      <div style={{ minWidth: 280 }}>
                        <DatePickerBase
                          label="Ngày trả từ"
                          value={pickupDateRange[0]}
                          placeholder="Ngày trả từ"
                          style={{ width: "100%" }}
                          onChange={(val) => {
                            // Set time = 00:00:00 cho ngày "từ"
                            const dateStr = val ? dayjs(val).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
                            setPickupDateRange([dateStr, pickupDateRange[1]]);
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 280 }}>
                        <DatePickerBase
                          label="Ngày trả đến"
                          value={pickupDateRange[1]}
                          placeholder="Ngày trả đến"
                          style={{ width: "100%" }}
                          onChange={(val) => {
                            // Set time = 23:59:59 cho ngày "đến"
                            const dateStr = val ? dayjs(val).endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
                            setPickupDateRange([pickupDateRange[0], dateStr]);
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 150 }}>
                        <SelectboxBase
                          label="Trạng thái nhận"
                          value={pickupStatus}
                          options={[
                            { label: "Tất cả", value: "" },
                            { label: "Đã nhận", value: "received" },
                            { label: "Chưa nhận", value: "not_received" },
                          ]}
                          onChange={(val) =>
                            setPickupStatus(typeof val === "string" ? val : val[0] || "")
                          }
                          style={{ width: "100%" }}
                        />
                      </div>
                      <ButtonBase
                        label="Tìm kiếm"
                        className="btn_primary"
                        icon={<SearchOutlined />}
                        onClick={() => fetchPickupContracts(1, pickupPagination.pageSize)} // Reset về trang 1 khi tìm kiếm
                        loading={loading}
                      />
                    </div>

                    {/* Thống kê */}
                    <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 500, color: "#1677ff" }}>
                      Có {pickupTotal} hợp đồng
                    </div>

                    {/* Table */}
                    <Table
                      columns={pickupColumns}
                      dataSource={flattenPickupContracts()}
                      loading={loading}
                      pagination={{
                        current: pickupPagination.current,
                        pageSize: pickupPagination.pageSize,
                        total: pickupPagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} hợp đồng`,
                        pageSizeOptions: ['20', '50', '100'],
                        onChange: handlePickupTableChange,
                        onShowSizeChange: handlePickupTableChange,
                      }}
                      scroll={{ x: 1200 }}
                      bordered
                    />
                  </div>
                ),
              },
            ]}
          />
        </ContainerBase>

        {/* Modal Giao xe */}
        {selectedContract && (
          <>
            <ModalUpdateInfoDelivery
              open={showModalDelivery}
              onClose={() => {
                setShowModalDelivery(false);
                setSelectedContract(null);
              }}
              onSave={handleDeliverySave}
              cars={(selectedContract.cars || []).map((c: any) => ({
                id: c.id,
                carId: c.carId,
                type: c.carType,
                model: c.carModel,
                licensePlate: c.licensePlate,
                startOdometer: c.startOdometer,
                currentOdometer: c.currentOdometer,
                status: c.status || "",
              }))}
              staffOptions={staffOptions}
              defaultStaff={deliveryDefault.staff}
              defaultTime={deliveryDefault.time}
              totalCar={calculateTotalCar(selectedContract)}
              totalSurcharge={calculateTotalSurcharge(selectedContract)}
            />

            <ModalUpdateInfoPickup
              open={showModalPickup}
              onClose={() => {
                setShowModalPickup(false);
                setSelectedContract(null);
              }}
              onSave={handlePickupSave}
              cars={(selectedContract.cars || []).map((c: any) => ({
                id: c.id,
                carId: c.carId,
                type: c.carType,
                model: c.carModel,
                licensePlate: c.licensePlate,
                odometer: c.endOdometer || c.currentOdometer || "",
                startOdometer: c.startOdometer,
                condition: c.condition || "",
                status: c.status || "",
              }))}
              staffOptions={staffOptions}
              defaultStaff={pickupDefault.staff}
              defaultTime={pickupDefault.time}
              totalCar={calculateTotalCar(selectedContract)}
              totalSurcharge={calculateTotalSurcharge(selectedContract)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryPickupPage;

