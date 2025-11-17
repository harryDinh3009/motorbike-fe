import React, { useEffect, useState } from "react";
import TModal from "@/component/common/modal/TModal";
import ButtonBase from "@/component/common/button/ButtonBase";
import SelectboxBase from "@/component/common/input/SelectboxBase";
import DatePickerBase from "@/component/common/datepicker/DatePickerBase";
import { getCarStatuses } from "@/service/business/carMng/carMng.service";

interface CarReceiveItem {
  id: string;
  carId: string;
  type: string;
  model: string;
  licensePlate: string;
  odometer: number | string;
  condition: string;
  status?: string; // Thêm field status
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  cars: CarReceiveItem[];
  staffOptions?: { value: string; label: string }[];
  defaultStaff?: string;
  defaultTime?: string;
  totalCar?: number;
  totalSurcharge?: number;
  // carStatusOptions?: { value: string; label: string }[];
}

const ModalUpdateInfoPickup = ({
  open,
  onClose,
  onSave,
  cars = [],
  staffOptions = [],
  defaultStaff = "",
  defaultTime = "",
  totalCar = 0,
  totalSurcharge = 0,
}: // carStatusOptions = [],
Props) => {
  const [staff, setStaff] = useState(defaultStaff);
  const [time, setTime] = useState(defaultTime);
  const [carStates, setCarStates] = useState<CarReceiveItem[]>(
    cars.map((c) => ({
      ...c,
      odometer: c.odometer || "",
      condition: c.condition || "",
      status: c.status || "", // Thêm status vào state
    }))
  );
  const [carStatusOptions, setCarStatusOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Chọn trạng thái" }]);

  const [odoError, setOdoError] = useState<string | null>(null);
  console.log(carStates);
  

  useEffect(() => {
    setStaff(defaultStaff);
    setTime(defaultTime);
    setCarStates(
      cars.map((c) => ({
        ...c,
        odometer: c.odometer || "",
        condition: c.condition || "",
        status: c.status || "", // Thêm status vào state
      }))
    );
    getCarStatuses().then((res) => {
      setCarStatusOptions([
        { value: "", label: "Chọn trạng thái" },
        ...(res.data || []).map((s: any) => ({
          value: s.code,
          label: s.name,
        })),
      ]);
    });
  }, [open, cars, defaultStaff, defaultTime]);

  const totalAll = (totalCar || 0) + (totalSurcharge || 0);

  const handleCarChange = (
    idx: number,
    key: keyof CarReceiveItem,
    value: any
  ) => {
    console.log(value);

    setCarStates((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item))
    );
  };

  const handleSave = () => {
    const missingOdoIdx = carStates.findIndex(
      (c) =>
        c.odometer === "" || c.odometer === null || isNaN(Number(c.odometer))
    );
    if (missingOdoIdx !== -1) {
      setOdoError(`Vui lòng nhập Odo cho xe số ${missingOdoIdx + 1}`);
      return;
    }
    setOdoError(null);
    const carsPayload = carStates.map((c, idx) => ({
      id: c.carId,
      endOdometer: Number(c.odometer),
      status: c.status,
    }));
    onSave({
      staff,
      time,
      cars: carsPayload,
    });
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Cập nhật thông tin nhận xe"
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
      <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 12 }}>
        Danh sách xe
      </div>
      {odoError && (
        <div style={{ color: "#ff4d4f", fontWeight: 600, marginBottom: 8 }}>
          {odoError}
        </div>
      )}
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 10,
          background: "#fafbfc",
          marginBottom: 18,
          padding: 12,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ width: 40, textAlign: "center" }}>STT</th>
              <th style={{ width: 100 }}>Loại xe</th>
              <th style={{ width: 140 }}>Mẫu xe</th>
              <th style={{ width: 120 }}>Biển số xe</th>
              <th style={{ width: 120 }}>Cập nhật Odometer</th>
              <th style={{ width: 160 }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {carStates.map((car, idx) => (
              <tr key={car.id}>
                <td style={{ textAlign: "center" }}>{idx + 1}</td>
                <td>{car.type}</td>
                <td>{car.model}</td>
                <td>{car.licensePlate}</td>
                <td>
                  <input
                    type="number"
                    value={car.odometer}
                    min={0}
                    onChange={(e) =>
                      handleCarChange(idx, "odometer", e.target.value)
                    }
                    style={{
                      width: 90,
                      borderRadius: 6,
                      border: "1px solid #eee",
                      padding: "4px 8px",
                    }}
                    placeholder="Odo"
                  />
                </td>
                <td>
                  <SelectboxBase
                    value={car.status}
                    options={carStatusOptions}
                    onChange={(val) =>
                      handleCarChange(
                        idx,
                        "status",
                        typeof val === "string" ? val : val[0] || ""
                      )
                    }
                    style={{ width: "100%" }}
                  />
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
            Nhân viên nhận xe <span style={{ color: "red" }}>*</span>
          </div>
          <input
            type="text"
            value={
              staffOptions.find((s) => s.value === staff)?.label || staff || ""
            }
            disabled
            style={{
              width: "100%",
              background: "#f5f5f5",
              color: "#888",
              border: "1px solid #eee",
              borderRadius: 6,
              padding: "4px 8px",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>
            Thời gian nhận xe
          </div>
          <DatePickerBase
            value={time ? new Date(time) : undefined}
            placeholder="mm/dd/yyyy --:--"
            showTime
            onChange={(val: any) => {
              if (!val) return setTime("");
              if (typeof val === "string") return setTime(val);
              if (val instanceof Date && !isNaN(val.getTime())) {
                return setTime(val.toISOString());
              }
            }}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </TModal>
  );
};

export default ModalUpdateInfoPickup;
