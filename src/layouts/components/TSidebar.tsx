import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  CarOutlined,
  FileTextOutlined,
  TeamOutlined,
  BankOutlined,
  UserOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UnorderedListOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import { SCREEN } from "@/router/screen";
import Logo from "@/assets/images/motorbike_logo_new.jpg";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const TSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Menu items
  const menuItems: MenuItem[] = [
    getItem("Trang chủ", SCREEN.dashboard?.path || "/", <HomeOutlined />),
    getItem("Quản lý xe", "car-management", <CarOutlined />, [
      getItem("Danh sách mẫu xe", SCREEN.motorbikeModel?.path || "#", <UnorderedListOutlined />),
      getItem("Danh sách xe", SCREEN.motorbike?.path || "#", <CarryOutOutlined />),
    ]),
    getItem("Quản lý thuê xe", SCREEN.contractMng.path, <FileTextOutlined />),
    getItem("Khách hàng", SCREEN.customer?.path || "#", <TeamOutlined />),
    getItem("Chi nhánh", SCREEN.branch?.path || "#", <BankOutlined />),
    getItem("Nhân viên", SCREEN.employee?.path || "#", <UserOutlined />),
    getItem("Báo cáo", "reports", <BarChartOutlined />, [
      getItem("Thống kê xe khả dụng", SCREEN.rentableCarReport?.path || "#"),
      getItem("Lượt thuê theo mẫu xe", SCREEN.modelRentalReport?.path || "#"),
      getItem("Doanh thu theo ngày", SCREEN.dailyRevenueReport?.path || "#"),
      getItem("Doanh thu theo tháng", SCREEN.revenueReport?.path || "#"),
    ]),
  ];

  // Update selected keys based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    setSelectedKeys([currentPath]);

    // Auto open parent menu
    if (currentPath.includes("/motorbike") || currentPath.includes("/car-model")) {
      setOpenKeys((prev) => [...new Set([...prev, "car-management"])]);
    }
    if (
      currentPath.includes("/report") ||
      currentPath.includes("/revenue") ||
      currentPath.includes("/rental")
    ) {
      setOpenKeys((prev) => [...new Set([...prev, "reports"])]);
    }
  }, [location.pathname]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key && e.key !== "#" && !e.key.includes("-management") && e.key !== "reports") {
      navigate(e.key);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      trigger={null}
      width={260}
      collapsedWidth={80}
      style={{
        background: "linear-gradient(180deg, #2f3542 0%, #1e272e 100%)",
        minHeight: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          transition: "all 0.2s",
        }}
      >
        <img
          src={Logo}
          alt="Motogo"
          style={{
            height: 40,
            maxWidth: collapsed ? 40 : 120,
            objectFit: "contain",
            transition: "all 0.2s",
          }}
        />
        {!collapsed && (
          <span
            style={{
              color: "#FFD600",
              fontSize: 20,
              fontWeight: 700,
              marginLeft: 12,
            }}
          >
            Motogo
          </span>
        )}
      </div>

      {/* Collapse button */}
      <div
        style={{
          padding: "12px 0",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          onClick={() => setCollapsed(!collapsed)}
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 18,
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: 4,
            transition: "all 0.2s",
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        items={menuItems}
        style={{
          borderRight: 0,
          background: "transparent",
        }}
      />
    </Sider>
  );
};

export default TSidebar;

