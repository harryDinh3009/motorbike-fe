import React, { useEffect, useState } from "react";
import { DatePicker, DatePickerProps } from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs, { Dayjs } from "dayjs"; // Sử dụng dayjs
import { AppDispatch, RootState } from "@/app/store";
import {
  setRequired,
  removeRequired,
  checkRequired,
} from "@/app/reducer/common/commonSlice";

const { RangePicker } = DatePicker;

interface RangePickerBaseProps extends DatePickerProps {
  id?: string;
  required?: boolean;
  value?: [string | null, string | null];
  onChange?: (
    dates: [string | null, string | null],
    dateStrings: [string | null, string | null]
  ) => void;
}

const RangeDatePickerBase: React.FC<RangePickerBaseProps> = ({
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

  const [internalValue, setInternalValue] = useState<
    [Dayjs | null, Dayjs | null]
  >([
    value?.[0] ? dayjs(value[0], "YYYY-MM-DD") : null,
    value?.[1] ? dayjs(value[1], "YYYY-MM-DD") : null,
  ]);

  useEffect(() => {
    setInternalValue([
      value?.[0] ? dayjs(value[0], "YYYY-MM-DD") : null,
      value?.[1] ? dayjs(value[1], "YYYY-MM-DD") : null,
    ]);
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

  const handleChange = (dates: [Dayjs | null, Dayjs | null]) => {
    const dateStrings = dates.map((date) =>
      date ? date.format("YYYY-MM-DD") : null
    );
    setInternalValue(dates);
    onChange?.(dateStrings, dateStrings);
  };

  return (
    <>
      <RangePicker
        {...props}
        value={internalValue}
        onChange={handleChange}
        className={isError ? "error-validate" : ""}
        style={isError ? { borderColor: "red" } : {}}
        format="YYYY-MM-DD"
      />
      <input
        type="hidden"
        id={id}
        value={internalValue
          .map((date) => (date ? date.format("YYYY-MM-DD") : ""))
          .join(",")}
        required={required}
      />
    </>
  );
};

export default RangeDatePickerBase;
