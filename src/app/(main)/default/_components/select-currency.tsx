"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAppSelector } from "@/lib/hooks";

type SelectCurrencyProps = {
  value: string;
  onValueChange: (value: string) => void;
  type?: "deposit" | "withdrawal";
};

export function SelectCurrency({
  value,
  onValueChange,
  type
}: SelectCurrencyProps) {
  const currencies = useAppSelector(
    (state) => state.currency.currencies
  );

  return (
    <>
      {type === "deposit" && (
        <Select
          value={value}
          onValueChange={onValueChange}
        >
          <SelectTrigger className="w-full rounded-lg bg-muted/30 data-[size=default]:h-12 text-start">
            <SelectValue placeholder="Select a currency" />
          </SelectTrigger>

          <SelectContent position="popper">
            {currencies.map((currency) => (
              <SelectItem
                key={currency._id}
                value={currency.symbol}
                disabled={!currency.depositEnabled}
              >
                <div className="flex items-center gap-2">
                  {currency.image ? (
                    <img
                      src={currency.image}
                      alt={`${currency.symbol} logo`}
                      className="size-6 shrink-0 rounded-full"
                    />
                  ) : (
                    <div
                      className="size-6 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          currency.colorCode || "#10b981",
                      }}
                    />
                  )}

                  <div className="flex flex-col">
                    <span className="font-medium">
                      {currency.symbol}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {currency.name} ({currency.chain})
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {type === "withdrawal" && (
        <div className="absolute left-0 right-0 top-8.5 z-50 overflow-hidden rounded-lg shadow-xl bg-muted">
          {currencies.map((currency) => {

            const isSelected =
              value === currency.symbol;

            return (
              <button
                key={currency.symbol}
                type="button"
                disabled={!currency.withdrawalEnabled}
                onClick={() =>
                  onValueChange(currency.symbol)
                }
                className={`
                            flex w-full items-center gap-4
                            ps-2 pe-4 py-1.5 text-left
                            transition-colors
                            disabled:cursor-not-allowed disabled:opacity-60
                            ${isSelected
                    ? "bg-blue-100 dark:bg-blue-50/10"
                    : "hover:bg-blue-100 dark:hover:bg-blue-50/20"
                  }
                          `}
              >
                {/* Network Icon */}
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-white"

                >
                  {currency.image ? (
                    <img
                      src={currency.image}
                      alt={`${currency.symbol} logo`}
                      className="size-6 shrink-0 rounded-full"
                    />
                  ) : (
                    <div
                      className="size-6 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          currency.colorCode || "#10b981",
                      }}
                    />
                  )}
                </div>

                {/* Name */}
                <div className="flex-1">
                  <p className="font-bold">
                    {currency.symbol}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {currency.name} ({currency.chain})
                  </p>
                </div>

                {/* Selected dot */}
                <span
                  className="size-3 rounded-full"
                  style={{
                    backgroundColor:
                      currency.colorCode || "#10b981",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}