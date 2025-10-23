import React from "react";
import { SCREEN } from "./screen";
import authMiddleware from "@/middleware/auth";

const getView = (path: string) => {
  return React.lazy(() => import(`../views/${path}`));
};

const getLayout = (path: string) => {
  return React.lazy(() => import(`../layouts/${path}`));
};

type RouteType = {
  path: string;
  name?: string;
  component: React.FC;
  meta?: {
    title?: string;
    middleware?: Array<(context: any) => void>;
  };
  children?: RouteType[];
};

export const routes: RouteType[] = [
  {
    path: "/",
    component: getLayout("DefaultLayout"),
    meta: {
      middleware: [authMiddleware],
    },
    children: [
      {
        path: SCREEN.dashboard.path,
        name: SCREEN.dashboard.name,
        component: getView("dashboard/index"),
      },
      {
        path: SCREEN.contractMng.path,
        name: SCREEN.contractMng.name,
        component: getView("contract/index"),
      },
    ],
  },
  {
    path: SCREEN.template.path,
    name: SCREEN.template.name,
    meta: { title: "Template UI" },
    component: getView("Template"),
  },
  {
    path: SCREEN.login.path,
    name: SCREEN.login.name,
    meta: {
      middleware: [authMiddleware],
    },
    component: getView("LoginView"),
  },
  {
    path: SCREEN.internalError.path,
    name: SCREEN.internalError.name,
    component: getView("InternalError"),
  },
  {
    path: SCREEN.notFound.path,
    name: SCREEN.notFound.name,
    meta: { title: "Not Found" },
    component: getView("NotFound"),
  },
];
