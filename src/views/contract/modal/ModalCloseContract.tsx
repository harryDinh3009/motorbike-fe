import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    paymentAmount: number;
    paymentMethod: string;
    closeDate: string;
  }) => void;
  customerName: string;
  totalAmount: number;
  discount: number;
  mustPay: number;
  paid: number;
  paymentMethods: { value: string; label: string }[];
}

const ModalCloseContract = ({
  open,
  onClose,
  onSubmit,
  customerName,
  totalAmount,
  discount,
  mustPay,
  paid,
  paymentMethods,
}: Props) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(mustPay);

  useEffect(() => {
    setPaymentAmount(mustPay);
    setPaymentMethod("");
    setCloseDate("");
  }, [open, mustPay]);

  const remain = mustPay - paid;

  const handleSubmit = () => {
    if (!paymentMethod) return;
    onSubmit({
      paymentAmount: remain,
      paymentMethod,
      closeDate,
    });
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Đóng hợp đồng"
      width={540}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid #eee", paddingTop: 16, marginTop: 8 }}>
          <ButtonBase label="Hủy" className="btn_lightgray" onClick={onClose} />
          <ButtonBase label="Lưu" className="btn_primary" onClick={handleSubmit} />
        </div>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{customerName}</div>
        <div style={{ marginTop: 12, background: "#fafbfc", borderRadius: 8, border: "1px solid #eee", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tổng tiền</span>
            <span>{totalAmount.toLocaleString()} đ</span>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
            (Bao gồm tiền thuê xe và phụ thu)
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Giảm giá</span>
            <span>{discount.toLocaleString()} đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tổng phải thu</span>
            <span>{mustPay.toLocaleString()} đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Khách đã thanh toán</span>
            <span>{paid.toLocaleString()} đ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
            <span>Phải thu khách:</span>
            <span>{remain.toLocaleString()} đ</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #eee", margin: "16px 0" }} />
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Khách thanh toán</div>
        <input
          value={remain.toLocaleString() + " đ"}
          disabled
          style={{ width: "100%", background: "#f5f5f5", border: "1px solid #eee", borderRadius: 4, padding: 8, fontWeight: 600 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Hình thức thanh toán</div>
        <SelectboxBase
          value={paymentMethod}
          options={[{ value: "", label: "Chọn hình thức" }, ...(paymentMethods || [])]}
          onChange={val => setPaymentMethod(typeof val === "string" ? val : val[0] || "")}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Ngày đóng hợp đồng</div>
        <input
          type="date"
          value={closeDate}
          onChange={e => setCloseDate(e.target.value)}
          style={{ width: "100%", border: "1px solid #eee", borderRadius: 4, padding: 8 }}
        />
      </div>
    </TModal>
  );
};

export default ModalCloseContract;
