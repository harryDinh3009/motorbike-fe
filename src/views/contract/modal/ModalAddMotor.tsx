import React, { useState, useEffect } from "react";
import ButtonBase from "@/component/common/button/ButtonBase";
import TModal from "@/component/common/modal/TModal";
import { SearchOutlined } from "@ant-design/icons";
import { searchAvailableCarsLight } from "@/service/business/carMng/carMng.service";
import { AvailableCarDTO } from "@/service/business/carMng/carMng.type";
import { isEmployee } from "@/utils/permission";

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
  selectedCarIds = [],
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (motors: any[]) => void;
  startDate?: string;
  endDate?: string;
  selectedCarIds?: string[];
}) => {
  const [search, setSearch] = useState("");
  const [carList, setCarList] = useState<AvailableCarDTO[]>([]);
  const [motors, setMotors] = useState<MotorSelect[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available cars with filter and date
  useEffect(() => {
    if (!open) return;
    setLoading(true);

    // Format dates to backend expected format
    const formatDate = (date: string | undefined) => {
      if (!date) return undefined;
      const d = new Date(date);
      // Format to yyyy-MM-ddTHH:mm:ss
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    searchAvailableCarsLight({
      keyword: search,
      page: 1,
      size: 10000,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    }).then((res) => {
      const cars = res.data.data || [];
      // Sắp xếp: xe khả dụng (AVAILABLE) lên trước, xe không khả dụng xuống dưới
      const sortedCars = [...cars].sort((a, b) => {
        const aIsAvailable = a.status === "AVAILABLE";
        const bIsAvailable = b.status === "AVAILABLE";
        if (aIsAvailable && !bIsAvailable) return -1; // a lên trước
        if (!aIsAvailable && bIsAvailable) return 1;  // b lên trước
        return 0; // giữ nguyên thứ tự nếu cùng trạng thái
      });
      setCarList(sortedCars);
      setMotors(
        sortedCars.map((car) => ({
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
          vehicleCode: info?.vehicleCode || "",
          branch: info?.branchName || "",
          status: info?.statusNm || "",
          condition: "", // AvailableCarDTO không có condition
          priceDay: m.priceDay,
          priceHour: m.priceHour,
          total: (m.priceDay || 0) + (m.priceHour || 0),
          startOdometer: null, // AvailableCarDTO không có currentOdometer
        };
      });
      console.log(selected);
      
    onAdd(selected);
  };

  return (
    <TModal
      visible={open}
      onCancel={onClose}
      title="Chọn xe thuê"
      width={1100}
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
            placeholder="Tìm theo Mã xe, Tên xe, Biển số"
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
            minWidth: 1000,
            fontWeight: 500,
            padding: "12px 16px",
            borderBottom: "2px solid #d9d9d9",
            display: "flex",
            alignItems: "center",
            background: "#e6f4ff",
            fontSize: 15,
          }}
        >
          <div style={{ width: 50, textAlign: "center" }} />
          <div style={{ flex: 1, minWidth: 180, textAlign: "left", paddingLeft: 8 }}>Tên xe</div>
          <div style={{ width: 140, textAlign: "left", paddingLeft: 8 }}>Biển số</div>
          <div style={{ width: 140, textAlign: "left", paddingLeft: 8 }}>Trạng thái</div>
          <div style={{ width: 180, textAlign: "right", paddingRight: 8 }}>Giá/ngày</div>
          <div style={{ width: 180, textAlign: "right", paddingRight: 8 }}>Giá/giờ</div>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            Đang tải dữ liệu...
          </div>
        ) : (
          carList.map((motor, idx) => {
            const mState = motors.find((m) => m.id === motor.id)!;
            const isAvailable = motor.status === "AVAILABLE";
            const isAlreadySelected = selectedCarIds.includes(motor.id);
            const strikeStyle = !isAvailable
              ? { textDecoration: "line-through", color: "#ff4d4f" }
              : {};
            const isCheckboxDisabled = !isAvailable || isAlreadySelected;
            const isPriceInputDisabled = !isAvailable || isAlreadySelected || isEmployee();
            
            return (
              <div
                key={motor.id}
                className="dp_flex"
                style={{
                  alignItems: "center",
                  gap: 0,
                  borderBottom: "1px solid #d9d9d9",
                  padding: "12px 16px",
                  fontSize: 15,
                  minWidth: 1000,
                  background: idx % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <div style={{ width: 50, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={isAlreadySelected || (mState?.checked || false)}
                    onChange={(e) => handleCheck(motor.id, e.target.checked)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: "#222",
                    }}
                    disabled={isCheckboxDisabled}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 180, paddingLeft: 8, ...strikeStyle }}>{motor.model}</div>
                <div style={{ width: 140, paddingLeft: 8, ...strikeStyle }}>
                  {motor.licensePlate}
                </div>
                <div style={{ width: 140, paddingLeft: 8, ...strikeStyle }}>
                  {motor.statusNm || motor.status || "-"}
                </div>
                <div
                  style={{
                    width: 180,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "flex-end",
                    paddingRight: 8,
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
                      width: 120,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #e0e0e0",
                      fontSize: 15,
                      marginRight: 4,
                      background: "#fff",
                      textDecoration: !isAvailable ? "line-through" : undefined,
                      color: !isAvailable ? "#ff4d4f" : undefined,
                    }}
                    disabled={isPriceInputDisabled}
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
                    width: 180,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "flex-end",
                    paddingRight: 8,
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
                      width: 120,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #e0e0e0",
                      fontSize: 15,
                      marginRight: 4,
                      background: "#fff",
                      textDecoration: !isAvailable ? "line-through" : undefined,
                      color: !isAvailable ? "#ff4d4f" : undefined,
                    }}
                    disabled={isPriceInputDisabled}
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
