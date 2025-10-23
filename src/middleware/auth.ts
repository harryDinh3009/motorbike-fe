import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CommonService from "@/service/common/CommonService";
import { getUserInfo } from "@/utils/storage";
import { SCREEN } from "@/router/screen";

const authMiddleware = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userInfo = getUserInfo();

    if (!userInfo && location.pathname !== SCREEN.login.path) {
      CommonService.logout();
      navigate(SCREEN.login.path);
    }

    if (userInfo && location.pathname === SCREEN.login.path) {
      navigate(SCREEN.dashboard.path);
    }
  }, [navigate, location]);
};

export default authMiddleware;
