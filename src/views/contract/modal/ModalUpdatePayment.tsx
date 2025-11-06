import React, { useState } from "react";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import InputBase from "@/component/common/input/InputBase";
import { DeleteOutlined } from "@ant-design/icons";

interface PaymentItem {
  method: string;
  amount: number | string;
  date: string;
  note: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payments: PaymentItem[]) => void;
  payments?: PaymentItem[];
}

const paymentMethodOptions = [
  { value: "bank", label: "Chuyển khoản NH" },
  { value: "cash", label: "Tiền mặt" },
];

const defaultPayments: PaymentItem[] = [
  {
    method: "",
    amount: "",
    date: "",
    note: "",
  },
];

const ModalUpdatePayment = ({
  open,
  onClose,
  onSave,
  payments = defaultPayments,
}: Props) => {
  const [list, setList] = useState<PaymentItem[]>(
    payments.length ? payments : defaultPayments
  );

  // Reset state when open
  React.useEffect(() => {
    setList(payments.length ? payments : defaultPayments);
    // eslint-disable-next-line
  }, [open]);

  const handleChange = (idx: number, key: keyof PaymentItem, value: any) => {
    setList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    );
  };

  const handleAdd = () => {
    setList((prev) => [
      ...prev,
      { method: "", amount: "", date: "", note: "" },
    ]);
  };

  const handleRemove = (idx: number) => {
    setList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave(list);
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Cập nhật thanh toán"
      width={1000}
      footer={
        <div
          className="dp_flex"
          style={{
            justifyContent: "flex-end",
            gap: 8,
            borderTop: "1px solid #eee",
            paddingTop: 16,
            marginTop: 8,
          }}
        >
          <ButtonBase
            label="Hủy bỏ"
            className="btn_lightgray"
            onClick={onClose}
          />
          <ButtonBase
            label="Lưu"
            className="btn_primary"
            onClick={handleSave}
          />
        </div>
      }
    >
      <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 12 }}>
        Danh sách thanh toán
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {list.map((item, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 18,
              marginBottom: 0,
              background: "#fafbfc",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1fr 40px",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  Phương thức
                </div>
                <SelectboxBase
                  value={item.method}
                  options={[
                    { value: "", label: "Chọn phương thức" },
                    ...paymentMethodOptions,
                  ]}
                  onChange={(val) =>
                    handleChange(
                      idx,
                      "method",
                      typeof val === "string" ? val : val[0] || ""
                    )
                  }
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Số tiền</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <InputBase
                    modelValue={item.amount}
                    placeholder="0"
                    onChange={(val) => handleChange(idx, "amount", val)}
                    style={{ width: "100%" }}
                  />
                  <span style={{ marginLeft: 8, color: "#888" }}>VND</span>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  Ngày thanh toán
                </div>
                <DatePickerBase
                  value={item.date}
                  placeholder="Chọn ngày"
                  showTime
                  onChange={(val) => handleChange(idx, "date", val)}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Ghi chú</div>
                <InputBase
                  modelValue={item.note}
                  placeholder="Ghi chú"
                  onChange={(val) => handleChange(idx, "note", val)}
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ textAlign: "center", marginTop: 22 }}>
                <ButtonBase
                  icon={<DeleteOutlined />}
                  className="btn_gray"
                  style={{
                    borderRadius: 8,
                    minWidth: 36,
                    height: 36,
                    padding: 0,
                  }}
                  onClick={() => handleRemove(idx)}
                  title="Xóa"
                  disabled={list.length === 1}
                />
              </div>
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 0 }}>
          <ButtonBase
            label="+ Thêm thanh toán"
            className="btn_lightgray"
            style={{
              borderRadius: 8,
              fontWeight: 500,
              minWidth: 180,
              height: 40,
              fontSize: 15,
              border: "1px dashed #bbb",
              background: "#fafbfc",
            }}
            onClick={handleAdd}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalUpdatePayment;
