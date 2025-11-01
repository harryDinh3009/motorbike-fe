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
      {
        path: SCREEN.contractCreate.path,
        name: SCREEN.contractCreate.name,
        component: getView("contract/create"),
      },
      {
        path: SCREEN.contractDetail.path,
        name: SCREEN.contractDetail.name,
        component: getView("contract/detail"),
      },
      {
        path: SCREEN.branch.path,
        name: SCREEN.branch.name,
        component: getView("branch/index"),
      },
      {
        path: SCREEN.employee.path,
        name: SCREEN.employee.name,
        component: getView("employee/index"),
      },
      {
        path: SCREEN.customer.path,
        name: SCREEN.customer.name,
        component: getView("customer/index"),
      },
      {
        path: SCREEN.surcharge.path,
        name: SCREEN.surcharge.name,
        component: getView("surcharge/index"),
      },
      {
        path: SCREEN.motorbike.path,
        name: SCREEN.motorbike.name,
        component: getView("motorbike/index"),
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
