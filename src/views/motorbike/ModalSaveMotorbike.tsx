import React, { useState, useEffect, useCallback } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import TabBase from "@/component/common/tab/TabBase";
import ImageBase from "@/component/common/image/ImageBase";
import { message } from "antd";
import {
  getCarModels,
  getCarConditions,
  getCarTypes,
  getCarColors,
  getCarStatuses,
  uploadCarImage,
  getNextVehicleCode,
  getCarModelInfo,
} from "@/service/business/carMng/carMng.service";
import {
  getAllActiveBranches,
  getBranchByCurrentUser,
} from "@/service/business/branchMng/branchMng.service";
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

  // Function để lấy next vehicle code
  const fetchNextVehicleCode = useCallback(async (): Promise<string> => {
    try {
      const response = await getNextVehicleCode();
      return response.data || 'XE0001';
    } catch (error) {
      console.error('Error getting next vehicle code:', error);
      return 'XE0001';
    }
  }, []);

  
  // Style chuẩn cho label
  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 4,
    fontWeight: 500,
    fontSize: 14,
    color: "#333",
  };
  type FormState = {
    model: string;
    branch: string;
    license: string;
    vehicleCode: string;
    condition: string;
    odometer: string;
    note: string;
    image: string | File;
    imageUrl: string;
    imagePreview: string;
    year: string;
    origin: string;
    value: string;
    frameNo: string;
    engineNo: string;
    color: string;
    regNo: string;
    regName: string;
    regPlace: string;
    insuranceNo: string;
    insuranceExpire: string;
    carType: string;
    dailyPrice: string;
    hourlyPrice: string;
    status: string;
    brandId: string;
  };

  const [form, setForm] = useState<FormState>({
    model: "",
    branch: "",
    license: "",
    vehicleCode: "",
    condition: "",
    odometer: "",
    note: "",
    image: "",
    imageUrl: "",
    imagePreview: "",
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
    brandId: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter options state
  const [branchOptions, setBranchOptions] = useState([
    { value: "", label: "Chi nhánh" },
  ]);
  const [currentBranch, setCurrentBranch] = useState<{
    value: string;
    label: string;
  } | null>(null);
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

  // Model info state for auto-populating brand and prices
  const [selectedModelInfo, setSelectedModelInfo] = useState<{
    brandId?: string;
    brandName?: string;
    baseDailyPrice?: number;
    baseHourlyPrice?: number;
  } | null>(null);

  // Fetch static options on mount
  useEffect(() => {
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
      const statusList = (res.data || []).map((s: any) => ({
        value: s.code,
        label: s.name,
      }));
      setStatusOptions([
        { value: "", label: "Trạng thái" },
        ...statusList,
      ]);
    });
  }, []);

  // Always fetch current branch when modal opens
  useEffect(() => {
    if (open) {
      getBranchByCurrentUser().then((res) => {
        if (res.data) {
          setCurrentBranch({ value: res.data.id, label: res.data.name });
          setForm((prev) => ({ ...prev, branch: res.data.id }));
          setBranchOptions([{ value: res.data.id, label: res.data.name }]);
        }
      });
    }
  }, [open]);

  // Reset form khi mở modal mới
  useEffect(() => {
    if (!open) return;

    // Reset errors và model info khi mở modal
    setErrors({});
    setSelectedModelInfo(null);
    
    if (motorbike) {
      // Debug logs for vehicle code
      console.log("DEBUG: Loading vehicle with code:", motorbike?.vehicleCode);

      setForm({
        ...form,
        ...motorbike,
        vehicleCode: motorbike.vehicleCode || "",
        carType: motorbike.carType || "",
        dailyPrice: motorbike.dailyPrice ? motorbike.dailyPrice.toString() : "",
        hourlyPrice: motorbike.hourlyPrice ? motorbike.hourlyPrice.toString() : "",
        odometer: motorbike.odometer ? motorbike.odometer.toString() : "",
        status: motorbike.status || "",
        condition: motorbike.condition || "",
        color: motorbike.color || "",
        imageUrl: motorbike.imageUrl || "",
        imagePreview: "",
        year: motorbike.year ? motorbike.year.toString() : "",
        value: motorbike.value ? motorbike.value.toString() : "",
        brandId: motorbike.brandId || "",
      });

      console.log("DEBUG Frontend: Form set with vehicleCode:", motorbike.vehicleCode || "");
    } else {
      // Khi tạo mới, lấy vehicle code tiếp theo và set form
      fetchNextVehicleCode().then((vehicleCode) => {
        setForm({
          model: "",
          branch: "",
          license: "",
          vehicleCode: vehicleCode, // Sử dụng vehicle code từ API
          condition: "",
          odometer: "",
          note: "",
          image: "",
          imageUrl: "",
          imagePreview: "",
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
          status: "AVAILABLE", // Mặc định là "Hoạt động"
          brandId: "",
        });
      }).catch((error) => {
        console.error("Failed to get next vehicle code:", error);
        // Fallback với mã mặc định
        setForm({
          model: "",
          branch: "",
          license: "",
          vehicleCode: "XE0001", // Fallback
          condition: "",
          odometer: "",
          note: "",
          image: "",
          imageUrl: "",
          imagePreview: "",
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
          status: "AVAILABLE",
          brandId: "",
        });
      });

    }
    setActiveTab("1");
  }, [open, motorbike]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // Xóa lỗi khi user nhập lại
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Handle model selection - fetch model info and auto-populate brand/prices
  const handleModelChange = async (modelName: string) => {
    setForm((prev) => ({ ...prev, model: modelName }));

    if (modelName && modelName.trim() !== "") {
      try {
        const response = await getCarModelInfo(modelName);
        const modelInfo = response.data;
        setSelectedModelInfo(modelInfo);

        // Auto-populate prices from base prices if not already set
        setForm((prev) => ({
          ...prev,
          dailyPrice: prev.dailyPrice || (modelInfo.baseDailyPrice ? modelInfo.baseDailyPrice.toString() : ""),
          hourlyPrice: prev.hourlyPrice || (modelInfo.baseHourlyPrice ? modelInfo.baseHourlyPrice.toString() : ""),
        }));
      } catch (error) {
        console.error("Error fetching model info:", error);
        setSelectedModelInfo(null);
      }
    } else {
      setSelectedModelInfo(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate các trường bắt buộc
    if (!form.model || form.model.trim() === "") {
      newErrors.model = "Vui lòng chọn mẫu xe";
    }
    if (!form.branch || form.branch.trim() === "") {
      newErrors.branch = "Vui lòng chọn chi nhánh";
    }
    if (!form.license || form.license.trim() === "") {
      newErrors.license = "Vui lòng nhập biển số xe";
    }
    if (!form.dailyPrice || form.dailyPrice.trim() === "") {
      newErrors.dailyPrice = "Vui lòng nhập giá ngày";
    } else {
      const dailyPriceNum = Number(form.dailyPrice);
      if (isNaN(dailyPriceNum) || dailyPriceNum <= 0) {
        newErrors.dailyPrice = "Giá ngày phải là số dương";
      }
    }
    // Validate giá giờ nếu có nhập (không bắt buộc)
    if (form.hourlyPrice && form.hourlyPrice.trim() !== "") {
      const hourlyPriceNum = Number(form.hourlyPrice);
      if (isNaN(hourlyPriceNum) || hourlyPriceNum < 0) {
        newErrors.hourlyPrice = "Giá giờ phải là số không âm";
      }
    }
    // Validate trạng thái
    if (!form.status || form.status.trim() === "") {
      newErrors.status = "Vui lòng chọn trạng thái";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validate form trước khi lưu
    if (!validateForm()) {
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }


    setSaving(true);
    let imageUrl = form.imageUrl || "";
    try {
      if (
        form.image &&
        typeof form.image === "object" &&
        form.image !== null &&
        "name" in form.image &&
        "size" in form.image &&
        "type" in form.image &&
        typeof form.image.name === "string" &&
        typeof form.image.size === "number" &&
        typeof form.image.type === "string" &&
        motorbike?.id
      ) {
        const imgRes = await uploadCarImage(motorbike.id, form.image);
        imageUrl = typeof imgRes.data === "string" ? imgRes.data : "";
      }
      // Xử lý giá giờ: nếu không điền thì mặc định là 0
      const hourlyPrice = form.hourlyPrice && form.hourlyPrice.trim() !== "" 
        ? form.hourlyPrice 
        : "0";
      
      // Xử lý Odometer: nếu không điền thì mặc định là 0
      const odometer = form.odometer && form.odometer.trim() !== "" 
        ? form.odometer 
        : "0";
      
      const payload = {
        id: motorbike?.id || form.id, // Đảm bảo ID được gửi
        ...form,
        brandId: selectedModelInfo?.brandId || form.brandId, // Set brand từ model
        hourlyPrice,
        odometer,
        imageUrl,
        image: undefined,
      };

      console.log("DEBUG: Submitting vehicle code:", payload.vehicleCode);

      await onSave(payload);
      message.success("Lưu xe thành công!");
      onClose();
    } catch (error: any) {
      console.error("Save error:", error);

      // Handle specific error codes
      if (error.response?.data?.code === "400037") { // VEHICLE_CODE_EXISTS
        message.error("Mã xe đã tồn tại trong hệ thống. Vui lòng chọn mã xe khác!");
      } else if (error.response?.data?.message) {
        message.error("Lỗi: " + error.response.data.message);
      } else {
        message.error("Có lỗi xảy ra khi lưu xe. Vui lòng thử lại!");
      }
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
              {/* Hàng 1: Mẫu xe - Mã xe */}
              <div>
                <label style={labelStyle}>
                  Mẫu xe <span style={{ color: 'red' }}>*</span>
                </label>
                <SelectboxBase
                  id="model"
                  required
                  value={form.model}
                  options={modelOptions}
                  placeholder="Ví dụ: Honda Wave Alpha"
                  onChange={handleModelChange}
                  style={{ width: "100%" }}
                />
                {errors.model && (
                  <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
                    {errors.model}
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>
                  Mã xe
                </label>
                <InputBase
                  id="vehicleCode"
                  modelValue={form.vehicleCode}
                  placeholder="Mã xe"
                  onChange={(val) => handleChange("vehicleCode", val)}
                  style={{ width: "100%" }}
                  disabled={true} // Luôn disabled - mã xe tự sinh
                />
              </div>

              {/* Hàng 2: Chi nhánh sở hữu - Biển số xe */}
              <div>
                <label style={labelStyle}>
                  Chi nhánh sở hữu <span style={{ color: 'red' }}>*</span>
                </label>
                <SelectboxBase
                  id="branch"
                  required
                  value={form.branch}
                  options={branchOptions}
                  placeholder="Chi nhánh"
                  onChange={() => {}}
                  style={{ width: "100%" }}
                  disabled
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Biển số xe <span style={{ color: 'red' }}>*</span>
                </label>
                <InputBase
                  id="license"
                  required
                  modelValue={form.license}
                  placeholder="Ví dụ: 34E-06869"
                  onChange={(val) => handleChange("license", val)}
                  style={{ width: "100%" }}
                />
                {errors.license && (
                  <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
                    {errors.license}
                  </div>
                )}
              </div>

              {/* Hàng 3: Loại xe */}
              <div>
                <label style={labelStyle}>
                  Loại xe
                </label>
                <SelectboxBase
                  value={form.carType}
                  options={typeOptions}
                  placeholder="Chọn loại xe"
                  onChange={(val) => handleChange("carType", val)}
                  style={{ width: "100%" }}
                />
              </div>
              {/* Ô trống để cân đối layout */}
              <div></div>

              {/* Hàng 4: Trạng thái - Odometer hiện tại */}
              <div>
                <label style={labelStyle}>
                  Trạng thái <span style={{ color: 'red' }}>*</span>
                </label>
                <SelectboxBase
                  required
                  value={form.status}
                  options={statusOptions}
                  placeholder="Chọn trạng thái"
                  onChange={(val) => handleChange("status", val)}
                  style={{ width: "100%" }}
                />
                {errors.status && (
                  <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
                    {errors.status}
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>
                  Odometer hiện tại{" "}
                  <span
                    title="Số km trên đồng hồ"
                    style={{
                      color: "#999",
                      fontSize: 12,
                      marginLeft: 4,
                      cursor: "help",
                    }}
                  >
                    <i className="fa fa-info-circle" />
                  </span>
                </label>
                <InputBase
                  modelValue={form.odometer}
                  placeholder="Nhập số km trên đồng hồ"
                  onChange={(val) => handleChange("odometer", val)}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Hàng 5: Giá ngày - Giá giờ */}
              <div>
                <label style={labelStyle}>
                  Giá ngày <span style={{ color: 'red' }}>*</span>
                </label>
                <InputBase
                  required
                  modelValue={form.dailyPrice}
                  placeholder="Nhập giá thuê theo ngày"
                  onChange={(val) => handleChange("dailyPrice", val)}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Giá giờ
                </label>
                <InputBase
                  modelValue={form.hourlyPrice}
                  placeholder="Nhập giá thuê theo giờ"
                  onChange={(val) => handleChange("hourlyPrice", val)}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Hàng 6: Ghi chú */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>
                  Ghi chú
                </label>
                <TextAreaBase
                  modelValue={form.note}
                  placeholder="Nhập ghi chú về xe"
                  onChange={(val) => handleChange("note", val)}
                  rows={3}
                  style={{ width: "100%" }}
                />
              </div>
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
              {form.imagePreview || form.imageUrl ? (
                <div
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    width: 180,
                    height: 180,
                    marginBottom: 12,
                    boxShadow: "0 2px 8px #eee",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ImageBase
                    src={form.imagePreview || form.imageUrl}
                    width={180}
                    height={180}
                    alt="Ảnh xe"
                  />
                </div>
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
              {form.image &&
                typeof form.image === "object" &&
                "name" in form.image && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                    {(form.image as File).name}
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
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: 16, 
            marginBottom: 16 
          }}>
            <div>
              <label style={labelStyle}>
                Năm sản xuất
              </label>
              <InputBase
                modelValue={form.year}
                placeholder="Nhập năm sản xuất"
                onChange={(val) => handleChange("year", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Xuất xứ
              </label>
              <InputBase
                modelValue={form.origin}
                placeholder="Nhập xuất xứ"
                onChange={(val) => handleChange("origin", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Giá trị xe
              </label>
              <InputBase
                modelValue={form.value}
                placeholder="Nhập giá trị xe"
                onChange={(val) => handleChange("value", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Số khung
              </label>
              <InputBase
                modelValue={form.frameNo}
                placeholder="Nhập số khung"
                onChange={(val) => handleChange("frameNo", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Số máy
              </label>
              <InputBase
                modelValue={form.engineNo}
                placeholder="Nhập số máy"
                onChange={(val) => handleChange("engineNo", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Màu sắc
              </label>
              <SelectboxBase
                value={form.color}
                options={colorOptions}
                placeholder="Màu sắc"
                onChange={(val) => handleChange("color", val)}
                width="100%"
              />
            </div>
            <div>
              <label style={labelStyle}>
                Số giấy đăng ký xe
              </label>
              <InputBase
                modelValue={form.regNo}
                placeholder="Nhập số giấy đăng ký xe"
                onChange={(val) => handleChange("regNo", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Tên trên đăng ký
              </label>
              <InputBase
                modelValue={form.regName}
                placeholder="Nhập tên trên đăng ký"
                onChange={(val) => handleChange("regName", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Nơi đăng ký
              </label>
              <InputBase
                modelValue={form.regPlace}
                placeholder="Nhập nơi đăng ký"
                onChange={(val) => handleChange("regPlace", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Số hợp đồng bảo hiểm TNDS
              </label>
              <InputBase
                modelValue={form.insuranceNo}
                placeholder="Nhập số hợp đồng bảo hiểm TNDS"
                onChange={(val) => handleChange("insuranceNo", val)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Ngày hết hạn bảo hiểm TNDS
              </label>
              <DatePickerBase
                value={form.insuranceExpire}
                placeholder="Chọn ngày hết hạn"
                onChange={(val) => handleChange("insuranceExpire", val)}
              />
            </div>
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
