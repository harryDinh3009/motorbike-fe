import React from "react";
import { Rate } from "antd";

interface RateBaseProps {
  value: number; 
  onChange: (value: number) => void; 
  allowHalf?: boolean;
}

const RateBase: React.FC<RateBaseProps> = ({
  value,
  onChange,
  allowHalf = false,
}) => {
  return (
    <Rate
      value={value}
      onChange={onChange}
      allowHalf={allowHalf} 
    />
  );
};

export default RateBase;
