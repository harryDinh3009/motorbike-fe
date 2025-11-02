import React, { useEffect, useState, ReactNode } from "react";
import styles from "./style.module.css";

interface ContainerBaseProps {
  id?: string;
  children: ReactNode;
}

const ContainerBase: React.FC<ContainerBaseProps> = ({ id, children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    // <div
    //   className={styles.containerComponent}
    //   style={{
    //     padding: isMobile ? 5 : 30,
    //   }}
    // >
    //   {children}
    // </div>
    <div className="box dp_block" id={id ? id : undefined}>
      {children}
    </div>
  );
};

export default ContainerBase;
