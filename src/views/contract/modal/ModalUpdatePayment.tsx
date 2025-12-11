import React, { useState } from "react";
import { Modal, message } from "antd";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import InputBase from "@/component/common/input/InputBase";
import { DeleteOutlined } from "@ant-design/icons";
import {
  addPayment,
  deletePayment,
} from "@/service/business/contractMng/contractMng.service";
import { getUserInfo } from "@/utils/storage";

interface PaymentItem {
  id?: string; // thêm id để nhận biết payment đã có
  contractId?: string; // thêm contractId để truyền contractId nếu có
  method: string;
  amount: number | string;
  date: string;
  note: string;
  status?: string; // status của payment (SUCCESS, CANCELLED)
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payments: PaymentItem[]) => void;
  payments?: PaymentItem[];
  contractId?: string; // thêm prop contractId
  onReload?: () => void; // callback để reload lại data sau khi xóa payment
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
  contractId,
  onReload,
}: Props) => {
  const [list, setList] = useState<PaymentItem[]>(
    payments.length ? payments : defaultPayments
  );
  const [loading, setLoading] = useState(false);

  // Reset state when open
  React.useEffect(() => {
    // Chỉ hiển thị payment có status = 'SUCCESS' hoặc chưa có status (payment mới)
    const filteredPayments = payments.filter((p) => p.status === 'SUCCESS' || !p.status);
    setList(filteredPayments.length ? filteredPayments : defaultPayments);
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

  // Xóa payment: nếu có id thì gọi API xóa, nếu chưa có thì chỉ xóa local
  const handleRemove = async (idx: number) => {
    const item = list[idx];
    if (item.id) {
      // Hiển thị popup xác nhận cho payment đã lưu
      Modal.confirm({
        title: "Xác nhận xóa",
        content: "Bạn có chắc chắn muốn xóa giao dịch thanh toán này?",
        okText: "Xác nhận",
        cancelText: "Hủy",
        centered: true,
        onOk: async () => {
          setLoading(true);
          try {
            const res = await deletePayment(item.id!);
            if (res?.status === "SUCCESS" || res?.data === true) {
              setList((prev) => prev.filter((_, i) => i !== idx));
              message.success("Xóa giao dịch thanh toán thành công");
              // Gọi callback để reload lại trang detail
              if (onReload) {
                onReload();
              }
              // Đóng popup sau khi xóa thành công
              onClose();
            } else {
              message.error("Xóa giao dịch thanh toán thất bại");
            }
          } catch (error) {
            message.error("Xóa giao dịch thanh toán thất bại");
          } finally {
            setLoading(false);
          }
        },
      });
    } else {
      // Payment chưa lưu thì xóa trực tiếp
      setList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  // Lưu: gửi các payment chưa có id (add mới), các payment có id thì gọi API cập nhật
  const handleSave = async () => {
    setLoading(true);
    try {
      let cid =
        contractId ||
        list[0]?.contractId ||
        payments.find((p) => p.contractId)?.contractId ||
        payments[0]?.contractId ||
        "";
      if (!cid) {
        alert("Không xác định được hợp đồng để thêm thanh toán!");
        setLoading(false);
        return;
      }
      // Lấy userId từ currentUser
      let currentUser: any = getUserInfo();
      if (typeof currentUser === "string") {
        try {
          currentUser = JSON.parse(currentUser);
        } catch {
          currentUser = {};
        }
      }
      const userId = currentUser?.userCurrent?.id || currentUser?.userCurrent?.userId || "";
      
      // CHỈ thêm mới các payment chưa có id (payment đã lưu không được chỉnh sửa)
      for (const p of list.filter((item) => !item.id)) {
        await addPayment({
          contractId: cid,
          paymentMethod: p.method,
          amount: Number(p.amount),
          paymentDate: p.date,
          notes: p.note,
          userId: userId, // Thêm userId để backend lưu vào payment_transaction
        });
      }
      // Không cập nhật payment đã có id - payment đã lưu không thể chỉnh sửa
      await onSave([]);
      onClose();
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          />
          <ButtonBase
            label="Lưu"
            className="btn_primary"
            onClick={handleSave}
            loading={loading}
          />
        </div>
      }
    >
      <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 12 }}>
        Danh sách thanh toán
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {list.map((item, idx) => {
          // Payment đã lưu (có id) thì không cho phép chỉnh sửa
          const isReadonly = !!item.id;
          return (
            <div
              key={idx}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 18,
                marginBottom: 0,
                background: "#fafbfc",
                position: "relative",
                opacity: loading ? 0.6 : 1,
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
                    disabled={isReadonly}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Số tiền
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <InputBase
                      modelValue={item.amount}
                      placeholder="0"
                      onChange={(val) => handleChange(idx, "amount", val)}
                      style={{ width: "100%", textAlign: "right" }}
                      disabled={isReadonly}
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
                    disabled={isReadonly}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    Ghi chú
                  </div>
                  <InputBase
                    modelValue={item.note}
                    placeholder="Ghi chú"
                    onChange={(val) => handleChange(idx, "note", val)}
                    style={{ width: "100%" }}
                    disabled={isReadonly}
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
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          );
        })}
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
            disabled={loading}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalUpdatePayment;
