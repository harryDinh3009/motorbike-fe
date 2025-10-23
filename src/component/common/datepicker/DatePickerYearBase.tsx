import React, { useEffect, useState } from "react";
import { DatePicker, DatePickerProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import {
  setRequired,
  removeRequired,
  checkRequired,
} from "@/app/reducer/common/commonSlice";

interface DatePickerYearBaseProps extends DatePickerProps {
  id?: string;
  required?: boolean;
  value?: string;
  onChange?: (date: string | null, dateString: string) => void;
}

const DatePickerYearBase: React.FC<DatePickerYearBaseProps> = ({
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
    value ? dayjs(value, "YYYY") : null
  );

  useEffect(() => {
    setInternalValue(value ? dayjs(value, "YYYY") : null);
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
    const dateString = date ? date.format("YYYY") : null;
    setInternalValue(date);
    onChange?.(dateString, dateString);
  };

  return (
    <>
      <DatePicker
        {...props}
        picker="year"
        value={internalValue}
        onChange={handleChange}
        className={isError ? "error-validate" : ""}
        style={isError ? { borderColor: "red" } : {}}
      />
      <input
        type="hidden"
        id={id}
        value={internalValue ? internalValue.format("YYYY") : ""}
        required={required}
      />
    </>
  );
};

export default DatePickerYearBase;
