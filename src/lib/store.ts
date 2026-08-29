import { configureStore } from "@reduxjs/toolkit";
import loadingReducer from "./features/loading/loadingSlice";
import visibleReducer from "./features/loading/visibleSlice";
import userReducer from "./features/user/userSlice";
import currencyReducer from "./features/currency/currencySlice"

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
    visible: visibleReducer,
    user: userReducer,
    currency: currencyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
