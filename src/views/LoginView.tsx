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
      // TODO: handle login logic
      alert("Đăng nhập thành công!");
    }, 1000);
  };

  return (
    <div
      className="login-bg"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #1677ff 0%, #fff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <img
          src="/logo-bookbike.png"
          alt="BookBike"
          style={{ height: 64, marginBottom: 8 }}
        />
        <h1
          style={{
            color: "#1677ff",
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: 1,
          }}
        >
          BOOKBIKE - THUÊ XE MÁY HÀ GIANG
        </h1>
      </div>
      <div style={{ maxWidth: 400, width: "100%", zIndex: 3 }}>
        <ContainerBase>
          <div
            className="box_section"
            style={{
              padding: 36,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 8px 32px 0 rgba(22,119,255,0.10)",
            }}
          >
            <h2
              className="ta_c mg_b20"
              style={{ color: "#1677ff", fontWeight: 700 }}
            >
              Đăng nhập tài khoản
            </h2>
            <div className="mg_b15">
              <InputBase
                modelValue={form.username}
                placeholder="Tên đăng nhập"
                prefixIcon={<UserOutlined />}
                onChange={handleChange("username")}
                required
                style={{ fontSize: 16, height: 44 }}
              />
            </div>
            <div className="mg_b10">
              <InputBase
                modelValue={form.password}
                placeholder="Mật khẩu"
                type="password"
                prefixIcon={<LockOutlined />}
                onChange={handleChange("password")}
                required
                style={{ fontSize: 16, height: 44 }}
              />
            </div>
            <div
              className="dp_flex"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <label style={{ fontSize: 14 }}>
                <input type="checkbox" style={{ marginRight: 6 }} /> Ghi nhớ
                đăng nhập
              </label>
              <a href="#" style={{ color: "#1677ff", fontSize: 14 }}>
                Quên mật khẩu?
              </a>
            </div>
            <ButtonBase
              label={loading ? "Đang đăng nhập..." : "Đăng nhập"}
              className="btn_primary"
              style={{ width: "100%", fontSize: 16, height: 44 }}
              onClick={handleLogin}
              disabled={loading || !form.username || !form.password}
            />
            <div
              style={{
                textAlign: "center",
                marginTop: 24,
                color: "#888",
              }}
            >
              <span>Chưa có tài khoản? </span>
              <a href="#" style={{ color: "#1677ff", fontWeight: 500 }}>
                Đăng ký ngay
              </a>
            </div>
          </div>
        </ContainerBase>
      </div>
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
        }}
      >
        © {new Date().getFullYear()} BookBike Hà Giang. All rights reserved.
      </div>
      <img
        src="/login-bike.png"
        alt="Xe máy"
        style={{
          position: "absolute",
          right: 40,
          bottom: 0,
          width: 320,
          opacity: 0.15,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default LoginView;
