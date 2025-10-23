import React from "react";

interface IconLeftProps {
  width?: number;
  height?: number; 
  fill?: string;
}

const IconLeft: React.FC<IconLeftProps> = ({
  width = 24, 
  height = 24,
  fill = "rgba(0, 0, 0, 1)",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      style={{ fill }}
    >
      <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />
    </svg>
  );
};

export default IconLeft;
