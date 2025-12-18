import React, { useState, useEffect } from "react";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import InputBase from "@/component/common/input/InputBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import { getAllBrands } from "@/service/business/brandMng/brandMng.service";
import { BrandDTO } from "@/service/business/brandMng/brandMng.type";
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
    brandId: "",
    description: "",
    baseDailyPrice: "",
    baseHourlyPrice: "",
    active: true,
  });

  const [brandOptions, setBrandOptions] = useState([
    { value: "", label: "Chọn hãng xe" },
  ]);

  // Fetch brands on mount
  useEffect(() => {
    if (open) {
      getAllBrands().then((res) => {
        setBrandOptions([
          { value: "", label: "Chọn hãng xe" },
          ...(res.data || []).map((b: BrandDTO) => ({
            value: b.id,
            label: b.name,
          })),
        ]);
      });
    }
  }, [open]);

  useEffect(() => {
    if (model) {
      setForm({
        name: model.name || "",
        brandId: model.brandId || "",
        description: model.description || "",
        baseDailyPrice: model.baseDailyPrice ? model.baseDailyPrice.toString() : "",
        baseHourlyPrice: model.baseHourlyPrice ? model.baseHourlyPrice.toString() : "",
        active: model.active ?? true,
      });
    } else {
      setForm({
        name: "",
        brandId: "",
        description: "",
        baseDailyPrice: "",
        baseHourlyPrice: "",
        active: true
      });
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

    const payload: CarModelSaveDTO = {
      ...form,
      baseDailyPrice: form.baseDailyPrice ? Number(form.baseDailyPrice) : undefined,
      baseHourlyPrice: form.baseHourlyPrice ? Number(form.baseHourlyPrice) : undefined,
    };

    onSave(payload);
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
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#333" }}>
              Tên mẫu xe <span style={{ color: "red" }}>*</span>
            </label>
            <InputBase
              required
              modelValue={form.name}
              placeholder="Nhập tên mẫu xe"
              onChange={(val) => handleChange("name", val)}
              style={{ width: "100%" }}
              disabled={!!viewOnly}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#333" }}>
              Hãng xe
            </label>
            <SelectboxBase
              value={form.brandId}
              options={brandOptions}
              placeholder="Chọn hãng xe"
              onChange={(val) => handleChange("brandId", val)}
              style={{ width: "100%" }}
              disabled={!!viewOnly}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#333" }}>
              Giá ngày mặc định
            </label>
            <InputBase
              modelValue={form.baseDailyPrice}
              placeholder="Nhập giá thuê theo ngày"
              onChange={(val) => handleChange("baseDailyPrice", val)}
              style={{ width: "100%" }}
              disabled={!!viewOnly}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#333" }}>
              Giá giờ mặc định
            </label>
            <InputBase
              modelValue={form.baseHourlyPrice}
              placeholder="Nhập giá thuê theo giờ"
              onChange={(val) => handleChange("baseHourlyPrice", val)}
              style={{ width: "100%" }}
              disabled={!!viewOnly}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#333" }}>
              Mô tả
            </label>
            <TextAreaBase
              placeholder="Nhập mô tả"
              value={form.description}
              onChange={(val) => handleChange("description", val)}
              rows={3}
              style={{ width: "100%" }}
              disabled={!!viewOnly}
            />
          </div>
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
