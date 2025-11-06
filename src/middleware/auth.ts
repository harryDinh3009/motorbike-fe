import { getUserInfo } from "@/utils/storage";
import { SCREEN } from "@/router/screen";
import { getToken, isTokenExpired } from "@/utils/token";

const authMiddleware = ({ from, to, next }) => {
  const userInfo = JSON.parse(getUserInfo() || "{}");
  const token = getToken();

  if (!token || !userInfo) {
    next(SCREEN.login.path);
  } else if (isTokenExpired(token)) {
    next(SCREEN.login.path);
  } else if (to === SCREEN.login.path) {
    next(SCREEN.dashboard.path);
  } else {
    next();
  }
};

export default authMiddleware;
