import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import AvatarBase from "@/component/common/image/AvatarBase";
import ImageBase from "@/component/common/image/ImageBase";
import {
  uploadCitizenIdImage,
  uploadDriverLicenseImage,
  uploadPassportImage,
} from "@/service/business/customerMng/customerMng.service";
import { CustomerDTO } from "@/service/business/customerMng/customerMng.type";
import dayjs from "dayjs";

const genderOptions = [
  { value: "", label: "Chọn giới tính" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const countryOptions = [
  { value: "", label: "Chọn quốc gia" },
  { value: "Việt Nam", label: "Việt Nam" },
  { value: "USA", label: "USA" },
  { value: "Japan", label: "Japan" },
];

interface Props {
  open: boolean;
  customer?: CustomerDTO | null;
  onClose: () => void;
  onSave: (customer: any) => void;
}

interface FormState {
  id?: string;
  name: string;
  phone: string;
  email: string;
  birthday: string;
  gender: string;
  country: string;
  address: string;
  cccd: string;
  cccdImg: string;
  license: string;
  licenseImg: string;
  passport: string;
  passportImg: string;
  note: string;
  avatar: string;
  [key: string]: any;
}

const DEFAULT_IMG = "/img-default-doc.png"; // Đảm bảo có file này trong public

const ModalSaveInfoCustomer = ({ open, customer, onClose, onSave }: Props) => {
  const [form, setForm] = useState<FormState>({
    id: undefined,
    name: "",
    phone: "",
    email: "",
    birthday: "",
    gender: "",
    country: "",
    address: "",
    cccd: "",
    cccdImg: DEFAULT_IMG,
    license: "",
    licenseImg: DEFAULT_IMG,
    passport: "",
    passportImg: DEFAULT_IMG,
    note: "",
    avatar: "",
  });

  useEffect(() => {
    if (customer) {
      setForm({
        id: customer.id,
        name: customer.fullName || "",
        phone: customer.phoneNumber || "",
        email: customer.email || "",
        birthday: customer.dateOfBirth
          ? dayjs(customer.dateOfBirth).format("YYYY-MM-DD")
          : "",
        gender: customer.gender || "",
        country: customer.country || "",
        address: customer.address || "",
        cccd: customer.citizenId || "",
        cccdImg: customer.citizenIdImageUrl || DEFAULT_IMG,
        license: customer.driverLicense || "",
        licenseImg: customer.driverLicenseImageUrl || DEFAULT_IMG,
        passport: customer.passport || "",
        passportImg: customer.passportImageUrl || DEFAULT_IMG,
        note: customer.note || "",
        avatar: "",
      });
    } else {
      setForm({
        id: undefined,
        name: "",
        phone: "",
        email: "",
        birthday: "",
        gender: "",
        country: "",
        address: "",
        cccd: "",
        cccdImg: DEFAULT_IMG,
        license: "",
        licenseImg: DEFAULT_IMG,
        passport: "",
        passportImg: DEFAULT_IMG,
        note: "",
        avatar: "",
      });
    }
    // eslint-disable-next-line
  }, [customer, open]);

  // Upload handlers
  const handleUpload =
    (key: string, uploadFn: (customerId: string, file: File) => Promise<any>) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setForm((prev) => ({
          ...prev,
          [key]: previewUrl,
        }));

        // If customer exists, upload immediately
        if (form.id) {
          try {
            const res = await uploadFn(form.id, file);
            const imageUrl = res.data;
            setForm((prev) => ({
              ...prev,
              [key]: imageUrl,
            }));
          } catch (err) {
            console.error("Upload failed:", err);
            // Revert to previous image on error
            setForm((prev) => ({
              ...prev,
              [key]: prev[key],
            }));
          }
        }
      }
    };

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <TModal
      title="Thông tin khách hàng"
      visible={open}
      onCancel={onClose}
      width={900}
      footer={
        <div
          className="dp_flex"
          style={{ justifyContent: "flex-end", gap: 16, padding: "16px 0 0 0" }}
        >
          <ButtonBase label="Hủy" className="btn_lightgray" onClick={onClose} />
          <ButtonBase
            label="Lưu thay đổi"
            className="btn_yellow"
            onClick={handleSubmit}
          />
        </div>
      }
      centered={true}
    >
      <style>
        {`
        .custom-upload-label {
          display: inline-block;
          padding: 7px 18px;
          background: #fffbe6;
          color: #b8860b;
          border: 1.5px solid #ffe58f;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 8px;
          transition: background 0.2s, border 0.2s;
        }
        .custom-upload-label:hover {
          background: #fff3bf;
          border-color: #ffd666;
        }
        .custom-upload-input {
          display: none;
        }
        `}
      </style>
      <div className="box_section" style={{ padding: 0 }}>
        {/* Thông tin cá nhân */}
        <div
          className="box_section"
          style={{
            marginBottom: 0,
            background: "#fafbfc",
            padding: "24px 24px 16px 24px",
            borderRadius: 12,
          }}
        >
          <p
            className="box_title_sm"
            style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}
          >
            Thông tin cá nhân
          </p>
          <div className="dp_flex" style={{ gap: 32, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
              >
                Họ tên <span style={{ color: "red" }}>*</span>
              </label>
              <InputBase
                placeholder="Nhập họ tên"
                modelValue={form.name}
                onChange={(val) => handleChange("name", val)}
                required={true}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
              >
                Số điện thoại <span style={{ color: "red" }}>*</span>
              </label>
              <InputBase
                placeholder="Nhập số điện thoại"
                modelValue={form.phone}
                onChange={(val) => handleChange("phone", val)}
                required={true}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 32, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
              >
                Email
              </label>
              <InputBase
                placeholder="Nhập email"
                modelValue={form.email}
                onChange={(val) => handleChange("email", val)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
              >
                Ngày sinh
              </label>
              <DatePickerBase
                placeholder="dd/mm/yyyy"
                value={form.birthday}
                dateOnly={true}
                onChange={(val) =>
                  handleChange(
                    "birthday",
                    val ? dayjs(val).format("YYYY-MM-DD") : ""
                  )
                }
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 32, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
              >
                Giới tính
              </label>
              <SelectboxBase
                placeholder="Chọn giới tính"
                value={form.gender}
                options={genderOptions}
                onChange={(val) => handleChange("gender", val)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
              >
                Quốc gia
              </label>
              <SelectboxBase
                placeholder="Chọn quốc gia"
                value={form.country}
                options={countryOptions}
                onChange={(val) => handleChange("country", val)}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 0 }}>
            <label
              style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
            >
              Địa chỉ
            </label>
            <InputBase
              placeholder="Nhập địa chỉ"
              modelValue={form.address}
              onChange={(val) => handleChange("address", val)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        {/* Giấy tờ tùy thân */}
        <div
          className="box_section"
          style={{
            marginBottom: 0,
            background: "#fafbfc",
            padding: "24px 24px 16px 24px",
            borderRadius: 12,
            marginTop: 18,
          }}
        >
          <p
            className="box_title_sm"
            style={{
              marginBottom: 20,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Giấy tờ tùy thân
          </p>
          <div
            style={{
              display: "flex",
              gap: 32,
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 0,
            }}
          >
            {/* CCCD/CMND */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <label
                style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}
              >
                CCCD/CMND
              </label>
              <InputBase
                placeholder="Nhập số CCCD/CMND"
                modelValue={form.cccd}
                onChange={(val) => handleChange("cccd", val)}
                style={{ width: "100%", marginBottom: 10, maxWidth: 180 }}
              />
              <label
                style={{
                  fontWeight: 500,
                  marginBottom: 6,
                  alignSelf: "flex-start",
                }}
              >
                Upload CCCD
              </label>
              <label className="custom-upload-label">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="custom-upload-input"
                  onChange={handleUpload("cccdImg", uploadCitizenIdImage)}
                />
              </label>
              <div
                style={{
                  width: 110,
                  height: 82,
                  background: "#fff",
                  border: "1.5px dashed #bbb",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 1px 4px #0001",
                  margin: "0 auto",
                  transition: "border-color 0.2s",
                  position: "relative",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#ffb300")
                }
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "#bbb")}
              >
                <img
                  src={
                    form.cccdImg && form.cccdImg !== DEFAULT_IMG
                      ? form.cccdImg
                      : DEFAULT_IMG
                  }
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit:
                      form.cccdImg && form.cccdImg !== DEFAULT_IMG
                        ? "cover"
                        : "contain",
                    background: "#fafbfc",
                    borderRadius: 8,
                    border: "none",
                    transition: "box-shadow 0.2s",
                    display: "block",
                  }}
                  onError={(e) => {
                    if (
                      e.currentTarget.src !==
                      window.location.origin + DEFAULT_IMG
                    ) {
                      e.currentTarget.src = DEFAULT_IMG;
                    }
                  }}
                  draggable={false}
                />
              </div>
            </div>
            {/* Bằng lái xe */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <label
                style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}
              >
                Bằng lái xe
              </label>
              <InputBase
                placeholder="Nhập số bằng lái xe"
                modelValue={form.license}
                onChange={(val) => handleChange("license", val)}
                style={{ width: "100%", marginBottom: 10, maxWidth: 180 }}
              />
              <label
                style={{
                  fontWeight: 500,
                  marginBottom: 6,
                  alignSelf: "flex-start",
                }}
              >
                Upload Bằng lái xe
              </label>
              <label className="custom-upload-label">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="custom-upload-input"
                  onChange={handleUpload(
                    "licenseImg",
                    uploadDriverLicenseImage
                  )}
                />
              </label>
              <div
                style={{
                  width: 110,
                  height: 82,
                  background: "#fff",
                  border: "1.5px dashed #bbb",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 1px 4px #0001",
                  margin: "0 auto",
                  transition: "border-color 0.2s",
                  position: "relative",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#ffb300")
                }
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "#bbb")}
              >
                <img
                  src={
                    form.licenseImg && form.licenseImg !== DEFAULT_IMG
                      ? form.licenseImg
                      : DEFAULT_IMG
                  }
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit:
                      form.licenseImg && form.licenseImg !== DEFAULT_IMG
                        ? "cover"
                        : "contain",
                    background: "#fafbfc",
                    borderRadius: 8,
                    border: "none",
                    transition: "box-shadow 0.2s",
                    display: "block",
                  }}
                  onError={(e) => {
                    if (
                      e.currentTarget.src !==
                      window.location.origin + DEFAULT_IMG
                    ) {
                      e.currentTarget.src = DEFAULT_IMG;
                    }
                  }}
                  draggable={false}
                />
              </div>
            </div>
            {/* Hộ chiếu */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <label
                style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}
              >
                Hộ chiếu
              </label>
              <InputBase
                placeholder="Nhập số hộ chiếu"
                modelValue={form.passport}
                onChange={(val) => handleChange("passport", val)}
                style={{ width: "100%", marginBottom: 10, maxWidth: 180 }}
              />
              <label
                style={{
                  fontWeight: 500,
                  marginBottom: 6,
                  alignSelf: "flex-start",
                }}
              >
                Upload Hộ chiếu
              </label>
              <label className="custom-upload-label">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="custom-upload-input"
                  onChange={handleUpload("passportImg", uploadPassportImage)}
                />
              </label>
              <div
                style={{
                  width: 110,
                  height: 82,
                  background: "#fff",
                  border: "1.5px dashed #bbb",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 1px 4px #0001",
                  margin: "0 auto",
                  transition: "border-color 0.2s",
                  position: "relative",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#ffb300")
                }
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "#bbb")}
              >
                <img
                  src={
                    form.passportImg && form.passportImg !== DEFAULT_IMG
                      ? form.passportImg
                      : DEFAULT_IMG
                  }
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit:
                      form.passportImg && form.passportImg !== DEFAULT_IMG
                        ? "cover"
                        : "contain",
                    background: "#fafbfc",
                    borderRadius: 8,
                    border: "none",
                    transition: "box-shadow 0.2s",
                    display: "block",
                  }}
                  onError={(e) => {
                    if (
                      e.currentTarget.src !==
                      window.location.origin + DEFAULT_IMG
                    ) {
                      e.currentTarget.src = DEFAULT_IMG;
                    }
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Ghi chú */}
        <div
          className="box_section"
          style={{
            marginBottom: 0,
            background: "#fafbfc",
            padding: "24px 24px 16px 24px",
            borderRadius: 12,
            marginTop: 18,
          }}
        >
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Ghi chú
          </label>
          <TextAreaBase
            id="customer-note"
            placeholder="Nhập ghi chú về khách hàng..."
            defaultValue={form.note}
            onChange={(val) => handleChange("note", val)}
            rows={3}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalSaveInfoCustomer;
