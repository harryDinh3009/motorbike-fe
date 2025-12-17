import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";

interface Props {
  open: boolean;
  brand?: any;
  onClose: () => void;
  onSave: (brand: any) => void;
}

const ModalSaveBrand = ({ open, brand, onClose, onSave }: Props) => {
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    description: "",
  });

  useEffect(() => {
    if (brand) {
      setForm({
        id: brand.id,
        name: brand.name || "",
        description: brand.description || "",
      });
    } else {
      setForm({
        id: undefined,
        name: "",
        description: "",
      });
    }
  }, [brand, open]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      return;
    }
    onSave(form);
  };

  const isUpdate = !!form.id;
  return (
    <TModal
      title={isUpdate ? "Cập nhật hãng xe" : "Thêm hãng xe"}
      visible={open}
      onCancel={onClose}
      footer={
        <>
          <div
            className="dp_flex"
            style={{ justifyContent: "flex-end", gap: 12 }}
          >
            <ButtonBase
              label="Hủy"
              className="btn_lightgray"
              onClick={onClose}
            />
            <ButtonBase
              label={isUpdate ? "Cập nhật" : "Thêm mới"}
              className="btn_yellow"
              onClick={handleSubmit}
            />
          </div>
        </>
      }
      width={600}
      centered={true}
    >
      <div className="box_section" style={{ padding: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
          >
            Tên hãng xe <span style={{ color: "red" }}>*</span>
          </label>
          <InputBase
            modelValue={form.name}
            placeholder="Nhập tên hãng xe"
            onChange={(val) => handleChange("name", val)}
            required={true}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
          >
            Mô tả
          </label>
          <TextAreaBase
            modelValue={form.description}
            placeholder="Nhập mô tả"
            onChange={(val) => handleChange("description", val)}
            rows={4}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalSaveBrand;

