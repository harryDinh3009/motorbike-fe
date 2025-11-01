import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import ButtonBase from "@/component/common/button/ButtonBase";

const genderOptions = [
  { value: "", label: "Chọn giới tính" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const branchOptions = [
  { value: "", label: "Chi nhánh" },
  { value: "center", label: "Chi nhánh trung tâm" },
  { value: "dongda", label: "Chi nhánh Đống Đa" },
];

const roleOptions = [
  { value: "", label: "Vai trò" },
  { value: "manager", label: "Quản lý" },
  { value: "staff", label: "Nhân viên" },
];

const statusOptions = [
  { value: true, label: "Đang làm" },
  { value: false, label: "Nghỉ" },
];

interface Props {
  open: boolean;
  employee?: any;
  onClose: () => void;
  onSave: (employee: any) => void;
}

const ModalSaveEmployee = ({ open, employee, onClose, onSave }: Props) => {
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    phone: "",
    email: "",
    birthday: "",
    gender: "",
    address: "",
    branch: "",
    role: "",
    status: true,
  });

  useEffect(() => {
    if (employee) {
      setForm({
        id: employee.id,
        name: employee.name || "",
        phone: employee.phone || "",
        email: employee.email || "",
        birthday: employee.birthday || "",
        gender: employee.gender || "",
        address: employee.address || "",
        branch: branchOptions.find(b => b.label === employee.branch)?.value || "",
        role: roleOptions.find(r => r.label === employee.role)?.value || "",
        status: employee.status !== "inactive",
      });
    } else {
      setForm({
        id: undefined,
        name: "",
        phone: "",
        email: "",
        birthday: "",
        gender: "",
        address: "",
        branch: "",
        role: "",
        status: true,
      });
    }
  }, [employee, open]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      branch: branchOptions.find(b => b.value === form.branch)?.label || "",
      role: roleOptions.find(r => r.value === form.role)?.label || "",
      status: form.status ? "active" : "inactive",
    });
  };

  return (
    <TModal
      title="Cập nhật nhân viên"
      visible={open}
      onCancel={onClose}
      width={600}
      centered={true}
      footer={
        <div className="dp_flex" style={{ justifyContent: "flex-end", gap: 12 }}>
          <ButtonBase label="Hủy" className="btn_lightgray" onClick={onClose} />
          <ButtonBase label="Lưu" className="btn_yellow" onClick={handleSubmit} />
        </div>
      }
    >
      <div className="box_section" style={{ padding: 0 }}>
        <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <InputBase
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              modelValue={form.name}
              onChange={(val) => handleChange("name", val)}
              required={true}
            />
          </div>
          <div style={{ flex: 1 }}>
            <InputBase
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              modelValue={form.phone}
              onChange={(val) => handleChange("phone", val)}
              required={true}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <InputBase
            label="Email"
            placeholder="Nhập email"
            modelValue={form.email}
            onChange={(val) => handleChange("email", val)}
            required={true}
          />
        </div>
        <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <DatePickerBase
              label="Ngày sinh"
              placeholder="dd/mm/yyyy"
              value={form.birthday}
              onChange={(val) => handleChange("birthday", val)}
              style={{ width: "100%" }}
            />
          </div>
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
        </div>
        <div style={{ marginBottom: 16 }}>
          <InputBase
            label="Địa chỉ"
            placeholder="Nhập địa chỉ"
            modelValue={form.address}
            onChange={(val) => handleChange("address", val)}
          />
        </div>
        <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <SelectboxBase
              label="Chi nhánh"
              placeholder="Chọn chi nhánh"
              value={form.branch}
              options={branchOptions}
              onChange={(val) => handleChange("branch", val)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <SelectboxBase
              label="Vai trò"
              placeholder="Chọn vai trò"
              value={form.role}
              options={roleOptions}
              onChange={(val) => handleChange("role", val)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="dp_flex" style={{ alignItems: "center", marginBottom: 24 }}>
          <span style={{ minWidth: 90 }}>Trạng thái</span>
          <SelectboxBase
            value={form.status}
            options={statusOptions}
            style={{ minWidth: 140 }}
            onChange={(val) => handleChange("status", val === "true" || val === true)}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalSaveEmployee;
