import React, { useState } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import TabBase from "@/component/common/tab/TabBase";
import ImageBase from "@/component/common/image/ImageBase";

const modelOptions = [
  { value: "", label: "Mẫu xe" },
  { value: "Honda Wave Alpha", label: "Honda Wave Alpha" },
  { value: "Yamaha Sirius", label: "Yamaha Sirius" },
  { value: "Yamaha PG-1", label: "Yamaha PG-1" },
  { value: "Honda XR150", label: "Honda XR150" },
  { value: "Honda Winner 150", label: "Honda Winner 150" },
];
const branchOptions = [
  { value: "", label: "Chi nhánh" },
  { value: "1", label: "Chi nhánh 1" },
  { value: "2", label: "Chi nhánh 2" },
];
const conditionOptions = [
  { value: "Nguyên vẹn", label: "Nguyên vẹn" },
  { value: "Hỏng hóc", label: "Hỏng hóc" },
];
const colorOptions = [
  { value: "", label: "Màu sắc" },
  { value: "Đen", label: "Đen" },
  { value: "Trắng", label: "Trắng" },
  { value: "Đỏ", label: "Đỏ" },
  { value: "Xanh", label: "Xanh" },
];

interface Props {
  open: boolean;
  motorbike?: any;
  onClose: () => void;
  onSave: (motorbike: any) => void;
}

