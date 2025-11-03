import React, { useState } from "react";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import InputBase from "@/component/common/input/InputBase";
import ButtonBase from "@/component/common/button/ButtonBase";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

const LoginView = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Đăng nhập thành công!");
    }, 1000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e90ff 0%, #6dd5ed 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Card Login */}
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#fff",
          borderRadius: 32,
          boxShadow:
            "0 12px 48px 0 rgba(22,119,255,0.18), 0 2px 12px 0 rgba(0,0,0,0.06)",
          padding: "54px 38px 38px 38px",
          position: "relative",
          zIndex: 2,
          margin: "40px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src="/logo-bookbike.png"
            alt="BookBike"
            style={{
              height: 68,
              marginBottom: 10,
              filter: "drop-shadow(0 2px 8px #1677ff33)",
              objectFit: "contain",
            }}
          />
          <h1
            style={{
              color: "#1677ff",
              fontWeight: 900,
              fontSize: 32,
              letterSpacing: 1,
              marginBottom: 0,
              textShadow: "0 2px 8px #1677ff22",
              lineHeight: 1.1,
            }}
          >
            BOOKBIKE
          </h1>
          <div
            style={{
              color: "#222",
              fontWeight: 500,
              fontSize: 17,
              letterSpacing: 0.5,
              marginBottom: 0,
              opacity: 0.85,
              marginTop: 2,
            }}
          >
            Thuê xe máy em Hòa auto
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <h2
            className="ta_c"
            style={{
              color: "#222",
              fontWeight: 800,
              fontSize: 24,
              marginBottom: 28,
              letterSpacing: 0.5,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Đăng nhập tài khoản
          </h2>
          <div style={{ marginBottom: 18 }}>
            <InputBase
              modelValue={form.username}
              placeholder="Tên đăng nhập"
              prefixIcon={<UserOutlined />}
              onChange={handleChange("username")}
              required
              style={{
                fontSize: 17,
                height: 48,
                borderRadius: 14,
                border: "1.5px solid #e0e7ef",
                background: "#f6faff",
                marginBottom: 10,
                transition: "border 0.2s",
                boxShadow: "0 1px 4px #eaf3ff44",
              }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <InputBase
              modelValue={form.password}
              placeholder="Mật khẩu"
              type="password"
              prefixIcon={<LockOutlined />}
              onChange={handleChange("password")}
              required
              style={{
                fontSize: 17,
                height: 48,
                borderRadius: 14,
                border: "1.5px solid #e0e7ef",
                background: "#f6faff",
                marginBottom: 2,
                transition: "border 0.2s",
                boxShadow: "0 1px 4px #eaf3ff44",
              }}
            />
          </div>
          <div
            className="dp_flex"
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 22,
              marginTop: 2,
            }}
          >
            <label
              style={{
                fontSize: 15,
                color: "#444",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                style={{
                  marginRight: 8,
                  width: 18,
                  height: 18,
                  accentColor: "#1677ff",
                  borderRadius: 4,
                  border: "1.5px solid #e0e7ef",
                }}
              />
              Ghi nhớ đăng nhập
            </label>
            <a
              href="#"
              style={{
                color: "#1677ff",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#0d47a1")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#1677ff")}
            >
              Quên mật khẩu?
            </a>
          </div>
          <ButtonBase
            label={loading ? "Đang đăng nhập..." : "Đăng nhập"}
            className="btn_primary"
            style={{
              width: "100%",
              fontSize: 18,
              height: 50,
              borderRadius: 14,
              fontWeight: 700,
              boxShadow: "0 2px 16px 0 #1677ff22",
              background: "linear-gradient(90deg, #1677ff 60%, #6dd5ed 100%)",
              border: "none",
              transition: "background 0.2s, box-shadow 0.2s",
              marginBottom: 8,
            }}
            onClick={handleLogin}
            disabled={loading || !form.username || !form.password}
          />
          <div
            style={{
              textAlign: "center",
              marginTop: 28,
              color: "#888",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            <span>Chưa có tài khoản? </span>
            <a
              href="#"
              style={{
                color: "#1677ff",
                fontWeight: 700,
                textDecoration: "underline",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#0d47a1")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#1677ff")}
            >
              Đăng ký ngay
            </a>
          </div>
        </div>
      </div>
      {/* Xe máy background */}
      <img
        src="/login-bike.png"
        alt="Xe máy"
        style={{
          position: "absolute",
          right: 40,
          bottom: 0,
          width: 340,
          opacity: 0.13,
          zIndex: 1,
          pointerEvents: "none",
          filter: "drop-shadow(0 2px 12px #1677ff33)",
        }}
      />
      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#888",
          fontSize: 14,
          zIndex: 2,
          letterSpacing: 0.2,
          textShadow: "0 1px 4px #fff",
        }}
      >
        © {new Date().getFullYear()} BookBike Hà Giang. All rights reserved.
      </div>
    </div>
  );
};

export default LoginView;
