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
  { value: true, label: "Hoạt động" },
  { value: false, label: "Ngừng" },
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
        phone: branch.phone || "",
        address: branch.address || "",
        note: branch.note || "",
        status: branch.status !== "inactive",
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
      status: form.status ? "active" : "inactive",
    });
  };

  return (
    <TModal
      title="Cập nhật chi nhánh"
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
              label="Lưu"
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
            <InputBase
              label="Tên chi nhánh"
              modelValue={form.name}
              onChange={(val) => handleChange("name", val)}
              required={true}
            />
          </div>
          <div style={{ flex: 1 }}>
            <InputBase
              label="Số điện thoại"
              modelValue={form.phone}
              onChange={(val) => handleChange("phone", val)}
              required={true}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <InputBase
            label="Địa chỉ"
            modelValue={form.address}
            onChange={(val) => handleChange("address", val)}
            required={true}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <TextAreaBase
            id="branch-note"
            label="Ghi chú"
            placeholder="Nhập ghi chú..."
            defaultValue={form.note}
            onChange={(val) => handleChange("note", val)}
            rows={2}
          />
        </div>
        <div
          className="dp_flex"
          style={{ alignItems: "center", marginBottom: 24 }}
        >
          <span style={{ minWidth: 90 }}>Trạng thái</span>
          <SelectboxBase
            value={form.status}
            options={statusOptions}
            style={{ minWidth: 140 }}
            onChange={(val) =>
              handleChange("status", val === "true" || val === true)
            }
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalSaveBranch;
