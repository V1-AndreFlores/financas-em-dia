import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Category } from '../../domain/entities/Category';

interface CategoriesState {
  items: Category[];
}

const initialState: CategoriesState = {
  items: [],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    categoriesReplaced(state, action: PayloadAction<Category[]>) {
      state.items = action.payload;
    },
    categoryAdded(state, action: PayloadAction<Category>) {
      state.items.push(action.payload);
    },
    categoryArchived(state, action: PayloadAction<string>) {
      const category = state.items.find((item) => item.id === action.payload);

      if (category) {
        category.isActive = false;
      }
    },
  },
});

export const { categoriesReplaced, categoryAdded, categoryArchived } =
  categoriesSlice.actions;
export const categoriesReducer = categoriesSlice.reducer;
