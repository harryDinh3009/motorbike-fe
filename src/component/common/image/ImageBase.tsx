import React from "react";
import { Image } from "antd";

interface ImageBaseProps {
  width?: number;
  height?: number;
  src: string;
  alt?: string;
}

const ImageBase: React.FC<ImageBaseProps> = ({
  width = 200,
  height,
  src,
  alt,
}) => {
  return (
    <Image
      width={width}
      height={height || width}
      src={src}
      alt={alt || "Image"}
      style={{ objectFit: "cover" }}
    />
  );
};

export default ImageBase;
