import React, { useState, useEffect } from "react";
import ButtonBase from "@/component/common/button/ButtonBase";
import TModal from "@/component/common/modal/TModal";
import { SearchOutlined } from "@ant-design/icons";
import { searchAvailableCars } from "@/service/business/carMng/carMng.service";
import { CarDTO } from "@/service/business/carMng/carMng.type";

interface MotorSelect {
  id: string;
  checked: boolean;
  priceDay: number;
  priceHour: number;
}

const ModalAddMotor = ({
  open,
  onClose,
  onAdd,
  startDate,
  endDate,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (motors: any[]) => void;
  startDate?: string;
  endDate?: string;
}) => {
  const [search, setSearch] = useState("");
  const [carList, setCarList] = useState<CarDTO[]>([]);
  const [motors, setMotors] = useState<MotorSelect[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available cars with filter and date
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    searchAvailableCars({
      keyword: search,
      page: 1,
      size: 10000,
      startDate,
      endDate,
    }).then((res) => {
      const cars = res.data.data || [];
      setCarList(cars);
      setMotors(
        cars.map((car) => ({
          id: car.id,
          checked: false,
          priceDay: car.dailyPrice || 0,
          priceHour: car.hourlyPrice || 0,
        }))
      );
      setLoading(false);
    });
  }, [open, search, startDate, endDate]);

  // Chọn xe
  const handleCheck = (id: string, checked: boolean) => {
    setMotors((prev) => prev.map((m) => (m.id === id ? { ...m, checked } : m)));
  };

  // Nhập giá/ngày, giá/giờ
  const handleChangePrice = (
    id: string,
    field: "priceDay" | "priceHour",
    value: number
  ) => {
    setMotors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Thêm xe
  const handleAdd = () => {
    const selected = motors
      .filter((m) => m.checked)
      .map((m) => {
        const info = carList.find((car) => car.id === m.id);
        return {
          id: info?.id || m.id,
          carId: info?.id || m.id,
          type: info?.carType || "",
          name: info?.model || "",
          plate: info?.licensePlate || "",
          branch: info?.branchName || "",
          status: info?.statusNm || "",
          condition: info?.condition || "",
          priceDay: m.priceDay,
          priceHour: m.priceHour,
          total: (m.priceDay || 0) + (m.priceHour || 0),
          startOdometer: info?.currentOdometer ?? null, // Thêm dòng này
        };
      });
    onAdd(selected);
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title={
        <div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Chọn xe thuê</div>
        </div>
      }
      width={800}
      footer={
        <div
          className="modal_footer dp_flex"
          style={{
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 18,
          }}
        >
          <ButtonBase label="Hủy" className="btn_gray" onClick={onClose} />
          <ButtonBase
            label="Thêm xe"
            className="contract-action-btn"
            onClick={handleAdd}
          />
        </div>
      }
    >
      {/* Cảnh báo xe không sẵn sàng */}
      {carList.some((motor) => motor.status !== "AVAILABLE") && (
        <div
          style={{
            color: "#ff4d4f",
            fontWeight: "600",
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          Xe bị gạch đỏ là xe không sẵn sàng, không thể thuê được!
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <div style={{ position: "relative", marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Tìm theo Tên xe, Biển số"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 38px 10px 38px",
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              fontSize: 15,
              background: "#fafafa",
            }}
          />
          <SearchOutlined
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "#bdbdbd",
            }}
          />
        </div>
      </div>
      <div
        style={{
          maxHeight: 400,
          overflowY: "auto",
          overflowX: "auto",
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          background: "#fff",
        }}
      >
        <div
          style={{
            minWidth: 600,
            fontWeight: 500,
            padding: "8px 0",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            background: "#fafbfc",
          }}
        >
          <div style={{ width: "20%", textAlign: "left" }} />
          <div style={{ width: "20%", textAlign: "left" }}>Tên xe</div>
          <div style={{ width: "20%", textAlign: "left" }}>Biển số</div>
          <div style={{ width: "20%", textAlign: "center" }}>Giá/ngày</div>
          <div style={{ width: "20%", textAlign: "center" }}>Giá/giờ</div>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            Đang tải dữ liệu...
          </div>
        ) : (
          carList.map((motor, idx) => {
            const mState = motors.find((m) => m.id === motor.id)!;
            const isAvailable = motor.status === "AVAILABLE";
            const strikeStyle = !isAvailable
              ? { textDecoration: "line-through", color: "#ff4d4f" }
              : {};
            return (
              <div
                key={motor.id}
                className="dp_flex"
                style={{
                  alignItems: "center",
                  gap: 0,
                  borderBottom: "1px solid #f0f0f0",
                  padding: "12px 0",
                  fontSize: 15,
                  minWidth: 600,
                  background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                }}
              >
                <div style={{ width: 40, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={mState?.checked || false}
                    onChange={(e) => handleCheck(motor.id, e.target.checked)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: "#222",
                    }}
                    disabled={!isAvailable}
                  />
                </div>
                <div style={{ flex: 1, ...strikeStyle }}>{motor.model}</div>
                <div style={{ width: "20%", ...strikeStyle }}>
                  {motor.licensePlate}
                </div>
                <div
                  style={{
                    width: "20%",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "center",
                    ...strikeStyle,
                  }}
                >
                  <input
                    type="number"
                    placeholder="0"
                    value={mState?.priceDay || 0}
                    onChange={(e) =>
                      handleChangePrice(
                        motor.id,
                        "priceDay",
                        Number(e.target.value)
                      )
                    }
                    style={{
                      width: 60,
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #e0e0e0",
                      fontSize: 15,
                      marginRight: 4,
                      background: "#fff",
                      textDecoration: !isAvailable ? "line-through" : undefined,
                      color: !isAvailable ? "#ff4d4f" : undefined,
                    }}
                    disabled={!isAvailable}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      color: !isAvailable ? "#ff4d4f" : "#888",
                    }}
                  >
                    /ngày
                  </span>
                </div>
                <div
                  style={{
                    width: "20%",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "center",
                    ...strikeStyle,
                  }}
                >
                  <input
                    type="number"
                    placeholder="0"
                    value={mState?.priceHour || 0}
                    onChange={(e) =>
                      handleChangePrice(
                        motor.id,
                        "priceHour",
                        Number(e.target.value)
                      )
                    }
                    style={{
                      width: 60,
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #e0e0e0",
                      fontSize: 15,
                      marginRight: 4,
                      background: "#fff",
                      textDecoration: !isAvailable ? "line-through" : undefined,
                      color: !isAvailable ? "#ff4d4f" : undefined,
                    }}
                    disabled={!isAvailable}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      color: !isAvailable ? "#ff4d4f" : "#888",
                    }}
                  >
                    /giờ
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </TModal>
  );
};

export default ModalAddMotor;
