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
        birthday: customer.dateOfBirth ? dayjs(customer.dateOfBirth).format("YYYY-MM-DD") : "",
        gender: customer.gender || "",
        country: customer.country || "",
        address: customer.address || "",
        cccd: customer.citizenId || "",
        cccdImg: customer.citizenIdImageUrl || "",
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
        cccdImg: "",
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
  const handleUpload = (key: string, uploadFn: (customerId: string, file: File) => Promise<any>) => 
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
        <div className="dp_flex" style={{ justifyContent: "flex-end", gap: 12 }}>
          <ButtonBase label="Hủy" className="btn_lightgray" onClick={onClose} />
          <ButtonBase label="Lưu thay đổi" className="btn_yellow" onClick={handleSubmit} />
        </div>
      }
      centered={true}
    >
      <div className="box_section" style={{ padding: 0 }}>
        {/* Thông tin cá nhân */}
        <div className="box_section" style={{ marginBottom: 0, background: "#fafbfc" }}>
          <p className="box_title_sm" style={{ marginBottom: 12 }}>Thông tin cá nhân</p>
          <div className="dp_flex" style={{ gap: 24, marginBottom: 0 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Họ tên *"
                placeholder="Nhập họ tên"
                modelValue={form.name}
                onChange={(val) => handleChange("name", val)}
                required={true}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                modelValue={form.phone}
                onChange={(val) => handleChange("phone", val)}
                required={true}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 24, marginBottom: 0 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Email"
                placeholder="Nhập email"
                modelValue={form.email}
                onChange={(val) => handleChange("email", val)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                Ngày sinh
              </label>
              <DatePickerBase
                placeholder="dd/mm/yyyy"
                value={form.birthday}
                onChange={(val) => handleChange("birthday", val || "")}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 24, marginBottom: 0 }}>
            <div style={{ flex: 1 }}>
              <SelectboxBase
                label="Giới tính"
                placeholder="Chọn giới tính"
                value={form.gender}
                options={genderOptions}
                onChange={(val) => handleChange("gender", val)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <SelectboxBase
                label="Quốc gia"
                placeholder="Chọn quốc gia"
                value={form.country}
                options={countryOptions}
                onChange={(val) => handleChange("country", val)}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div>
            <InputBase
              label="Địa chỉ"
              placeholder="Nhập địa chỉ"
              modelValue={form.address}
              onChange={(val) => handleChange("address", val)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        {/* Giấy tờ tùy thân */}
        <div className="box_section" style={{ marginBottom: 0, background: "#fafbfc" }}>
          <p className="box_title_sm" style={{ marginBottom: 12 }}>Giấy tờ tùy thân</p>
          <div className="dp_flex" style={{ gap: 24, marginBottom: 0 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="CCCD/CMND"
                placeholder="Nhập số CCCD/CMND"
                modelValue={form.cccd}
                onChange={(val) => handleChange("cccd", val)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                Upload CCCD
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload("cccdImg", uploadCitizenIdImage)}
                style={{
                  display: "block",
                  marginBottom: 8,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 6,
                  width: "100%",
                  background: "#fff"
                }}
              />
              <div
                style={{
                  marginTop: 0,
                  width: 140,
                  height: 110,
                  background: "#f4f4f4",
                  border: "1px dashed #bbb",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}
              >
                <div style={{
                  background: "#eee",
                  borderRadius: 8,
                  overflow: "hidden",
                  maxWidth: "100%",
                  maxHeight: "100%"
                }}>
                  <ImageBase
                    src={form.cccdImg || "/img-placeholder.svg"}
                    width={120}
                    height={90}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 24, marginBottom: 0 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Bằng lái xe"
                placeholder="Nhập số bằng lái xe"
                modelValue={form.license}
                onChange={(val) => handleChange("license", val)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                Upload Bằng lái xe
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload("licenseImg", uploadDriverLicenseImage)}
                style={{
                  display: "block",
                  marginBottom: 8,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 6,
                  width: "100%",
                  background: "#fff"
                }}
              />
              <div
                style={{
                  marginTop: 0,
                  width: 140,
                  height: 110,
                  background: "#f4f4f4",
                  border: "1px dashed #bbb",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}
              >
                <div style={{
                  background: "#eee",
                  borderRadius: 8,
                  overflow: "hidden",
                  maxWidth: "100%",
                  maxHeight: "100%"
                }}>
                  <ImageBase
                    src={form.licenseImg || "/img-placeholder.svg"}
                    width={120}
                    height={90}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="dp_flex" style={{ gap: 24 }}>
            <div style={{ flex: 1 }}>
              <InputBase
                label="Hộ chiếu"
                placeholder="Nhập số hộ chiếu"
                modelValue={form.passport}
                onChange={(val) => handleChange("passport", val)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                Upload Hộ chiếu
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload("passportImg", uploadPassportImage)}
                style={{
                  display: "block",
                  marginBottom: 8,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 6,
                  width: "100%",
                  background: "#fff"
                }}
              />
              <div
                style={{
                  marginTop: 0,
                  width: 140,
                  height: 110,
                  background: "#f4f4f4",
                  border: "1px dashed #bbb",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}
              >
                <div style={{
                  background: "#eee",
                  borderRadius: 8,
                  overflow: "hidden",
                  maxWidth: "100%",
                  maxHeight: "100%"
                }}>
                  <ImageBase
                    src={form.passportImg || "/img-placeholder.svg"}
                    width={120}
                    height={90}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Ghi chú */}
        <div className="box_section" style={{ marginBottom: 0, background: "#fafbfc" }}>
          <TextAreaBase
            id="customer-note"
            label="Ghi chú"
            placeholder="Nhập ghi chú về khách hàng..."
            defaultValue={form.note}
            onChange={(val) => handleChange("note", val)}
            rows={3}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalSaveInfoCustomer;
