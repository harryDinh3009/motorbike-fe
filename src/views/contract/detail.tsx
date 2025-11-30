import { formatDateDMY } from "@/utils/common";
import React, { useEffect, useState } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import {
  HomeOutlined,
  CheckCircleTwoTone,
  ClockCircleTwoTone,
} from "@ant-design/icons";
import { Table, Dropdown, Menu, message } from "antd";
import ButtonBase from "@/component/common/button/ButtonBase";
import {
  EditOutlined,
  CarOutlined,
  RollbackOutlined,
  DollarOutlined,
  FileDoneOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  getContractDetail,
  getSurchargesByContractId,
  getPaymentHistory,
  updateDelivery,
  updateReturn,
  addPayment,
  completeContract,
  getContractStatuses,
  deleteContract,
  downloadContractPDF,
  exportContractReceipt,
} from "@/service/business/contractMng/contractMng.service";
import {
  ContractDTO,
  SurchargeDTO,
  PaymentTransactionDTO,
  ContractCarSaveDTO,
} from "@/service/business/contractMng/contractMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import { useParams, useNavigate } from "react-router-dom";
import ModalUpdateInfoPickup from "./modal/ModalUpdateInfoPickup";
import ModalUpdateInfoDelivery from "./modal/ModalUpdateInfoDelivery";
import ModalUpdatePayment from "./modal/ModalUpdatePayment";
import ModalCloseContract from "./modal/ModalCloseContract";
import { getUserInfo } from "@/utils/storage";
import { getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";

const pageTitle = "Chi tiết hợp đồng thuê xe";
const breadcrumbItems = [
  { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
  { label: "Quản lý hợp đồng", path: "/contract" },
  { label: "Chi tiết hợp đồng", path: "/contract/detail" },
];

// Hàm tính số ngày, số giờ phát sinh và tổng tiền thuê cho từng xe
function calcRentalInfo(
  start: string,
  end: string,
  dailyPrice: number,
  hourlyPrice: number
) {
  if (!start || !end || (!dailyPrice && !hourlyPrice))
    return { days: 0, extraHours: 0, total: 0, durationText: "" };
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return { days: 0, extraHours: 0, total: 0, durationText: "" };
  let totalHours = Math.ceil(ms / (1000 * 60 * 60));
  let days = 0;
  let extraHours = 0;
  let total = 0;
  let durationText = "";

  if (dailyPrice) {
    if (totalHours < 24) {
      // Nếu thuê dưới 24h thì tính là 1 ngày
      days = 1;
      extraHours = 0;
      total = dailyPrice;
      durationText = "1 ngày";
    } else {
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
      if (days > 0 && msMod > 0 && msMod <= 1000 * 60 * 30 && extraHours > 0) {
        extraHours -= 1;
        if (extraHours < 0) extraHours = 0;
      }
      total = dailyPrice * days + (hourlyPrice || 0) * extraHours;
      if (days > 0 && extraHours > 0) {
        durationText = `${days} ngày ${extraHours} giờ`;
      } else if (days > 0) {
        durationText = `${days} ngày`;
      } else {
        durationText = `${extraHours} giờ`;
      }
    }
  } else if (hourlyPrice) {
    // Nếu chỉ có giá giờ
    total = hourlyPrice * totalHours;
    durationText = `${totalHours} giờ`;
  }

  return { days, extraHours, total, durationText };
}

const ContractDetailComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<ContractDTO | null>(null);
  const [surchargeList, setSurchargeList] = useState<SurchargeDTO[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransactionDTO[]>(
    []
  );

  // Modal states
  const [showModalPickup, setShowModalPickup] = useState(false);
  const [showModalDelivery, setShowModalDelivery] = useState(false);
  const [showModalPayment, setShowModalPayment] = useState(false);
  const [showModalClose, setShowModalClose] = useState(false);
  // Parse user info from localStorage or use as object
  let currentUser: any = getUserInfo();
  if (typeof currentUser === "string") {
    try {
      currentUser = JSON.parse(currentUser);
    } catch {
      currentUser = {};
    }
  }

  // Lưu lại danh sách thanh toán hiện tại để truyền vào modal
  const [currentPayments, setCurrentPayments] = useState<any[]>([]);

  // State cho danh sách trạng thái xe
  const [carStatusOptions, setCarStatusOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // State để lưu defaultStaff, defaultTime cho modal giao/nhận xe
  const [deliveryDefault, setDeliveryDefault] = useState<{
    staff: string;
    time: string;
  }>({ staff: "", time: "" });
  const [pickupDefault, setPickupDefault] = useState<{
    staff: string;
    time: string;
  }>({ staff: "", time: "" });

  // State cho chi nhánh hiện tại của user
  const [currentBranchId, setCurrentBranchId] = useState<string>("");

  // Export biên nhận trả xe
  const handleExportReceipt = async () => {
    if (!contract?.id) return;
    try {
      setLoading(true);
      const blob = await exportContractReceipt({ contractId: contract.id });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bien-nhan-hop-dong-${
        contract.contractCode || contract.id
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setLoading(false);
      message.success("Xuất biên nhận trả xe thành công!");
    } catch {
      setLoading(false);
      message.error("Xuất biên nhận trả xe thất bại!");
    }
  };

  // Hàm reload lại dữ liệu hợp đồng
  const reloadData = async () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getContractDetail(id),
      getSurchargesByContractId(id),
      getPaymentHistory(id),
    ])
      .then(([contractRes, surchargeRes, paymentRes]) => {
        setContract(contractRes.data);
        setSurchargeList(surchargeRes.data || []);
        setPaymentHistory(paymentRes.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reloadData();
    // Lấy trạng thái xe từ API
    getContractStatuses().then((res) => {
      if (Array.isArray(res.data)) {
        setCarStatusOptions(
          res.data.map((item) => ({
            value: item.code,
            label: item.name,
          }))
        );
      }
    });
    // Lấy chi nhánh hiện tại của user để phân quyền
    getBranchByCurrentUser()
      .then((res) => setCurrentBranchId(res.data?.id || ""))
      .catch(() => setCurrentBranchId(""));
    // eslint-disable-next-line
  }, [id]);

  if (loading || !contract) {
    return <LoadingIndicator />;
  }

  // Tính toán thời gian thuê và tiền thuê từng xe
  const rentalStart = contract.startDate;
  const rentalEnd = contract.endDate;
  const carRentalList = (contract.cars || []).map((c) => {
    const { days, extraHours, total, durationText } = calcRentalInfo(
      rentalStart,
      rentalEnd,
      c.dailyPrice || 0,
      c.hourlyPrice || 0
    );
    return {
      ...c,
      rentalDays: days,
      rentalExtraHours: extraHours,
      rentalDurationText: durationText,
      rentalTotal: total,
    };
  });

  // Tính tổng tiền thuê xe theo công thức mới
  const totalCar = carRentalList.reduce(
    (sum, c) => sum + (c.rentalTotal || 0),
    0
  );

  // Tính tổng phụ thu
  const totalSurcharge = (surchargeList || []).reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );
  // Tính tổng đã thanh toán
  const totalPaid = (paymentHistory || []).reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );
  // Tổng cộng
  const totalAll = totalCar + totalSurcharge;
  // Còn lại (đã sửa công thức: trừ thêm giảm giá)
  const remain =
    totalCar + totalSurcharge - (contract.discountAmount || 0) - totalPaid;

  // Status icon
  const statusIcon =
    contract.statusNm === "Đã đặt" || contract.status === "CONFIRMED" ? (
      <CheckCircleTwoTone twoToneColor="#52c41a" style={{ marginRight: 6 }} />
    ) : (
      <ClockCircleTwoTone twoToneColor="#faad14" style={{ marginRight: 6 }} />
    );

  // Handler cho modal giao xe
  const handleDeliverySave = async (data: any) => {
    if (!contract) return;
    // Chuẩn hóa danh sách xe cho API, truyền startOdometer lấy từ detail
    const cars: ContractCarSaveDTO[] = (contract.cars || []).map((c: any) => ({
      id: c.id,
      carId: c.carId || c.id,
      dailyPrice: c.dailyPrice,
      hourlyPrice: c.hourlyPrice,
      totalAmount: c.totalAmount,
      startOdometer: c.startOdometer, // luôn truyền startOdometer từ detail
      notes: c.notes,
    }));
    await updateDelivery({
      contractId: contract.id,
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
    reloadData();
  };

  // Handler cho modal trả xe
  const handlePickupSave = async (data: any) => {
    console.log(data);

    if (!contract) return;
    const cars: ContractCarSaveDTO[] = (data.cars || contract.cars || []).map(
      (c: any) => ({
        id: c.id,
        carId: c.carId || c.id,
        endOdometer: c.endOdometer,
        notes: c.notes,
        status: c.status,
      })
    );

    await updateReturn({
      contractId: contract.id,
      cars,
      returnUserId: data.staff,
      returnUserName:
        currentUser?.userCurrent?.fullName ||
        currentUser?.userCurrent?.userName ||
        currentUser?.userCurrent?.username ||
        "",
      returnTime: data.time,
    });
    setShowModalPickup(false);
    reloadData();
  };

  // Handler cho modal thanh toán
  const handlePaymentSave = async (payments: any[]) => {
    if (!contract) return;
    for (const p of payments) {
      await addPayment({
        contractId: contract.id,
        paymentMethod: p.method,
        amount: Number(p.amount),
        paymentDate: p.date,
        notes: p.note,
      });
    }
    setShowModalPayment(false);
    reloadData();
  };

  // Handler cho modal đóng hợp đồng
  const handleCloseContract = async (data: any) => {
    if (!contract) return;
    await completeContract({
      contractId: contract.id,
      completedDate: data.closeDate,
      finalPaymentAmount: data.paymentAmount,
      paymentMethod: data.paymentMethod,
    });
    setShowModalClose(false);
    reloadData();
  };

  // Khi bấm nút "Thanh toán", truyền danh sách thanh toán hiện tại vào modal
  const handleShowPaymentModal = () => {
    if (!contract) return;
    const mapped = (paymentHistory || []).map((p) => ({
      id: p.id,
      contractId: contract.id, // truyền contractId vào từng item
      method: p.paymentMethod || "",
      amount: p.amount || "",
      date: p.paymentDate || "",
      note: p.notes || "",
    }));
    setShowModalPayment(true);
    setCurrentPayments(mapped.length ? mapped : []);
  };

  // Khi bấm nút "Giao xe"
  const handleShowDeliveryModal = () => {
    setDeliveryDefault({
      staff: currentUser?.userCurrent?.id || "",
      time: contract?.deliveryTime || new Date().toISOString(),
    });
    setShowModalDelivery(true);
  };

  // Khi bấm nút "Trả xe"
  const handleShowPickupModal = () => {
    setPickupDefault({
      staff: currentUser?.userCurrent?.id || "",
      time: contract?.returnTime || new Date().toISOString(),
    });
    setShowModalPickup(true);
  };

  // Chuẩn hóa dữ liệu cho các modal
  // TODO: Replace with real staff list if available
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

  // In hợp đồng
  const handlePrintContract = async () => {
    if (!contract?.id) return;
    try {
      setLoading(true);
      const blob = await downloadContractPDF(contract.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hop-dong-thue-xe-${
        contract.contractCode || contract.id
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch {
      setLoading(false);
      message.error("Tải file hợp đồng thất bại!");
    }
  };

  // Hủy hợp đồng
  const handleCancelContract = async () => {
    if (!contract?.id) return;
    if (!window.confirm("Bạn có chắc chắn muốn hủy hợp đồng này?")) return;
    try {
      setLoading(true);
      await deleteContract(contract.id);
      setLoading(false);
      message.success("Đã hủy hợp đồng!");
      navigate("/contract");
    } catch {
      setLoading(false);
      message.error("Hủy hợp đồng thất bại!");
    }
  };

  // Phân quyền chức năng
  const canEditOrCancelOrPay =
    currentBranchId &&
    (contract?.pickupBranchId === currentBranchId ||
      contract?.returnBranchId === currentBranchId);

  const canDelivery =
    currentBranchId && contract?.pickupBranchId === currentBranchId;

  const canReturn =
    currentBranchId && contract?.returnBranchId === currentBranchId;

  // Handler cho các chức năng bị hạn chế quyền
  const handleNoPermission = () => {
    message.error("Lỗi không được thực hiện chức năng");
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />

        {/* Dải button thao tác */}
        <div
          className="dp_flex"
          style={{
            justifyContent: "flex-end",
            gap: 12,
            marginBottom: 20,
            width: "100%",
          }}
        >
          {/* Chỉnh sửa: chỉ user thuộc chi nhánh thuê hoặc trả */}
          <ButtonBase
            label="Chỉnh sửa"
            className="btn_primary"
            icon={<EditOutlined />}
            onClick={() => {
              if (!canEditOrCancelOrPay) return handleNoPermission();
              if (contract?.id) {
                navigate(`/contract/create?id=${contract.id}`);
              }
            }}
          />
          {/* Giao xe: chỉ user thuộc chi nhánh thuê */}
          {(() => {
            const hideAll = ["RETURNED", "COMPLETED", "CANCELLED"];
            if (hideAll.includes(contract?.status || "")) {
              return null;
            }
            if (contract.status === "CONFIRMED") {
              return (
                <ButtonBase
                  label="Giao xe"
                  className="btn_primary"
                  icon={<CarOutlined />}
                  onClick={() => {
                    if (!canDelivery) return handleNoPermission();
                    handleShowDeliveryModal();
                  }}
                />
              );
            }
            if (contract.status === "DELIVERED") {
              return (
                <ButtonBase
                  label="Trả xe"
                  className="btn_primary"
                  icon={<RollbackOutlined />}
                  onClick={() => {
                    if (!canReturn) return handleNoPermission();
                    handleShowPickupModal();
                  }}
                />
              );
            }
            // Các trạng thái khác (nháp, chờ duyệt, ...) có thể hiện cả 2 nút nếu muốn
            return (
              <>
                <ButtonBase
                  label="Giao xe"
                  className="btn_primary"
                  icon={<CarOutlined />}
                  onClick={() => {
                    if (!canDelivery) return handleNoPermission();
                    handleShowDeliveryModal();
                  }}
                />
                <ButtonBase
                  label="Trả xe"
                  className="btn_primary"
                  icon={<RollbackOutlined />}
                  onClick={() => {
                    if (!canReturn) return handleNoPermission();
                    handleShowPickupModal();
                  }}
                />
              </>
            );
          })()}
          {/* Ẩn các nút sau nếu trạng thái là "Đã hủy" */}
          {contract?.statusNm !== "Đã hủy" && (
            <>
              {/* Ẩn button Thanh toán và Đóng HĐ khi trạng thái là "Hoàn thành" */}
              {contract?.statusNm !== "Hoàn thành" && (
                <>
                  <ButtonBase
                    label="Thanh toán"
                    className="btn_primary"
                    icon={<DollarOutlined />}
                    onClick={() => {
                      if (!canEditOrCancelOrPay) return handleNoPermission();
                      handleShowPaymentModal();
                    }}
                  />
                  <ButtonBase
                    label="Đóng HĐ"
                    className="btn_primary"
                    icon={<FileDoneOutlined />}
                    onClick={() => {
                      if (!canEditOrCancelOrPay) return handleNoPermission();
                      setShowModalClose(true);
                    }}
                  />
                </>
              )}
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="print" onClick={handlePrintContract}>
                      In hợp đồng
                    </Menu.Item>
                    <Menu.Item key="export_receipt" onClick={handleExportReceipt}>
                      In biên nhận
                    </Menu.Item>
                    {/* Hủy hợp đồng: chỉ user thuộc chi nhánh thuê hoặc trả */}
                    <Menu.Item
                      key="cancel"
                      onClick={() => {
                        if (!canEditOrCancelOrPay) return handleNoPermission();
                        handleCancelContract();
                      }}
                    >
                      Hủy hợp đồng
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <ButtonBase
                  label="Khác"
                  className="btn_lightgray"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.preventDefault()}
                />
              </Dropdown>
            </>
          )}
        </div>

        <div
          className="dp_flex"
          style={{
            gap: 24,
            alignItems: "stretch",
            marginBottom: 24,
            width: "100%",
          }}
        >
          {/* Thông tin hợp đồng */}
          <ContainerBase
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="box_section"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minWidth: 750,
              }}
            >
              <p
                className="box_title_sm"
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <HomeOutlined style={{ color: "#1677ff", marginRight: 8 }} />
                Thông tin hợp đồng
              </p>
              <div className="dp_flex" style={{ gap: 24, flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      background: "#fafafa",
                      borderRadius: 8,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      { label: "Mã hợp đồng", value: contract.contractCode, bold: true },
                      { label: "Nguồn", value: contract.source },
                      { label: "Ngày thuê", value: formatDateDMY(contract.startDate) },
                      { label: "Chi nhánh thuê", value: contract.pickupBranchName },
                      { label: "Địa điểm giao xe", value: contract.pickupAddress || "-" },
                      { label: "Thời gian giao xe", value: contract.deliveryTime ? formatDateDMY(contract.deliveryTime) : "-" },
                      { label: "Người giao xe", value: contract.deliveryUserName || "-" },
                      { label: "Ghi chú", value: contract.notes || "-" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          paddingBottom: idx < 7 ? 12 : 0,
                          borderBottom: idx < 7 ? "1px solid #e8e8e8" : "none",
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
                            fontWeight: item.bold ? 600 : 400,
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      background: "#fafafa",
                      borderRadius: 8,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      {
                        label: "Trạng thái",
                        value: (() => {
                          const STATUS_COLOR_MAP: Record<
                            string,
                            { bg: string; color: string }
                          > = {
                            "Đã xác nhận": { bg: "#FFD600", color: "#222" },
                            "Đã giao xe": { bg: "#345FCE", color: "#fff" },
                            "Đã trả xe": { bg: "#FF8C00", color: "#fff" },
                            "Hoàn thành": { bg: "#26D02E", color: "#fff" },
                            "Đã hủy": { bg: "#F33232", color: "#fff" },
                          };
                          const label = contract.statusNm || "-";
                          const colorObj = STATUS_COLOR_MAP[label] || {
                            bg: "#E0E0E0",
                            color: "#222",
                          };
                          return (
                            <span
                              style={{
                                background: colorObj.bg,
                                color: colorObj.color,
                                borderRadius: 8,
                                padding: "2px 12px",
                                fontWeight: 500,
                                fontSize: 14,
                                display: "inline-flex",
                                alignItems: "center",
                              }}
                            >
                              {statusIcon}
                              {label}
                            </span>
                          );
                        })(),
                        isCustom: true,
                      },
                      { label: "Ngày đặt", value: formatDateDMY(contract.createdDate) },
                      { label: "Ngày trả", value: formatDateDMY(contract.endDate) },
                      { label: "Chi nhánh trả", value: contract.returnBranchName },
                      { label: "Địa điểm trả xe", value: contract.returnAddress || "-" },
                      { label: "Thời gian nhận xe", value: contract.returnTime ? formatDateDMY(contract.returnTime) : "-" },
                      { label: "Người nhận xe", value: contract.returnUserName || "-" },
                      { label: "Tiền đặt cọc", value: `${(contract.depositAmount || 0).toLocaleString("vi-VN")} đ`, bold: true },
                      // Hiển thị "Ngày hoàn thành" khi trạng thái là "Hoàn thành"
                      ...(contract.statusNm === "Hoàn thành" ? [{ label: "Ngày hoàn thành", value: contract.completedDate ? formatDateDMY(contract.completedDate) : "-", bold: true }] : []),
                    ].map((item, idx, arr) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          paddingBottom: idx < arr.length - 1 ? 12 : 0,
                          borderBottom: idx < arr.length - 1 ? "1px solid #e8e8e8" : "none",
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
                            fontWeight: item.bold ? 600 : 400,
                          }}
                        >
                          {item.isCustom ? item.value : item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ContainerBase>

          <ContainerBase>
            <div
              className="box_section"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minWidth: 350,
              }}
            >
              <p
                className="box_title_sm"
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  role="img"
                  aria-label="user"
                  style={{ color: "#1677ff", marginRight: 8 }}
                >
                  👤
                </span>
                Khách hàng
              </p>
              <div
                style={{
                  background: "#fafafa",
                  borderRadius: 8,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {[
                  { label: "Họ tên", value: contract.customerName, bold: true },
                  { label: "Số điện thoại", value: contract.phoneNumber },
                  { label: "Email", value: contract.email || "-" },
                  { label: "Quốc gia", value: contract.country || "-" },
                  { label: "Căn cước công dân", value: contract.citizenId || "-" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      paddingBottom: idx < 4 ? 12 : 0,
                      borderBottom: idx < 4 ? "1px solid #e8e8e8" : "none",
                    }}
                  >
                    <div style={{ minWidth: 140, color: "#666", fontSize: 14, fontWeight: 500 }}>
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
          </ContainerBase>
        </div>

        {/* Danh sách xe */}
        <ContainerBase>
          <div className="box_section">
            <div
              className="dp_flex"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                width: "100%",
              }}
            >
              <p
                className="box_title_sm"
                style={{
                  marginBottom: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  role="img"
                  aria-label="car"
                  style={{ color: "#1677ff", marginRight: 8 }}
                >
                  🏍️
                </span>
                Danh sách xe
              </p>
              {/* Thời gian thuê có thể tính toán nếu cần */}
              <span style={{ color: "#1677ff", fontWeight: 500, fontSize: 15 }}>
                Thời gian tính thuê:{" "}
                {carRentalList[0]?.rentalDurationText || ""}
              </span>
            </div>
            <Table
              columns={[
                {
                  title: "STT",
                  dataIndex: "stt",
                  key: "stt",
                  width: 60,
                  align: "center" as const,
                  render: (_: any, __: any, idx: number) => idx + 1,
                },
                {
                  title: "Loại xe",
                  dataIndex: "carType",
                  key: "carType",
                },
                {
                  title: "Xe",
                  dataIndex: "carModel",
                  key: "carModel",
                },
                {
                  title: "Biển số xe",
                  dataIndex: "licensePlate",
                  key: "licensePlate",
                },
                {
                  title: "Giá/ngày",
                  dataIndex: "dailyPrice",
                  key: "dailyPrice",
                  align: "right" as const,
                  render: (val: number) => val?.toLocaleString(),
                },
                {
                  title: "Giá/giờ",
                  dataIndex: "hourlyPrice",
                  key: "hourlyPrice",
                  align: "right" as const,
                  render: (val: number) => val?.toLocaleString(),
                },
                {
                  title: "Tiền thuê",
                  dataIndex: "rentalTotal",
                  key: "rentalTotal",
                  align: "right" as const,
                  render: (val: number) => <b>{val?.toLocaleString()}</b>,
                },
              ]}
              dataSource={carRentalList}
              pagination={false}
              rowKey={(r, idx) => idx.toString()}
              style={{ marginTop: 8 }}
              footer={() => (
                <div style={{ textAlign: "right", fontWeight: 500 }}>
                  Tổng tiền thuê xe:{" "}
                  <span style={{ fontWeight: "bold", color: "#1677ff" }}>
                    {totalCar.toLocaleString()}đ
                  </span>
                </div>
              )}
              bordered
              className="contract-table"
            />
          </div>
        </ContainerBase>

        {/* Danh sách phụ thu */}
        <ContainerBase>
          <div className="box_section">
            <p
              className="box_title_sm"
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="money"
                style={{ color: "#faad14", marginRight: 8 }}
              >
                💸
              </span>
              Danh sách phụ thu
            </p>
            <Table
              columns={[
                {
                  title: "STT",
                  dataIndex: "stt",
                  key: "stt",
                  width: 60,
                  align: "center" as const,
                  render: (_: any, __: any, idx: number) => idx + 1,
                },
                {
                  title: "Lý do thu",
                  dataIndex: "description",
                  key: "description",
                },
                {
                  title: "Số tiền",
                  dataIndex: "amount",
                  key: "amount",
                  align: "right" as const,
                  render: (val: number) => val?.toLocaleString() + "đ",
                },
                {
                  title: "Ghi chú",
                  dataIndex: "notes",
                  key: "notes",
                },
              ]}
              dataSource={surchargeList}
              pagination={false}
              rowKey={(_, idx) => idx.toString()}
              style={{ marginTop: 8 }}
              footer={() => (
                <div style={{ textAlign: "right", fontWeight: 500 }}>
                  Tổng tiền phụ thu:{" "}
                  <span style={{ fontWeight: "bold", color: "#faad14" }}>
                    {totalSurcharge.toLocaleString()}đ
                  </span>
                </div>
              )}
              bordered
              className="contract-table"
            />
          </div>
        </ContainerBase>

        {/* Thông tin thanh toán */}
        <ContainerBase>
          <div className="box_section">
            <p
              className="box_title_sm"
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="payment"
                style={{ color: "#52c41a", marginRight: 8 }}
              >
                💳
              </span>
              Thông tin thanh toán
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 32,
                marginBottom: 8,
                background: "#f6ffed",
                borderRadius: 8,
                padding: 16,
                border: "1px solid #b7eb8f",
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Tiền thuê xe:</span>
                  <span>{totalCar.toLocaleString()} đ</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Tiền phụ thu:</span>
                  <span>{totalSurcharge.toLocaleString()} đ</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Giảm giá:</span>
                  <span>
                    {(contract.discountAmount || 0).toLocaleString()} đ
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>
                    <b>Tổng tiền:</b>
                  </span>
                  <span>
                    <b>
                      {(
                        totalAll - (contract.discountAmount || 0)
                      ).toLocaleString()}{" "}
                      đ
                    </b>
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>Đã thanh toán:</span>
                  <span>{totalPaid.toLocaleString()} đ</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "#1677ff", fontWeight: 500 }}>
                    {remain >= 0 ? "Phải thu khách:" : "Phải trả khách:"}
                  </span>
                  <span style={{ color: "#1677ff", fontWeight: 600 }}>
                    {Math.abs(remain).toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ContainerBase>

        {/* Lịch sử thanh toán */}
        <ContainerBase>
          <div className="box_section">
            <p
              className="box_title_sm"
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="history"
                style={{ color: "#4096ff", marginRight: 8 }}
              >
                📜
              </span>
              Lịch sử thanh toán
            </p>
            <Table
              columns={[
                {
                  title: "Mã TT",
                  dataIndex: "transactionCode",
                  key: "transactionCode",
                },
                {
                  title: "Phương thức",
                  dataIndex: "paymentMethod",
                  key: "paymentMethod",
                },
                {
                  title: "Số tiền",
                  dataIndex: "amount",
                  key: "amount",
                  align: "right" as const,
                  render: (val: number) => val?.toLocaleString() + "đ",
                },
                {
                  title: "Ngày thanh toán",
                  dataIndex: "paymentDate",
                  key: "paymentDate",
                  render: (val: string) => formatDateDMY(val),
                },
                {
                  title: "Nhân viên",
                  dataIndex: "userName",
                  key: "userName",
                },
                {
                  title: "Ghi chú",
                  dataIndex: "notes",
                  key: "notes",
                },
              ]}
              dataSource={paymentHistory}
              pagination={false}
              rowKey={(_, idx) => idx.toString()}
              style={{ marginTop: 8 }}
              bordered
              className="contract-table"
            />
          </div>
        </ContainerBase>

        {/* Modals */}
        <ModalUpdateInfoPickup
          open={showModalPickup}
          onClose={() => setShowModalPickup(false)}
          onSave={handlePickupSave}
          cars={(contract.cars || []).map((c) => ({
            id: c.id,
            carId: c.carId,
            type: c.carType,
            model: c.carModel,
            licensePlate: c.licensePlate,
            odometer: c.endOdometer ?? c.startOdometer ?? "", // Truyền odo hiện tại (ưu tiên endOdometer nếu đã có, nếu chưa thì lấy startOdometer)
            condition: "", // truyền lại nếu có field tình trạng
            status: c.status || "", // Truyền status sang modal
          }))}
          staffOptions={staffOptions}
          defaultStaff={pickupDefault.staff}
          defaultTime={pickupDefault.time}
          totalCar={totalCar}
          totalSurcharge={totalSurcharge}
          carStatusOptions={carStatusOptions}
        />
        <ModalUpdateInfoDelivery
          open={showModalDelivery}
          onClose={() => setShowModalDelivery(false)}
          onSave={handleDeliverySave}
          staffOptions={staffOptions}
          defaultStaff={deliveryDefault.staff}
          defaultTime={deliveryDefault.time}
          totalCar={totalCar}
          totalSurcharge={totalSurcharge}
        />
        <ModalUpdatePayment
          open={showModalPayment}
          onClose={() => setShowModalPayment(false)}
          onSave={handlePaymentSave}
          payments={
            currentPayments.length
              ? currentPayments
              : contract
              ? [
                  {
                    contractId: contract.id, // truyền contractId cho payment mới
                    method: "",
                    amount: "",
                    date: "",
                    note: "",
                  },
                ]
              : []
          }
          contractId={contract.id} // truyền contractId vào props
        />
        <ModalCloseContract
          open={showModalClose}
          onClose={() => setShowModalClose(false)}
          onSubmit={handleCloseContract}
          customerName={contract.customerName}
          totalAmount={totalCar + totalSurcharge}
          discount={contract.discountAmount || 0}
          mustPay={totalAll - (contract.discountAmount || 0)}
          paid={totalPaid}
          paymentMethods={[
            { value: "bank", label: "Chuyển khoản NH" },
            { value: "cash", label: "Tiền mặt" },
          ]}
        />
      </div>
    </div>
  );
};

export default ContractDetailComponent;
