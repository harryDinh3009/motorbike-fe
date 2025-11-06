import Logo from "@/assets/images/motorbike_logo.png";
import { gnbOneDepth, headerStyle, mobileGnb } from "@/assets/js/common";
import { SCREEN } from "@/router/screen";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserInfo, removeUserInfo } from "@/utils/storage";

type MenuItem = {
  name: string;
  path: string;
  subMenus?: MenuItem[];
};

const THeaderHorizontal = () => {
  const [userInfo, setUserInfo] = useState<{
    userName: string;
    lastLoginDate: string | null;
  }>({
    userName: "",
    lastLoginDate: null,
  });
  const [currentDate, setCurrentDate] = useState<string>("");

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
        });
      }
    } catch {
      setUserInfo({
        userName: "",
        lastLoginDate: null,
      });
    }
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
            <p className="login_info">
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
      <div className="header_bottom">
        <div className="grid_content">
          <nav className="nav_wrap">
            <ul id="gnbMenu" className="gnb_1depth">
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
