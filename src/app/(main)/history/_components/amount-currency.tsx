import { getStatusVariant } from "@/lib/utils";

export function AmountCurrency(
  category: string,
  amount: number,
  status: string,
  currency: string,
) {
  const symbols: Record<string, string> = {
    DEPOSIT: "+",
    WITHDRAWAL: "-",
    GAME_LOSE: "-",
    GAME_WIN: "+",
    REFERRAL_BONUS: "-",
    ROI_CREDIT: "+",
    ADMIN_CREDIT: "-",
  };
  if (category === "GAME_LOSE" || category === "ADMIN_CREDIT") {
    status = "FAILED";
  }

  return (
    <span className={`font-medium ${getStatusVariant(status)}`}>
      {symbols[category] ?? ""}
      {amount}{" "}
      {currency}
    </span>
  );
}
