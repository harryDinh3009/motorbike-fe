import React, { useState } from "react";
import ButtonBase from "@/component/common/button/ButtonBase";
import TModal from "@/component/common/modal/TModal";
import { SearchOutlined } from "@ant-design/icons";

// Dummy data xe
const motorList = [
  { id: 1, name: "Mazda CX5 2020", plate: "30E-42103" },
  { id: 2, name: "Toyota Vios 2019", plate: "29A-15678" },
  { id: 3, name: "Honda City 2021", plate: "51D-98765" },
  { id: 4, name: "Hyundai Accent 2020", plate: "43B-23456" },
  { id: 5, name: "Kia Morning 2018", plate: "60A-87654" },
];

interface MotorSelect {
  id: number;
  checked: boolean;
  priceDay: number;
  priceHour: number;
}

const ModalAddMotor = ({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (motors: any[]) => void;
}) => {
  const [search, setSearch] = useState("");
  const [motors, setMotors] = useState<MotorSelect[]>(
    motorList.map((m) => ({
      id: m.id,
      checked: false,
      priceDay: 0,
      priceHour: 0,
    }))
  );

  // Lọc xe theo search
  const filtered = motorList.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.plate.toLowerCase().includes(search.toLowerCase())
  );

  // Chọn xe
  const handleCheck = (id: number, checked: boolean) => {
    setMotors((prev) => prev.map((m) => (m.id === id ? { ...m, checked } : m)));
  };

  // Nhập giá/ngày, giá/giờ
  const handleChangePrice = (
    id: number,
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
        const info = motorList.find((motor) => motor.id === m.id);
        return {
          type: "", // có thể bổ sung loại xe nếu cần
          name: info?.name || "",
          plate: info?.plate || "",
          priceDay: m.priceDay,
          priceHour: m.priceHour,
          total: (m.priceDay || 0) + (m.priceHour || 0),
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
          <div style={{ fontWeight: 600, fontSize: 18 }}>Tìm xe</div>
          <div style={{ fontSize: 14, color: "#888" }}>
            Chọn xe để đưa vào hợp đồng
          </div>
        </div>
      }
      width={600}
      footer={
        <>
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
        </>
      }
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            position: "relative",
            marginBottom: 0,
          }}
        >
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
      <div>
        {filtered.map((motor, idx) => {
          const mState = motors.find((m) => m.id === motor.id)!;
          return (
            <div
              key={motor.id}
              className="dp_flex"
              style={{
                alignItems: "center",
                gap: 0,
                marginBottom: 0,
                borderBottom: "1px solid #f0f0f0",
                padding: "16px 0",
                fontSize: 15,
              }}
            >
              <div style={{ width: 40, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={mState.checked}
                  onChange={(e) => handleCheck(motor.id, e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: "#222",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{motor.name}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{motor.plate}</div>
              </div>
              <div
                style={{
                  width: 120,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <input
                  type="number"
                  placeholder="0"
                  value={mState.priceDay}
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
                  }}
                />
                <span style={{ fontSize: 14, color: "#888" }}>/ngày</span>
              </div>
              <div
                style={{
                  width: 120,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <input
                  type="number"
                  placeholder="0"
                  value={mState.priceHour}
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
                  }}
                />
                <span style={{ fontSize: 14, color: "#888" }}>/giờ</span>
              </div>
            </div>
          );
        })}
      </div>
    </TModal>
  );
};

export default ModalAddMotor;
