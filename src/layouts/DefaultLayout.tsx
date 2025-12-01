import React, { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import TSidebar from "./components/TSidebar";
import THeaderTop from "./components/THeaderTop";
import TFooter from "./components/TFooter";

const { Content } = Layout;

const DefaultLayout: React.FC<PropsWithChildren> = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar bên trái */}
      <TSidebar />

      {/* Main area */}
      <Layout
        style={{
          marginLeft: 260, // Bằng với width của Sider
          transition: "all 0.2s",
        }}
        className="main-layout"
      >
        {/* Header nhỏ gọn */}
        <THeaderTop />

        {/* Main Content */}
        <Content
          style={{
            background: "#f0f2f5",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          <div className="content_wrap" style={{ paddingTop: 24 }}>
            <Outlet />
          </div>
        </Content>

        {/* Footer */}
        <TFooter />
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;
