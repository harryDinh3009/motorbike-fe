import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import ButtonBase from "@/component/common/button/ButtonBase";
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
  cccdFrontImg: string;
  cccdBackImg: string;
  license: string;
  licenseImg: string;
  passport: string;
  passportImg: string;
  note: string;
  avatar: string;
  [key: string]: any;
}

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
    cccdImg: "",
    cccdFrontImg: "",
    cccdBackImg: "",
    license: "",
    licenseImg: "",
    passport: "",
    passportImg: "",
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
        cccdFrontImg: customer.citizenIdFrontImageUrl || "",
        cccdBackImg: customer.citizenIdBackImageUrl || "",
        license: customer.driverLicense || "",
        licenseImg: customer.driverLicenseImageUrl || "",
        passport: customer.passport || "",
        passportImg: customer.passportImageUrl || "",
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
        cccdFrontImg: "",
        cccdBackImg: "",
        license: "",
        licenseImg: "",
        passport: "",
        passportImg: "",
        note: "",
        avatar: "",
      });
    }
    // eslint-disable-next-line
  }, [customer, open]);

  // Upload handlers
  const handleUpload =
    (
      key: string,
      uploadFn: (customerId: string, file: File, side?: string) => Promise<any>,
      side?: string
    ) =>
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
            // Truyền side cho CCCD (front/back), các loại khác không cần
            const res = await uploadFn(form.id, file, side);
            const imageUrl = res.data;
            setForm((prev) => ({
              ...prev,
              [key]: imageUrl,
            }));
          } catch (err) {
            console.error("Upload failed:", err);
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

  // SVG icon cho ảnh rỗng
  const EmptyImageIcon = (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#f5f5f5" />
      <path
        d="M14 34l8-10 6 8 4-6 6 8"
        stroke="#bbb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="20" r="2" fill="#bbb" />
    </svg>
  );

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
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: 32,
              marginBottom: 0,
            }}
          >
            {/* CCCD/CMND mặt trước */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <label
                style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}
              >
                CCCD/CMND (Mặt trước)
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
                Upload mặt trước
              </label>
              <label className="custom-upload-label">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="custom-upload-input"
                  onChange={handleUpload(
                    "cccdFrontImg",
                    async (customerId, file) => {
                      // Gọi API uploadCitizenIdImage với tham số side = "front"
                      return uploadCitizenIdImage(customerId, file, "front");
                    },
                    "front"
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
                {form.cccdFrontImg ? (
                  <img
                    src={form.cccdFrontImg}
                    alt="Ảnh CCCD mặt trước"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      background: "#fafbfc",
                      borderRadius: 8,
                      border: "none",
                      transition: "box-shadow 0.2s",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent)
                        parent.innerHTML = EmptyImageIcon.props.children;
                    }}
                    draggable={false}
                  />
                ) : (
                  EmptyImageIcon
                )}
              </div>
            </div>
            {/* CCCD/CMND mặt sau */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <label
                style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}
              >
                CCCD/CMND (Mặt sau)
              </label>
              <div style={{ height: 38, marginBottom: 10 }} />
              <label
                style={{
                  fontWeight: 500,
                  marginBottom: 6,
                  alignSelf: "flex-start",
                }}
              >
                Upload mặt sau
              </label>
              <label className="custom-upload-label">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="custom-upload-input"
                  onChange={handleUpload(
                    "cccdBackImg",
                    async (customerId, file) => {
                      // Gọi API uploadCitizenIdImage với tham số side = "back"
                      return uploadCitizenIdImage(customerId, file, "back");
                    },
                    "back"
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
                {form.cccdBackImg ? (
                  <img
                    src={form.cccdBackImg}
                    alt="Ảnh CCCD mặt sau"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      background: "#fafbfc",
                      borderRadius: 8,
                      border: "none",
                      transition: "box-shadow 0.2s",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent)
                        parent.innerHTML = EmptyImageIcon.props.children;
                    }}
                    draggable={false}
                  />
                ) : (
                  EmptyImageIcon
                )}
              </div>
            </div>
            {/* Bằng lái xe */}
            <div
              style={{
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
                {form.licenseImg ? (
                  <img
                    src={form.licenseImg}
                    alt="Ảnh bằng lái xe"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      background: "#fafbfc",
                      borderRadius: 8,
                      border: "none",
                      transition: "box-shadow 0.2s",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent)
                        parent.innerHTML = EmptyImageIcon.props.children;
                    }}
                    draggable={false}
                  />
                ) : (
                  EmptyImageIcon
                )}
              </div>
            </div>
            {/* Hộ chiếu */}
            <div
              style={{
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
                {form.passportImg ? (
                  <img
                    src={form.passportImg}
                    alt="Ảnh hộ chiếu"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      background: "#fafbfc",
                      borderRadius: 8,
                      border: "none",
                      transition: "box-shadow 0.2s",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent)
                        parent.innerHTML = EmptyImageIcon.props.children;
                    }}
                    draggable={false}
                  />
                ) : (
                  EmptyImageIcon
                )}
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
