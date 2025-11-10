import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import InputBase from "@/component/common/input/InputBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import TextAreaBase from "@/component/common/input/TextAreaBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";

interface Props {
  open: boolean;
  branch?: any;
  onClose: () => void;
  onSave: (branch: any) => void;
}

const statusOptions = [
  { value: 1, label: "Hoạt động" },
  { value: 0, label: "Ngừng" },
];

const ModalSaveBranch = ({ open, branch, onClose, onSave }: Props) => {
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    phone: "",
    address: "",
    note: "",
    status: true,
  });

  useEffect(() => {
    if (branch) {
      setForm({
        id: branch.id,
        name: branch.name || "",
        phone: branch.phone || branch.phoneNumber || "",
        address: branch.address || "",
        note: branch.note || "",
        status:
          branch.status === 1 ||
          branch.status === true ||
          branch.status === "active",
      });
    } else {
      setForm({
        id: undefined,
        name: "",
        phone: "",
        address: "",
        note: "",
        status: true,
      });
    }
  }, [branch, open]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      phoneNumber: form.phone,
      status: form.status ? 1 : 0,
    });
  };

  const isUpdate = !!form.id;
  return (
    <TModal
      title={isUpdate ? "Cập nhật chi nhánh" : "Thêm chi nhánh"}
      visible={open}
      onCancel={onClose}
      footer={
        <>
          <div
            className="dp_flex"
            style={{ justifyContent: "flex-end", gap: 12 }}
          >
            <ButtonBase
              label="Hủy"
              className="btn_lightgray"
              onClick={onClose}
            />
            <ButtonBase
              label={isUpdate ? "Cập nhật" : "Thêm mới"}
              className="btn_yellow"
              onClick={handleSubmit}
            />
          </div>
        </>
      }
      width={600}
      centered={true}
    >
      <div className="box_section" style={{ padding: 0 }}>
        <div className="dp_flex" style={{ gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              Tên chi nhánh <span style={{ color: "red" }}>*</span>
            </label>
            <InputBase
              modelValue={form.name}
              placeholder="Nhập tên chi nhánh"
              onChange={(val) => handleChange("name", val)}
              required={true}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 500 }}
            >
              Số điện thoại <span style={{ color: "red" }}>*</span>
            </label>
            <InputBase
              modelValue={form.phone}
              placeholder="Nhập số điện thoại"
              onChange={(val) => handleChange("phone", val)}
              required={true}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
            Địa chỉ <span style={{ color: "red" }}>*</span>
          </label>
          <InputBase
            modelValue={form.address}
            placeholder="Nhập địa chỉ"
            onChange={(val) => handleChange("address", val)}
            required={true}
          />
        </div>
        <div
          className="dp_flex"
          style={{ alignItems: "center", marginBottom: 24 }}
        >
          <label style={{ minWidth: 90, marginBottom: 0, fontWeight: 500 }}>
            Trạng thái
          </label>
          <SelectboxBase
            value={form.status ? 1 : 0}
            options={statusOptions}
            style={{ minWidth: 140 }}
            onChange={(val) => {
              let v = val;
              if (Array.isArray(val)) v = val[0];
              handleChange("status", Number(v) === 1);
            }}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalSaveBranch;
