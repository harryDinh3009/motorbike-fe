import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    paymentAmount: number;
    closeDate: string;
    paymentMethod?: string;
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
  const [closeDate, setCloseDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  useEffect(() => {
    // Set default time là thời gian hiện tại (local time)
    setCloseDate(dayjs().format("YYYY-MM-DDTHH:mm:ss"));
    setPaymentMethod("");
  }, [open, mustPay]);

  const remain = mustPay - paid;

  const handleSubmit = () => {
    // Validation: luôn phải chọn hình thức thanh toán
    if (!paymentMethod) {
      alert("Vui lòng chọn hình thức thanh toán");
      return;
    }
    
    // Validation: phải có ngày đóng hợp đồng
    if (!closeDate) {
      alert("Vui lòng chọn ngày đóng hợp đồng");
      return;
    }
    
    onSubmit({
      paymentAmount: remain,
      closeDate,
      paymentMethod: paymentMethod, // Luôn truyền paymentMethod
    });
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Đóng hợp đồng"
      width={540}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            borderTop: "1px solid #eee",
            paddingTop: 16,
            marginTop: 8,
          }}
        >
          <ButtonBase label="Hủy" className="btn_lightgray" onClick={onClose} />
          <ButtonBase
            label="Lưu"
            className="btn_primary"
            onClick={handleSubmit}
          />
        </div>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{customerName}</div>
        <div
          style={{
            marginTop: 12,
            background: "#fafbfc",
            borderRadius: 8,
            border: "1px solid #eee",
            padding: 16,
          }}
        >
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 600,
            }}
          >
            <span>{remain >= 0 ? "Phải thu khách:" : "Phải trả khách:"}</span>
            <span>{Math.abs(remain).toLocaleString()} đ</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #eee", margin: "16px 0" }} />
      {/* Luôn hiển thị số tiền còn lại */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>
          {remain >= 0 ? "Phải thu khách:" : "Phải trả khách:"}
        </div>
        <input
          type="text"
          value={remain >= 0 
            ? remain.toLocaleString() + " đ" 
            : "-" + Math.abs(remain).toLocaleString() + " đ"}
          disabled
          style={{
            width: "100%",
            border: "1px solid #eee",
            borderRadius: 4,
            padding: 8,
            color: '#888',
            background: '#f5f5f5',
            fontWeight: 600,
            textAlign: "right",
          }}
        />
      </div>
      {/* Luôn hiển thị trường phương thức thanh toán */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>
          Hình thức thanh toán
        </div>
        <select
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #eee",
            borderRadius: 4,
            padding: 8,
          }}
          required
        >
          <option value="">Chọn hình thức</option>
          {paymentMethods.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <DatePickerBase
          id="closeDate"
          label="Ngày đóng hợp đồng"
          value={closeDate}
          onChange={(val) => setCloseDate(val || "")}
          required
          style={{ width: "100%" }}
        />
      </div>
    </TModal>
  );
};

export default ModalCloseContract;
