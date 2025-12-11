import React, { useState, useEffect } from "react";
import ButtonBase from "@/component/common/button/ButtonBase";
import TModal from "@/component/common/modal/TModal";
import { getAllActiveSurchargeTypes } from "@/service/business/surchargeTypeMng/surchargeTypeMng.service";
import { SurchargeTypeDTO } from "@/service/business/surchargeTypeMng/surchargeTypeMng.type";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (fee: any) => void;
  fee?: any; // Nếu có thì là sửa, không có thì là thêm mới
}

const ModalSaveSurcharge = ({ open, onClose, onSave, fee }: Props) => {
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState("");
  const [surchargeTypeOptions, setSurchargeTypeOptions] = useState<
    { value: string; label: string; price: number }[]
  >([]);

  useEffect(() => {
    // Call API lấy danh sách phụ thu, size 1000
    getAllActiveSurchargeTypes().then((res) => {
      setSurchargeTypeOptions(
        (res.data || []).map((item: SurchargeTypeDTO) => ({
          value: item.id,
          label: item.name,
          price: item.price,
        }))
      );
    });
  }, []);

  useEffect(() => {
    if (fee) {
      // Ưu tiên tìm theo surchargeTypeId, nếu không có thì tìm theo desc
      const typeId = fee.type || fee.surchargeTypeId || "";
      const foundType = surchargeTypeOptions.find((s) => s.value === typeId);
      setType(typeId || "");
      setQuantity(fee.quantity || 1);
      setPrice(fee.unitPrice || fee.amount || 0);
      setNote(fee.note || "");
    } else {
      setType("");
      setQuantity(1);
      setPrice(0);
      setNote("");
    }
  }, [open, fee, surchargeTypeOptions]);

  // Khi chọn loại phụ thu thì tự động lấy giá mặc định nếu có
  useEffect(() => {
    const found = surchargeTypeOptions.find((s) => s.value === type);
    if (found && !fee) {
      setPrice(found.price || 0);
    }
  }, [type, surchargeTypeOptions, fee]);

  const total = (quantity || 0) * (price || 0);

  // Hàm xác định đơn vị tính dựa trên loại phụ thu
  const getUnitLabel = (surchargeTypeName: string): string => {
    if (!surchargeTypeName) return "VND/Lượt";
    
    const name = surchargeTypeName.toLowerCase();
    
    // Phụ phí trả xe muộn -> VND/Giờ
    if (name.includes("trả xe muộn")) {
      return "VND/Giờ";
    }
    
    // Phụ phí đi đường dài -> VND/KM
    if (name.includes("đi đường dài")) {
      return "VND/KM";
    }
    
    // Các loại còn lại -> VND/Lượt
    return "VND/Lượt";
  };

  // Lấy đơn vị tính hiện tại
  const selectedSurchargeType = surchargeTypeOptions.find((s) => s.value === type);
  const unitLabel = getUnitLabel(selectedSurchargeType?.label || "");

  const handleSave = () => {
    const selectedType = surchargeTypeOptions.find((s) => s.value === type);
    onSave({
      desc: selectedType?.label || "",
      type,
      surchargeTypeId: type,
      quantity,
      unitPrice: price,
      amount: total,
      note,
    });
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title={fee ? "Sửa phụ thu" : "Thêm mới phụ thu"}
      width={400}
      footer={
        <>
          <div
            className="modal_footer dp_flex"
            style={{ justifyContent: "flex-end", gap: 8 }}
          >
            <ButtonBase label="Thoát" className="btn_gray" onClick={onClose} />
            <ButtonBase
              label={fee ? "Lưu" : "Thêm mới"}
              className="contract-action-btn"
              onClick={handleSave}
            />
          </div>
        </>
      }
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
          {surchargeTypeOptions.map((s) => (
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
        <label>Đơn giá <span style={{ color: "red" }}>*</span></label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="number"
            value={price}
            min={0}
            onChange={(e) => setPrice(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px",
              paddingRight: type ? "80px" : "50px", // Tạo khoảng trống cho label
              borderRadius: 8,
              border: "1px solid #eee",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: "8px",
              color: "#1677ff",
              fontWeight: 500,
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            {unitLabel}
          </span>
        </div>
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
    </TModal>
  );
};

export default ModalSaveSurcharge;
