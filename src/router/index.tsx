import { Suspense, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { routes, RouteType } from "./router";
import { useTranslation } from "react-i18next";
import { SCREEN } from "./screen";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";

export type MiddlewareContext = {
  from: string;
  to: string;
  next: (path?: string) => void;
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

const applyMiddleware = (
  to: RouteType,
  from: { path: string },
  navigate: (path: string) => void
) => {
  if (to.meta?.middleware) {
    const middlewares = Array.isArray(to.meta.middleware)
      ? to.meta.middleware
      : [to.meta.middleware];

    const context: MiddlewareContext = {
      from: from.path,
      to: to.path,
      next: (path?: string) => {
        if (path) {
          navigate(path);
        }
      },
    };

    const runMiddleware = (index: number) => {
      if (index < middlewares.length) {
        middlewares[index](context);
      }
    };

    runMiddleware(0);
  }
};

const RouteWithMiddleware: React.FC<RouteType> = (route) => {
  const Component = route.component;
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const from = { path: location.pathname };
    applyMiddleware(route, from, navigate);
    if (route.meta?.title) {
      document.title = "Motogo";
    }
  }, [location.pathname, route.meta?.title, t]);

  if (!Component) return null;
  return (
    <Suspense
      fallback={
        <>
          <LoadingIndicator />
        </>
      }
    >
      <Component />
    </Suspense>
  );
};

const renderRoutes = (route: RouteType): JSX.Element => {
  return (
    <Route
      key={route.path}
      path={route.path}
      element={<RouteWithMiddleware {...route} />}
    >
      {route.children &&
        route.children.length > 0 &&
        route.children.map((child) => renderRoutes(child))}
    </Route>
  );
};

const AppRouter: React.FC = () => {
  return (
    <>
      {" "}
      <ScrollToTop />
      <Routes>
        <Route element={<ScrollToTop />} />
        {routes.map((route) => renderRoutes(route))}
        <Route path="*" element={<Navigate to={SCREEN.login.path} replace />} />
      </Routes>
    </>
  );
};

export default AppRouter;