const ModalSaveMotorbike = ({ open, motorbike, onClose, onSave }: Props) => {
  const [activeTab, setActiveTab] = useState("1");
  const [form, setForm] = useState({
    model: "",
    branch: "",
    license: "",
    condition: "Nguyên vẹn",
    odometer: "",
    note: "",
    image: "",
    // Thông tin bổ sung
    year: "",
    origin: "",
    value: "",
    frameNo: "",
    engineNo: "",
    color: "",
    regNo: "",
    regName: "",
    regPlace: "",
    insuranceNo: "",
    insuranceExpire: "",
  });

  // Reset form khi mở modal mới
  React.useEffect(() => {
    if (motorbike) {
      setForm({
        ...form,
        ...motorbike,
      });
    } else {
      setForm({
        model: "",
        branch: "",
        license: "",
        condition: "Nguyên vẹn",
        odometer: "",
        note: "",
        image: "",
        year: "",
        origin: "",
        value: "",
        frameNo: "",
        engineNo: "",
        color: "",
        regNo: "",
        regName: "",
        regPlace: "",
        insuranceNo: "",
        insuranceExpire: "",
      });
    }
    setActiveTab("1");
  }, [open, motorbike]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(form);
  };

  const tabItems = [
    {
      label: "Thông tin cơ bản",
      key: "1",
      content: (
        <div className="dp_flex" style={{ gap: 32 }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <SelectboxBase
                label="Mẫu xe"
                required
                value={form.model}
                options={modelOptions}
                placeholder="Ví dụ: Honda Wave Alpha"
                onChange={(val) => handleChange("model", val)}
              />
            </div>
            <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <SelectboxBase
                  label="Chi nhánh sở hữu"
                  required
                  value={form.branch}
                  options={branchOptions}
                  placeholder="Chọn chi nhánh"
                  onChange={(val) => handleChange("branch", val)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <SelectboxBase
                  label="Tình trạng xe"
                  value={form.condition}
                  options={conditionOptions}
                  placeholder="Chọn tình trạng"
                  onChange={(val) => handleChange("condition", val)}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <InputBase
                label="Biển số xe"
                required
                modelValue={form.license}
                placeholder="Ví dụ: 34E-06869"
                onChange={(val) => handleChange("license", val)}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <InputBase
                label={
                  <>
                    Odometer hiện tại{" "}
                    <span
                      title="Số km trên đồng hồ"
                      style={{
                        color: "#999",
                        fontSize: 14,
                        marginLeft: 4,
                        cursor: "help",
                      }}
                    >
                      <i className="fa fa-info-circle" />
                    </span>
                  </>
                }
                modelValue={form.odometer}
                placeholder="Nhập số km trên đồng hồ"
                onChange={(val) => handleChange("odometer", val)}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <TextAreaBase
                label="Ghi chú"
                placeholder="Nhập ghi chú"
                defaultValue={form.note}
                onChange={(val) => handleChange("note", val)}
                rows={2}
              />
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            <div
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                width: 260,
                height: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafbfc",
                textAlign: "center",
                padding: 16,
              }}
            >
              {form.image ? (
                <ImageBase src={form.image} width={180} height={180} alt="Ảnh xe" />
              ) : (
                <>
                  <div style={{ fontSize: 60, color: "#d9d9d9", marginBottom: 12 }}>
                    <i className="fa fa-image" />
                  </div>
                  <div style={{ color: "#bdbdbd", fontSize: 15, marginBottom: 8 }}>
                    Thiết lập hình ảnh đại diện cho xe.
                  </div>
                  <div style={{ color: "#bdbdbd", fontSize: 13 }}>
                    Chỉ chấp nhận tệp hình ảnh *.png, *.jpg và *.jpeg
                  </div>
                </>
              )}
              {/* Upload ảnh: chỉ UI, không xử lý upload thực */}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                style={{ marginTop: 16 }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      handleChange("image", ev.target?.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Thông tin bổ sung",
      key: "2",
      content: (
        <div>
          <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Năm sản xuất"
                modelValue={form.year}
                placeholder="Nhập năm sản xuất"
                onChange={(val) => handleChange("year", val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Xuất xứ"
                modelValue={form.origin}
                placeholder="Nhập xuất xứ"
                onChange={(val) => handleChange("origin", val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Giá trị xe"
                modelValue={form.value}
                placeholder="Nhập giá trị xe"
                onChange={(val) => handleChange("value", val)}
              />
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Số khung"
                modelValue={form.frameNo}
                placeholder="Nhập số khung"
                onChange={(val) => handleChange("frameNo", val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Số máy"
                modelValue={form.engineNo}
                placeholder="Nhập số máy"
                onChange={(val) => handleChange("engineNo", val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <SelectboxBase
                label="Màu sắc"
                value={form.color}
                options={colorOptions}
                placeholder="Màu sắc"
                onChange={(val) => handleChange("color", val)}
              />
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Số giấy đăng ký xe"
                modelValue={form.regNo}
                placeholder="Nhập số giấy đăng ký xe"
                onChange={(val) => handleChange("regNo", val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Tên trên đăng ký"
                modelValue={form.regName}
                placeholder="Nhập tên trên đăng ký"
                onChange={(val) => handleChange("regName", val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Nơi đăng ký"
                modelValue={form.regPlace}
                placeholder="Nhập nơi đăng ký"
                onChange={(val) => handleChange("regPlace", val)}
              />
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Số hợp đồng bảo hiểm TNDS"
                modelValue={form.insuranceNo}
                placeholder="Nhập số hợp đồng bảo hiểm TNDS"
                onChange={(val) => handleChange("insuranceNo", val)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <DatePickerBase
                label="Ngày hết hạn bảo hiểm TNDS"
                value={form.insuranceExpire}
                placeholder="Chọn ngày hết hạn"
                onChange={(val) => handleChange("insuranceExpire", val)}
              />
            </div>
            <div style={{ flex: 1 }} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <TModal
      title="Thêm xe mới"
      visible={open}
      onCancel={onClose}
      width={900}
      centered
      footer={
        <div className="dp_flex" style={{ justifyContent: "flex-end", gap: 12 }}>
          <ButtonBase label="Hủy bỏ" className="btn_lightgray" onClick={onClose} />
          <ButtonBase label="Lưu" className="btn_yellow" onClick={handleSave} />
        </div>
      }
    >
      <div className="box_section" style={{ padding: 0 }}>
        <TabBase
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </TModal>
  );
};

export default ModalSaveMotorbike;
