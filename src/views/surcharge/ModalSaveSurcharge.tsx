import React, { useEffect, useState } from "react";
import Modal from "antd/es/modal/Modal";
import InputBase from "@/component/common/input/InputBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";

interface Props {
  open: boolean;
  surcharge?: any;
  onClose: () => void;
  onSave: (surcharge: any) => void;
}

const statusOptions = [
  { value: true, label: "Hoạt động" },
  { value: false, label: "Ngừng" },
];

const ModalSaveSurcharge = ({ open, surcharge, onClose, onSave }: Props) => {
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    price: "",
    description: "",
    status: true,
  });

  useEffect(() => {
    if (surcharge) {
      setForm({
        id: surcharge.id,
        name: surcharge.name || "",
        price: surcharge.price || "",
        description: surcharge.description || "",
        status: surcharge.status !== "inactive",
      });
    } else {
      setForm({
        id: undefined,
        name: "",
        price: "",
        description: "",
        status: true,
      });
    }
  }, [surcharge, open]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      status: form.status ? "active" : "inactive",
    });
  };

  return (
    <Modal
      open={open}
      title={<span className="font_18 font_bold" style={{ color: "#222" }}>Cập nhật phụ thu</span>}
      onCancel={onClose}
      footer={
        <div className="dp_flex" style={{ justifyContent: "flex-end", gap: 12 }}>
          <ButtonBase label="Hủy" className="btn_lightgray" onClick={onClose} />
          <ButtonBase label="Lưu" className="btn_primary" onClick={handleSubmit} />
        </div>
      }
      width={600}
      centered
      closeIcon={<span style={{ color: "#f5a623", fontSize: 22 }}>×</span>}
      bodyStyle={{ padding: 24, paddingTop: 12 }}
      style={{ top: 40 }}
    >
      <div className="box_section" style={{ padding: 0 }}>
        <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <InputBase
              label="Tên phụ thu"
              modelValue={form.name}
              onChange={(val) => handleChange("name", val)}
              required={true}
              placeholder="Nhập tên phụ thu"
            />
          </div>
          <div style={{ flex: 1 }}>
            <InputBase
              label="Đơn giá"
              modelValue={form.price}
              onChange={(val) => handleChange("price", val)}
              required={true}
              placeholder="Nhập đơn giá"
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <TextAreaBase
            label="Mô tả"
            placeholder="Nhập mô tả"
            defaultValue={form.description}
            onChange={(val) => handleChange("description", val)}
            rows={2}
          />
        </div>
        <div className="dp_flex" style={{ alignItems: "center", marginBottom: 24 }}>
          <span style={{ minWidth: 90 }}>Trạng thái</span>
          <SelectboxBase
            value={form.status}
            options={statusOptions}
            style={{ minWidth: 140 }}
            onChange={(val) =>
              handleChange("status", val === "true" || val === true)
            }
            placeholder="Chọn trạng thái"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalSaveSurcharge;
