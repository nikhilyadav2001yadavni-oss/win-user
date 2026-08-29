"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { apiFetch } from "@/lib/api";
import {
  setUser,
  setUserLoading,
  setUserError,
} from "@/lib/features/user/userSlice";
import {
  setCurrencies,
  setCurrencyLoading,
  setCurrencyError,
} from "@/lib/features/currency/currencySlice";
import { startLoading, stopLoading } from "@/lib/features/loading/loadingSlice";
export function UserDetailsFetcher() {
  const dispatch = useDispatch();

  const fetchCurrencies = async () => {
    dispatch(setCurrencyLoading(true));

    try {
      const result = await apiFetch("/wallet/currency-list", {
        method: "GET",
      });

      dispatch(setCurrencies(result.data));
    } catch (error) {
      console.error("Failed to fetch currencies:", error);

      dispatch(
        setCurrencyError("Failed to fetch currencies")
      );
    } finally {
      dispatch(setCurrencyLoading(false));
    }
  };
  const fetchUserDetails = async () => {
    dispatch(startLoading());
    dispatch(setUserLoading(true));

    try {
      const result = await apiFetch("/user/user-details", {
        method: "GET",
      });

      dispatch(setUser(result.data));
    } catch (error) {
      console.error("Failed to fetch user details:", error);

      dispatch(
        setUserError("Failed to fetch user details")
      );
    } finally {
      dispatch(setUserLoading(false));
      dispatch(stopLoading());
    }
  };
  useEffect(() => {
    fetchUserDetails();
    fetchCurrencies();
  }, [dispatch]);

  return null;
}
