import React from "react";

interface IconRightProps {
  width?: number; // Optional width prop
  height?: number; // Optional height prop
  fill?: string; // Optional fill color prop
}

const IconRight: React.FC<IconRightProps> = ({
  width = 24, // Default width
  height = 24, // Default height
  fill = "rgba(0, 0, 0, 1)", // Default fill color
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      style={{ fill }}
    >
      <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z" />
    </svg>
  );
};

export default IconRight;
