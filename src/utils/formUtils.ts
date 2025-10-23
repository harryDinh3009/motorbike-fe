import { Dispatch, SetStateAction } from "react";

export const handleChange =
  <T>(setter: Dispatch<SetStateAction<T>>, field: keyof T) =>
  (value: string | number | string[]) => {
    setter((prev: T) => ({
      ...prev,
      [field]: value,
    }));
  };
