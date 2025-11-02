import React from "react";
import { Button, ButtonProps } from "antd";
import styles from "./style.module.css"

interface ButtonBaseProps extends ButtonProps {
  label: string;
}

const ButtonBase: React.FC<ButtonBaseProps> = ({ label, ...props }) => {
  return <Button {...props}>{label}</Button>;
};

export default ButtonBase;