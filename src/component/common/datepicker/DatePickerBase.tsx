import React, { useEffect } from "react";
import { DatePicker, DatePickerProps } from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs, { Dayjs } from "dayjs"; // Thay thế moment bằng dayjs
import { AppDispatch, RootState } from "@/app/store";
import {
  setRequired,
  removeRequired,
  checkRequired,
} from "@/app/reducer/common/commonSlice";

interface DatePickerBaseProps extends DatePickerProps {
  id?: string;
  required?: boolean;
  value?: string;
  onChange?: (date: string | null, dateString: string) => void;
}

const DatePickerBase: React.FC<DatePickerBaseProps> = ({
  id,
  required = false,
  value,
  onChange,
  ...props
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isError = useSelector(
    (state: RootState) => state.common.check[id || ""] || false
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
  }, [value, dispatch, id]);


  // Parse value as ISO string for full date-time
  const dayjsValue: Dayjs | null = value ? dayjs(value) : null;

  const handleChange = (date: Dayjs | null) => {
    // Output ISO string for full date-time
    const isoString = date ? date.toISOString() : null;
    onChange?.(isoString, isoString || "");
  };

  return (
    <>
      <DatePicker
        {...props}
        value={dayjsValue}
        onChange={handleChange}
        showTime={{ format: "HH:mm:ss" }}
        format="YYYY-MM-DD HH:mm:ss"
        className={isError ? "error-validate" : ""}
        style={isError ? { borderColor: "red" } : {}}
      />
      <input
        type="hidden"
        id={`${id}`}
        value={value || ""} 
        required={required}
      />
    </>
  );
};

export default DatePickerBase;
