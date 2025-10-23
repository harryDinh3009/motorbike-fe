import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

const initialState: boolean = false;

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
    toggleLoading: (state) => {
      return !state;
    },
  },
});

export const { setLoading, toggleLoading } = loadingSlice.actions;
export const getLoading = (state: RootState) => state.loading;
export default loadingSlice.reducer;
