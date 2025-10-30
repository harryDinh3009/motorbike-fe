import React, { useState } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import ButtonBase from "@/component/common/button/ButtonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import { HomeOutlined } from "@ant-design/icons";
import ModalAddMotor from "./modal/ModalAddMotor";
import ModalAddNewSurcharge from "./modal/ModalAddNewSurcharge";

// Dummy data
const customers = [
  { value: "1", label: "Nguyễn Văn A" },
  { value: "2", label: "Trần Thị B" },
  { value: "3", label: "Lê Văn C" },
];
const cars = [
  { value: "1", label: "Honda Wave Alpha" },
  { value: "2", label: "Yamaha Sirius" },
  { value: "3", label: "Vinfast Fadil" },
];
const branches = [
  { value: "CN1", label: "Chi nhánh 1" },
  { value: "CN2", label: "Chi nhánh 2" },
  { value: "CN3", label: "Chi nhánh 3" },
];

const paymentMethods = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank", label: "Chuyển khoản ngân hàng" },
];

const pageTitle = "Tạo hợp đồng thuê xe";
const breadcrumbItems = [
  { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
  { label: "Quản lý hợp đồng", path: "/contract" },
  { label: "Tạo hợp đồng", path: "/contract/create" },
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
};

interface CarItem {
  type: string;
  name: string;
  plate: string;
  priceDay: number;
  priceHour: number;
  total: number;
}

const initialCarList: CarItem[] = [
  {
    type: "Xe số",
    name: "Honda Wave Alpha",
    plate: "66H1-12345",
    priceDay: 120000,
    priceHour: 70000,
    total: 250000,
  },
];

interface FeeItem {
  desc: string;
  amount: number;
  note: string;
}

const initialFeeList: FeeItem[] = [
  { desc: "Phí phụ chuyển giao/nhận xe", amount: 50000, note: "" },
];

const ContractCreateComponent = () => {
  const [form, setForm] = useState(initialForm);
  const [carList, setCarList] = useState<any[]>(initialCarList);
  const [feeList, setFeeList] = useState<any[]>(initialFeeList);
  const [payment, setPayment] = useState({
    deposit: 0,
    method: "",
    total: 0,
    paid: 0,
    remain: 0,
  });
  const [showAddMotor, setShowAddMotor] = useState(false);
  const [showAddSurcharge, setShowAddSurcharge] = useState(false);

  // Thêm xe thuê từ modal
  const handleAddCarFromModal = (cars: any[]) => {
    setCarList([...carList, ...cars]);
    setShowAddMotor(false);
  };

  // Thêm phụ phí từ modal
  const handleAddFeeFromModal = (fee: any) => {
    setFeeList([...feeList, fee]);
    setShowAddSurcharge(false);
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

  // Tính tổng tiền thuê xe
  const totalCar = carList.reduce((sum, c) => sum + (c.total || 0), 0);
  // Tính tổng phụ phí
  const totalFee = feeList.reduce((sum, f) => sum + (f.amount || 0), 0);
  // Tổng cộng
  const totalAll = totalCar + totalFee;

  // Lưu hợp đồng
  const handleSave = () => {
    // TODO: Validate & gửi dữ liệu lên API
    alert("Đã lưu hợp đồng!");
  };

  return (
    <div className="content_wrap">
      <div id="content" className="grid_content">
        <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />

        <ContainerBase>
          <div className="box_section">
            <p className="box_title_sm">Thông tin thuê xe</p>
            <div className="box_section mg_b15">
              <p className="box_title_xs">Form Add / Update hợp đồng</p>
            </div>
            <div className="box_section">
              <table className="tbl_row tbl_border" style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td className="form_label" style={{ width: 160 }}>
                      Khách hàng
                    </td>
                    <td>
                      <SelectboxBase
                        value={form.customer}
                        options={[
                          { value: "", label: "Chọn khách hàng" },
                          ...customers,
                        ]}
                        onChange={(val: string | string[]) =>
                          setForm({
                            ...form,
                            customer:
                              typeof val === "string" ? val : val[0] || "",
                          })
                        }
                        style={{ minWidth: 200 }}
                      />
                    </td>
                    <td className="form_label" style={{ width: 160 }}>
                      Nguồn
                    </td>
                    <td>
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
                            source:
                              typeof val === "string" ? val : val[0] || "",
                          })
                        }
                        style={{ minWidth: 160 }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="form_label">Ngày thuê</td>
                    <td>
                      <input
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(e) =>
                          setForm({ ...form, startDate: e.target.value })
                        }
                        style={{ minWidth: 180 }}
                      />
                    </td>
                    <td className="form_label">Ngày trả</td>
                    <td>
                      <input
                        type="datetime-local"
                        value={form.endDate}
                        onChange={(e) =>
                          setForm({ ...form, endDate: e.target.value })
                        }
                        style={{ minWidth: 180 }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="form_label">Chi nhánh thuê xe</td>
                    <td>
                      <SelectboxBase
                        value={form.branchRent}
                        options={[
                          { value: "", label: "Chi nhánh mặc định" },
                          ...branches,
                        ]}
                        onChange={(val: string | string[]) =>
                          setForm({
                            ...form,
                            branchRent:
                              typeof val === "string" ? val : val[0] || "",
                          })
                        }
                        style={{ minWidth: 160 }}
                      />
                    </td>
                    <td className="form_label">Chi nhánh trả xe</td>
                    <td>
                      <SelectboxBase
                        value={form.branchReturn}
                        options={[
                          { value: "", label: "Chọn chi nhánh" },
                          ...branches,
                        ]}
                        onChange={(val: string | string[]) =>
                          setForm({
                            ...form,
                            branchReturn:
                              typeof val === "string" ? val : val[0] || "",
                          })
                        }
                        style={{ minWidth: 160 }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.needDelivery}
                          onChange={(e) =>
                            setForm({ ...form, needDelivery: e.target.checked })
                          }
                          style={{ marginRight: 8 }}
                        />
                        Cần vận chuyển giao xe tận nơi
                      </label>
                    </td>
                    <td colSpan={2}>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.needReceive}
                          onChange={(e) =>
                            setForm({ ...form, needReceive: e.target.checked })
                          }
                          style={{ marginRight: 8 }}
                        />
                        Cần vận chuyển nhận xe tận nơi
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="form_label">Địa điểm giao xe</td>
                    <td>
                      <input
                        type="text"
                        placeholder="Địa điểm giao xe"
                        value={form.deliveryAddress}
                        onChange={(e) =>
                          setForm({ ...form, deliveryAddress: e.target.value })
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td className="form_label">Địa điểm trả xe</td>
                    <td>
                      <input
                        type="text"
                        placeholder="Địa điểm trả xe"
                        value={form.receiveAddress}
                        onChange={(e) =>
                          setForm({ ...form, receiveAddress: e.target.value })
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="form_label">Ghi chú</td>
                    <td colSpan={3}>
                      <textarea
                        placeholder="Ghi chú"
                        value={form.note}
                        onChange={(e) =>
                          setForm({ ...form, note: e.target.value })
                        }
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          padding: 8,
                          border: "1px solid #eee",
                        }}
                        rows={2}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ContainerBase>

        <ContainerBase>
          <div className="box_section">
            <p className="box_title_sm">Danh sách xe thuê</p>
            <table
              className="contract-table contract-table-edit"
              style={{ width: "100%" }}
            >
              <thead>
                <tr>
                  <th>STT</th>
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
                {carList.map((car, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
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
                          newCarList[idx].total =
                            (Number(e.target.value) || 0) +
                            (newCarList[idx].priceHour || 0);
                          setCarList(newCarList);
                        }}
                        className="input-edit"
                        style={{ width: 90, textAlign: "right" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={car.priceHour}
                        onChange={(e) => {
                          const newCarList = [...carList];
                          newCarList[idx].priceHour = Number(e.target.value);
                          newCarList[idx].total =
                            (newCarList[idx].priceDay || 0) +
                            (Number(e.target.value) || 0);
                          setCarList(newCarList);
                        }}
                        className="input-edit"
                        style={{ width: 90, textAlign: "right" }}
                      />
                    </td>
                    <td style={{ fontWeight: "bold", color: "#222" }}>
                      {car.total?.toLocaleString()}
                    </td>
                    <td>
                      <ButtonBase
                        label="X"
                        className="btn_gray"
                        onClick={() => handleRemoveCar(idx)}
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
              style={{ width: "100%" }}
            >
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Lý do thu</th>
                  <th>Số tiền</th>
                  <th>Ghi chú</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {feeList.map((fee, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <select
                        value={fee.desc}
                        onChange={(e) => {
                          const newFeeList = [...feeList];
                          newFeeList[idx].desc = e.target.value;
                          setFeeList(newFeeList);
                        }}
                        className="input-edit"
                        style={{ width: "100%" }}
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
                        style={{ width: 100, textAlign: "right" }}
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
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          cursor: "pointer",
                          color: "#4096ff",
                          marginRight: 8,
                        }}
                        title="Sửa"
                        onClick={() => {}}
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
                onClick={handleAddFee}
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
            <div className="dp_flex" style={{ gap: 16 }}>
              <input
                type="number"
                placeholder="Tiền đặt cọc"
                value={payment.deposit}
                onChange={(e) =>
                  setPayment({ ...payment, deposit: Number(e.target.value) })
                }
                style={{ minWidth: 140 }}
              />
              <SelectboxBase
                value={payment.method}
                options={[
                  { value: "", label: "Phương thức thanh toán" },
                  ...paymentMethods,
                ]}
                onChange={(val: string | string[]) =>
                  setPayment({
                    ...payment,
                    method: typeof val === "string" ? val : val[0] || "",
                  })
                }
                style={{ minWidth: 180 }}
              />
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
                    <td>Đặt cọc:</td>
                    <td style={{ textAlign: "right" }}>
                      {payment.deposit.toLocaleString()} đ
                    </td>
                  </tr>
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
            label="Lưu hợp đồng"
            className="contract-action-btn"
            onClick={handleSave}
          />
        </div>

        {/* Modal thêm xe */}
        <ModalAddMotor
          open={showAddMotor}
          onClose={() => setShowAddMotor(false)}
          onAdd={handleAddCarFromModal}
        />

        {/* Modal thêm phụ phí */}
        <ModalAddNewSurcharge
          open={showAddSurcharge}
          onClose={() => setShowAddSurcharge(false)}
          onAdd={handleAddFeeFromModal}
        />
      </div>
    </div>
  );
};

export default ContractCreateComponent;
