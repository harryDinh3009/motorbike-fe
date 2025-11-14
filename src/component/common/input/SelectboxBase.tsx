import React, { useEffect } from "react";
import { Select } from "antd";
import { SelectProps } from "antd/es/select";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import {
  setRequired,
  removeRequired,
  checkRequired,
} from "@/app/reducer/common/commonSlice";

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectboxBaseProps extends Omit<SelectProps, "onChange"> {
  id?: string;
  label?: React.ReactNode;
  options: Option[];
  required?: boolean;
  multiSelect?: boolean;
  onChange?: (value: string | string[]) => void;
  width?: string;
}

const SelectboxBase: React.FC<SelectboxBaseProps> = ({
  id,
  label,
  options,
  required = false,
  multiSelect = false,
  onChange,
  defaultValue,
  width = "150px",
  ...restProps
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isError = useSelector((state: RootState) => state.common.check[id] || false);

  const handleChange = (newValue: string | string[]) => {
    onChange?.(newValue);
    const hiddenInput = document.getElementById(`${id}`) as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = Array.isArray(newValue) ? newValue.join(",") : newValue || "";
    }
    dispatch(checkRequired());
  };

  useEffect(() => {
    if (id && required) {
      dispatch(setRequired(id));
      dispatch(checkRequired());
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
      <Select
        mode={multiSelect ? "multiple" : undefined}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={isError ? "error_validate" : ""}
        options={options}
        style={{ width }}
        {...restProps}
      />
      <input
        type="hidden"
        id={`${id}`}
        value={Array.isArray(defaultValue) ? defaultValue.join(",") : defaultValue || ""}
        required={required}
      />
    </div>
  );
};

export default SelectboxBase;
