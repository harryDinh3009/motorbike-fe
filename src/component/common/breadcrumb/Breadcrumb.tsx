import React from "react";
import { Breadcrumb } from "antd";
import { useNavigate } from "react-router-dom";
import type { BreadcrumbProps } from "antd/es/breadcrumb";
import type { ReactNode, CSSProperties } from "react";
import styles from "./breadcrumbBase.module.css";

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
  style?: CSSProperties;
}

interface BreadcrumbBaseProps extends BreadcrumbProps {
  items: BreadcrumbItem[];
  title: string;
}

const BreadcrumbBase: React.FC<BreadcrumbBaseProps> = ({
  items,
  title,
  ...props
}) => {
  const navigate = useNavigate();

  const handleItemClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className={styles.breadcrumbContainer}>
      <h2 className={styles.breadcrumbTitle}>{title}</h2>
      <Breadcrumb {...props} className={styles.breadcrumb}>
        {items.map((item, index) => (
          <Breadcrumb.Item
            key={index}
            onClick={() => handleItemClick(item.path)}
            className={styles.breadcrumbItem}
            style={{
              ...(item.style || {}),
            }}
          >
            {item.icon && <span style={{ marginRight: 5 }}>{item.icon}</span>}
            <span>{item.label}</span>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbBase;
