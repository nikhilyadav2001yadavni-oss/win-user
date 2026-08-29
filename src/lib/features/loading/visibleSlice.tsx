import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VisibleState {
  isVisible: boolean;
}

const initialState: VisibleState = {
  isVisible: true,
};

const visibleSlice = createSlice({
  name: "visible",
  initialState,
  reducers: {
    setVisible: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
  },
});

export const {
  setVisible,
} = visibleSlice.actions;

export default visibleSlice.reducer;
