import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined, UserOutlined, BankOutlined } from "@ant-design/icons";
import { getUserInfo, removeUserInfo } from "@/utils/storage";
import { getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";
import { formatDateDMYOnly } from "@/utils/common";
import { SCREEN } from "@/router/screen";

const THeaderTop: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<{
    userName: string;
    lastLoginDate: string | null;
  }>({
    userName: "",
    lastLoginDate: null,
  });
  const [currentDate, setCurrentDate] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    setCurrentDate(formatDateDMYOnly(today));

    // Lấy user info
    try {
      const raw = getUserInfo();
      if (raw) {
        const info = JSON.parse(raw);
        setUserInfo({
          userName:
            info.userCurrent?.fullName ||
            info.userCurrent?.username ||
            info.username ||
            "",
          lastLoginDate: info.userCurrent?.lastLoginDate || null,
        });
      }
    } catch {
      setUserInfo({ userName: "", lastLoginDate: null });
    }

    // Lấy chi nhánh
    getBranchByCurrentUser()
      .then((res) => setBranchName(res.data?.name || ""))
      .catch(() => setBranchName(""));
  }, []);

  const handleLogout = () => {
    removeUserInfo();
    navigate(SCREEN.login.path);
  };

  return (
    <div
      style={{
        height: 56,
        background: "#fff",
        borderBottom: "1px solid #e8e8e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 24px",
        gap: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Chi nhánh */}
      {branchName && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#f5f5f5",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 13,
            color: "#666",
          }}
        >
          <BankOutlined style={{ color: "#FFD600" }} />
          <span>{branchName}</span>
        </div>
      )}

      {/* User info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: "#333",
        }}
      >
        <UserOutlined style={{ color: "#1677ff" }} />
        <span style={{ fontWeight: 500 }}>{userInfo.userName}</span>
        <span style={{ color: "#999" }}>|</span>
        <span style={{ color: "#666" }}>{currentDate}</span>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#ff4d4f",
          color: "#fff",
          border: "none",
          padding: "6px 16px",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#ff7875")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#ff4d4f")}
      >
        <LogoutOutlined />
        Đăng xuất
      </button>
    </div>
  );
};

export default THeaderTop;

