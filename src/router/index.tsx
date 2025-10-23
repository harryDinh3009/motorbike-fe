import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { routes } from "./router";

type RouteType = {
  path: string;
  component: React.FC;
  meta?: {
    title?: string;
    middleware?: Array<(context: any) => void>;
  };
  children?: RouteType[];
};

type MiddlewareContext = {
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
  from: RouteType,
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
        if (path) navigate(path);
      },
    };

    const runMiddleware = (index: number) => {
      if (index < middlewares.length) {
        middlewares[index]({
          ...context,
          next: () => runMiddleware(index + 1),
        });
      }
    };

    runMiddleware(0);
  }
};
const RouteWithMiddleware: React.FC<RouteType> = (route) => {
  const Component = route.component;
  // Nếu có children, giả sử là layout, truyền children là <Outlet />
  if (route.children && route.children.length > 0) {
    return (
      <Suspense>
        {React.createElement(Component, undefined, <Outlet />)}
      </Suspense>
    );
  }
  // Nếu không phải layout, chỉ render component
  return (
    <Suspense>
      {React.createElement(Component)}
    </Suspense>
  );
};

// Đệ quy để render nested routes
const renderRoutes = (routes: RouteType[]) => {
  return routes.map((route, index) => {
    if (route.children && route.children.length > 0) {
      return (
        <Route
          key={index}
          path={route.path}
          element={<RouteWithMiddleware {...route} />}
        >
          {renderRoutes(route.children)}
        </Route>
      );
    }
    return (
      <Route
        key={index}
        path={route.path}
        element={<RouteWithMiddleware {...route} />}
      />
    );
  });
};
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>{renderRoutes(routes)}</Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
