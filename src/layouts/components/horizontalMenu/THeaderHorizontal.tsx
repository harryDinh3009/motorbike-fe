import Logo from "@/assets/images/motorbike_logo_new.jpg";
import { gnbOneDepth, headerStyle, mobileGnb } from "@/assets/js/common";
import { SCREEN } from "@/router/screen";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUserInfo, removeUserInfo } from "@/utils/storage";
import { getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";
import { formatDateDMYOnly } from "@/utils/common";

type MenuItem = {
  name: string;
  path: string;
  subMenus?: MenuItem[];
};

const THeaderHorizontal = () => {
  const [userInfo, setUserInfo] = useState<{
    userName: string;
    lastLoginDate: string | null;
    avatar?: string;
  }>({
    userName: "",
    lastLoginDate: null,
    avatar: "",
  });
  const [currentDate, setCurrentDate] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = formatDateDMYOnly(today);
    setCurrentDate(formattedDate);
    headerStyle();
    mobileGnb();
    gnbOneDepth();

    // Lấy user info từ localStorage
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
          avatar: info.userCurrent?.avatar || info.avatar || "",
        });
      }
    } catch {
      setUserInfo({
        userName: "",
        lastLoginDate: null,
        avatar: "",
      });
    }

    // Lấy chi nhánh hiện tại của user
    getBranchByCurrentUser()
      .then((res) => {
        setBranchName(res.data?.name || "");
      })
      .catch(() => setBranchName(""));
  }, []);

  const subMenus: MenuItem[] = [
    {
      name: "Trang chủ",
      path: SCREEN.dashboard?.path || "#",
      subMenus: [],
    },
    {
      name: "Quản lý xe",
      path: "#",
      subMenus: [
        {
          name: "Danh sách mẫu xe",
          path: SCREEN.motorbikeModel?.path || "#",
          subMenus: [],
        },
        {
          name: "Danh sách xe",
          path: SCREEN.motorbike?.path || "#",
          subMenus: [],
        },
      ],
    },
    {
      name: "Quản lý thuê xe",
      path: SCREEN.contractMng.path,
      subMenus: [
        {
          name: "Danh sách hợp đồng",
          path: SCREEN.contractMng.path,
          subMenus: [],
        },
        {
          name: "Xem lịch đặt xe",
          path: SCREEN.contractSchedule.path,
          subMenus: [],
        },
      ],
    },
    {
      name: "Khách hàng",
      path: SCREEN.customer?.path || "#",
      subMenus: [],
    },
    {
      name: "Chi nhánh",
      path: SCREEN.branch?.path || "#",
      subMenus: [],
    },
    {
      name: "Nhân viên",
      path: SCREEN.employee?.path || "#",
      subMenus: [],
    },
    {
      name: "Báo cáo",
      path: "#",
      subMenus: [
        {
          name: "Thống kê xe khả dụng",
          path: SCREEN.rentableCarReport?.path || "#",
          subMenus: [],
        },
        {
          name: "Thống kê lượt thuê theo mẫu xe",
          path: SCREEN.modelRentalReport?.path || "#",
          subMenus: [],
        },
        {
          name: "Doanh thu theo ngày",
          path: SCREEN.dailyRevenueReport?.path || "#",
          subMenus: [],
        },
        {
          name: "Doanh thu theo tháng",
          path: SCREEN.revenueReport?.path || "#",
          subMenus: [],
        },
      ],
    },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  // Hàm kiểm tra menu item có đang active không
  const isMenuActive = (menuPath: string): boolean => {
    if (!menuPath || menuPath === "#") return false;
    const currentPath = location.pathname;
    // Nếu path chính xác khớp
    if (currentPath === menuPath) return true;
    // Nếu currentPath bắt đầu bằng menuPath (cho các sub-routes)
    // Ví dụ: /contract/detail/123 sẽ match với /contract
    if (menuPath !== "/" && currentPath.startsWith(menuPath + "/")) return true;
    // Xử lý trường hợp đặc biệt: "/" chỉ match chính xác
    if (menuPath === "/" && currentPath === "/") return true;
    return false;
  };

  // Hàm kiểm tra menu item hoặc submenu có active không
  const isMenuOrSubMenuActive = (menu: MenuItem): boolean => {
    if (isMenuActive(menu.path)) return true;
    // Kiểm tra các submenu
    if (menu.subMenus) {
      return menu.subMenus.some((subMenu) => {
        if (isMenuActive(subMenu.path)) return true;
        // Kiểm tra submenu của submenu
        if (subMenu.subMenus) {
          return subMenu.subMenus.some((subSubMenu) =>
            isMenuActive(subSubMenu.path)
          );
        }
        return false;
      });
    }
    return false;
  };

  return (
    <div className="header_wrap">
      <div className="header_top">
        <div className="grid_content">
          <button type="button" className="btn_menu">
            메뉴보기
          </button>
          <h1 className="header_logo">
            <a href="/">
              <img src={Logo} alt="영산대학교" />
            </a>
          </h1>
          <div className="header_function">
            {/* Chi nhánh đẹp, nhỏ gọn, không ảnh hưởng phần khác */}
            {branchName && (
              <div
                style={{
                  display: "inline-block",
                  background: "#fff",
                  color: "#222",
                  borderRadius: 8,
                  padding: "6px 16px",
                  fontWeight: 500,
                  fontSize: 12,
                  border: "1px solid #eee",
                  marginRight: 12,
                  boxShadow: "0 1px 4px #0001",
                  letterSpacing: 0.2,
                  maxWidth: 220,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  verticalAlign: "middle",
                }}
                title={branchName}
              >
                {/* Icon chi nhánh */}
                <span
                  style={{
                    marginRight: 6,
                    color: "#FFD600",
                    verticalAlign: "middle",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <rect
                      x="3"
                      y="7"
                      width="14"
                      height="9"
                      rx="2"
                      stroke="#FFD600"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 7V5a3 3 0 0 1 6 0v2"
                      stroke="#FFD600"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
                {branchName}
              </div>
            )}
            <p className="login_info">
              {userInfo.userName}{" "}
              {userInfo.lastLoginDate && `[${formatDateDMYOnly(userInfo.lastLoginDate)}]`}{" "}
              [{currentDate}]
            </p>{" "}
            <button
              type="button"
              className="btn_logout"
              onClick={() => {
                removeUserInfo();
                navigate(SCREEN.login.path);
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      <div className="header_bottom" style={{ background: "#FFD600" }}>
        <div className="grid_content">
          <nav className="nav_wrap" style={{ justifyContent: "flex-start" }}>
            <ul
              id="gnbMenu"
              className="gnb_1depth"
              style={{
                justifyContent: "flex-start",
                textAlign: "left",
                paddingLeft: 24,
              }}
            >
              {subMenus.map((subMenu1, indexMenu1) => {
                const isActive = isMenuOrSubMenuActive(subMenu1);
                return (
                  <li key={indexMenu1}>
                    <Link
                      to={subMenu1.path}
                      style={{
                        color: isActive ? "#1677ff" : undefined,
                        borderBottom: isActive ? "2px solid #1677ff" : "none",
                        paddingBottom: isActive ? "2px" : undefined,
                        fontWeight: isActive ? 500 : undefined,
                      }}
                    >
                      {subMenu1.name}
                    </Link>
                  <ul className="gnb_2depth">
                    {subMenu1.subMenus?.map((subMenu2, indexMenu2) => (
                      <li key={indexMenu2}>
                        <Link to={subMenu2.path}>{subMenu2.name}</Link>
                        <ul
                          className={`gnb_3depth ${!indexMenu2 ? "first" : ""}`}
                        >
                          {subMenu2.subMenus?.map((subMenu3, indexMenu3) => (
                            <li key={indexMenu3}>
                              {/* Nếu có subMenu3, dùng Link, nếu không có path thì không render */}
                              {subMenu3.path ? (
                                <Link to={subMenu3.path}>{subMenu3.name}</Link>
                              ) : (
                                subMenu3.name
                              )}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default THeaderHorizontal;
