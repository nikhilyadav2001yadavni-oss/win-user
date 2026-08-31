import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = "USD", locale = "en-US", minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}

export function categoryToTitle(category: string) {
  const categories: Record<string, string> = {
    DEPOSIT: "Deposit",
    WITHDRAWAL: "Withdrawal",
    GAME_LOSE: "Game Loss",
    GAME_WIN: "Game Win",
    REFERRAL_BONUS: "Referral Bonus",
    ROI_CREDIT: "ROI Credit",
    ADMIN_CREDIT: "Admin Credit",
  };
  return categories[category] ?? "Unknown";
}

export function getStatusVariant(status: string) {
  switch (status) {
    case "COMPLETED":
    case "SUCCESS":
    case "DUPLICATE_HASH":
      return "text-green-700";

    case "PENDING":
      return "text-yellow-600";

    case "FAILED":
    case "REJECTED":
      return "text-destructive";

    default:
      return "outline";
  }
}