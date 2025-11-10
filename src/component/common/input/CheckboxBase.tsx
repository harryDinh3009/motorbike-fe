import React, { useEffect } from "react";
import { Checkbox, Tooltip } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import {
  setRequired,
  removeRequired,
  checkRequired,
} from "@/app/reducer/common/commonSlice";

interface CheckboxBaseProps {
  id: string;
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  required?: boolean;
  tooltip?: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const CheckboxBase: React.FC<CheckboxBaseProps> = ({
  id,
  label,
  checked = false,
  indeterminate = false,
  required = false,
  tooltip,
  disabled = false,
  onChange,
  onFocus,
  onBlur,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isError = useSelector((state: RootState) => state.common.check);

  const handleChange = (e: CheckboxChangeEvent) => {
    onChange?.(e.target.checked);
  };

  const isValidateError = required && !checked && isError;

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
    <Tooltip title={tooltip}>
      <Checkbox
        id={id}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={isValidateError ? "error_validate" : ""}
      >
        {label}
      </Checkbox>
    </Tooltip>
  );
};

export default CheckboxBase;
