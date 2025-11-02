import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import {
  setRequired,
  removeRequired,
  checkRequired,
} from "@/app/reducer/common/commonSlice";

export const useRequiredValidation = (
  id: string,
  required: boolean,
  value: any
) => {
  const dispatch = useDispatch<AppDispatch>();
  const isError = useSelector((state: RootState) =>
    required && !value ? state.common.check[id] : false
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
    if (required) {
      dispatch(checkRequired());
    }
  }, [value, dispatch, required]);

  return isError;
};
