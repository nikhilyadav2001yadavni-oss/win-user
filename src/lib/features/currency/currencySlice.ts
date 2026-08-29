import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Currency = {
    _id: string;
    symbol: string;
    name: string;
    chain: string;
    colorCode: string;
    image: string | null;

    minimumDepositAmount: number;
    minimumWithdrawalAmount: number;

    depositFee: number;
    depositFeeType: "fixed" | "percentage";
    depositAddress: string;
    withdrawalFee: number;
    withdrawalFeeType: "fixed" | "percentage";

    isActive: boolean;
    depositEnabled: boolean;
    withdrawalEnabled: boolean;

    __v: number;
    createdAt: string;
    updatedAt: string;
};

type CurrencyState = {
    currencies: Currency[];
    isLoading: boolean;
    error: string | null;
};

const initialState: CurrencyState = {
    currencies: [],
    isLoading: false,
    error: null,
};

const currencySlice = createSlice({
    name: "currency",
    initialState,

    reducers: {
        setCurrencies: (
            state,
            action: PayloadAction<Currency[]>
        ) => {
            state.currencies = action.payload;
            state.error = null;
        },

        clearCurrencies: (state) => {
            state.currencies = [];
        },

        setCurrencyLoading: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.isLoading = action.payload;
        },

        setCurrencyError: (
            state,
            action: PayloadAction<string | null>
        ) => {
            state.error = action.payload;
        },
    },
});

export const {
    setCurrencies,
    clearCurrencies,
    setCurrencyLoading,
    setCurrencyError,
} = currencySlice.actions;

export default currencySlice.reducer;
