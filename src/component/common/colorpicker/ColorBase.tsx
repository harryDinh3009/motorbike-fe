import React from 'react';
import { ColorPicker } from 'antd';
import { Space } from 'antd';

interface ColorBaseProps {
  value: string; 
  onChange: (color: string) => void;
}

const ColorBase: React.FC<ColorBaseProps> = ({ value, onChange }) => {
  const handleColorChange = (colorObject: any) => {
    const color = colorObject?.toHexString();
    onChange(color); 
  };

  return (
    <Space>
      <ColorPicker value={value} onChange={handleColorChange} />
    </Space>
  );
};

export default ColorBase;
