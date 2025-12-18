import { formatDateDMY } from "@/utils/common";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import {
  HomeOutlined,
  CheckCircleTwoTone,
  ClockCircleTwoTone,
} from "@ant-design/icons";
import { Table, Dropdown, Menu, message, Tooltip, Modal } from "antd";
import ButtonBase from "@/component/common/button/ButtonBase";
import {
  EditOutlined,
  CarOutlined,
  RollbackOutlined,
  DollarOutlined,
  FileDoneOutlined,
  MoreOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getContractDetail,
  getSurchargesByContractId,
  getPaymentHistory,
  updateDelivery,
  updateReturn,
  checkReturnPermission,
  checkDeliveryPermission,
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

// Hàm kiểm tra phụ thu cần cảnh báo
const checkRequiredSurcharges = (contract: ContractDTO | null): string[] => {
  if (!contract) return [];
  
  const warnings: string[] = [];
  
  // 1. Kiểm tra Phụ phí đi đường dài: có xe có (endOdometer - startOdometer) >= 300km
  const hasLongDistance = (contract.cars || []).some((car) => {
    if (car.endOdometer && car.startOdometer) {
      const distance = car.endOdometer - car.startOdometer;
      return distance >= 300;
    }
    return false;
  });
  if (hasLongDistance) {
    warnings.push("Phụ phí đi đường dài");
  }
  
  // 2. Kiểm tra Phụ phí trả xe muộn: returnTime > endDate
  if (contract.returnTime && contract.endDate) {
    const returnTime = new Date(contract.returnTime).getTime();
    const endDate = new Date(contract.endDate).getTime();
    if (returnTime > endDate) {
      warnings.push("Phụ phí trả xe muộn");
    }
  }
  
  // 3. Kiểm tra Phụ phí vận chuyển giao nhận: needPickupDelivery = 1 hoặc needReturnDelivery = 1
  if (contract.needPickupDelivery || contract.needReturnDelivery) {
    warnings.push("Phụ phí vận chuyển giao nhận");
  }
  
  // 4. Kiểm tra Phụ phí trả xe tại điểm khác: pickupBranchId != returnBranchId
  if (contract.pickupBranchId && contract.returnBranchId && 
      contract.pickupBranchId !== contract.returnBranchId) {
    warnings.push("Phụ phí trả xe tại điểm khác");
  }
  
  return warnings;
};

// Hàm tính số giờ và phút trả muộn (hiển thị chính xác, không làm tròn)
const calculateLateReturnTime = (returnTime: string | null | undefined, endDate: string | null | undefined): string | null => {
  if (!returnTime || !endDate) {
    return null;
  }
  
  const returnTimeMs = new Date(returnTime).getTime();
  const endDateMs = new Date(endDate).getTime();
  
  // Chỉ tính nếu returnTime > endDate
  if (returnTimeMs <= endDateMs) {
    return null;
  }
  
  // Tính số milliseconds chênh lệch
  const diffMs = returnTimeMs - endDateMs;
  // Chuyển sang phút
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // Nếu trả muộn dưới 30 phút thì không hiển thị
  if (diffMinutes < 30) {
    return null;
  }
  
  // Tính số giờ và phút chính xác
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  // Format: "X giờ Y phút"
  if (hours > 0 && minutes > 0) {
    return `${hours} giờ ${minutes} phút`;
  } else if (hours > 0) {
    return `${hours} giờ`;
  } else {
    return `${minutes} phút`;
  }
};

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

// Hàm tính thời gian thuê thực tế (không áp dụng các quy tắc làm tròn)
function calcActualRentalDuration(start: string, end: string): string {
  if (!start || !end) return "";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return "";
  
  // Tính số giờ và phút
  let totalHours = Math.floor(ms / (1000 * 60 * 60));
  const leftoverMinutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  // Làm tròn phút thành giờ (≥ 30 phút)
  if (leftoverMinutes >= 30) {
    totalHours += 1;
  }
  
  // Chia thành ngày và giờ vượt (không áp dụng quy tắc làm tròn)
  const days = Math.floor(totalHours / 24);
  const extraHours = totalHours % 24;
  
  // Format durationText
  if (days > 0 && extraHours > 0) {
    return `${days} ngày ${extraHours} tiếng`;
  } else if (days > 0) {
    return `${days} ngày`;
  } else if (extraHours > 0) {
    return `${extraHours} tiếng`;
  } else {
    return "";
  }
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
  const [requiredSurcharges, setRequiredSurcharges] = useState<string[]>([]);

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
        // Kiểm tra phụ thu cần cảnh báo
        setRequiredSurcharges(checkRequiredSurcharges(contractRes.data));
        // Chỉ hiển thị payment có status = 'SUCCESS' (đã lưu và chưa hủy)
        const paymentData = paymentRes.data || [];
        setPaymentHistory(paymentData.filter((p: PaymentTransactionDTO) => p.status === 'SUCCESS' || !p.status));
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
  
  // Tính thời gian thuê thực tế (không áp dụng các quy tắc làm tròn)
  const actualRentalDurationText = rentalStart && rentalEnd 
    ? calcActualRentalDuration(rentalStart, rentalEnd)
    : "";
  
  // Tính thời gian tính tiền thuê (dùng giá mặc định vì durationText không phụ thuộc vào giá)
  const { durationText: rentalDurationText } = rentalStart && rentalEnd
    ? calcRentalInfo(
        rentalStart,
        rentalEnd,
        1, // dailyPrice mặc định (chỉ để tính durationText)
        1  // hourlyPrice mặc định (chỉ để tính durationText)
      )
    : { durationText: "" };
  
  // Hàm format công thức tính tiền thuê để hiển thị trong tooltip
  const formatRentalCalculation = (car: any) => {
    const { dailyPrice, hourlyPrice, rentalDays, rentalExtraHours, rentalTotal } = car;
    
    if (rentalDays > 0 && rentalExtraHours > 0) {
      return `${(dailyPrice || 0).toLocaleString()} × ${rentalDays} + ${(hourlyPrice || 0).toLocaleString()} × ${rentalExtraHours} = ${(rentalTotal || 0).toLocaleString()}`;
    } else if (rentalDays > 0) {
      return `${(dailyPrice || 0).toLocaleString()} × ${rentalDays} = ${(rentalTotal || 0).toLocaleString()}`;
    } else if (rentalExtraHours > 0) {
      return `${(hourlyPrice || 0).toLocaleString()} × ${rentalExtraHours} = ${(rentalTotal || 0).toLocaleString()}`;
    }
    return "Chưa có thông tin tính toán";
  };
  
  const carRentalList = (contract.cars || []).map((c) => {
    const { days, extraHours, total, durationText } = rentalStart && rentalEnd
      ? calcRentalInfo(
          rentalStart,
          rentalEnd,
          c.dailyPrice || 0,
          c.hourlyPrice || 0
        )
      : { days: 0, extraHours: 0, total: 0, durationText: "" };
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
      deliveryTime: data.time,
    });
    setShowModalDelivery(false);
    reloadData();
  };

  // Handler cho modal trả xe
  const handlePickupSave = async (data: any) => {
    console.log(data);

    if (!contract) return;
    
    try {
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
        returnTime: data.time,
      });
      
      message.success("Trả xe thành công!");
      setShowModalPickup(false);
      reloadData();
    } catch (err: any) {
      console.error("Error returning car:", err);
      // Parse error message từ backend
      const errorMessage = err?.response?.data?.message || 
                           err?.response?.data?.data?.message ||
                           err?.message ||
                           "Trả xe thất bại!";
      message.error(errorMessage);
    }
  };

  // Handler cho modal thanh toán
  const handlePaymentSave = async (payments: any[]) => {
    if (!contract) return;
    // Lấy userId từ currentUser
    const userId = currentUser?.userCurrent?.id || currentUser?.userCurrent?.userId || "";
    for (const p of payments) {
      await addPayment({
        contractId: contract.id,
        paymentMethod: p.method,
        amount: Number(p.amount),
        paymentDate: p.date,
        notes: p.note,
        userId: userId, // Thêm userId để backend lưu vào payment_transaction
      });
    }
    setShowModalPayment(false);
    reloadData();
  };

  // Handler cho modal đóng hợp đồng
  const handleCloseContract = async (data: any) => {
    if (!contract) return;
    try {
      await completeContract({
        contractId: contract.id,
        completedDate: data.closeDate,
        // Truyền finalPaymentAmount kể cả số âm (nếu != 0)
        finalPaymentAmount: data.paymentAmount !== 0 ? data.paymentAmount : undefined,
        paymentMethod: data.paymentMethod,
      });
      setShowModalClose(false);
      reloadData();
    } catch (error: any) {
      console.error("Error closing contract:", error);
      message.error(error?.response?.data?.message || "Đóng hợp đồng thất bại!");
    }
  };

  // Khi bấm nút "Thanh toán", truyền danh sách thanh toán hiện tại vào modal
  const handleShowPaymentModal = () => {
    if (!contract) return;
    // paymentHistory đã được filter chỉ có SUCCESS, nhưng filter thêm để đảm bảo
    const filteredPayments = (paymentHistory || []).filter((p) => p.status === 'SUCCESS' || !p.status);
    const mapped = filteredPayments.map((p) => ({
      id: p.id,
      contractId: contract.id, // truyền contractId vào từng item
      method: p.paymentMethod || "",
      amount: p.amount || "",
      date: p.paymentDate || "",
      note: p.notes || "",
      status: p.status || "SUCCESS", // Truyền status để frontend có thể filter
    }));
    setShowModalPayment(true);
    setCurrentPayments(mapped.length ? mapped : []);
  };

  // Khi bấm nút "Giao xe"
  const handleShowDeliveryModal = async () => {
    if (!contract?.id) return;
    
    try {
      // Check permission trước khi mở modal
      await checkDeliveryPermission(contract.id);
      
      // Nếu check thành công, mở modal như cũ
      let defaultTime = "";
      if (contract?.deliveryTime) {
        // Nếu đã có deliveryTime thì dùng nó (đã đúng timezone GMT+7 từ backend)
        defaultTime = dayjs(contract.deliveryTime).format("YYYY-MM-DDTHH:mm:ss");
      } else if (contract?.startDate) {
        // Nếu chưa có thì lấy từ ngày thuê (startDate) (đã đúng timezone GMT+7 từ backend)
        defaultTime = dayjs(contract.startDate).format("YYYY-MM-DDTHH:mm:ss");
      } else {
        // Fallback về thời gian hiện tại
        defaultTime = dayjs().format("YYYY-MM-DDTHH:mm:ss");
      }
      setDeliveryDefault({
        staff: currentUser?.userCurrent?.id || "",
        time: defaultTime,
      });
      setShowModalDelivery(true);
    } catch (err: any) {
      let errorMessage = err?.response?.data?.message || err?.message || "Lỗi không xác định khi kiểm tra quyền giao xe.";
      
      // Fix timezone +7 giờ (trừ 7 giờ)
      const fixTimezoneInMessage = (msg: string): string => {
        const regex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})/g;
        return msg.replace(regex, (match) => {
          const [datePart, timePart] = match.split(" ");
          const [day, month, year] = datePart.split("/").map(Number);
          const [hour, minute] = timePart.split(":").map(Number);

          // Create a Date object in local timezone
          const date = new Date(year, month - 1, day, hour, minute);
          // Subtract 7 hours
          date.setHours(date.getHours() - 7);

          const fixedDay = String(date.getDate()).padStart(2, '0');
          const fixedMonth = String(date.getMonth() + 1).padStart(2, '0');
          const fixedYear = date.getFullYear();
          const fixedHour = String(date.getHours()).padStart(2, '0');
          const fixedMinute = String(date.getMinutes()).padStart(2, '0');

          return `${fixedDay}/${fixedMonth}/${fixedYear} ${fixedHour}:${fixedMinute}`;
        });
      };
      
      errorMessage = fixTimezoneInMessage(errorMessage);
      
      // Nếu message có nhiều dòng (phân cách bởi \n), hiển thị từng message riêng biệt
      const errorLines = errorMessage.split('\n').filter((line: string) => line.trim().length > 0);
      
      if (errorLines.length > 1) {
        // Hiển thị từng message riêng với delay nhỏ để không bị chồng lên nhau
        errorLines.forEach((line: string, index: number) => {
          setTimeout(() => {
            message.error(line.trim(), 5); // 5 giây tự động ẩn
          }, index * 300); // Delay 300ms giữa các message
        });
      } else {
        // Chỉ có 1 message thì hiển thị bình thường
        message.error(errorMessage, 5); // 5 giây tự động ẩn
      }
    }
  };

  // Khi bấm nút "Trả xe"
  const handleShowPickupModal = async () => {
    if (!contract?.id) return;
    
    try {
      // Kiểm tra quyền trả xe trước khi mở modal
      await checkReturnPermission(contract.id);
      
      // Lấy thời gian mặc định từ ngày trả (endDate) hoặc returnTime nếu đã có
      let defaultTime = "";
      if (contract?.returnTime) {
        // Nếu đã có returnTime thì dùng nó (đã đúng timezone GMT+7 từ backend)
        defaultTime = dayjs(contract.returnTime).format("YYYY-MM-DDTHH:mm:ss");
      } else if (contract?.endDate) {
        // Nếu chưa có thì lấy từ ngày trả (endDate) (đã đúng timezone GMT+7 từ backend)
        defaultTime = dayjs(contract.endDate).format("YYYY-MM-DDTHH:mm:ss");
      } else {
        // Fallback về thời gian hiện tại
        defaultTime = dayjs().format("YYYY-MM-DDTHH:mm:ss");
      }
      setPickupDefault({
        staff: currentUser?.userCurrent?.id || "",
        time: defaultTime,
      });
      setShowModalPickup(true);
    } catch (err: any) {
      console.error("Error checking return permission:", err);
      // Parse error message từ backend
      const errorMessage = err?.response?.data?.message || 
                           err?.response?.data?.data?.message ||
                           err?.message ||
                           "Bạn không có quyền thực hiện chức năng này";
      message.error(errorMessage);
    }
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
      // Reload lại dữ liệu để cập nhật trạng thái, không navigate đi đâu
      reloadData();
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
    currentBranchId &&
    // Cho phép trả xe nếu user thuộc chi nhánh trả HOẶC chi nhánh thuê (nếu chi nhánh trả chưa được set)
    (contract?.returnBranchId === currentBranchId ||
      (contract?.pickupBranchId === currentBranchId && (!contract?.returnBranchId || contract?.returnBranchId === contract?.pickupBranchId)));

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
              // Nếu hợp đồng đã hoàn thành, hiển thị popup confirm
              if (contract?.status === "COMPLETED") {
                Modal.confirm({
                  title: "Xác nhận chỉnh sửa",
                  content: "Hợp đồng đã hoàn thành. Việc chỉnh sửa các thông tin quan trọng có thể gây ảnh hưởng đến dữ liệu đã được ghi nhận. Bạn có chắc chắn muốn tiếp tục?",
                  okText: "Xác nhận",
                  cancelText: "Hủy",
                  centered: true,
                  getContainer: () => document.body,
                  style: { top: '1%' },
                  onOk: () => {
                    if (contract?.id) {
                      navigate(`/contract/create?id=${contract.id}`);
                    }
                  },
                });
              } else {
                // Nếu chưa hoàn thành, điều hướng bình thường
                if (contract?.id) {
                  navigate(`/contract/create?id=${contract.id}`);
                }
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
                  onClick={handleShowPickupModal}
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
                  onClick={handleShowPickupModal}
                />
              </>
            );
          })()}
          {/* Ẩn các nút sau nếu trạng thái là "Đã hủy" */}
          {contract?.statusNm !== "Đã hủy" && (
            <>
              {/* Nút Thanh toán: ẩn khi hợp đồng đã hoàn thành hoặc đã hủy */}
              {contract?.status !== "COMPLETED" && (
                <ButtonBase
                  label="Thanh toán"
                  className="btn_primary"
                  icon={<DollarOutlined />}
                  onClick={() => {
                    if (!canEditOrCancelOrPay) return handleNoPermission();
                    handleShowPaymentModal();
                  }}
                />
              )}
              {/* Nút Đóng HĐ chỉ hiện khi trạng thái là "Đã trả xe" (RETURNED) */}
              {contract?.status === "RETURNED" && (
                <ButtonBase
                  label="Đóng HĐ"
                  className="btn_primary"
                  icon={<FileDoneOutlined />}
                  onClick={() => {
                    if (!canEditOrCancelOrPay) return handleNoPermission();
                    setShowModalClose(true);
                  }}
                />
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
            gap: 16,
            alignItems: "stretch",
            marginBottom: 24,
            width: "100%",
          }}
        >
          {/* 1. Thông tin hợp đồng - chia 2 cột */}
          <div style={{ flex: 2.5, display: "flex" }}>
            <ContainerBase>
              <div
                className="box_section"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
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
                <div
                  style={{
                    background: "#fafafa",
                    borderRadius: 8,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  {/* Hàng 1: Mã hợp đồng; Trạng thái */}
                  <div style={{ display: "flex", gap: 24 }}>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 120, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Mã hợp đồng:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14, fontWeight: 600 }}>
                        {contract.contractCode}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 110, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Trạng thái:
                      </div>
                      <div style={{ flex: 1 }}>
                        {(() => {
                          const STATUS_COLOR_MAP: Record<string, { bg: string; color: string }> = {
                            "Đã xác nhận": { bg: "#FFD600", color: "#222" },
                            "Đã giao xe": { bg: "#345FCE", color: "#fff" },
                            "Đã trả xe": { bg: "#FF8C00", color: "#fff" },
                            "Hoàn thành": { bg: "#26D02E", color: "#fff" },
                            "Đã hủy": { bg: "#F33232", color: "#fff" },
                          };
                          const label = contract.statusNm || "-";
                          const colorObj = STATUS_COLOR_MAP[label] || { bg: "#E0E0E0", color: "#222" };
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
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hàng 2: Nguồn; Ngày đặt */}
                  <div style={{ display: "flex", gap: 24, paddingTop: 12, borderTop: "1px solid #e8e8e8" }}>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 120, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Nguồn:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14 }}>
                        {contract.source || "-"}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 110, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Ngày đặt:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14 }}>
                        {formatDateDMY(contract.createdDate)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hàng 3: Ngày thuê; Ngày trả */}
                  <div style={{ display: "flex", gap: 24, paddingTop: 12, borderTop: "1px solid #e8e8e8" }}>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 120, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Ngày thuê:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14 }}>
                        {formatDateDMY(contract.startDate)}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 110, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Ngày trả:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14 }}>
                        {formatDateDMY(contract.endDate)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hàng 4: Chi nhánh thuê; Chi nhánh trả */}
                  <div style={{ display: "flex", gap: 24, paddingTop: 12, borderTop: "1px solid #e8e8e8" }}>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 120, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Chi nhánh thuê:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14 }}>
                        {contract.pickupBranchName || "-"}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 110, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Chi nhánh trả:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14 }}>
                        {contract.returnBranchName || "-"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hàng 5: Ghi chú; Tiền đặt cọc */}
                  <div style={{ display: "flex", gap: 24, paddingTop: 12, borderTop: "1px solid #e8e8e8" }}>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 120, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Ghi chú:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14 }}>
                        {contract.notes || "-"}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: "flex" }}>
                      <div style={{ minWidth: 110, color: "#666", fontSize: 14, fontWeight: 500 }}>
                        Tiền đặt cọc:
                      </div>
                      <div style={{ flex: 1, color: "#222", fontSize: 14 }}>
                        {(contract.depositAmount || 0).toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ContainerBase>
          </div>

          {/* 2. Thông tin giao-nhận xe - chia 2 cột */}
          <div style={{ flex: 2.5, display: "flex" }}>
            <ContainerBase>
              <div
                className="box_section"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
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
                  <CarOutlined style={{ color: "#1677ff", marginRight: 8 }} />
                  Thông tin giao - nhận xe
                </p>
                <div
                  style={{
                    background: "#fafafa",
                    borderRadius: 8,
                    padding: 20,
                    display: "flex",
                    gap: 24,
                    flex: 1,
                  }}
                >
                  {/* Cột trái - Giao xe */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Địa điểm giao xe", value: contract.pickupAddress || "-" },
                      { label: "Thời gian giao xe", value: contract.deliveryTime ? formatDateDMY(contract.deliveryTime) : "-" },
                      { label: "Người giao xe", value: contract.deliveryUserName || "-" },
                      // Thêm trường "Trả xe muộn" - chỉ hiển thị khi >= 30 phút, màu đỏ
                      ...(calculateLateReturnTime(contract.returnTime, contract.endDate) !== null 
                        ? [{ label: "Trả xe muộn", value: calculateLateReturnTime(contract.returnTime, contract.endDate) || "-", isRed: true }] 
                        : []),
                    ].map((item, idx, arr) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          paddingBottom: idx < arr.length - 1 ? 12 : 0,
                          borderBottom: idx < arr.length - 1 ? "1px solid #e8e8e8" : "none",
                        }}
                      >
                        <div style={{ minWidth: 130, color: "#666", fontSize: 14, fontWeight: 500 }}>
                          {item.label}:
                        </div>
                        <div style={{ flex: 1, color: (item as any).isRed ? "#ff4d4f" : "#222", fontSize: 14 }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cột phải - Nhận xe */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Địa điểm trả xe", value: contract.returnAddress || "-" },
                      { label: "Thời gian nhận xe", value: contract.returnTime ? formatDateDMY(contract.returnTime) : "-" },
                      { label: "Người nhận xe", value: contract.returnUserName || "-" },
                      ...(contract.statusNm === "Hoàn thành" ? [{ label: "Ngày hoàn thành", value: contract.completedDate ? formatDateDMY(contract.completedDate) : "-", isGreen: true }] : []),
                    ].map((item, idx, arr) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          paddingBottom: idx < arr.length - 1 ? 12 : 0,
                          borderBottom: idx < arr.length - 1 ? "1px solid #e8e8e8" : "none",
                        }}
                      >
                        <div style={{ minWidth: 130, color: "#666", fontSize: 14, fontWeight: 500 }}>
                          {item.label}:
                        </div>
                        <div style={{ flex: 1, color: (item as any).isGreen ? "#52c41a" : "#222", fontSize: 14, fontWeight: (item as any).bold ? 600 : 400 }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ContainerBase>
          </div>

          {/* 3. Khách hàng */}
          <div style={{ flex: 1.2, display: "flex" }}>
            <ContainerBase>
              <div
                className="box_section"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
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
                  flex: 1,
                }}
              >
                {[
                  { label: "Họ tên", value: contract.customerName, bold: true },
                  { label: "Số điện thoại", value: contract.phoneNumber || "-" },
                  { label: "Email", value: contract.email || "-" },
                  { label: "Ngày sinh", value: contract.customerDateOfBirth ? formatDateDMY(contract.customerDateOfBirth) : "-" },
                  { label: "Quốc gia", value: contract.country || "-" },
                  { label: "Căn cước công dân", value: contract.citizenId || "-" },
                  { label: "Địa chỉ", value: contract.customerAddress || "-" },
                ].map((item, idx, arr) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      paddingBottom: idx < arr.length - 1 ? 12 : 0,
                      borderBottom: idx < arr.length - 1 ? "1px solid #e8e8e8" : "none",
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
              {/* Thời gian thuê thực tế và thời gian tính tiền thuê */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <span style={{ color: "#333", fontWeight: 500, fontSize: 14 }}>
                  Thời gian thuê trên hợp đồng: {actualRentalDurationText || ""}
                </span>
                <span style={{ color: "#1677ff", fontWeight: 500, fontSize: 15 }}>
                  Thời gian tính tiền thuê: {rentalDurationText || ""}
                </span>
              </div>
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
                  title: "Mã xe",
                  dataIndex: "vehicleCode",
                  key: "vehicleCode",
                  width: 120,
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
                // Chỉ hiển thị khi hợp đồng đã giao xe
                ...(contract?.status === "DELIVERED" ||
                contract?.status === "RETURNED" ||
                contract?.status === "COMPLETED" ||
                contract?.deliveryTime
                  ? [
                      {
                        title: "Odometer giao",
                        dataIndex: "startOdometer",
                        key: "startOdometer",
                        width: 150,
                        align: "right" as const,
                        render: (val: number) => {
                          return val ? val.toLocaleString("vi-VN") : "-";
                        },
                      },
                    ]
                  : []),
                // Chỉ hiển thị khi hợp đồng đã trả xe hoặc hoàn thành
                ...(contract?.status === "RETURNED" || contract?.status === "COMPLETED"
                  ? [
                      {
                        title: "Odometer khi trả",
                        dataIndex: "endOdometer",
                        key: "endOdometer",
                        width: 150,
                        align: "right" as const,
                        render: (val: number) => {
                          return val ? val.toLocaleString("vi-VN") : "-";
                        },
                      },
                      {
                        title: "Trạng thái xe trả",
                        dataIndex: "returnStatus",
                        key: "returnStatus",
                        width: 150,
                        render: (val: string) => {
                          if (!val) return "-";
                          // Map status code sang tên tiếng Việt
                          const statusMap: Record<string, string> = {
                            AVAILABLE: "Hoạt động",
                            NOT_AVAILABLE: "Không sẵn sàng",
                            MAINTENANCE: "Đang bảo dưỡng",
                            BROKEN: "Hỏng hóc",
                            LOST: "Bị mất",
                          };
                          return statusMap[val] || val;
                        },
                      },
                    ]
                  : []),
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
                  render: (val: number, record: any) => (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                      <b>{val?.toLocaleString()}</b>
                      <Tooltip
                        title={
                          <div style={{ fontSize: 13 }}>
                            <div style={{ marginBottom: 4, fontWeight: 500 }}>Cách tính tiền thuê:</div>
                            <div>{formatRentalCalculation(record)}</div>
                          </div>
                        }
                        placement="left"
                      >
                        <InfoCircleOutlined 
                          style={{ 
                            fontSize: 16, 
                            color: "#1677ff", 
                            cursor: "pointer",
                            flexShrink: 0
                          }} 
                        />
                      </Tooltip>
                    </div>
                  ),
                },
              ]}
              dataSource={carRentalList}
              pagination={false}
              rowKey={(r, idx) => (idx ?? 0).toString()}
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
              components={{
                header: {
                  cell: (props: any) => (
                    <th {...props} style={{ ...props.style, background: "#e6f4ff" }} />
                  ),
                },
              }}
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
              <span style={{ display: "flex", alignItems: "center" }}>
                <span
                  role="img"
                  aria-label="money"
                  style={{ color: "#faad14", marginRight: 8 }}
                >
                  💸
                </span>
                Danh sách phụ thu
              </span>
              {requiredSurcharges.length > 0 && (
                <Tooltip
                  title={
                    <div style={{ fontSize: 13 }}>
                      Phát sinh phụ thu: {requiredSurcharges.join("; ")}
                    </div>
                  }
                  placement="top"
                >
                  <ExclamationCircleOutlined
                    style={{
                      color: "#ff4d4f",
                      fontSize: 22,
                      cursor: "pointer",
                      marginLeft: 10,
                    }}
                  />
                </Tooltip>
              )}
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
              rowKey={(_, idx) => (idx ?? 0).toString()}
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
              components={{
                header: {
                  cell: (props: any) => (
                    <th {...props} style={{ ...props.style, background: "#e6f4ff" }} />
                  ),
                },
              }}
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
                  render: (val: number) => {
                    if (val == null) return "-";
                    const absVal = Math.abs(val);
                    const formatted = absVal.toLocaleString();
                    return val < 0 ? `-${formatted} đ` : `${formatted} đ`;
                  },
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
                  render: (val: string) => val || "-",
                },
                {
                  title: "Ghi chú",
                  dataIndex: "notes",
                  key: "notes",
                },
              ]}
              dataSource={paymentHistory}
              pagination={false}
              rowKey={(_, idx) => (idx ?? 0).toString()}
              style={{ marginTop: 8 }}
              bordered
              className="contract-table"
              components={{
                header: {
                  cell: (props: any) => (
                    <th {...props} style={{ ...props.style, background: "#e6f4ff" }} />
                  ),
                },
              }}
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
            startOdometer: c.startOdometer, // Odometer ban đầu (không edit)
            condition: "", // truyền lại nếu có field tình trạng
            status: (c as any).status || "", // Truyền status sang modal
          }))}
          staffOptions={staffOptions}
          defaultStaff={pickupDefault.staff}
          defaultTime={pickupDefault.time}
          totalCar={totalCar}
          totalSurcharge={totalSurcharge}
        />
        <ModalUpdateInfoDelivery
          open={showModalDelivery}
          onClose={() => setShowModalDelivery(false)}
          onSave={handleDeliverySave}
          cars={(contract.cars || []).map((c) => ({
            id: c.id,
            carId: c.carId,
            type: c.carType,
            model: c.carModel,
            licensePlate: c.licensePlate,
            startOdometer: c.startOdometer,
            currentOdometer: c.currentOdometer, // Odometer hiện tại từ bảng car
            status: (c as any).status || "", // Trạng thái hiện tại của xe từ bảng car
          }))}
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
          onReload={reloadData}
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
