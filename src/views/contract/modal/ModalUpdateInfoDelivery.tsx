import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";

interface CarDeliveryItem {
  id: string;
  carId: string;
  type: string;
  model: string;
  licensePlate: string;
  startOdometer?: number;
  status?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  cars?: CarDeliveryItem[];
  staffOptions?: { value: string; label: string }[];
  defaultStaff?: string;
  defaultTime?: string;
  totalCar?: number;
  totalSurcharge?: number;
}

const ModalUpdateInfoDelivery = ({
  open,
  onClose,
  onSave,
  cars = [],
  staffOptions = [],
  defaultStaff = "",
  defaultTime = "",
  totalCar = 0,
  totalSurcharge = 0,
}: Props) => {
  const [staff, setStaff] = useState(defaultStaff);
  const [time, setTime] = useState(defaultTime);

  useEffect(() => {
    setStaff(defaultStaff);
    setTime(defaultTime);
  }, [open, defaultStaff, defaultTime]);

  const totalAll = (totalCar || 0) + (totalSurcharge || 0);

  const handleSave = () => {
    onSave({
      staff,
      time,
    });
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Cập nhật thông tin giao xe"
      width={800}
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
          <ButtonBase label="Hủy" className="btn_lightgray" onClick={onClose} />
          <ButtonBase
            label="Tiếp tục"
            className="btn_primary"
            onClick={handleSave}
          />
        </div>
      }
    >
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          background: "#fff",
          marginBottom: 18,
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f7fa" }}>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 14,
                  borderBottom: "2px solid #e0e0e0",
                  width: 50,
                }}
              >
                STT
              </th>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: 14,
                  borderBottom: "2px solid #e0e0e0",
                }}
              >
                Loại xe
              </th>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: 14,
                  borderBottom: "2px solid #e0e0e0",
                }}
              >
                Mẫu xe
              </th>
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "right",
                  fontWeight: 600,
                  fontSize: 14,
                  borderBottom: "2px solid #e0e0e0",
                  width: 140,
                }}
              >
                Odometer hiện tại
              </th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, idx) => (
              <tr
                key={car.id}
                style={{
                  background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  {idx + 1}
                </td>
                <td style={{ padding: "12px 8px", color: "#333" }}>
                  {car.type || "-"}
                </td>
                <td style={{ padding: "12px 8px", color: "#333" }}>
                  {car.model || "-"}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "right",
                    color: "#333",
                    fontWeight: 500,
                  }}
                >
                  {car.startOdometer
                    ? car.startOdometer.toLocaleString("vi-VN")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 18,
          marginTop: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#fafbfc",
            borderRadius: 8,
            border: "1px solid #eee",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 15 }}>
            Tiền thuê xe hiện tại:
          </div>
          <div style={{ fontWeight: 600, fontSize: 18, color: "#1677ff" }}>
            {(totalCar || 0).toLocaleString()}đ
          </div>
        </div>
        <div
          style={{
            flex: 1,
            background: "#fafbfc",
            borderRadius: 8,
            border: "1px solid #eee",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 15 }}>Tiền phụ thu:</div>
          <div style={{ fontWeight: 600, fontSize: 18, color: "#faad14" }}>
            {(totalSurcharge || 0).toLocaleString()}đ
          </div>
        </div>
        <div
          style={{
            flex: 1,
            background: "#fafbfc",
            borderRadius: 8,
            border: "1px solid #eee",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 15 }}>
            Tổng tiền hiện tại:
          </div>
          <div style={{ fontWeight: 600, fontSize: 18, color: "#222" }}>
            {totalAll.toLocaleString()}đ
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>
            Nhân viên giao xe <span style={{ color: "red" }}>*</span>
          </div>
          <input
            type="text"
            value={
              staffOptions.find((s) => s.value === staff)?.label || staff || ""
            }
            disabled
            style={{
              width: "100%",
              background: "#f0f7ff",
              color: "#1677ff",
              border: "1px solid #91caff",
              borderRadius: 6,
              padding: "8px 12px",
              fontWeight: 500,
              fontSize: 14,
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>
            Thời gian giao xe
          </div>
          <DatePickerBase
            value={time || undefined}
            placeholder="dd/mm/yyyy HH:mm:ss"
            onChange={(val: string | null) => {
              setTime(val || "");
            }}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalUpdateInfoDelivery;
