import React, { useState, useEffect } from "react";
import { useDebouncedApi } from "./useDebouncedApi";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import ButtonBase from "@/component/common/button/ButtonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import CheckBoxBase from "@/component/common/input/CheckboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import { HomeOutlined } from "@ant-design/icons";
import ModalAddMotor from "./modal/ModalAddMotor";
import ModalSaveSurcharge from "./modal/ModalSaveSurcharge";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getContractDetail,
  saveContract,
  addContractCar,
  updateContractCar,
  deleteContractCar,
  addSurcharge,
  updateSurcharge,
  deleteSurcharge,
  getSurchargesByContractId,
} from "@/service/business/contractMng/contractMng.service";
import {
  getAllActiveBranches,
  getBranchByCurrentUser,
} from "@/service/business/branchMng/branchMng.service";
import { getAllActiveSurchargeTypes } from "@/service/business/surchargeTypeMng/surchargeTypeMng.service";
import { getAllCustomers, saveCustomer as apiSaveCustomer } from "@/service/business/customerMng/customerMng.service";
import { searchAvailableCars } from "@/service/business/carMng/carMng.service";
import { ContractSaveDTO } from "@/service/business/contractMng/contractMng.type";
import { CustomerSaveDTO, CustomerDTO } from "@/service/business/customerMng/customerMng.type";
import { message } from "antd"; // thêm import này
import ModalSaveInfoCustomer from "@/views/customer/ModalSaveInfoCustomer";
import TModal from "@/component/common/modal/TModal";
import { PlusOutlined, InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { formatDateDMYOnly } from "@/utils/common";

const getPageTitle = (isEdit: boolean) =>
  isEdit ? "Cập nhật hợp đồng thuê xe" : "Tạo hợp đồng thuê xe";
const getBreadcrumbItems = (isEdit: boolean) => [
  { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
  { label: "Quản lý hợp đồng", path: "/contract" },
  {
    label: isEdit ? "Cập nhật hợp đồng" : "Tạo hợp đồng",
    path: "/contract/create",
  },
];

const initialForm = {
  customer: "",
  source: "",
  branchRent: "",
  branchReturn: "",
  startDate: "",
  endDate: "",
  needDelivery: false,
  needReceive: false,
  deliveryAddress: "",
  receiveAddress: "",
  note: "",
  discountType: "", // "AMOUNT" | "PERCENTAGE"
  discountValue: 0,
};

interface CarItem {
  type: string;
  name: string;
  plate: string;
  priceDay: number;
  priceHour: number;
  total: number;
}

const initialCarList: CarItem[] = [];

interface FeeItem {
  desc: string;
  amount: number;
  note: string;
}

const initialFeeList: FeeItem[] = [];

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
  
  // Tính số giờ và phút
  let totalHours = Math.floor(ms / (1000 * 60 * 60));
  const leftoverMinutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  // Quy tắc 4: Làm tròn phút thành giờ (≥ 30 phút)
  if (leftoverMinutes >= 30) {
    totalHours += 1;
  }
  
  let days = 0;
  let extraHours = 0;
  let total = 0;
  let durationText = "";

  if (dailyPrice) {
    // Quy tắc 1: Tối thiểu tính 1 ngày
    if (totalHours < 24) {
      days = 1;
      extraHours = 0;
      total = dailyPrice;
      durationText = "1 ngày";
    } else {
      // Quy tắc 2: Chia thành ngày + giờ vượt
      days = Math.floor(totalHours / 24);
      extraHours = totalHours % 24;
      
      // Quy tắc 3: Làm tròn giờ vượt thành ngày (≥ 8 giờ)
      if (extraHours >= 8) {
        days += 1;
        extraHours = 0;
      }
      
      total = dailyPrice * days + (hourlyPrice || 0) * extraHours;
      
      // Format durationText
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

const ContractCreateComponent = () => {
  const [form, setForm] = useState(initialForm);
  const [carList, setCarList] = useState<any[]>(initialCarList);
  const [feeList, setFeeList] = useState<any[]>(initialFeeList);
  const [payment, setPayment] = useState({
    deposit: 0,
    total: 0,
    paid: 0,
    remain: 0,
  });
  const [showAddMotor, setShowAddMotor] = useState(false);
  const [showAddSurcharge, setShowAddSurcharge] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<CustomerDTO | null>(null);
  const [showRentalCalculationModal, setShowRentalCalculationModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contractId = searchParams.get("id");
  const isEditMode = !!contractId;

  // State cho options
  const [customerOptions, setCustomerOptions] = useState([
    { value: "", label: "Chọn khách hàng" },
  ]);
  const [branchOptions, setBranchOptions] = useState([
    { value: "", label: "Chi nhánh" },
  ]);
  const [surchargeTypeOptions, setSurchargeTypeOptions] = useState<
    { value: string; label: string; price: number }[]
  >([]);
  const [currentBranchId, setCurrentBranchId] = useState<string>("");

  // Fetch customer options
  const fetchCustomerOptions = async () => {
    try {
      const res = await getAllCustomers();
      setCustomerOptions([
        { value: "", label: "Chọn khách hàng" },
        ...(res.data || []).map((c: CustomerDTO) => ({
          value: c.id,
          label: `${c.fullName} - ${c.phoneNumber}`, // Format: "Tên - Số điện thoại"
          // Lưu thêm thông tin để filter
          fullName: c.fullName || "",
          phoneNumber: c.phoneNumber || "",
        })),
      ]);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  // Load thông tin chi tiết khách hàng
  const loadCustomerDetail = async (customerId: string) => {
    if (!customerId) {
      setSelectedCustomerDetail(null);
      return;
    }
    try {
      const res = await getAllCustomers();
      const customer = (res.data || []).find((c: CustomerDTO) => c.id === customerId);
      setSelectedCustomerDetail(customer || null);
    } catch (err) {
      console.error("Failed to fetch customer detail:", err);
      setSelectedCustomerDetail(null);
    }
  };

  // Fetch options
  useEffect(() => {
    fetchCustomerOptions();
    getAllActiveBranches().then((res) => {
      setBranchOptions([
        { value: "", label: "Chi nhánh" },
        ...(res.data || []).map((b: any) => ({
          value: b.id,
          label: b.name,
        })),
      ]);
    });
    getAllActiveSurchargeTypes().then((res) => {
      setSurchargeTypeOptions(
        (res.data || []).map((item: any) => ({
          value: item.id,
          label: item.name,
          price: item.price,
        }))
      );
    });
    // Lấy chi nhánh hiện tại của user
    getBranchByCurrentUser()
      .then((res) => {
        setCurrentBranchId(res.data?.id || "");
        // Nếu tạo mới hợp đồng thì set branchRent và branchReturn mặc định
        if (!isEditMode) {
          setForm((prev) => ({
            ...prev,
            branchRent: res.data?.id || "",
            branchReturn: res.data?.id || "", // Set chi nhánh trả xe mặc định
          }));
        }
      })
      .catch(() => setCurrentBranchId(""));
  }, []);

  // Handle query params from schedule screen (carIds, startDate, endDate)
  useEffect(() => {
    if (isEditMode) return; // Skip if in edit mode

    const carIdsParam = searchParams.get("carIds"); // "id1,id2,id3" (multiple cars)
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (carIdsParam && startDateParam && endDateParam) {
      const carIdList = carIdsParam.split(",");

      // Set form dates from params
      setForm((prev) => ({
        ...prev,
        startDate: startDateParam,
        endDate: endDateParam,
      }));

      // Check each car availability and auto-add if available
      const checkAndAddCars = async () => {
        try {
          const res = await searchAvailableCars({
            keyword: "",
            page: 1,
            size: 10000,
            startDate: startDateParam,
            endDate: endDateParam,
          });

          const availableCars = res.data.data || [];
          const carsToAdd: any[] = [];

          // Check each car and show individual message
          for (const carId of carIdList) {
            const targetCar = availableCars.find((car) => car.id === carId);

            if (targetCar && targetCar.status === "AVAILABLE") {
              // Car is available - add to list
              carsToAdd.push({
                id: targetCar.id,
                carId: targetCar.id,
                type: targetCar.carType || "",
                name: targetCar.model || "",
                plate: targetCar.licensePlate || "",
                priceDay: targetCar.dailyPrice || 0,
                priceHour: targetCar.hourlyPrice || 0,
                total: 0,
                startOdometer: targetCar.currentOdometer ?? null,
              });
              message.success(`Xe ${targetCar.licensePlate} khả dụng - đã thêm vào hợp đồng`);
            } else {
              // Car is not available - show warning with plate if possible
              const carInList = availableCars.find((car) => car.id === carId);
              const plateDisplay = carInList?.licensePlate || carId;
              message.warning(`Xe ${plateDisplay} không khả dụng trong khoảng thời gian đã chọn`);
            }
          }

          // Add all available cars to carList
          if (carsToAdd.length > 0) {
            setCarList(carsToAdd);
          }
        } catch (err) {
          console.error("Failed to check car availability:", err);
          message.error("Lỗi khi kiểm tra xe khả dụng");
        }
      };

      checkAndAddCars();
    }
  }, [searchParams, isEditMode]);

  // Khi ở mode sửa, load dữ liệu hợp đồng và phụ thu
  useEffect(() => {
    if (isEditMode && contractId) {
      getContractDetail(contractId).then((res) => {
        const c = res.data;
        setForm({
          customer: c.customerId,
          source: c.source || "",
          branchRent: c.pickupBranchId || "",
          branchReturn: c.returnBranchId || "",
          startDate: c.startDate ? c.startDate.slice(0, 16) : "",
          endDate: c.endDate ? c.endDate.slice(0, 16) : "",
          needDelivery: !!c.needPickupDelivery,
          needReceive: !!c.needReturnDelivery,
          deliveryAddress: c.pickupAddress || "",
          receiveAddress: c.returnAddress || "",
          note: c.notes || "",
          discountType: c.discountType || "",
          discountValue: c.discountValue || 0,
        });
        setCarList(
          (c.cars || []).map((car) => ({
            id: car.carId,
            carId: car.carId,
            contractCarId: car.id,
            type: car.carType,
            name: car.carModel,
            plate: car.licensePlate,
            priceDay: car.dailyPrice || 0,
            priceHour: car.hourlyPrice || 0,
            total: car.totalAmount || 0,
            startOdometer: car.startOdometer ?? null,
          }))
        );
        setPayment({
          deposit: c.depositAmount || 0,
          total: c.finalAmount || 0,
          paid: c.paidAmount || 0,
          remain: c.remainingAmount || 0,
        });
        
        // Load thông tin khách hàng chi tiết
        if (c.customerId) {
          loadCustomerDetail(c.customerId);
        }
      });
      // Lấy danh sách phụ thu riêng biệt để luôn đồng bộ
      getSurchargesByContractId(contractId).then((res) => {
        setFeeList(
          (res.data || []).map((fee) => ({
            id: fee.id,
            desc: fee.description || "",
            amount: fee.amount || 0,
            note: fee.notes || "",
          }))
        );
      });
    }
    // eslint-disable-next-line
  }, [contractId]);

  const handleRemoveCar = async (idx: number) => {
    const car = carList[idx];
    if (isEditMode && car.contractCarId) {
      try {
        await deleteContractCar(car.contractCarId);
        setCarList(carList.filter((_, i) => i !== idx));
        message.success("Đã xóa xe khỏi hợp đồng!");
      } catch {
        message.error("Xóa xe thất bại!");
      }
    } else {
      setCarList(carList.filter((_, i) => i !== idx));
    }
  };

  // Thêm xe thuê từ modal
  const handleAddCarFromModal = async (cars: any[]) => {
    if (isEditMode && contractId) {
      // Thêm từng xe vào hợp đồng qua API, cập nhật state ngay khi xong từng xe
      for (const car of cars) {
        try {
          await addContractCar({
            contractId,
            carId: car.carId || car.id,
            dailyPrice: car.priceDay,
            hourlyPrice: car.priceHour,
            totalAmount: car.total,
            startOdometer: car.startOdometer ?? null,
            notes: "",
          });
          // Sau mỗi lần thêm, reload lại danh sách xe từ server để đồng bộ state
          const res = await getContractDetail(contractId);
          setCarList(
            (res.data.cars || []).map((car) => ({
              id: car.id,
              carId: car.carId,
              type: car.carType,
              name: car.carModel,
              plate: car.licensePlate,
              priceDay: car.dailyPrice || 0,
              priceHour: car.hourlyPrice || 0,
              total: car.totalAmount || 0,
              startOdometer: car.startOdometer ?? null,
            }))
          );
        } catch {
          message.error("Thêm xe vào hợp đồng thất bại!");
        }
      }
    } else {
      setCarList([...carList, ...cars]);
    }
    setShowAddMotor(false);
  };

  // Debounced API update for car
  const debouncedUpdateCar = useDebouncedApi(async (carId, data) => {
    try {
      await updateContractCar(carId, data);
    } catch {}
  }, 600);

  // Debounced API update for fee
  const debouncedUpdateFee = useDebouncedApi(async (feeId, data) => {
    try {
      await updateSurcharge(feeId, data);
    } catch {}
  }, 600);

  // Sửa giá/ngày, giá/giờ xe thuê (nếu là hợp đồng đã có trên server)
  const handleChangeCarPrice = (
    idx: number,
    field: "priceDay" | "priceHour",
    value: number
  ) => {
    const newCarList = [...carList];
    newCarList[idx][field] = value;
    setCarList(newCarList);

    const car = newCarList[idx];
    if (isEditMode && car.id) {
      debouncedUpdateCar(car.id, {
        carId: car.carId || car.id,
        dailyPrice: car.priceDay,
        hourlyPrice: car.priceHour,
        totalAmount: car.total,
        startOdometer: car.startOdometer ?? null,
        notes: "",
      });
    }
  };

  // Xóa phụ phí (nếu là hợp đồng đã có trên server)
  const handleRemoveFee = async (idx: number) => {
    const fee = feeList[idx];
    if (isEditMode && fee.id) {
      try {
        await deleteSurcharge(fee.id);
        // Lấy lại danh sách phụ thu từ server để đồng bộ
        if (contractId) {
          const res = await getSurchargesByContractId(contractId);
          setFeeList(
            (res.data || []).map((fee) => ({
              id: fee.id,
              desc: fee.description || "",
              amount: fee.amount || 0,
              note: fee.notes || "",
            }))
          );
        }
        message.success("Đã xóa phụ thu!");
      } catch {
        message.error("Xóa phụ thu thất bại!");
      }
    } else {
      setFeeList(feeList.filter((_, i) => i !== idx));
    }
  };

  // Thêm/Sửa phụ phí từ modal
  const handleSaveFee = async (fee: any) => {
    if (isEditMode && contractId) {
      try {
        if (editingFee !== null && feeList[editingFee]?.id) {
          // Sửa phụ thu: gọi API updateSurcharge
          const feeId = feeList[editingFee].id;
          await updateSurcharge(feeId, {
            id: feeId,
            contractId,
            description: fee.desc,
            amount: fee.amount,
            notes: fee.note,
          });
          // Lấy lại danh sách phụ thu từ server để đồng bộ
          const res = await getSurchargesByContractId(contractId);
          setFeeList(
            (res.data || []).map((fee) => ({
              id: fee.id,
              desc: fee.description || "",
              amount: fee.amount || 0,
              note: fee.notes || "",
            }))
          );
        } else {
          // Thêm mới
          await addSurcharge({
            contractId,
            description: fee.desc,
            amount: fee.amount,
            notes: fee.note,
          });
          // Lấy lại danh sách phụ thu từ server để đồng bộ
          const res = await getSurchargesByContractId(contractId);
          setFeeList(
            (res.data || []).map((fee) => ({
              id: fee.id,
              desc: fee.description || "",
              amount: fee.amount || 0,
              note: fee.notes || "",
            }))
          );
        }
        message.success("Đã lưu phụ thu!");
      } catch {
        message.error("Lưu phụ thu thất bại!");
      }
    } else {
      if (editingFee !== null) {
        setFeeList(feeList.map((f, idx) => (idx === editingFee ? fee : f)));
      } else {
        setFeeList([...feeList, fee]);
      }
    }
    setShowAddSurcharge(false);
    setEditingFee(null);
  };

  // Handler khi bấm "Chọn xe" - validate ngày thuê và ngày trả
  const handleClickAddCar = () => {
    // Validate ngày thuê và ngày trả
    if (!form.startDate || !form.endDate) {
      message.warning("Vui lòng chọn ngày thuê và ngày trả trước khi chọn xe!");
      return;
    }
    
    // Kiểm tra ngày hợp lệ
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      message.warning("Ngày trả phải sau ngày thuê!");
      return;
    }
    
    // Mở modal chọn xe
    setShowAddMotor(true);
  };

  // Thêm xe thuê
  const handleAddCar = () => {
    setCarList([
      ...carList,
      {
        type: "",
        name: "",
        plate: "",
        priceDay: 0,
        priceHour: 0,
        total: 0,
      },
    ]);
  };

  const rentalStart = form.startDate;
  const rentalEnd = form.endDate;
  
  // Tính thời gian thuê thực tế (không áp dụng các quy tắc làm tròn)
  const actualRentalDurationText = calcActualRentalDuration(rentalStart, rentalEnd);
  
  // Tính thời gian tính tiền thuê từ ngày thuê và ngày trả (dùng giá mặc định vì durationText không phụ thuộc vào giá)
  const { durationText: rentalDurationText } = calcRentalInfo(
    rentalStart,
    rentalEnd,
    1, // dailyPrice mặc định (chỉ để tính durationText)
    1  // hourlyPrice mặc định (chỉ để tính durationText)
  );
  
  const carRentalList = carList.map((c) => {
    const { days, extraHours, total, durationText } = calcRentalInfo(
      rentalStart,
      rentalEnd,
      c.priceDay || 0,
      c.priceHour || 0
    );
    return {
      ...c,
      rentalDays: days,
      rentalExtraHours: extraHours,
      rentalDurationText: durationText,
      rentalTotal: total,
    };
  });

  // Tổng tiền thuê xe theo công thức mới
  const totalCar = carRentalList.reduce(
    (sum, c) => sum + (c.rentalTotal || 0),
    0
  );
  // Tính tổng phụ phí
  const totalFee = feeList.reduce((sum, f) => sum + (f.amount || 0), 0);
  // Tính giảm giá
  let discountAmount = 0;
  if (form.discountType === "AMOUNT") {
    discountAmount = Number(form.discountValue) || 0;
  } else if (form.discountType === "PERCENTAGE") {
    discountAmount =
      ((Number(form.discountValue) || 0) / 100) * (totalCar + totalFee);
  }
  // Tổng cộng
  const totalAll = totalCar + totalFee - discountAmount;

  // Lưu hợp đồng
  const handleSave = async () => {
    // Validate dữ liệu ở đây nếu cần
    if (!form.customer) {
      alert("Vui lòng chọn khách hàng!");
      return;
    }
    if (!form.startDate || !form.endDate) {
      alert("Vui lòng nhập ngày thuê và ngày trả!");
      return;
    }
    if (!form.branchRent || !form.branchReturn) {
      alert("Vui lòng chọn chi nhánh thuê và trả xe!");
      return;
    }
    if (!carList.length) {
      alert("Vui lòng chọn ít nhất một xe thuê!");
      return;
    }
    const contractPayload: ContractSaveDTO = {
      ...(isEditMode ? { id: contractId } : {}),
      customerId: form.customer,
      source: form.source,
      startDate: form.startDate,
      endDate: form.endDate,
      pickupBranchId: form.branchRent,
      returnBranchId: form.branchReturn,
      pickupAddress: form.deliveryAddress,
      returnAddress: form.receiveAddress,
      needPickupDelivery: form.needDelivery,
      needReturnDelivery: form.needReceive,
      notes: form.note,
      discountType: form.discountType as any,
      discountValue: Number(form.discountValue) || 0,
      cars: carRentalList.map((car) => ({
        carId: car.carId || car.id || "",
        dailyPrice: car.priceDay,
        hourlyPrice: car.priceHour,
        totalAmount: car.rentalTotal, // Đã tính chuẩn cả giờ lẻ
        notes: "",
        startOdometer: car.startOdometer ?? null,
      })),
      surcharges: feeList.map((fee) => ({
        description: fee.desc,
        amount: fee.amount,
        notes: fee.note,
        surchargeTypeId:
          surchargeTypeOptions.find((s) => s.label === fee.desc)?.value || "",
        quantity: fee.quantity || 1,
        unitPrice: fee.unitPrice || fee.amount || 0,
      })),
      depositAmount: payment.deposit,
      status: "CONFIRMED",
    };
    try {
      const res = await saveContract(contractPayload);
      const newId = res.data.id;
      alert(isEditMode ? "Đã cập nhật hợp đồng!" : "Đã lưu hợp đồng!");
      if (newId) {
        navigate(`/contract/detail/${newId}`);
      } else {
        navigate("/contract");
      }
    } catch (err) {
      alert("Lưu hợp đồng thất bại!");
    }
  };

  // Hàm hủy thao tác (KHÔNG phải hủy hợp đồng)
  const handleCancelContract = () => {
    if (isEditMode && contractId) {
      navigate(`/contract/detail/${contractId}`);
    } else {
      navigate("/contract");
    }
  };

  // Handler thêm khách hàng mới từ modal
  const handleSaveCustomer = async (customerData: any) => {
    try {
      const payload: CustomerSaveDTO = {
        id: customerData.id,
        fullName: customerData.name || customerData.fullName,
        phoneNumber: customerData.phone || customerData.phoneNumber,
        email: customerData.email,
        dateOfBirth: customerData.birthday || customerData.dateOfBirth,
        gender: customerData.gender,
        country: customerData.country,
        address: customerData.address,
        citizenId: customerData.cccd || customerData.citizenId,
        citizenIdFrontImageUrl: customerData.cccdFrontImg || customerData.citizenIdFrontImageUrl,
        citizenIdBackImageUrl: customerData.cccdBackImg || customerData.citizenIdBackImageUrl,
        driverLicense: customerData.license || customerData.driverLicense,
        driverLicenseImageUrl: customerData.licenseImg || customerData.driverLicenseImageUrl,
        passport: customerData.passport,
        passportImageUrl: customerData.passportImg || customerData.passportImageUrl,
        note: customerData.note,
      };
      
      await apiSaveCustomer(payload);
      
      // Reload danh sách khách hàng
      await fetchCustomerOptions();
      
      // Tìm khách hàng vừa tạo để set vào form (dựa vào phoneNumber)
      const phoneToFind = payload.phoneNumber;
      const res = await getAllCustomers();
      const newCustomer = (res.data || []).find(
        (c: CustomerDTO) => c.phoneNumber === phoneToFind
      );
      
      if (newCustomer) {
        setForm({
          ...form,
          customer: newCustomer.id,
        });
        // Load thông tin chi tiết khách hàng vừa tạo
        setSelectedCustomerDetail(newCustomer);
        message.success("Đã thêm khách hàng và chọn vào hợp đồng!");
      } else {
        message.success("Đã thêm khách hàng thành công!");
      }
      
      // Reload lại danh sách khách hàng để cập nhật dropdown
      await fetchCustomerOptions();
      setShowAddCustomer(false);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lưu khách hàng thất bại!");
    }
  };

  const pageTitle = getPageTitle(isEditMode);
  const breadcrumbItems = getBreadcrumbItems(isEditMode);

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />

        <ContainerBase>
          <div className="box_section">
            <p className="box_title_sm">Thông tin thuê xe</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                marginBottom: 24,
              }}
            >
              <div>
                <label className="form_label">Khách hàng</label>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", width: "100%" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <SelectboxBase
                      value={form.customer}
                      options={customerOptions}
                      onChange={async (val: string | string[]) => {
                        const customerId = typeof val === "string" ? val : val[0] || "";
                        setForm({
                          ...form,
                          customer: customerId,
                        });
                        // Load thông tin chi tiết khách hàng
                        await loadCustomerDetail(customerId);
                      }}
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Nhập tên hoặc số điện thoại khách hàng"
                      filterOption={(input, option) => {
                        if (!option) return false;
                        const searchText = input.toLowerCase();
                        const label = String(option.label || "").toLowerCase();
                        const fullName = String((option as any).fullName || "").toLowerCase();
                        const phoneNumber = String((option as any).phoneNumber || "").toLowerCase();
                        return label.includes(searchText) || 
                               fullName.includes(searchText) || 
                               phoneNumber.includes(searchText);
                      }}
                    />
                  </div>
                  {/* Icon More Information - chỉ hiện khi đã chọn khách hàng */}
                  {form.customer && (
                    <button
                      type="button"
                      onClick={() => setShowCustomerInfoModal(true)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #d9d9d9",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 40,
                        width: 40,
                        height: 32,
                        flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "#1677ff";
                        e.currentTarget.style.color = "#1677ff";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "#000";
                      }}
                      title="Xem thông tin khách hàng"
                    >
                      <InfoCircleOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(true)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #d9d9d9",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 40,
                      width: 40,
                      height: 32,
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#4096ff";
                      e.currentTarget.style.color = "#4096ff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#d9d9d9";
                      e.currentTarget.style.color = "#000";
                    }}
                    title="Thêm khách hàng mới"
                  >
                    <PlusOutlined style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
              <div>
                <label className="form_label">Nguồn</label>
                <SelectboxBase
                  value={form.source}
                  options={[
                    { value: "", label: "Nguồn" },
                    { value: "Walk-in", label: "Walk-in" },
                    { value: "Facebook", label: "Facebook" },
                    { value: "Hotline", label: "Hotline" },
                    { value: "Zalo", label: "Zalo" },
                  ]}
                  onChange={(val: string | string[]) =>
                    setForm({
                      ...form,
                      source: typeof val === "string" ? val : val[0] || "",
                    })
                  }
                  style={{ width: "100%", minWidth: 160 }}
                />
              </div>
              <div>
                <DatePickerBase
                  id="startDate"
                  label="Ngày thuê"
                  value={form.startDate}
                  onChange={(date) =>
                    setForm({ ...form, startDate: date || "" })
                  }
                  required
                  placeholder="Chọn ngày thuê/trả"
                  style={{ width: "100%", minWidth: 180 }}
                />
              </div>
              <div>
                <DatePickerBase
                  id="endDate"
                  label="Ngày trả"
                  value={form.endDate}
                  onChange={(date) =>
                    setForm({ ...form, endDate: date || "" })
                  }
                  required
                  placeholder="Chọn ngày thuê/trả"
                  style={{ width: "100%", minWidth: 180 }}
                />
              </div>
              <div>
                <label className="form_label">Chi nhánh thuê xe</label>
                <SelectboxBase
                  value={form.branchRent}
                  options={branchOptions}
                  onChange={() => {}}
                  style={{ width: "100%", minWidth: 160 }}
                  disabled={true}
                />
              </div>
              <div>
                <label className="form_label">Chi nhánh trả xe</label>
                <SelectboxBase
                  value={form.branchReturn}
                  options={branchOptions}
                  onChange={(val: string | string[]) =>
                    setForm({
                      ...form,
                      branchReturn:
                        typeof val === "string" ? val : val[0] || "",
                    })
                  }
                  style={{ width: "100%", minWidth: 160 }}
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 0,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: "flex-start",
                    }}
                  >
                    <CheckBoxBase
                      id="needDelivery"
                      checked={form.needDelivery}
                      onChange={(checked: boolean) =>
                        setForm((prev) => ({ ...prev, needDelivery: checked }))
                      }
                    />
                    <label
                      htmlFor="needDelivery"
                      style={{
                        margin: 0,
                        fontWeight: 400,
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: 15,
                        minWidth: 180,
                        textAlign: "left",
                      }}
                    >
                      Cần vận chuyển giao xe tận nơi
                    </label>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: "flex-start",
                    }}
                  >
                    <CheckBoxBase
                      id="needReceive"
                      checked={form.needReceive}
                      onChange={(checked: boolean) =>
                        setForm((prev) => ({ ...prev, needReceive: checked }))
                      }
                    />
                    <label
                      htmlFor="needReceive"
                      style={{
                        margin: 0,
                        fontWeight: 400,
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: 15,
                        minWidth: 180,
                        textAlign: "left",
                      }}
                    >
                      Cần vận chuyển nhận xe tận nơi
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="form_label">Địa điểm giao xe</label>
                <input
                  type="text"
                  placeholder="Địa điểm giao xe"
                  value={form.deliveryAddress}
                  onChange={(e) =>
                    setForm({ ...form, deliveryAddress: e.target.value })
                  }
                  disabled={!form.needDelivery}
                  style={{
                    width: "100%",
                    borderRadius: 6,
                    padding: "6px 10px",
                    border: "1px solid #eee",
                    background: !form.needDelivery ? "#f5f5f5" : undefined,
                    color: !form.needDelivery ? "#bbb" : undefined,
                  }}
                />
              </div>
              <div>
                <label className="form_label">Địa điểm trả xe</label>
                <input
                  type="text"
                  placeholder="Địa điểm trả xe"
                  value={form.receiveAddress}
                  onChange={(e) =>
                    setForm({ ...form, receiveAddress: e.target.value })
                  }
                  disabled={!form.needReceive}
                  style={{
                    width: "100%",
                    borderRadius: 6,
                    padding: "6px 10px",
                    border: "1px solid #eee",
                    background: !form.needReceive ? "#f5f5f5" : undefined,
                    color: !form.needReceive ? "#bbb" : undefined,
                  }}
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label className="form_label">Ghi chú</label>
                <textarea
                  placeholder="Ghi chú"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    padding: 8,
                    border: "1px solid #eee",
                    minHeight: 40,
                  }}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </ContainerBase>

        <ContainerBase>
          <div className="box_section">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <p className="box_title_sm" style={{ margin: 0 }}>Danh sách xe thuê</p>
            </div>
            {/* Thời gian thuê thực tế và thời gian tính tiền thuê */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                marginBottom: 8,
                width: "100%",
                gap: 4,
              }}
            >
              <span style={{ color: "#333", fontWeight: 500, fontSize: 14 }}>
                Thời gian thuê thực tế: {actualRentalDurationText || ""}
              </span>
              <span style={{ color: "#1677ff", fontWeight: 500, fontSize: 15 }}>
                Thời gian tính tiền thuê: {rentalDurationText || ""}
              </span>
            </div>
            <table
              className="contract-table contract-table-edit"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 12,
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <thead style={{ background: "#e6f4ff" }}>
                <tr>
                  <th style={{ padding: "8px 4px" }}>STT</th>
                  <th>Loại xe</th>
                  <th>Xe</th>
                  <th>Biển số xe</th>
                  <th>Giá/ngày</th>
                  <th>Giá/giờ</th>
                  <th style={{ position: "relative" }}>
                    Tiền thuê
                    <QuestionCircleOutlined 
                      onClick={() => setShowRentalCalculationModal(true)}
                      style={{ 
                        fontSize: 16, 
                        color: "#1677ff", 
                        cursor: "pointer",
                        marginLeft: 6,
                        verticalAlign: "middle",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "#0958d9";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "#1677ff";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      title="Xem cách tính tiền thuê"
                    />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carRentalList.map((car, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #d9d9d9" }}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>{car.type}</td>
                    <td>{car.name}</td>
                    <td>{car.plate}</td>
                    <td>
                      {isEditMode ? (
                        <span>{car.priceDay?.toLocaleString() || 0}</span>
                      ) : (
                        <input
                          type="number"
                          value={car.priceDay}
                          onChange={(e) =>
                            handleChangeCarPrice(
                              idx,
                              "priceDay",
                              Number(e.target.value)
                            )
                          }
                          className="input-edit"
                          style={{
                            width: 90,
                            textAlign: "right",
                            borderRadius: 6,
                            border: "1px solid #d9d9d9",
                            padding: "4px 8px",
                          }}
                        />
                      )}
                    </td>
                    <td>
                      {isEditMode ? (
                        <span>{car.priceHour?.toLocaleString() || 0}</span>
                      ) : (
                        <input
                          type="number"
                          value={car.priceHour}
                          onChange={(e) =>
                            handleChangeCarPrice(
                              idx,
                              "priceHour",
                              Number(e.target.value)
                            )
                          }
                          className="input-edit"
                          style={{
                            width: 90,
                            textAlign: "right",
                            borderRadius: 6,
                            border: "1px solid #d9d9d9",
                            padding: "4px 8px",
                          }}
                        />
                      )}
                    </td>
                    <td
                      style={{
                        fontWeight: "bold",
                        color: "#222",
                        textAlign: "right",
                      }}
                    >
                      {car.rentalTotal?.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <ButtonBase
                        label="X"
                        className="btn_gray"
                        onClick={() => handleRemoveCar(idx)}
                        style={{
                          borderRadius: 6,
                          minWidth: 28,
                          padding: "2px 8px",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="dp_flex"
              style={{ justifyContent: "flex-end", marginTop: 8 }}
            >
              <ButtonBase
                label="+ Chọn xe"
                className="contract-action-btn contract-btn-yellow"
                onClick={handleClickAddCar}
                style={{ borderRadius: 6, fontWeight: 500 }}
              />
            </div>
            <div
              style={{
                textAlign: "right",
                marginTop: 8,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Tổng tiền thuê xe: <b>{totalCar.toLocaleString()} đ</b>
            </div>
          </div>
        </ContainerBase>

        <ContainerBase>
          <div className="box_section">
            <p className="box_title_sm">Danh sách phụ thu</p>
            <table
              className="contract-table contract-table-edit"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 12,
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <thead style={{ background: "#e6f4ff" }}>
                <tr>
                  <th style={{ padding: "8px 4px" }}>STT</th>
                  <th>Lý do thu</th>
                  <th>Số tiền</th>
                  <th>Ghi chú</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {feeList.map((fee, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #d9d9d9" }}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>
                      <select
                        value={fee.type || ""}
                        onChange={(e) => {
                          const newFeeList = [...feeList];
                          newFeeList[idx].type = e.target.value;
                          // Update desc and price based on selected type
                          const found = surchargeTypeOptions.find(
                            (s) => s.value === e.target.value
                          );
                          newFeeList[idx].desc = found?.label || "";
                          newFeeList[idx].unitPrice = found?.price || 0;
                          // Recalculate amount if quantity exists
                          newFeeList[idx].amount =
                            (newFeeList[idx].quantity || 1) * (found?.price || 0);
                          setFeeList(newFeeList);
                          if (isEditMode && fee.id) {
                            debouncedUpdateFee(fee.id, {
                              description: found?.label || "",
                              amount: newFeeList[idx].amount,
                              notes: fee.note,
                            });
                          }
                        }}
                        className="input-edit"
                        style={{
                          width: "100%",
                          borderRadius: 6,
                          border: "1px solid #d9d9d9",
                          padding: "4px 8px",
                        }}
                      >
                        <option value="">Chọn lý do thu</option>
                        {surchargeTypeOptions.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={fee.amount}
                        onChange={(e) => {
                          const newFeeList = [...feeList];
                          newFeeList[idx].amount = Number(e.target.value);
                          setFeeList(newFeeList);
                          if (isEditMode && fee.id) {
                            debouncedUpdateFee(fee.id, {
                              description: fee.desc,
                              amount: Number(e.target.value),
                              notes: fee.note,
                            });
                          }
                        }}
                        className="input-edit"
                        style={{
                          width: 100,
                          textAlign: "right",
                          borderRadius: 6,
                          border: "1px solid #d9d9d9",
                          padding: "4px 8px",
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={fee.note}
                        onChange={(e) => {
                          const newFeeList = [...feeList];
                          newFeeList[idx].note = e.target.value;
                          setFeeList(newFeeList);
                          if (isEditMode && fee.id) {
                            debouncedUpdateFee(fee.id, {
                              description: fee.desc,
                              amount: fee.amount,
                              notes: e.target.value,
                            });
                          }
                        }}
                        className="input-edit"
                        style={{
                          width: "100%",
                          borderRadius: 6,
                          border: "1px solid #d9d9d9",
                          padding: "4px 8px",
                        }}
                      />
                    </td>
                    <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                      <span
                        style={{
                          cursor: "pointer",
                          color: "#4096ff",
                          marginRight: 8,
                        }}
                        title="Sửa"
                        onClick={() => {
                          setEditingFee(idx);
                          setShowAddSurcharge(true);
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M4 21v-3.5l11.06-11.06a1.5 1.5 0 0 1 2.12 0l1.38 1.38a1.5 1.5 0 0 1 0 2.12L7.5 21H4z"
                            stroke="#4096ff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span
                        style={{ cursor: "pointer", color: "#ff4d4f" }}
                        title="Xóa"
                        onClick={() => handleRemoveFee(idx)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                            stroke="#ff4d4f"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="dp_flex"
              style={{ justifyContent: "flex-end", marginTop: 8 }}
            >
              <ButtonBase
                label="+ Thêm phụ thu"
                className="contract-action-btn contract-btn-yellow"
                onClick={() => {
                  setEditingFee(null);
                  setShowAddSurcharge(true);
                }}
                style={{ borderRadius: 6, fontWeight: 500 }}
              />
            </div>
            <div
              style={{
                textAlign: "right",
                marginTop: 8,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Tổng tiền phụ thu: <b>{totalFee.toLocaleString()} đ</b>
            </div>
          </div>
        </ContainerBase>

        <ContainerBase>
          <div className="box_section">
            <p className="box_title_sm">Thông tin thanh toán</p>
            <div className="dp_flex" style={{ gap: 16, marginBottom: 12 }}>
              <div style={{ minWidth: 180 }}>
                <label className="form_label">Loại giảm giá</label>
                <SelectboxBase
                  value={form.discountType}
                  options={[
                    { value: "", label: "Chọn loại giảm giá" },
                    { value: "AMOUNT", label: "Theo giá trị" },
                    { value: "PERCENTAGE", label: "Theo phần trăm" },
                  ]}
                  onChange={(val: string | string[]) =>
                    setForm({
                      ...form,
                      discountType:
                        typeof val === "string" ? val : val[0] || "",
                      discountValue: 0,
                    })
                  }
                  style={{ width: "100%" }}
                />
              </div>
              {form.discountType && (
                <div style={{ minWidth: 140 }}>
                  <label className="form_label">
                    {form.discountType === "AMOUNT"
                      ? "Giá trị giảm giá"
                      : "Phần trăm giảm giá"}
                  </label>
                  <input
                    type="number"
                    placeholder={
                      form.discountType === "AMOUNT" ? "Giá trị" : "%"
                    }
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountValue: Number(e.target.value),
                      })
                    }
                    style={{
                      width: "100%",
                      borderRadius: 6,
                      border: "1px solid #eee",
                      padding: "6px 10px",
                    }}
                  />
                </div>
              )}
              <div style={{ minWidth: 140 }}>
                <label className="form_label">Tiền đặt cọc</label>
                <input
                  type="number"
                  placeholder="Tiền đặt cọc"
                  value={payment.deposit}
                  onChange={(e) =>
                    setPayment({ ...payment, deposit: Number(e.target.value) })
                  }
                  style={{
                    width: "100%",
                    borderRadius: 6,
                    border: "1px solid #eee",
                    padding: "6px 10px",
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td>Tổng tiền thuê xe:</td>
                    <td style={{ textAlign: "right" }}>
                      {totalCar.toLocaleString()} đ
                    </td>
                  </tr>
                  <tr>
                    <td>Tổng phụ phí:</td>
                    <td style={{ textAlign: "right" }}>
                      {totalFee.toLocaleString()} đ
                    </td>
                  </tr>
                  <tr>
                    <td>Giảm giá:</td>
                    <td style={{ textAlign: "right" }}>
                      {discountAmount
                        ? `- ${discountAmount.toLocaleString()} đ`
                        : "0 đ"}
                    </td>
                  </tr>
                  {/* Đặt cọc chỉ lưu thông tin, KHÔNG hiển thị ở bảng tổng kết */}
                  {/* <tr>
                    <td>Đặt cọc:</td>
                    <td style={{ textAlign: "right" }}>
                      {payment.deposit.toLocaleString()} đ
                    </td>
                  </tr> */}
                  <tr>
                    <td>
                      <b>Tổng cộng:</b>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <b>{totalAll.toLocaleString()} đ</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ContainerBase>

        <div
          className="dp_flex"
          style={{ justifyContent: "flex-end", margin: "24px 0", gap: 12 }}
        >
          <ButtonBase
            label="Hủy"
            className="btn_lightgray"
            style={{
              minWidth: 140,
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              padding: "10px 24px",
              border: "1px solid #ff4d4f",
              color: "#ff4d4f",
              background: "#fff",
            }}
            onClick={handleCancelContract}
          />
          <ButtonBase
            label={isEditMode ? "Cập nhật hợp đồng" : "Lưu hợp đồng"}
            className="contract-action-btn"
            style={{
              minWidth: 160,
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              padding: "10px 24px",
            }}
            onClick={handleSave}
          />
        </div>

        {/* Modal thêm xe */}
        <ModalAddMotor
          open={showAddMotor}
          onClose={() => setShowAddMotor(false)}
          onAdd={handleAddCarFromModal}
          startDate={form.startDate}
          endDate={form.endDate}
        />

        {/* Modal thêm phụ phí */}
        <ModalSaveSurcharge
          open={showAddSurcharge}
          onClose={() => {
            setShowAddSurcharge(false);
            setEditingFee(null);
          }}
          onSave={handleSaveFee}
          fee={editingFee !== null ? feeList[editingFee] : undefined}
        />

        {/* Modal thêm khách hàng */}
        <ModalSaveInfoCustomer
          open={showAddCustomer}
          customer={null}
          onClose={() => setShowAddCustomer(false)}
          onSave={handleSaveCustomer}
        />

        {/* Modal thông tin khách hàng */}
        <TModal
          visible={showCustomerInfoModal}
          onCancel={() => setShowCustomerInfoModal(false)}
          title="Thông tin khách hàng"
          width={600}
          footer={null}
          hideOkButton={true}
          hideCancelButton={true}
        >
          {selectedCustomerDetail ? (
            <div style={{ padding: "16px 0" }}>
              {/* Thông tin cơ bản */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
                  Thông tin cơ bản
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                      Tên khách hàng
                    </label>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>
                      {selectedCustomerDetail.fullName}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                      Số điện thoại
                    </label>
                    <div style={{ fontSize: 15 }}>
                      {selectedCustomerDetail.phoneNumber}
                    </div>
                  </div>
                  {selectedCustomerDetail.email && (
                    <div>
                      <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                        Email
                      </label>
                      <div style={{ fontSize: 15 }}>
                        {selectedCustomerDetail.email}
                      </div>
                    </div>
                  )}
                  {selectedCustomerDetail.dateOfBirth && (
                    <div>
                      <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                        Ngày sinh
                      </label>
                      <div style={{ fontSize: 15 }}>
                        {formatDateDMYOnly(selectedCustomerDetail.dateOfBirth)}
                      </div>
                    </div>
                  )}
                  {selectedCustomerDetail.gender && (
                    <div>
                      <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                        Giới tính
                      </label>
                      <div style={{ fontSize: 15 }}>
                        {selectedCustomerDetail.gender === "male" ? "Nam" : 
                         selectedCustomerDetail.gender === "female" ? "Nữ" : 
                         selectedCustomerDetail.gender === "other" ? "Khác" : 
                         selectedCustomerDetail.gender}
                      </div>
                    </div>
                  )}
                  {selectedCustomerDetail.country && (
                    <div>
                      <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                        Quốc gia
                      </label>
                      <div style={{ fontSize: 15 }}>
                        {selectedCustomerDetail.country}
                      </div>
                    </div>
                  )}
                  {selectedCustomerDetail.address && (
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                        Địa chỉ
                      </label>
                      <div style={{ fontSize: 15 }}>
                        {selectedCustomerDetail.address}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Giấy tờ tùy thân */}
              {(selectedCustomerDetail.citizenId || 
                selectedCustomerDetail.driverLicense || 
                selectedCustomerDetail.passport) && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
                    Giấy tờ tùy thân
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {selectedCustomerDetail.citizenId && (
                      <div>
                        <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                          CCCD/CMND
                        </label>
                        <div style={{ fontSize: 15, marginBottom: 8 }}>
                          {selectedCustomerDetail.citizenId}
                        </div>
                        {selectedCustomerDetail.citizenIdFrontImageUrl && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Mặt trước:</div>
                            <img 
                              src={selectedCustomerDetail.citizenIdFrontImageUrl} 
                              alt="CCCD mặt trước"
                              style={{ maxWidth: "100%", borderRadius: 4, border: "1px solid #eee" }}
                            />
                          </div>
                        )}
                        {selectedCustomerDetail.citizenIdBackImageUrl && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Mặt sau:</div>
                            <img 
                              src={selectedCustomerDetail.citizenIdBackImageUrl} 
                              alt="CCCD mặt sau"
                              style={{ maxWidth: "100%", borderRadius: 4, border: "1px solid #eee" }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {selectedCustomerDetail.driverLicense && (
                      <div>
                        <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                          GPLX
                        </label>
                        <div style={{ fontSize: 15, marginBottom: 8 }}>
                          {selectedCustomerDetail.driverLicense}
                        </div>
                        {selectedCustomerDetail.driverLicenseImageUrl && (
                          <div style={{ marginTop: 8 }}>
                            <img 
                              src={selectedCustomerDetail.driverLicenseImageUrl} 
                              alt="GPLX"
                              style={{ maxWidth: "100%", borderRadius: 4, border: "1px solid #eee" }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {selectedCustomerDetail.passport && (
                      <div>
                        <label style={{ fontWeight: 600, color: "#666", fontSize: 13, display: "block", marginBottom: 4 }}>
                          Passport
                        </label>
                        <div style={{ fontSize: 15, marginBottom: 8 }}>
                          {selectedCustomerDetail.passport}
                        </div>
                        {selectedCustomerDetail.passportImageUrl && (
                          <div style={{ marginTop: 8 }}>
                            <img 
                              src={selectedCustomerDetail.passportImageUrl} 
                              alt="Passport"
                              style={{ maxWidth: "100%", borderRadius: 4, border: "1px solid #eee" }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {selectedCustomerDetail.note && (
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
                    Ghi chú
                  </h3>
                  <div style={{ fontSize: 15, color: "#666", padding: "12px", background: "#f8f9fa", borderRadius: 6 }}>
                    {selectedCustomerDetail.note}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
              Không có thông tin khách hàng
            </div>
          )}
        </TModal>

        {/* Modal giải thích cách tính tiền thuê */}
        <TModal
          visible={showRentalCalculationModal}
          onCancel={() => setShowRentalCalculationModal(false)}
          title="Cách tính tiền thuê xe"
          width={650}
          hideOkButton={true}
          hideCancelButton={true}
        >
          <div style={{ padding: "8px 0" }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#222" }}>
                Công thức tính tiền thuê
              </h3>
              <div style={{ 
                padding: "16px", 
                borderRadius: 6, 
                border: "1px solid #e8e8e8",
                background: "#fafafa",
                marginBottom: 16
              }}>
                <div style={{ fontSize: 15, fontWeight: 500, textAlign: "center", color: "#222" }}>
                  Tiền thuê = (Giá ngày × Số ngày) + (Giá giờ × Số giờ vượt)
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 12, color: "#222" }}>
                Quy tắc tính thời gian
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ 
                    minWidth: 24, 
                    height: 24, 
                    borderRadius: "50%", 
                    background: "#f0f0f0", 
                    color: "#666", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                    border: "1px solid #d9d9d9"
                  }}>
                    1
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4, color: "#222" }}>
                      Tối thiểu tính 1 ngày
                    </div>
                    <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                      Dù khách thuê dưới 24 giờ, hệ thống vẫn tính tối thiểu 1 ngày.
                    </div>
                    <div style={{ fontSize: 13, color: "#999", marginTop: 6 }}>
                      Ví dụ: Thuê 5 giờ → Tính 1 ngày
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ 
                    minWidth: 24, 
                    height: 24, 
                    borderRadius: "50%", 
                    background: "#f0f0f0", 
                    color: "#666", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                    border: "1px solid #d9d9d9"
                  }}>
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4, color: "#222" }}>
                      Chia thành ngày + giờ vượt
                    </div>
                    <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                      Thời gian trên 24 giờ được tách thành số ngày đầy đủ và số giờ vượt.
                    </div>
                    <div style={{ fontSize: 13, color: "#999", marginTop: 6 }}>
                      Ví dụ: Thuê 26 giờ → 1 ngày + 2 giờ vượt
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ 
                    minWidth: 24, 
                    height: 24, 
                    borderRadius: "50%", 
                    background: "#f0f0f0", 
                    color: "#666", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                    border: "1px solid #d9d9d9"
                  }}>
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4, color: "#222" }}>
                      Làm tròn giờ vượt thành ngày
                    </div>
                    <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                      Nếu số giờ vượt ≥ 8 giờ, hệ thống tự động làm tròn thành thêm 1 ngày.
                    </div>
                    <div style={{ fontSize: 13, color: "#999", marginTop: 6 }}>
                      Ví dụ: Thuê 1 ngày 8 giờ → Tính 2 ngày (không tính giờ vượt)
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ 
                    minWidth: 24, 
                    height: 24, 
                    borderRadius: "50%", 
                    background: "#f0f0f0", 
                    color: "#666", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                    border: "1px solid #d9d9d9"
                  }}>
                    4
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4, color: "#222" }}>
                      Làm tròn phút thành giờ
                    </div>
                    <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                      Phút lẻ ≥ 30 phút được làm tròn lên thành 1 giờ.
                    </div>
                    <div style={{ fontSize: 13, color: "#999", marginTop: 6 }}>
                      Ví dụ: Thuê 1 ngày 2 giờ 30 phút → Tính 1 ngày 3 giờ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              padding: "16px", 
              borderRadius: 6, 
              border: "1px solid #e8e8e8",
              background: "#fafafa"
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#222" }}>
                Ví dụ cụ thể
              </h3>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: "#666" }}>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "#222" }}>Xe có giá:</strong> 300,000 đ/ngày, 40,000 đ/giờ
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong style={{ color: "#222" }}>Thuê:</strong> 6 ngày 4 giờ
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong style={{ color: "#222" }}>Tính:</strong> (300,000 × 6) + (40,000 × 4) = 1,800,000 + 160,000
                </div>
                <div style={{ fontWeight: 600, color: "#222", fontSize: 14, marginTop: 8 }}>
                  <strong>Tổng tiền thuê:</strong> 1,960,000 đ
                </div>
              </div>
            </div>
          </div>
        </TModal>
      </div>
    </div>
  );
};

export default ContractCreateComponent;
