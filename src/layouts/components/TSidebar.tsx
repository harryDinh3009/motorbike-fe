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
  CalendarOutlined,
  SwapOutlined,
  AppstoreOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { SCREEN } from "@/router/screen";
import Logo from "@/assets/images/motorbike_logo_new.jpg";
import { canManageBrand, canManageCarModel, canManageEmployee, canManageBranch } from "@/utils/permission";

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

  // Menu items - ẩn theo quyền
  // Nhân viên vẫn thấy menu mẫu xe và hãng xe (chỉ ẩn button trong trang)
  const carManagementChildren: MenuItem[] = [
    getItem("Danh sách mẫu xe", SCREEN.motorbikeModel?.path || "#", <UnorderedListOutlined />),
    getItem("Danh sách xe", SCREEN.motorbike?.path || "#", <CarryOutOutlined />),
    getItem("Danh sách hãng xe", SCREEN.brand?.path || "#", <ShopOutlined />),
  ];

  // Ẩn menu nhân viên và chi nhánh với role EMPLOYEE
  const catalogManagementChildren: MenuItem[] = [
    getItem("Khách hàng", SCREEN.customer?.path || "#", <TeamOutlined />),
    canManageEmployee() && getItem("Nhân viên", SCREEN.employee?.path || "#", <UserOutlined />),
    canManageBranch() && getItem("Chi nhánh", SCREEN.branch?.path || "#", <BankOutlined />),
  ].filter(Boolean) as MenuItem[];

  const menuItems: MenuItem[] = [
    getItem("Trang chủ", SCREEN.dashboard?.path || "/", <HomeOutlined />),
    getItem("Quản lý xe", "car-management", <CarOutlined />, carManagementChildren),
    getItem("Quản lý thuê xe", "contract-management", <FileTextOutlined />, [
      getItem("Danh sách hợp đồng", SCREEN.contractMng.path, <FileTextOutlined />),
      getItem("Giao nhận xe", SCREEN.contractDeliveryPickup.path, <SwapOutlined />),
      getItem("Xem lịch thuê xe", SCREEN.contractSchedule.path, <CalendarOutlined />),
    ]),
    catalogManagementChildren.length > 0 && getItem("Quản lý danh mục", "catalog-management", <AppstoreOutlined />, catalogManagementChildren),
    getItem("Báo cáo", "reports", <BarChartOutlined />, [
      getItem("Thống kê xe khả dụng", SCREEN.rentableCarReport?.path || "#"),
      getItem("Lượt thuê theo mẫu xe", SCREEN.modelRentalReport?.path || "#"),
      getItem("Doanh thu theo ngày", SCREEN.dailyRevenueReport?.path || "#"),
      getItem("Doanh thu theo tháng", SCREEN.revenueReport?.path || "#"),
    ]),
  ].filter(Boolean) as MenuItem[];

  // Update selected keys based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    setSelectedKeys([currentPath]);

    // Auto open parent menu chỉ khi sidebar không collapsed
    // và chỉ mở menu tương ứng với path hiện tại, không giữ các menu khác mở
    const newOpenKeys: string[] = [];
    
    if (currentPath.includes("/motorbike") || currentPath.includes("/car-model") || currentPath.includes("/brand")) {
      newOpenKeys.push("car-management");
    }
    if (
      currentPath.includes("/contract") ||
      currentPath.includes("/schedule") ||
      currentPath.includes("/delivery-pickup")
    ) {
      newOpenKeys.push("contract-management");
    }
    if (
      currentPath.includes("/report") ||
      currentPath.includes("/revenue") ||
      currentPath.includes("/rental")
    ) {
      newOpenKeys.push("reports");
    }
    if (
      currentPath.includes("/customer") ||
      currentPath.includes("/employee") ||
      currentPath.includes("/branch")
    ) {
      newOpenKeys.push("catalog-management");
    }
    
    // Chỉ cập nhật openKeys nếu có thay đổi và sidebar không collapsed
    if (!collapsed && newOpenKeys.length > 0) {
      setOpenKeys(newOpenKeys);
    } else if (collapsed) {
      // Khi collapsed, đóng tất cả menu
      setOpenKeys([]);
    }
  }, [location.pathname, collapsed]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key && e.key !== "#" && !e.key.includes("-management") && e.key !== "reports" && e.key !== "catalog-management") {
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
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        items={menuItems}
        triggerSubMenuAction="click"
        style={{
          borderRight: 0,
          background: "transparent",
        }}
      />
    </Sider>
  );
};

export default TSidebar;

