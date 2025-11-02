import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ISave {
  [key: string]: string | object;
}

interface CommonState {
  loading: boolean;
  check: boolean;
  arrRequired: string[];
  saveValueSearch: ISave;
}

const initialState: CommonState = {
  loading: false,
  check: true,
  arrRequired: [],
  saveValueSearch: {},
};

export const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRequired: (state, action: PayloadAction<string>) => {
      if (!state.arrRequired.includes(action.payload)) {
        state.arrRequired.push(action.payload);
      }
      commonSlice.caseReducers.checkRequired(state);
    },
    removeRequired: (state, action: PayloadAction<string>) => {
      state.arrRequired = state.arrRequired.filter(
        (id) => id !== action.payload
      );
      commonSlice.caseReducers.checkRequired(state);
    },
    checkRequired: (state) => {
      const hasEmptyField = state.arrRequired.some((id) => {
        const inputElement = document.getElementById(
          id
        ) as HTMLInputElement | null;

        const value = inputElement ? inputElement.value : undefined;
        return (
          !inputElement || (value !== undefined && value.trim().length === 0)
        );
      });

      state.check = hasEmptyField;
    },
    setSaveValueSearch: (state, action: PayloadAction<ISave>) => {
      state.saveValueSearch = action.payload;
    },
  },
});

export const {
  setLoading,
  setRequired,
  removeRequired,
  checkRequired,
  setSaveValueSearch,
} = commonSlice.actions;

export default commonSlice.reducer;
