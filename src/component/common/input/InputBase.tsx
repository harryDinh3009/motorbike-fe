import React, { useEffect } from "react";
import { Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import {
  setRequired,
  removeRequired,
  checkRequired,
} from "@/app/reducer/common/commonSlice";

interface InputBaseProps {
  id?: string;
  modelValue?: string | number;
  required?: boolean;
  type?: "text" | "number";
  onChange?: (value: string | number) => void;
  [key: string]: any;
  min?: number;
  max?: number;
}

const InputBase: React.FC<InputBaseProps> = ({
  id,
  modelValue = "",
  required = false,
  type = "text",
  onChange,
  min,
  max,
  ...props
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isError = useSelector(
    (state: RootState) => state.common.check[id] || false
  );

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

  useEffect(() => {
    if (id && required) dispatch(checkRequired());
  }, [modelValue, dispatch, id]);

  const checkError = () => {
    const input = document.getElementById(id as string) as HTMLInputElement;
    if (input && required) {
      if (!input.value) {
        input.classList.add("error_validate");
      } else {
        input.classList.remove("error_validate");
      }
    }
  };

  return (
    <Input
      id={id}
      type={type}
      value={modelValue}
      required={required}
      onChange={(e) => {
        const newValue =
          type === "number" ? Number(e.target.value) : e.target.value;
        onChange?.(newValue);
        checkError();
      }}
      onBlur={checkError}
      onFocus={checkError}
      className={isError ? "error_validate" : ""}
      min={type === "number" ? min : undefined}
      max={type === "number" ? max : undefined}
      {...props}
    /> 
  );
};

export default InputBase;
