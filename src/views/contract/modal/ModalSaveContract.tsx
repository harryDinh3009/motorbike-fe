import React, { useState, useEffect } from "react";
import styles from "./style.module.css";
import { FileAddOutlined, DollarOutlined } from "@ant-design/icons";
import TModal from "@/component/common/modal/TModal";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import InputBase from "@/component/common/input/InputBase";
import ButtonBase from "@/component/common/button/ButtonBase";

interface ModalSaveContractProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  contract?: any;
  customers: Array<{ value: string; label: string }>;
  cars: Array<{ value: string; label: string }>;
}

const ModalSaveContract: React.FC<ModalSaveContractProps> = ({
  open,
  onClose,
  onSave,
  contract,
  customers,
  cars,
}) => {
  const [form, setForm] = useState({
    customer: "",
    car: "",
    startDate: "",
    endDate: "",
    pricePerDay: 0,
    extraFee: 0,
  });

  useEffect(() => {
    if (contract) {
      setForm({
        customer:
          customers.find((cu) => cu.label === contract.customer)?.value || "",
        car: cars.find((car) => car.label === contract.car)?.value || "",
        startDate: contract.startDate || "",
        endDate: contract.endDate || "",
        pricePerDay: contract.pricePerDay || 0,
        extraFee: contract.extraFee || 0,
      });
    } else {
      setForm({
        customer: "",
        car: "",
        startDate: "",
        endDate: "",
        pricePerDay: 0,
        extraFee: 0,
      });
    }
  }, [contract, customers, cars]);
  // ...existing code...
  const calcTotal = () => {
    if (!form.startDate || !form.endDate || !form.pricePerDay) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return days * form.pricePerDay + (form.extraFee || 0);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (
      !form.customer ||
      !form.car ||
      !form.startDate ||
      !form.endDate ||
      !form.pricePerDay
    ) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }
    onSave(form);
  };

  return (
    <TModal
      title={contract ? "Chỉnh sửa hợp đồng" : "Thêm hợp đồng"}
      visible={open}
      onCancel={onClose}
      width={500}
      footer={<></>}
    >
      <form onSubmit={handleSubmit} className={styles.modalContractForm}>
        <div className={styles.modalContractFields}>
          <div>
            <label className={styles.modalLabel}>Khách hàng</label>
            <SelectboxBase
              value={form.customer}
              options={[{ value: "", label: "Chọn khách hàng" }, ...customers]}
              onChange={(val: string | string[]) =>
                setForm({
                  ...form,
                  customer: typeof val === "string" ? val : val[0] || "",
                })
              }
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className={styles.modalLabel}>Xe</label>
            <SelectboxBase
              value={form.car}
              options={[{ value: "", label: "Chọn xe" }, ...cars]}
              onChange={(val: string | string[]) =>
                setForm({
                  ...form,
                  car: typeof val === "string" ? val : val[0] || "",
                })
              }
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className={styles.modalLabel}>Ngày thuê</label>
            <InputBase
              type="text"
              value={form.startDate}
              placeholder="YYYY-MM-DD"
              onChange={(val) => setForm({ ...form, startDate: val as string })}
              style={{ width: "100%" }}
              inputMode="date"
            />
          </div>
          <div>
            <label className={styles.modalLabel}>Ngày trả</label>
            <InputBase
              type="text"
              value={form.endDate}
              placeholder="YYYY-MM-DD"
              onChange={(val) => setForm({ ...form, endDate: val as string })}
              style={{ width: "100%" }}
              inputMode="date"
            />
          </div>
          <div>
            <label className={styles.modalLabel}>Giá thuê/ngày</label>
            <InputBase
              type="number"
              value={form.pricePerDay}
              placeholder="Giá thuê/ngày"
              min={0}
              onChange={(val) => setForm({ ...form, pricePerDay: Number(val) })}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label className={styles.modalLabel}>Phụ phí (nếu có)</label>
            <InputBase
              type="number"
              value={form.extraFee}
              placeholder="Phụ phí (nếu có)"
              min={0}
              onChange={(val) => setForm({ ...form, extraFee: Number(val) })}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className={styles.modalContractTotal}>
          <DollarOutlined style={{ color: "#1890ff" }} />
          <span>Tổng tiền thuê:</span>
          <b className={styles.modalContractTotalValue}>
            {calcTotal().toLocaleString()}₫
          </b>
        </div>
        <div className={styles.modalContractActions}>
          <ButtonBase
            label={contract ? "Lưu" : "Thêm mới"}
            className="btn_primary"
            onClick={handleSubmit}
            style={{ minWidth: 100, borderRadius: 6, fontWeight: 500 }}
          />
          <ButtonBase
            label="Đóng"
            className="btn_lightgray"
            onClick={onClose}
            style={{ minWidth: 100, borderRadius: 6, fontWeight: 500 }}
          />
        </div>
      </form>
    </TModal>
  );
  // ...existing code...
};

export default ModalSaveContract;
