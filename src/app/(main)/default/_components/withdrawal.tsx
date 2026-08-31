"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Gamepad2,
    Percent,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";

import { Badge } from "@/components/ui/badge";
import { SelectCurrency } from "./select-currency";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { updateWalletBalance } from "@/lib/features/user/userSlice";

type WalletType = "roiWallet" | "gamingWallet";

interface WithdrawalModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const WithdrawalModal = ({
    open,
    setOpen,
}: WithdrawalModalProps) => {
    const [selectedWallet, setSelectedWallet] = useState<WalletType>("roiWallet");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState("BNB");
    const [networkOpen, setNetworkOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");
    const user = useAppSelector(
        (state) => state.user.user
    );

    const currencies = useAppSelector(
        (state) => state.currency.currencies
    );

    const selectedCurrency = currencies.find(
        (item) => item.symbol === selectedNetwork
    );

    const wallets = {
        roiWallet: {
            name: "ROI Wallet",
            balance: user?.wallet?.roiWallet ?? 0,
            icon: Percent,
            color: "bg-purple-600",
        },
        gamingWallet: {
            name: "Game Wallet",
            balance: user?.wallet?.gamingWallet ?? 0,
            icon: Gamepad2,
            color: "bg-pink-600",
        },
    };

    const wallet = wallets[selectedWallet];
    const withdrawalMin = selectedCurrency?.minimumWithdrawalAmount ?? 0;
    const networkFee = selectedCurrency?.withdrawalFee ?? 0;
    const withdrawalEnabled = selectedCurrency?.withdrawalEnabled ?? false;
    const withdrawalAmount = Number(amount) || 0;
    const receiveAmount = Math.max(withdrawalAmount - networkFee, 0);

    const isValid =
        !!selectedCurrency &&
        selectedCurrency.isActive &&
        withdrawalEnabled &&
        withdrawalAmount >= withdrawalMin &&
        withdrawalAmount <= wallet.balance &&
        address.trim().length > 0;

    const handleWalletChange = (
        walletType: WalletType
    ) => {
        setSelectedWallet(walletType);
        setAmount("");
        setAddress("");
    };

    const handleNetworkChange = (
        networkType: string
    ) => {
        setSelectedNetwork(networkType);
        setNetworkOpen(false);
        setAmount("");
        setAddress("");
    };

    const handleMax = () => {
        if (wallet.balance > 0) {
            setAmount(String(wallet.balance));
        }
    };
    const dispatch = useAppDispatch();

    const handleWithdraw = async () => {
        console.log(isValid, selectedCurrency);
        if (!isValid || !selectedCurrency) {
            return;
        }

        const payload = {
            walletType: selectedWallet,
            amount: withdrawalAmount,
            withdrawalAddress: address.trim(),
            currency: selectedCurrency.symbol,
            networkFee: networkFee,
        };

        try {
            setIsSubmitting(true);

            const result = await apiFetch(
                "/wallet/withdrawal",
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            console.log(
                "Withdrawal submitted successfully:",
                result
            );

            const currentBalance = wallet.balance;
            const newBalance = currentBalance - withdrawalAmount;
            dispatch(
                updateWalletBalance({
                    walletType: selectedWallet,
                    balance: newBalance,
                })
            );
            setOpen(false);

            toast.success("Withdrawal request submitted successfully.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to submit withdrawal request."
            );
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogContent className="max-w-lg overflow-visible p-0">
                <>
                    <DialogHeader className="gap-0 border-b px-6 py-3 text-center">
                        <DialogTitle className="text-lg font-bold">
                            Withdrawal
                        </DialogTitle>

                        <DialogDescription>
                            Select wallet and enter withdrawal details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[80vh] space-y-4 overflow-y-auto px-6 py-5 pt-1 no-scrollbar">

                        <section className="space-y-1">
                            <h2 className="text-base font-bold">
                                Select Wallet
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                {(Object.keys(wallets) as WalletType[]).map(
                                    (walletType) => {
                                        const item =
                                            wallets[walletType];

                                        const Icon =
                                            item.icon;

                                        const isSelected =
                                            selectedWallet ===
                                            walletType;

                                        const isDisabled =
                                            walletType === "gamingWallet" &&
                                            item.balance <= 0;

                                        return (
                                            <button
                                                key={walletType}
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    handleWalletChange(
                                                        walletType
                                                    )
                                                }
                                                className={`
                                                    rounded-lg
                                                    border-2
                                                    px-3
                                                    py-2
                                                    text-left
                                                    transition-all
                                                    cursor-pointer
                                                    ${isSelected
                                                        ? "border-orange-500"
                                                        : "border-border"
                                                    }
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60`}
                                            >
                                                <div
                                                    className={`
                                                        flex
                                                        size-10
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        text-white
                                                        ${item.color}
                                                    `}
                                                >
                                                    <Icon className="size-5" />
                                                </div>

                                                <div className="mt-4">
                                                    <p className="font-bold">
                                                        {item.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {selectedNetwork}{" "}
                                                        {item.balance}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </section>

                        {/* Withdrawal Amount */}
                        <section className="space-y-1">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold">
                                    Withdrawal Amount
                                </h2>

                                <Badge
                                    variant="outline"
                                    onClick={handleMax}
                                    className="cursor-pointer text-xs"
                                >
                                    MAX
                                </Badge>
                            </div>

                            {/* Amount + Network */}
                            <div className="relative">
                                <InputGroup>
                                    <InputGroupInput
                                        type="text"
                                        min={withdrawalMin}
                                        max={wallet.balance}
                                        step="any"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(
                                                e.target.value
                                            )
                                        }
                                        placeholder={`Minimum withdrawal ${withdrawalMin}`}
                                    />

                                    <InputGroupAddon align="inline-end">
                                        <InputGroupButton
                                            type="button"
                                            variant="secondary"
                                            onClick={() =>
                                                setNetworkOpen(
                                                    (prev) => !prev
                                                )
                                            }
                                        >
                                            {selectedNetwork}

                                            {networkOpen ? (
                                                <ChevronUp className="size-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="size-4 text-muted-foreground" />
                                            )}
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                </InputGroup>

                                {/* Network Dropdown */}
                                {networkOpen && (
                                    <SelectCurrency
                                        type="withdrawal"
                                        value={selectedNetwork}
                                        onValueChange={
                                            handleNetworkChange
                                        }
                                    />
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Minimum:{" "}
                                {withdrawalMin}{" "}
                                • Available:{" "}
                                {wallet.balance}
                            </p>

                            {!withdrawalEnabled &&
                                selectedCurrency && (
                                    <p className="text-xs font-medium text-red-500">
                                        Withdrawals are currently
                                        disabled for this network.
                                    </p>
                                )}
                        </section>

                        {/* Withdrawal Address */}
                        <section className="space-y-1">
                            <h2 className="text-base font-bold">
                                Withdrawal Address
                            </h2>

                            <Input
                                value={address}
                                onChange={(e) =>
                                    setAddress(
                                        e.target.value
                                    )
                                }
                                placeholder={`Enter your ${selectedNetwork} address`}
                                className="text-sm"
                            />

                            <p className="text-xs text-muted-foreground">
                                Enter your{" "}
                                {selectedCurrency?.name ??
                                    "USDT"}{" "}
                                (
                                {selectedCurrency?.chain ??
                                    selectedNetwork}
                                ) wallet address
                            </p>
                        </section>

                        {/* Summary */}
                        <Card className="rounded-lg py-2.5 shadow-none">
                            <CardContent className="space-y-2.5 px-4">

                                {/* Withdrawal Amount */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Withdrawal Amount
                                    </span>

                                    <span className="text-sm font-medium">
                                        {selectedCurrency?.name ??
                                            "USDT"}{" "}
                                        {withdrawalAmount.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>

                                <div className="border-t" />

                                {/* Network */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Network
                                    </span>

                                    <span className="text-sm font-medium">
                                        {selectedCurrency?.chain ??
                                            selectedNetwork}
                                    </span>
                                </div>

                                <div className="border-t" />

                                {/* Network Fee */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Network Fee
                                    </span>

                                    <span className="text-sm font-medium">
                                        {selectedCurrency?.name ??
                                            "USDT"}{" "}
                                        {networkFee.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>

                                <div className="border-t" />

                                {/* You'll Receive */}
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">
                                        You'll Receive
                                    </span>

                                    <span className="font-semibold text-emerald-500">
                                        {selectedCurrency?.name ??
                                            "USDT"}{" "}
                                        {receiveAmount.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Important Warning */}
                        <div className="flex gap-4 rounded-lg border-2 border-red-200 bg-red-50 p-2">
                            <div className="shrink-0 text-xl">
                                ⚠️
                            </div>

                            <div>
                                <p className="font-bold text-red-600">
                                    Important:
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    Please ensure the withdrawal
                                    address is correct.
                                    Withdrawals to wrong addresses
                                    cannot be recovered.
                                </p>
                            </div>
                        </div>

                        {/* Processing Info */}
                        <div className="flex gap-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-2">
                            <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                <span className="text-sm">
                                    i
                                </span>
                            </div>

                            <p className="text-sm text-blue-600">
                                Withdrawals are processed within
                                3 days. You will receive a
                                confirmation once your withdrawal
                                is processed.
                            </p>
                        </div>

                        {/* Continue */}
                        <Button
                            type="button"
                            disabled={!isValid || isSubmitting}
                            onClick={handleWithdraw}
                            className="h-12 w-full cursor-pointer rounded-lg text-base font-semibold"
                        >
                            {isSubmitting ? "Submitting..." : "Continue"}
                        </Button>
                    </div>
                </>
            </DialogContent>
        </Dialog>
    );
};
