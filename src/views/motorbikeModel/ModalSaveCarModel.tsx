import React, { useState, useEffect } from "react";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import InputBase from "@/component/common/input/InputBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import {
  CarModelDTO,
  CarModelSaveDTO,
} from "@/service/business/carMng/carModelMng.type";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: CarModelSaveDTO) => void;
  model?: CarModelDTO | null;
  viewOnly?: boolean;
}

const ModalSaveCarModel = ({ open, onClose, onSave, model, viewOnly }: Props) => {
  const [form, setForm] = useState<CarModelSaveDTO>({
    name: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    if (model) {
      setForm({
        name: model.name || "",
        description: model.description ?? "", // fix: always set description, even if empty string
        active: model.active ?? true,
      });
    } else {
      setForm({ name: "", description: "", active: true });
    }
  }, [model, open]);

  const handleChange = (key: keyof CarModelSaveDTO, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên mẫu xe!");
      return;
    }
    onSave(form);
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title={
        viewOnly
          ? "Chi tiết mẫu xe"
          : model
          ? "Cập nhật mẫu xe"
          : "Thêm mẫu xe"
      }
      width={480}
      centered
      footer={
        <div
          className="dp_flex"
          style={{ justifyContent: "flex-end", gap: 12 }}
        >
          <ButtonBase
            label={viewOnly ? "Đóng" : "Hủy"}
            className="btn_lightgray"
            onClick={onClose}
          />
          {!viewOnly && (
            <ButtonBase
              label={model ? "Lưu" : "Thêm mới"}
              className="btn_yellow"
              onClick={handleSubmit}
            />
          )}
        </div>
      }
    >
      <div className="box_section" style={{ padding: 0 }}>
        <div style={{ display: "grid", gap: 20 }}>
          <InputBase
            label={
              <span>
                Tên mẫu xe <span style={{ color: "red" }}>*</span>
              </span>
            }
            required
            modelValue={form.name}
            placeholder="Nhập tên mẫu xe"
            onChange={(val) => handleChange("name", val)}
            style={{ width: "100%" }}
            disabled={!!viewOnly}
          />
          <TextAreaBase
            label="Mô tả"
            placeholder="Nhập mô tả"
            value={form.description}
            onChange={(val) => handleChange("description", val)}
            rows={3}
            style={{ width: "100%" }}
            disabled={!!viewOnly}
          />
          {viewOnly && (
            <div>
              <b>Trạng thái:</b>{" "}
              {model?.active ? (
                <span style={{ color: "#52c41a", fontWeight: 500 }}>
                  Đang sử dụng
                </span>
              ) : (
                <span style={{ color: "#aaa" }}>Ngừng</span>
              )}
            </div>
          )}
        </div>
      </div>
    </TModal>
  );
};

export default ModalSaveCarModel;
