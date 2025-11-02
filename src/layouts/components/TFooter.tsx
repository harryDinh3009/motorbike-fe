import React, { useEffect } from "react";
import { moveTop } from "@/assets/js/common";
import { Link } from "react-router-dom";
import Logo4sDigital from "@/assets/images/common/logo_no_text_white.png";

const TFooter: React.FC = () => {
  useEffect(() => {
    moveTop();
  }, []);

  return (
    <div id="footer" className="footer_wrap">
      <p className="copyright" style={{ fontSize: 13, fontWeight: 500 }}>
        <img
          src={Logo4sDigital}
          alt=""
          style={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            marginRight: 5,
          }}
        />{" "}
        Copyright © 2024 - Developed by{" "}
        <Link
          to={`https://4sdigital.vn`}
          style={{ color: "#003770" }}
          target="_blank"
        >
          <span
            style={{ textDecoration: "underline", fontWeight: 500,fontStyle: "italic"  }}
            className="digital-services"
          >
            4S Digital Services
          </span>
        </Link>
      </p>
      <a
        href="javascript:void(0);"
        className="move_top"
        title="페이지 상단으로 이동"
      >
        TOP
      </a>
    </div>
  );
};

export default TFooter;
