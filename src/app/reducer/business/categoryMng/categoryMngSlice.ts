import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store";

interface Category {
  id: string;
  name: string;
}

const initialState: Category[] = [];

const categoryMngSlice = createSlice({
  name: "categoryMng",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      return action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.push(action.payload);
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      return state.filter((category) => category.id !== action.payload);
    },
  },
});

export const { setCategories, addCategory, removeCategory } =
  categoryMngSlice.actions;

export const GetListCategoryMng = (state: RootState) => state.categoryMng;

export default categoryMngSlice.reducer;
