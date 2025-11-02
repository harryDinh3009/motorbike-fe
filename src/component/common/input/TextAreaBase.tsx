import React, { useEffect, useState } from "react";
import { Input, Tooltip } from "antd";
import { TextAreaProps } from "antd/es/input";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store";
import { setRequired, removeRequired, checkRequired } from "@/app/reducer/common/commonSlice";

interface TextAreaBaseProps extends Omit<TextAreaProps, "onChange"> {
  id: string;
  label?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

const TextAreaBase: React.FC<TextAreaBaseProps> = ({
  id,
  label,
  required = false,
  onChange,
  rows = 5,
  ...restProps
}) => {
  const [value, setValue] = useState<string | undefined>(restProps.defaultValue);
  const [touched, setTouched] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleFocus = () => {
    if (id && required) {
      dispatch(checkRequired());
    }
    setTouched(true);
  };

  const handleBlur = () => {
    if (id && required) {
      dispatch(checkRequired());
    }
  };

  useEffect(() => {
    if (id && required) {
      dispatch(setRequired(id));
    }
    return () => {
      if (id && required) {
        dispatch(removeRequired(id));
      }
    };
  }, [dispatch, id, required]);

  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <Tooltip title={restProps.tooltip}>
        <Input.TextArea
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={required && touched && !value ? "error_validate" : ""}
          rows={rows}
          {...restProps}
        />
      </Tooltip>
    </div>
  );
};

export default TextAreaBase;
