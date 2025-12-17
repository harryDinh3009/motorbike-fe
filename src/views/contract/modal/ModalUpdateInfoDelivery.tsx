import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";

// Status color mapping giống màn quản lý xe
const STATUS_COLOR_MAP: Record<string, { bg: string; color: string }> = {
  "Hoạt động": { bg: "#D6F5E6", color: "#22A06B" },
  "Đang bảo dưỡng": { bg: "#FFF4E6", color: "#FF8C00" }, // Màu cam nổi bật thay vì xám
  "Không sẵn sàng": { bg: "#FFE066", color: "#B38600" },
  "Bị mất": { bg: "#FFD6D6", color: "#E14D4D" },
  "Hỏng hóc": { bg: "#FFE0E0", color: "#D32F2F" }, // Màu đỏ đậm hơn để nổi bật
};

function getStatusStyle(status: string): React.CSSProperties {
  const s = STATUS_COLOR_MAP[status?.trim() || ""];
  if (s) {
    return {
      background: s.bg,
      color: s.color,
      borderRadius: "16px",
      padding: "2px 16px",
      fontWeight: 500,
      fontSize: 14,
      display: "inline-block",
      minWidth: "100px",
      textAlign: "center" as const,
      margin: "2px 0",
      whiteSpace: "nowrap" as const,
    };
  }
  return {
    background: "#f5f5f5",
    color: "#333",
    borderRadius: "8px",
    padding: "2px 12px",
    fontWeight: 500,
    fontSize: 14,
    display: "inline-block",
    minWidth: "100px",
    textAlign: "center" as const,
    margin: "2px 0",
  };
}

interface CarDeliveryItem {
  id: string;
  carId: string;
  type: string;
  model: string;
  licensePlate: string;
  startOdometer?: number;
  currentOdometer?: number;
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
  const [statusError, setStatusError] = useState<string | null>(null);
  const [invalidStatusCarIds, setInvalidStatusCarIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setStaff(defaultStaff);
    setTime(defaultTime);
    // Reset errors when modal opens
    setStatusError(null);
    setInvalidStatusCarIds(new Set());
  }, [open, defaultStaff, defaultTime]);

  const totalAll = (totalCar || 0) + (totalSurcharge || 0);

  const handleSave = () => {
    // Check status validation - chỉ cho phép status "AVAILABLE" (Hoạt động)
    const invalidCars = cars.filter(
      (c) => !c.status || c.status !== "AVAILABLE"
    );
    
    if (invalidCars.length > 0) {
      setStatusError("Có xe không thể cho thuê do trạng thái không thỏa mãn");
      setInvalidStatusCarIds(new Set(invalidCars.map((c) => c.id)));
      return;
    }

    // Clear errors if validation passes
    setStatusError(null);
    setInvalidStatusCarIds(new Set());

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
      {statusError && (
        <div style={{ color: "#ff4d4f", fontWeight: 600, marginBottom: 12 }}>
          {statusError}
        </div>
      )}
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
                Mẫu xe
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
                Biển số xe
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
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 14,
                  borderBottom: "2px solid #e0e0e0",
                  width: 120,
                }}
              >
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, idx) => {
              // Map status code sang tên tiếng Việt
              const statusMap: Record<string, string> = {
                AVAILABLE: "Hoạt động",
                NOT_AVAILABLE: "Không sẵn sàng",
                MAINTENANCE: "Đang bảo dưỡng",
                BROKEN: "Hỏng hóc",
                LOST: "Bị mất",
              };
              const statusText = car.status ? statusMap[car.status] || car.status : "-";
              const isInvalidStatus = invalidStatusCarIds.has(car.id);
              
              return (
                <tr
                  key={car.id}
                  style={{
                    background: isInvalidStatus 
                      ? "#fff1f0" 
                      : idx % 2 === 0 ? "#fff" : "#fafbfc",
                    borderBottom: isInvalidStatus 
                      ? "2px solid #ff4d4f" 
                      : "1px solid #f0f0f0",
                    borderLeft: isInvalidStatus ? "3px solid #ff4d4f" : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      color: isInvalidStatus ? "#ff4d4f" : "#666",
                      fontWeight: isInvalidStatus ? 600 : 400,
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td style={{ padding: "12px 8px", color: isInvalidStatus ? "#ff4d4f" : "#333", fontWeight: isInvalidStatus ? 600 : 400 }}>
                    {car.model || "-"}
                  </td>
                  <td style={{ padding: "12px 8px", color: isInvalidStatus ? "#ff4d4f" : "#333", fontWeight: isInvalidStatus ? 600 : 400 }}>
                    {car.licensePlate || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "right",
                      color: isInvalidStatus ? "#ff4d4f" : "#333",
                      fontWeight: isInvalidStatus ? 600 : 500,
                    }}
                  >
                    {car.currentOdometer !== undefined && car.currentOdometer !== null
                      ? car.currentOdometer.toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                    }}
                  >
                    <span style={getStatusStyle(statusText)}>
                      {statusText}
                    </span>
                  </td>
                </tr>
              );
            })}
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
