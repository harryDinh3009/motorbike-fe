// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import loadingSlice from "./reducer/common/loadingSlice";
import categoryMngSlice from "./reducer/business/categoryMng/categoryMngSlice";
import commonSlice from "./reducer/common/commonSlice";

export const store = configureStore({
  reducer: {
    common: commonSlice,
    loading: loadingSlice,
    categoryMng: categoryMngSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const dispatch: AppDispatch = store.dispatch;
export const getState: () => RootState = store.getState;
