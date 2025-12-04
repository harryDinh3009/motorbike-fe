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
  label?: React.ReactNode;
  required?: boolean;
  value?: string;
  onChange?: (date: string | null, dateString: string) => void;
  dateOnly?: boolean; // Thêm prop này
}

const DatePickerBase: React.FC<DatePickerBaseProps> = ({
  id,
  label,
  required = false,
  value,
  onChange,
  dateOnly = false, // default: false
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


  // Parse datetime string as local time (không convert timezone)
  // Nếu value có format ISO với Z (UTC), parse như local time để tránh lệch -7 giờ
  const parseValueAsLocal = (val: string): Dayjs | null => {
    if (!val) return null;
    
    // Nếu là dateOnly format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return dayjs(val);
    }
    
    // Nếu có timezone Z hoặc +00:00, loại bỏ và parse như local time
    const normalized = val.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
    // Handle format: "2024-12-02T17:12:00" or "2024-12-02 17:12:00"
    const [datePart, timePart] = normalized.split(/[T ]/);
    if (!datePart) return null;
    
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour = 0, minute = 0, second = 0] = (timePart || "00:00:00").split(":").map(Number);
    
    return dayjs(new Date(year, month - 1, day, hour, minute, second));
  };

  const dayjsValue: Dayjs | null = value ? parseValueAsLocal(value) : null;

  const handleChange = (date: Dayjs | null) => {
    if (dateOnly) {
      const dateString = date ? date.format("YYYY-MM-DD") : "";
      onChange?.(dateString, dateString);
    } else {
      // Format local time string thay vì toISOString() để tránh timezone conversion
      // Format: YYYY-MM-DDTHH:mm:ss (không có Z, không có timezone offset)
      const localTimeString = date ? date.format("YYYY-MM-DDTHH:mm:ss") : null;
      onChange?.(localTimeString, localTimeString || "");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 13,
            color: "#666",
            fontWeight: 500,
            marginBottom: 0,
            lineHeight: 1.4,
          }}
        >
          {label}
        </label>
      )}
      <DatePicker
        {...props}
        value={dayjsValue}
        onChange={handleChange}
        // Nếu dateOnly thì không showTime, format ngày thôi
        showTime={dateOnly ? false : { format: "HH:mm:ss" }}
        format={dateOnly ? "DD/MM/YYYY" : "DD/MM/YYYY HH:mm:ss"}
        picker={dateOnly ? "date" : undefined}
        className={isError ? "error-validate" : ""}
        style={isError ? { borderColor: "red" } : {}}
      />
      <input
        type="hidden"
        id={`${id}`}
        value={value || ""} 
        required={required}
      />
    </div>
  );
};

export default DatePickerBase;
