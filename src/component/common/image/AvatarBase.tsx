import React from "react";
import { Avatar as AntAvatar } from "antd";

interface AvatarProps {
  src: string;
  size?: number;
  alt?: string;
}

const AvatarBase: React.FC<AvatarProps> = ({ src, size = 50, alt }) => {
  return (
    <AntAvatar
      src={src}
      size={size}
      alt={alt || "Avatar"}
      style={{ borderRadius: "50%" }}
    />
  );
};

export default AvatarBase;
