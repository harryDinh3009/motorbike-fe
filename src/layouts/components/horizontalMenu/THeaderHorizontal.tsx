import Logo from "@/assets/images/motorbike_logo.png";
import { gnbOneDepth, headerStyle, mobileGnb } from "@/assets/js/common";
import { SCREEN } from "@/router/screen";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserInfo, removeUserInfo } from "@/utils/storage";
import { getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";

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
    const formattedDate = today.toLocaleDateString("vi-VN");
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
      path: SCREEN.motorbike?.path || "#",
      subMenus: [],
    },
    {
      name: "Hợp đồng thuê xe",
      path: SCREEN.contractMng.path,
      subMenus: [],
    },
    // {
    //   name: "Quản lý phụ thu",
    //   path: SCREEN.surcharge?.path || "#",
    //   subMenus: [],
    // },
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
      name: "Khách hàng",
      path: SCREEN.customer?.path || "#",
      subMenus: [],
    },
  ];

  const navigate = useNavigate();

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
                <span style={{ marginRight: 6, color: "#FFD600", verticalAlign: "middle", display: "inline-flex", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="7" width="14" height="9" rx="2" stroke="#FFD600" strokeWidth="1.5" />
                    <path d="M7 7V5a3 3 0 0 1 6 0v2" stroke="#FFD600" strokeWidth="1.5" />
                  </svg>
                </span>
                {branchName}
              </div>
            )}
            <p className="login_info">
              {userInfo.avatar && (
                <img
                  src={userInfo.avatar}
                  alt="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: 8,
                    verticalAlign: "middle",
                  }}
                />
              )}
              {userInfo.userName}{" "}
              {userInfo.lastLoginDate && `[${userInfo.lastLoginDate}]`} [
              {currentDate}]
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
              {subMenus.map((subMenu1, indexMenu1) => (
                <li key={indexMenu1}>
                  <Link to={subMenu1.path}>{subMenu1.name}</Link>
                  <ul className="gnb_2depth">
                    {subMenu1.subMenus?.map((subMenu2, indexMenu2) => (
                      <li key={indexMenu2}>
                        <a href="#">{subMenu2.name}</a>
                        <ul
                          className={`gnb_3depth ${!indexMenu2 ? "first" : ""}`}
                        >
                          {subMenu2.subMenus?.map((subMenu3, indexMenu3) => (
                            <li key={indexMenu3}>
                              <a href="#">{subMenu3.name}</a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default THeaderHorizontal;
