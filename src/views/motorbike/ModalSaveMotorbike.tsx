import React, { useState, useEffect } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import TabBase from "@/component/common/tab/TabBase";
import ImageBase from "@/component/common/image/ImageBase";
import {
  getCarModels,
  getCarConditions,
  getCarTypes,
  getCarColors,
  getCarStatuses,
  uploadCarImage,
} from "@/service/business/carMng/carMng.service";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import { BranchDTO } from "@/service/business/branchMng/branchMng.type";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";

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
    condition: "",
    odometer: "",
    note: "",
    image: "",
    imageUrl: "",
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
    carType: "",
    dailyPrice: "",
    hourlyPrice: "",
    status: "",
  });
  const [saving, setSaving] = useState(false);

  // Filter options state
  const [branchOptions, setBranchOptions] = useState([
    { value: "", label: "Chi nhánh" },
  ]);
  const [modelOptions, setModelOptions] = useState([
    { value: "", label: "Mẫu xe" },
  ]);
  const [conditionOptions, setConditionOptions] = useState([
    { value: "", label: "Tình trạng xe" },
  ]);
  const [typeOptions, setTypeOptions] = useState([
    { value: "", label: "Loại xe" },
  ]);
  const [colorOptions, setColorOptions] = useState([
    { value: "", label: "Màu sắc" },
  ]);
  const [statusOptions, setStatusOptions] = useState([
    { value: "", label: "Trạng thái" },
  ]);

  useEffect(() => {
    getAllActiveBranches().then((res) => {
      setBranchOptions([
        { value: "", label: "Chi nhánh" },
        ...(res.data || []).map((b: BranchDTO) => ({
          value: b.id,
          label: b.name,
        })),
      ]);
    });
    getCarModels().then((res) => {
      setModelOptions([
        { value: "", label: "Mẫu xe" },
        ...(res.data || []).map((m: string) => ({
          value: m,
          label: m,
        })),
      ]);
    });
    getCarTypes().then((res) => {
      setTypeOptions([
        { value: "", label: "Loại xe" },
        ...(res.data || []).map((t: string) => ({
          value: t,
          label: t,
        })),
      ]);
    });
    getCarConditions().then((res) => {
      setConditionOptions([
        { value: "", label: "Tình trạng xe" },
        ...(res.data || []).map((c: string) => ({
          value: c,
          label: c,
        })),
      ]);
    });
    getCarColors().then((res) => {
      setColorOptions([
        { value: "", label: "Màu sắc" },
        ...(res.data || []).map((c: string) => ({
          value: c,
          label: c,
        })),
      ]);
    });
    getCarStatuses().then((res) => {
      setStatusOptions([
        { value: "", label: "Trạng thái" },
        ...(res.data || []).map((s: any) => ({
          value: s.code,
          label: s.name,
        })),
      ]);
    });
  }, []);

  // Reset form khi mở modal mới
  useEffect(() => {
    if (motorbike) {
      setForm({
        ...form,
        ...motorbike,
        carType: motorbike.carType || "",
        dailyPrice: motorbike.dailyPrice || "",
        hourlyPrice: motorbike.hourlyPrice || "",
        status: motorbike.status || "",
        condition: motorbike.condition || "",
        color: motorbike.color || "",
        imageUrl: motorbike.imageUrl || "",
      });
    } else {
      setForm({
        model: "",
        branch: "",
        license: "",
        condition: "",
        odometer: "",
        note: "",
        image: "",
        imageUrl: "",
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
        carType: "",
        dailyPrice: "",
        hourlyPrice: "",
        status: "",
      });
    }
    setActiveTab("1");
  }, [open, motorbike]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    let imageUrl = form.imageUrl || "";
    try {
      if (
        form.image &&
        typeof form.image !== "string" &&
        form.image instanceof File &&
        motorbike?.id
      ) {
        const imgRes = await uploadCarImage(motorbike.id, form.image);
        imageUrl = typeof imgRes.data === "string" ? imgRes.data : "";
      }
      await onSave({
        ...form,
        imageUrl,
        image: undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  // Thêm ref để trigger chọn file qua ButtonBase
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const tabItems = [
    {
      label: "Thông tin cơ bản",
      key: "1",
      content: (
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
          }}
        >
          {/* Form bên trái */}
          <div
            style={{
              flex: 2,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <div style={{ gridColumn: "span 2" }}>
                <SelectboxBase
                  label="Mẫu xe"
                  required
                  value={form.model}
                  options={modelOptions}
                  placeholder="Ví dụ: Honda Wave Alpha"
                  onChange={(val) => handleChange("model", val)}
                  style={{ width: "100%" }}
                />
              </div>
              <SelectboxBase
                label="Chi nhánh sở hữu"
                required
                value={form.branch}
                options={branchOptions}
                placeholder="Chọn chi nhánh"
                onChange={(val) => handleChange("branch", val)}
                style={{ width: "100%" }}
              />
              <SelectboxBase
                label="Tình trạng xe"
                value={form.condition}
                options={conditionOptions}
                placeholder="Chọn tình trạng"
                onChange={(val) => handleChange("condition", val)}
                style={{ width: "100%" }}
              />
              <SelectboxBase
                label="Loại xe"
                value={form.carType}
                options={typeOptions}
                placeholder="Chọn loại xe"
                onChange={(val) => handleChange("carType", val)}
                style={{ width: "100%" }}
              />
              <InputBase
                label="Giá ngày (Đ)"
                modelValue={form.dailyPrice}
                placeholder="Nhập giá ngày"
                onChange={(val) => handleChange("dailyPrice", val)}
                style={{ width: "100%" }}
              />
              <InputBase
                label="Giá giờ (Đ)"
                modelValue={form.hourlyPrice}
                placeholder="Nhập giá giờ"
                onChange={(val) => handleChange("hourlyPrice", val)}
                style={{ width: "100%" }}
              />
              <SelectboxBase
                label="Trạng thái"
                value={form.status}
                options={statusOptions}
                placeholder="Chọn trạng thái"
                onChange={(val) => handleChange("status", val)}
                style={{ width: "100%" }}
              />
              <InputBase
                label="Biển số xe"
                required
                modelValue={form.license}
                placeholder="Ví dụ: 34E-06869"
                onChange={(val) => handleChange("license", val)}
                style={{ width: "100%" }}
              />
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
                style={{ width: "100%" }}
              />
            </div>
            {/* Ghi chú chiếm toàn bộ chiều ngang, margin trên rõ ràng */}
            <div style={{ marginTop: 28 }}>
              <TextAreaBase
                label="Ghi chú"
                placeholder="Nhập ghi chú"
                defaultValue={form.note}
                onChange={(val) => handleChange("note", val)}
                rows={2}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          {/* Ảnh bên phải */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              height: "100%",
            }}
          >
            <div
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                width: 260,
                minHeight: 420,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafbfc",
                textAlign: "center",
                padding: 20,
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              {form.imageUrl || form.imagePreview ? (
                <ImageBase
                  src={form.imagePreview || form.imageUrl}
                  width={180}
                  height={180}
                  alt="Ảnh xe"
                  style={{
                    borderRadius: 8,
                    objectFit: "cover",
                    marginBottom: 12,
                    boxShadow: "0 2px 8px #eee",
                  }}
                />
              ) : (
                <>
                  <div
                    style={{ fontSize: 60, color: "#d9d9d9", marginBottom: 12 }}
                  >
                    <i className="fa fa-image" />
                  </div>
                  <div
                    style={{ color: "#bdbdbd", fontSize: 15, marginBottom: 8 }}
                  >
                    Thiết lập hình ảnh đại diện cho xe.
                  </div>
                  <div style={{ color: "#bdbdbd", fontSize: 13 }}>
                    Chỉ chấp nhận tệp hình ảnh *.png, *.jpg và *.jpeg
                  </div>
                </>
              )}
              {/* Upload ảnh: UI đẹp hơn, dùng ButtonBase */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleChange("image", file);
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      handleChange("imagePreview", ev.target?.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <ButtonBase
                label="Chọn tệp"
                className="btn_gray"
                style={{
                  marginTop: 16,
                  minWidth: 120,
                  borderRadius: 6,
                  fontWeight: 500,
                  fontSize: 15,
                  height: 40,
                  boxShadow: "0 1px 4px #eee",
                }}
                onClick={() => fileInputRef.current?.click()}
              />
              {form.image && typeof form.image !== "string" && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                  {form.image.name}
                </div>
              )}
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
        <div
          className="dp_flex"
          style={{ justifyContent: "flex-end", gap: 12 }}
        >
          <ButtonBase
            label="Hủy bỏ"
            className="btn_lightgray"
            onClick={onClose}
            disabled={saving}
          />
          <ButtonBase
            label="Lưu"
            className="btn_yellow"
            onClick={handleSave}
            loading={saving}
            disabled={saving}
          />
        </div>
      }
    >
      {saving && <LoadingIndicator />}
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
