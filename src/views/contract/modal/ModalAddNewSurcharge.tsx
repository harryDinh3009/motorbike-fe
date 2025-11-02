import React, { useState } from "react";
import ButtonBase from "@/component/common/button/ButtonBase";
import TModal from "@/component/common/modal/TModal";

// Dummy data loại phụ phí
const surchargeTypes = [
  { value: "delivery", label: "Phí giao/nhận xe" },
  { value: "late", label: "Phí trả xe trễ" },
  { value: "clean", label: "Phí vệ sinh xe" },
  { value: "other", label: "Khác" },
];

const ModalAddNewSurcharge = ({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (fee: any) => void;
}) => {
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState("");

  const total = (quantity || 0) * (price || 0);

  const handleAdd = () => {
    onAdd({
      desc: surchargeTypes.find((s) => s.value === type)?.label || "",
      amount: total,
      note,
    });
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Thêm mới phụ thu"
      width={400}
      footer={null}
    >
      <div style={{ marginBottom: 12 }}>
        <label>Lý do phụ thu</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        >
          <option value="">Chọn lý do thu</option>
          {surchargeTypes.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Số lượng</label>
        <input
          type="number"
          value={quantity}
          min={1}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Đơn giá</label>
        <input
          type="number"
          value={price}
          min={0}
          onChange={(e) => setPrice(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
        <span style={{ marginLeft: 8 }}>VND</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Ghi chú</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
          placeholder="Nhập ghi chú về phụ thu"
        />
      </div>
      <div style={{ marginBottom: 12, textAlign: "right" }}>
        <b>Tổng tiền: {total.toLocaleString()} VND</b>
      </div>
      <div
        className="modal_footer dp_flex"
        style={{ justifyContent: "flex-end", gap: 8 }}
      >
        <ButtonBase label="Thoát" className="btn_gray" onClick={onClose} />
        <ButtonBase
          label="Thêm mới"
          className="contract-action-btn"
          onClick={handleAdd}
        />
      </div>
    </TModal>
  );
};

export default ModalAddNewSurcharge;
