import React from "react";
import { Button, Empty, Typography } from "antd";

interface EmptyBaseProps {
  image?: string; 
  imageStyle?: React.CSSProperties; 
  description?: React.ReactNode; 
  buttonLabel?: string;
  onButtonClick?: () => void;
}

const EmptyBase: React.FC<EmptyBaseProps> = ({
  image = "https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg",
  imageStyle,
  description = <Typography.Text>Không có dữ liệu.</Typography.Text>,
  buttonLabel,
  onButtonClick,
}) => {
  return (
    <Empty image={image} imageStyle={imageStyle} description={description}>
      {buttonLabel && onButtonClick && (
        <Button type="primary" onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      )}
    </Empty>
  );
};

export default EmptyBase;
