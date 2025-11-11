import React, { useState, useEffect } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import ButtonBase from "@/component/common/button/ButtonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import CheckBoxBase from "@/component/common/input/CheckboxBase";
import { HomeOutlined } from "@ant-design/icons";
import ModalAddMotor from "./modal/ModalAddMotor";
import ModalSaveSurcharge from "./modal/ModalSaveSurcharge";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getContractDetail,
  saveContract,
} from "@/service/business/contractMng/contractMng.service";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import { getAllActiveSurchargeTypes } from "@/service/business/surchargeTypeMng/surchargeTypeMng.service";
import { getAllCustomers } from "@/service/business/customerMng/customerMng.service";
import { ContractSaveDTO } from "@/service/business/contractMng/contractMng.type";

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
  let totalHours = Math.ceil(ms / (1000 * 60 * 60));
  let days = 0;
  let extraHours = 0;
  let total = 0;
  let durationText = "";

  if (dailyPrice) {
    days = Math.floor(totalHours / 24);
    extraHours = totalHours % 24;
    // Nếu chỉ thuê vài tiếng trong ngày đầu tiên, vẫn tính là 1 ngày
    if (days === 0) {
      days = 1;
      extraHours = 0;
    } else {
      // Nếu giờ phát sinh > 8h thì làm tròn thành 1 ngày
      if (extraHours > 8) {
        days += 1;
        extraHours = 0;
      }
    }
    // Nếu trả xe trễ dưới 30 phút thì không tính thêm giờ phát sinh
    const msMod = ms % (1000 * 60 * 60);
    if (days > 0 && msMod <= 1000 * 60 * 30 && extraHours > 0) {
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
  } else if (hourlyPrice) {
    // Nếu chỉ có giá giờ
    total = hourlyPrice * totalHours;
    durationText = `${totalHours} giờ`;
  }

  return { days, extraHours, total, durationText };
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
    {
      value: string;
      label: string;
      price: number;
    }[]
  >([]);

  // Fetch options
  useEffect(() => {
    getAllCustomers().then((res) => {
      setCustomerOptions([
        { value: "", label: "Chọn khách hàng" },
        ...(res.data || []).map((c: any) => ({
          value: c.id,
          label: c.fullName,
        })),
      ]);
    });
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
  }, []);

  // Khi ở mode sửa, load dữ liệu hợp đồng
  useEffect(() => {
    if (isEditMode && contractId) {
      getContractDetail(contractId).then((res) => {
        const c = res.data;
        setForm({
          customer: c.customerId,
          source: c.source || "",
          branchRent: c.pickupBranchId || "",
          branchReturn: c.returnBranchId || "",
          startDate: c.startDate ? c.startDate.slice(0, 16) : "", // ISO string to yyyy-MM-ddTHH:mm
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
            type: car.carType,
            name: car.carModel,
            plate: car.licensePlate,
            priceDay: car.dailyPrice || 0,
            priceHour: car.hourlyPrice || 0,
            total: car.totalAmount || 0,
          }))
        );
        setFeeList(
          (c.surcharges || []).map((fee) => ({
            desc: fee.description || "",
            amount: fee.amount || 0,
            note: fee.notes || "",
          }))
        );
        setPayment({
          deposit: c.depositAmount || 0,
          method: "",
          total: c.finalAmount || 0,
          paid: c.paidAmount || 0,
          remain: c.remainingAmount || 0,
        });
      });
    }
    // eslint-disable-next-line
  }, [contractId]);

  // Thêm xe thuê từ modal
  const handleAddCarFromModal = (cars: any[]) => {
    setCarList([...carList, ...cars]);
    setShowAddMotor(false);
  };

  // Thêm phụ phí từ modal
  const handleSaveFee = (fee: any) => {
    if (editingFee !== null) {
      // Sửa
      setFeeList(feeList.map((f, idx) => (idx === editingFee ? fee : f)));
    } else {
      // Thêm mới
      setFeeList([...feeList, fee]);
    }
    setShowAddSurcharge(false);
    setEditingFee(null);
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

  // Xóa xe thuê
  const handleRemoveCar = (idx: number) => {
    setCarList(carList.filter((_, i) => i !== idx));
  };

  // Thêm phụ phí
  const handleAddFee = () => {
    setFeeList([
      ...feeList,
      {
        desc: "",
        amount: 0,
        note: "",
      },
    ]);
  };

  // Xóa phụ phí
  const handleRemoveFee = (idx: number) => {
    setFeeList(feeList.filter((_, i) => i !== idx));
  };

  const rentalStart = form.startDate;
  const rentalEnd = form.endDate;
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
  const totalCar = carRentalList.reduce((sum, c) => sum + (c.rentalTotal || 0), 0);
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
      cars: carList.map((car) => ({
        carId: car.carId || car.id || "",
        dailyPrice: car.priceDay,
        hourlyPrice: car.priceHour,
        totalAmount: car.total,
        notes: "",
        startOdometer: car.startOdometer ?? null, // Thêm dòng này
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
      await saveContract(contractPayload);
      alert(isEditMode ? "Đã cập nhật hợp đồng!" : "Đã lưu hợp đồng!");
      navigate("/contract");
    } catch (err) {
      alert("Lưu hợp đồng thất bại!");
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
                <SelectboxBase
                  value={form.customer}
                  options={customerOptions}
                  onChange={(val: string | string[]) =>
                    setForm({
                      ...form,
                      customer: typeof val === "string" ? val : val[0] || "",
                    })
                  }
                  style={{ width: "100%", minWidth: 200 }}
                />
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
                <label className="form_label">Ngày thuê</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  style={{
                    width: "100%",
                    minWidth: 180,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #eee",
                  }}
                />
              </div>
              <div>
                <label className="form_label">Ngày trả</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  style={{
                    width: "100%",
                    minWidth: 180,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #eee",
                  }}
                />
              </div>
              <div>
                <label className="form_label">Chi nhánh thuê xe</label>
                <SelectboxBase
                  value={form.branchRent}
                  options={branchOptions}
                  onChange={(val: string | string[]) =>
                    setForm({
                      ...form,
                      branchRent: typeof val === "string" ? val : val[0] || "",
                    })
                  }
                  style={{ width: "100%", minWidth: 160 }}
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
              <div style={{ gridColumn: "span 2", marginBottom: 0 }}>
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
                  style={{
                    width: "100%",
                    borderRadius: 6,
                    padding: "6px 10px",
                    border: "1px solid #eee",
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
                  style={{
                    width: "100%",
                    borderRadius: 6,
                    padding: "6px 10px",
                    border: "1px solid #eee",
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
            <p className="box_title_sm">Danh sách xe thuê</p>
            {/* Thời gian tính thuê giống detail */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginBottom: 8,
                width: "100%",
              }}
            >
              <span style={{ color: "#1677ff", fontWeight: 500, fontSize: 15 }}>
                Thời gian tính thuê:{" "}
                {carRentalList[0]?.rentalDurationText || ""}
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
              <thead style={{ background: "#fafbfc" }}>
                <tr>
                  <th style={{ padding: "8px 4px" }}>STT</th>
                  <th>Loại xe</th>
                  <th>Xe</th>
                  <th>Biển số xe</th>
                  <th>Giá/ngày</th>
                  <th>Giá/giờ</th>
                  <th>Tiền thuê</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carRentalList.map((car, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>{car.type}</td>
                    <td>{car.name}</td>
                    <td>{car.plate}</td>
                    <td>
                      <input
                        type="number"
                        value={car.priceDay}
                        onChange={(e) => {
                          const newCarList = [...carList];
                          newCarList[idx].priceDay = Number(e.target.value);
                          setCarList(newCarList);
                        }}
                        className="input-edit"
                        style={{
                          width: 90,
                          textAlign: "right",
                          borderRadius: 6,
                          border: "1px solid #eee",
                          padding: "4px 8px",
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={car.priceHour}
                        onChange={(e) => {
                          const newCarList = [...carList];
                          newCarList[idx].priceHour = Number(e.target.value);
                          setCarList(newCarList);
                        }}
                        className="input-edit"
                        style={{
                          width: 90,
                          textAlign: "right",
                          borderRadius: 6,
                          border: "1px solid #eee",
                          padding: "4px 8px",
                        }}
                      />
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
                onClick={() => setShowAddMotor(true)}
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
              <thead style={{ background: "#fafbfc" }}>
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
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>
                      <select
                        value={fee.desc}
                        onChange={(e) => {
                          const newFeeList = [...feeList];
                          newFeeList[idx].desc = e.target.value;
                          setFeeList(newFeeList);
                        }}
                        className="input-edit"
                        style={{
                          width: "100%",
                          borderRadius: 6,
                          border: "1px solid #eee",
                          padding: "4px 8px",
                        }}
                      >
                        <option value="">Chọn lý do thu</option>
                        <option value="Phí vận chuyển giao/nhận xe tận nơi">
                          Phí vận chuyển giao/nhận xe tận nơi
                        </option>
                        <option value="Phí trả xe tại khu vực khác">
                          Phí trả xe tại khu vực khác
                        </option>
                        <option value="Phí phụ chuyển giao/nhận xe">
                          Phí phụ chuyển giao/nhận xe
                        </option>
                        <option value="Phí khác">Phí khác</option>
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
                        }}
                        className="input-edit"
                        style={{
                          width: 100,
                          textAlign: "right",
                          borderRadius: 6,
                          border: "1px solid #eee",
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
                        }}
                        className="input-edit"
                        style={{
                          width: "100%",
                          borderRadius: 6,
                          border: "1px solid #eee",
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
          style={{ justifyContent: "flex-end", margin: "24px 0" }}
        >
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
          onAdd={(cars: any[]) => {
            setCarList([
              ...carList,
              ...cars.map((car) => ({
                ...car,
                id: car.id || "",
              })),
            ]);
            setShowAddMotor(false);
          }}
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
      </div>
    </div>
  );
};

export default ContractCreateComponent;
