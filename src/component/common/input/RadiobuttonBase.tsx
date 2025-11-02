import React, { useEffect, useState } from "react";
import { Radio } from "antd";
import { RadioGroupProps } from "antd/es/radio";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store";
import { setRequired } from "@/app/reducer/common/commonSlice";

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface RadioButtonBaseProps extends Omit<RadioGroupProps, "onChange"> {
  id: string;
  label?: string;
  options: Option[];
  required?: boolean;
  tooltip?: string;
  onChange?: (value: string | number) => void;
}

const RadioButtonBase: React.FC<RadioButtonBaseProps> = ({
  id,
  label,
  options,
  required = false,
  onChange,
  ...restProps
}) => {
  const [value, setValue] = useState<string | number | undefined>(
    restProps.defaultValue
  );
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (newValue: string | number) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  useEffect(() => {
    if (id && required) {
      dispatch(setRequired(id));
    }
  }, [dispatch, id, required]);

  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <Radio.Group
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        {...restProps}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
};

export default RadioButtonBase;
