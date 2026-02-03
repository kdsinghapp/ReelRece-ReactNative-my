// redux/slices/multiSelectSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MultiSelectState {
  isMultiSelectMode: boolean;
}

const initialState: MultiSelectState = {
  isMultiSelectMode: false,
};

const multiSelectSlice = createSlice({
  name: 'multiSelect',
  initialState,
  reducers: {
    setMultiSelectMode: (state, action: PayloadAction<boolean>) => {
      state.isMultiSelectMode = action.payload;
    },
    toggleMultiSelectMode: (state) => {
      state.isMultiSelectMode = !state.isMultiSelectMode;
    },
  },
});

export const { setMultiSelectMode, toggleMultiSelectMode } = multiSelectSlice.actions;
export default multiSelectSlice.reducer;
