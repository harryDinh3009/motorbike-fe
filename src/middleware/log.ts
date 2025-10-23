import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const logMiddleware = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("log middleware");
    console.log(`Navigated to: ${location.pathname}`);
  }, [location]);
};

export default logMiddleware;
