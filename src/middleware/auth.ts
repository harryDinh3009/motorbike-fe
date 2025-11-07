import { getUserInfo } from "@/utils/storage";
import { SCREEN } from "@/router/screen";
import { MiddlewareContext } from "@/router";
import { getToken, isTokenExpired } from "@/utils/token";

const authMiddleware = ({ from, to, next }: MiddlewareContext) => {
  const userInfoStr = getUserInfo();
  let userInfo: any = null;
  try {
    userInfo = JSON.parse(userInfoStr || "null");
  } catch {
    userInfo = null;
  }
  const token = getToken();

  if (
    !token ||
    !userInfo ||
    typeof userInfo !== "object" ||
    Object.keys(userInfo).length === 0
  ) {
    if (to !== SCREEN.login.path) {
      next(SCREEN.login.path);
    } else {
      next();
    }
  } else if (isTokenExpired(token)) {
    next(SCREEN.login.path);
  } else if (to === SCREEN.login.path) {
    next(SCREEN.dashboard.path);
  } else {
    next();
  }
};

export default authMiddleware;
