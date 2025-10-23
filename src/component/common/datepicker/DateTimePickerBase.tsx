import React, { useEffect, useState } from "react";
import { DatePicker, DatePickerProps } from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs, { Dayjs } from "dayjs"; // Sử dụng dayjs để thay thế moment
import { AppDispatch, RootState } from "@/app/store";
import {
  setRequired,
  removeRequired,
  checkRequired,
} from "@/app/reducer/common/commonSlice";

interface DateTimePickerBaseProps extends DatePickerProps {
  id?: string;
  required?: boolean;
  value?: string;
  onChange?: (date: string | null, dateString: string) => void;
}

const DateTimePickerBase: React.FC<DateTimePickerBaseProps> = ({
  id,
  required = false,
  value,
  onChange,
  ...props
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isError = useSelector(
    (state: RootState) => state.common.check[id] || false
  );

  const [internalValue, setInternalValue] = useState<Dayjs | null>(
    value ? dayjs(value, "YYYY-MM-DD HH:mm:ss") : null
  );

  useEffect(() => {
    setInternalValue(value ? dayjs(value, "YYYY-MM-DD HH:mm:ss") : null);
  }, [value]);

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
  }, [internalValue, dispatch, id]);

  const handleChange = (date: Dayjs | null) => {
    const dateString = date ? date.format("YYYY-MM-DD HH:mm:ss") : null;
    setInternalValue(date);
    onChange?.(dateString, dateString);
  };

  return (
    <>
      <DatePicker
        {...props}
        showTime
        value={internalValue}
        onChange={handleChange}
        className={isError ? "error-validate" : ""}
        style={isError ? { borderColor: "red" } : {}}
      />
      <input
        type="hidden"
        id={id}
        value={internalValue ? internalValue.format("YYYY-MM-DD HH:mm:ss") : ""}
        required={required}
      />
    </>
  );
};

export default DateTimePickerBase;
