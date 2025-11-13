import React, { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import TFooter from "./components/TFooter";
import THeaderHorizontal from "./components/horizontalMenu/THeaderHorizontal";

const DefaultLayout: React.FC<PropsWithChildren> = () => {
  return (
    <div className="page_wrap">
      {/* Header */}
      <header>
        <THeaderHorizontal />
      </header>

      {/* Main Content */}
      <main id="main_content">
        <Outlet />
      </main>

      {/* Footer */}
      <TFooter />
    </div>
  );
};

export default DefaultLayout;
