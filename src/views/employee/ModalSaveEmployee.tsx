import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import { Input, message } from "antd";
import { UserMngSaveDTO, UserMngListDTO } from "@/service/business/userMng/userMng.type";
import { getAllActiveBranches } from "@/service/business/branchMng/branchMng.service";
import { BranchDTO } from "@/service/business/branchMng/branchMng.type";
import dayjs from "dayjs";

const genderOptions = [
  { value: "", label: "Chọn giới tính" },
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const roleOptions = [
  { value: "", label: "Vai trò" },
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "STAFF", label: "Nhân viên" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Đang làm" },
  { value: "INACTIVE", label: "Nghỉ" },
];

interface Props {
  open: boolean;
  employee?: UserMngSaveDTO | UserMngListDTO | null;
  onClose: () => void;
  onSave: (employee: any) => void;
}

interface FormState {
  id?: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  birthday: string;
  gender: string;
  address: string;
  branch: string;
  role: string;
  status: string;
  password?: string;
}

const ModalSaveEmployee = ({ open, employee, onClose, onSave }: Props) => {
  const [form, setForm] = useState<FormState>({
    id: undefined,
    username: "",
    name: "",
    phone: "",
    email: "",
    birthday: "",
    gender: "",
    address: "",
    branch: "",
    role: "",
    status: "ACTIVE",
    password: "",
  });
  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Chi nhánh" },
  ]);

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await getAllActiveBranches();
        const branches = res.data || [];
        setBranchOptions([
          { value: "", label: "Chi nhánh" },
          ...branches.map((b: BranchDTO) => ({
            value: b.id,
            label: b.name,
          })),
        ]);
      } catch (err) {
        console.error("Failed to load branches:", err);
      }
    };
    if (open) {
      loadBranches();
    }
  }, [open]);

  useEffect(() => {
    if (employee) {
      const emp = employee as any;
      setForm({
        id: emp.id,
        username: emp.username || emp.userName || "",
        name: emp.fullName || emp.name || "",
        phone: emp.phoneNumber || emp.phone || "",
        email: emp.email || "",
        birthday: emp.dateOfBirth ? dayjs(emp.dateOfBirth).format("YYYY-MM-DD") : "",
        gender: emp.genderCd || emp.gender || "",
        address: emp.address || "",
        branch: emp.branchId || emp.branch || "",
        role: emp.roleCd || emp.role || "",
        status: emp.statusCd || "ACTIVE",
        password: "",
      });
    } else {
      setForm({
        id: undefined,
        username: "",
        name: "",
        phone: "",
        email: "",
        birthday: "",
        gender: "",
        address: "",
        branch: "",
        role: "",
        status: "ACTIVE",
        password: "",
      });
    }
    // eslint-disable-next-line
  }, [employee, open]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // Validation
    if (!form.username || !form.username.trim()) {
      message.error("Vui lòng nhập tên đăng nhập!");
      return;
    }
    if (!form.name || !form.name.trim()) {
      message.error("Vui lòng nhập họ và tên!");
      return;
    }
    if (!form.phone || !form.phone.trim()) {
      message.error("Vui lòng nhập số điện thoại!");
      return;
    }
    // Email is required when creating new user (backend requirement)
    if (!form.id && (!form.email || !form.email.trim())) {
      message.error("Vui lòng nhập email!");
      return;
    }
    if (form.email && form.email.trim()) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        message.error("Email không hợp lệ!");
        return;
      }
    }
    if (!form.id && (!form.password || !form.password.trim())) {
      message.error("Vui lòng nhập mật khẩu!");
      return;
    }
    if (!form.id && form.password && form.password.length < 6) {
      message.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    // Role is required when creating new user (backend requirement)
    if (!form.id && !form.role) {
      message.error("Vui lòng chọn vai trò!");
      return;
    }

    onSave({
      id: form.id,
      username: form.username.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || "",
      birthday: form.birthday || "",
      gender: form.gender || "",
      address: form.address || "",
      branch: form.branch || "",
      role: form.role || "",
      status: form.status || "ACTIVE",
      password: form.password || "",
    });
  };

  return (
    <TModal
      title={form.id ? "Cập nhật nhân viên" : "Thêm mới nhân viên"}
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
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              modelValue={form.username}
              onChange={(val) => handleChange("username", val)}
              required={true}
            />
          </div>
          <div style={{ flex: 1 }}>
            <InputBase
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              modelValue={form.name}
              onChange={(val) => handleChange("name", val)}
              required={true}
            />
          </div>
        </div>
        <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <InputBase
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              modelValue={form.phone}
              onChange={(val) => handleChange("phone", val)}
              required={true}
            />
          </div>
          <div style={{ flex: 1 }}>
            <InputBase
              label="Email"
              placeholder="Nhập email"
              modelValue={form.email}
              onChange={(val) => handleChange("email", val)}
              required={true}
            />
          </div>
        </div>
        {!form.id && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
              Mật khẩu <span style={{ color: "red" }}>*</span>
            </label>
            <Input.Password
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required={true}
              style={{ width: "100%" }}
            />
          </div>
        )}
        <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
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
        <div style={{ marginBottom: 16 }}>
          <SelectboxBase
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            value={form.status}
            options={statusOptions}
            onChange={(val) => handleChange("status", val)}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalSaveEmployee;
