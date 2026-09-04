"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Info,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectCurrency } from "./select-currency";
import { apiFetch } from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "sonner";

type DepositStep = "amount" | "deposit";

type DepositDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function DepositDialog({
  open,
  setOpen,
}: DepositDialogProps) {
  const [step, setStep] = useState<DepositStep>("amount");

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETH");

  const [walletAddress, setWalletAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencies = useAppSelector(
    (state) => state?.currency.currencies
  );

  const selectedCurrency = currencies.find(
    (item) => item.symbol === currency
  );
  const depositAddress = selectedCurrency?.depositAddress ?? "";

  /*
   * Values now come from the API
   */
  const minimumDepositAmount =
    selectedCurrency?.minimumDepositAmount ?? 0;

  const depositFee =
    selectedCurrency?.depositFee ?? 0;

  const depositFeeType =
    selectedCurrency?.depositFeeType ?? "fixed";

  const network =
    selectedCurrency?.chain ?? "";

  const numericAmount = Number(amount) || 0;

  /*
   * Calculate fee based on API configuration
   */
  const calculatedFee =
    depositFeeType === "percentage"
      ? (numericAmount * depositFee) / 100
      : depositFee;

  const finalAmount = Math.max(
    numericAmount - calculatedFee,
    0
  );

  const isValidAmount =
    numericAmount >= minimumDepositAmount &&
    selectedCurrency?.depositEnabled === true;

  const handleContinue = () => {
    if (!isValidAmount) return;

    console.log("Creating deposit:", {
      currency,
      amount: numericAmount,
      fee: calculatedFee,
      finalAmount,
      network,
    });

    setStep("deposit");
  };

  const handleBack = () => {
    setStep("amount");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        depositAddress
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const handleClose = (value: boolean) => {
    setOpen(value);

    if (!value) {
      setTimeout(() => {
        setStep("amount");
        setAmount("");
        setWalletAddress("");
        setTransactionHash("");
        setCopied(false);
      }, 200);
    }
  };

  const handleSubmit = async () => {
    if (!walletAddress || !transactionHash) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await apiFetch("/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({
          currency,
          amount: numericAmount,
          toAddress: depositAddress,
          fromAddress: walletAddress,
          transactionHash,
        }),
      });

      console.log(
        "Deposit submitted successfully:",
        result
      );

      toast.success(result.message);

      setOpen(false);
    } catch (error: any) {
      console.error(
        "Deposit submission failed:",
        error
      );
      toast.error(error?.message ?? "Failed to submit deposit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg overflow-visible p-0">

        {/* ================================================== */}
        {/* STEP 1 - AMOUNT */}
        {/* ================================================== */}

        {step === "amount" && (
          <>
            <DialogHeader className="border-b px-6 py-2 gap-0">
              <DialogTitle className="text-center text-lg font-bold">
                Deposit
              </DialogTitle>

              <p className="text-center text-sm text-muted-foreground">
                Enter your {currency} deposit amount
              </p>
            </DialogHeader>

            <div className="space-y-4 px-6 pb-5">

              {/* Currency */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Currency
                </Label>

                <SelectCurrency
                  value={currency}
                  onValueChange={setCurrency}
                  type="deposit"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Enter Amount
                </Label>

                <div className="relative">
                  <Input
                    type="text"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    className="rounded-lg bg-muted/30 pr-20"
                    placeholder="0"
                  />

                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    {currency}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Minimum deposit amount is{" "}
                  {currency} {minimumDepositAmount}
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-lg border bg-muted/20 px-5 py-1">

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-muted-foreground">
                    Deposit Amount
                  </span>

                  <span className="text-sm font-medium">
                    {currency} {amount || "0"}
                  </span>
                </div>

                <div className="border-t" />

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-muted-foreground">
                    Deposit Fee
                  </span>

                  <span className="text-sm font-medium">
                    {currency}{" "}
                    {calculatedFee.toFixed(2)}
                  </span>
                </div>

                <div className="border-t" />

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm font-bold">
                    Final Amount to Credit
                  </span>

                  <span className="text-sm font-bold text-emerald-500">
                    {currency}{" "}
                    {finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-5 py-3 text-blue-600 dark:border-blue-900 dark:bg-blue-950/30">
                <Info className="mt-0.5 size-4 shrink-0" />

                <p className="text-xs">
                  Your deposit will be credited after blockchain
                  confirmation. This typically takes 5-10 minutes
                  depending on network congestion.
                </p>
              </div>

              {/* Continue */}
              <Button
                className="h-12 w-full rounded-lg text-base font-semibold cursor-pointer"
                disabled={!isValidAmount}
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* ================================================== */}
        {/* STEP 2 - DEPOSIT */}
        {/* ================================================== */}

        {step === "deposit" && (
          <>
            <DialogHeader className="border-b px-6 py-2">
              <div className="flex items-center gap-3">

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="rounded-full"
                >
                  <ArrowLeft className="size-5" />
                </Button>

                <div className="flex-1">
                  <DialogTitle className="text-center text-lg font-bold">
                    Deposit
                  </DialogTitle>

                  <p className="text-center text-sm text-muted-foreground">
                    Send {currency} to the address below
                  </p>
                </div>

                <div className="size-10" />
              </div>
            </DialogHeader>

            <div className="max-h-[75vh] space-y-3 overflow-y-auto px-6 pb-5 no-scrollbar">

              {/* Deposit Amount */}
              <div className="rounded-lg border border-emerald-500/70 bg-emerald-50 px-5 py-3 text-center dark:bg-emerald-950/30">

                <p className="text-sm text-emerald-900 dark:text-emerald-200">
                  Deposit Amount
                </p>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {amount}
                  </span>

                  <span
                    className="flex size-5 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      backgroundColor:
                        selectedCurrency?.colorCode ??
                        "#10b981",
                    }}
                  >
                    {currency.charAt(0)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-emerald-700/70 dark:text-emerald-300/70">
                  {network} Network
                </p>
              </div>

              {/* QR Code */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold">
                  Scan QR Code
                </h3>

                <div className="rounded-lg border bg-white p-2 text-center">
                  <div className="mx-auto flex aspect-square max-w-31.25 items-center justify-center">
                    <QRCodeSVG
                      value={depositAddress}
                      size={125}
                      level="H"
                    />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Scan this QR code with your wallet app
                  </p>
                </div>
              </div>

              {/* Deposit Address */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold">
                  Deposit Address
                </h3>

                <InputGroup>
                  <InputGroupInput placeholder="0x..." value={depositAddress} type="text" readOnly />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label="Copy"
                      title="Copy"
                      size="icon-xs"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="size-5 text-emerald-500" />
                      ) : (
                        <Copy className="size-5 cursor-pointer" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>


                <p className="text-xs text-muted-foreground">
                  Send only {currency} ({network}) to this
                  address
                </p>
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold">
                  Your Wallet Address
                </h3>

                <Input
                  value={walletAddress}
                  onChange={(e) =>
                    setWalletAddress(e.target.value)
                  }
                  placeholder="0x..."
                  className="rounded-lg bg-muted/20"
                />

                <p className="text-xs text-muted-foreground">
                  Enter the wallet address you're sending from
                </p>
              </div>

              {/* Transaction Hash */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold">
                  Transaction Hash
                </h3>

                <Input
                  value={transactionHash}
                  onChange={(e) =>
                    setTransactionHash(e.target.value)
                  }
                  placeholder="0x..."
                  className="rounded-lg bg-muted/20"
                />

                <p className="text-xs text-muted-foreground">
                  Enter the transaction hash after sending{" "}
                  {currency}
                </p>
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 dark:border-red-900 dark:bg-red-950/30">
                <div className="flex gap-3">
                  <span className="text-xl">⚠️</span>

                  <div>
                    <p className="font-bold">
                      Important:
                    </p>

                    <p className="mt-1 text-xs">
                      Send only {currency} on {network} network
                      to this address. Sending any other
                      cryptocurrency or using a different network
                      will result in permanent loss of funds.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                className="h-12 w-full rounded-lg text-base font-semibold cursor-pointer"
                disabled={
                  !walletAddress ||
                  !transactionHash ||
                  isSubmitting
                }
                onClick={handleSubmit}
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit Deposit"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
