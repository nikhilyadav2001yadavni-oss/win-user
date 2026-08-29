import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type MonthlyChange = {
  percentage: number;
  period: string;
  balanceAtStart: number;
  currentBalance: number;
};

type Wallet = {
  mainWallet: number;
  gamingWallet: number;
  roiWallet: number;
  totalBalance: number;
  monthlyChange: MonthlyChange;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  country: string;
  city: string;
  profilepicture: string;
  referralCode: string;
  isVerified: boolean;
  pushNotificationStatus: boolean;
  totalReferrals: number;
  totalTeams: number;
  totalEarning: number;
  totalGames: number;
  gameWinningEarning: number;
  themeMode: string;
  fcmToken: string | null;
  createdAt: string;
  updatedAt: string;
  wallet: Wallet;
};

type UserState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
    },

    clearUser: (state) => {
      state.user = null;
    },

    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setUserError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  setUserLoading,
  setUserError,
} = userSlice.actions;

export default userSlice.reducer;
