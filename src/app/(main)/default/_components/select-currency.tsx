"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAppSelector } from "@/lib/hooks";

type SelectCurrencyProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function SelectCurrency({
  value,
  onValueChange,
}: SelectCurrencyProps) {
  const currencies = useAppSelector(
    (state) => state.currency.currencies
  );

  // const activeCurrencies = currencies.filter(
  //   (currency) =>
  //     currency.isActive && currency.depositEnabled
  // );

  return (
    <>
    <Combobox
      value={value}
      onValueChange={(newValue) => {
        if (typeof newValue === "string") {
          onValueChange(newValue);
        }
      }}
    >
      <ComboboxInput placeholder="Select a currency" />

      <ComboboxContent>
        <ComboboxList>

          {currencies.map((currency) => (
            <ComboboxItem
              key={currency._id}
              value={currency.symbol}
              className="flex items-center gap-2 py-2 px-2"
              disabled={!currency.depositEnabled}
            >
              {currency.image ? (
                <img
                  src={currency.image}
                  alt={`${currency.symbol} logo`}
                  className="size-8 shrink-0 rounded-full"
                />
              ) : (
                <div
                  className="size-8 shrink-0 rounded-full"
                  style={{
                    backgroundColor: currency.colorCode,
                  }}
                />
              )}

              <div>
                <p>{currency.symbol}</p>

              <span className="text-xs text-muted-foreground">
                {currency.name} ({currency.chain})
              </span>
              </div>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
    </>
  );
}
