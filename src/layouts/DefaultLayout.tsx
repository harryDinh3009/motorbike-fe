import React, { PropsWithChildren } from "react";
import TFooter from "./components/TFooter";
import THeaderHorizontal from "./components/horizontalMenu/THeaderHorizontal";

const DefaultLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="page_wrap">
      {/* Header */}
      <header>
        <THeaderHorizontal />
      </header>

      {/* Main Content */}
      <main id="main_content">{children}</main>

      {/* Footer */}
      <TFooter />
    </div>
  );
};

export default DefaultLayout;
