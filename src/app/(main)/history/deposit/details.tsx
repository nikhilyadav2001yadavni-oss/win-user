"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCircle2, Clock3, Copy, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { categoryToTitle } from "@/lib/utils";

type Transaction = {
    _id: string;
    userId: string;
    category: string;
    status: string;
    amount: number;
    currency: string;
    network: string;
    fee: number;
    netAmount: number;
    fromAddress?: string;
    toAddress?: string;
    transactionHash?: string;
    blockchainVerified: boolean;
    verifiedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    transactionId: string;
    metadata?: {
        notes?: string;
        duplicateTransactionHash?: string;
    };
};

type DepositDetailsProps = {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function getStatusVariant(status: string) {
    switch (status) {
        case "COMPLETED":
        case "SUCCESS":
            return "default";

        case "PENDING":
            return "secondary";

        case "FAILED":
        case "DUPLICATE_HASH":
        case "REJECTED":
            return "destructive";

        default:
            return "outline";
    }
}

function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function DetailRow({
    label,
    value,
    title,
}: {
    label: string;
    value: string;
    title?: string;
}) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(
                text
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to copy address:", error);
        }
    };
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 text-sm text-muted-foreground">
                {label}
            </span>

            <span
                className="max-w-[65%] break-all text-right text-sm font-medium"
            >
                {title ? (
                    <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                            {value}
                            {copied ? (
                                <Check className="size-3.5 text-emerald-500" />
                            ) : (
                                <Copy className="size-3.5" onClick={() => handleCopy(value)} />
                            )}
                        </TooltipTrigger>
                        <TooltipContent>
                            {title}
                        </TooltipContent>
                    </Tooltip>

                ) : (
                    value
                )}
            </span>
        </div>
    );
}

export const DepositDetails = ({
    transaction,
    open,
    onOpenChange,
}: DepositDetailsProps) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SUCCESS":
            case "COMPLETED":
                return (
                    <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                        <CheckCircle2 className="size-3" />
                        {status}
                    </Badge>
                );

            case "PENDING":
            case "PROCESSING":
                return (
                    <Badge className="gap-1 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/10">
                        <Clock3 className="size-3" />
                        {status}
                    </Badge>
                );

            case "FAILED":
            case "DUPLICATE_HASH":
                return (
                    <Badge className="gap-1 bg-red-500/10 text-red-600 hover:bg-red-500/10">
                        <XCircle className="size-3" />
                        {status}
                    </Badge>
                );

            default:
                return (
                    <Badge variant="secondary">
                        {status}
                    </Badge>
                );
        }
    };
    const formatAddress = (address?: string) => {
        if (!address) return "-";

        if (address.length <= 18) {
            return address;
        }

        return `${address.slice(0, 9)}...${address.slice(-9)}`;
    };
    return (
        <>
            <Dialog
                open={open}
                onOpenChange={onOpenChange}
            >
                <DialogContent className="max-w-xl">

                    <DialogHeader>
                        <DialogTitle>
                            Transaction Details
                        </DialogTitle>
                    </DialogHeader>

                    {transaction && (
                        <div className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto space-y-4 px-4">

                            {/* Status */}
                            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Status
                                    </p>

                                    <div className="mt-1">
                                        {getStatusBadge(
                                            transaction.status
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                        Amount
                                    </p>

                                    <p className="font-semibold">
                                        {transaction.amount}{" "}
                                        {transaction.currency}
                                    </p>
                                </div>
                            </div>

                            {/* Basic Details */}
                            <div className="space-y-3">

                                <DetailRow
                                    label="Transaction ID"
                                    value={
                                        transaction.transactionId
                                    }
                                />

                                <DetailRow
                                    label="Type"
                                    value={
                                        categoryToTitle(transaction.category)
                                    }
                                />

                                <DetailRow
                                    label="Currency"
                                    value={
                                        transaction.currency
                                    }
                                />

                                <DetailRow
                                    label="Network"
                                    value={
                                        transaction.network
                                    }
                                />

                                <DetailRow
                                    label="Amount"
                                    value={`${transaction.amount} ${transaction.currency}`}
                                />

                                <DetailRow
                                    label="Fee"
                                    value={`${transaction.fee} ${transaction.currency}`}
                                />

                                <DetailRow
                                    label="Net Amount"
                                    value={`${transaction.netAmount} ${transaction.currency}`}
                                />

                            </div>

                            {/* Addresses */}
                            {transaction.category !== "GAME_LOSE" && transaction.category !== "ADMIN_CREDIT" && transaction.category !== "GAME_WIN" && (
                            <div className="space-y-3 rounded-lg border p-4">

                                <p className="font-semibold">
                                    Blockchain Details
                                </p>

                                <DetailRow
                                    label="From Address"
                                    value={formatAddress(
                                        transaction.fromAddress
                                    )}
                                    title={
                                        transaction.fromAddress
                                    }
                                />

                                <DetailRow
                                    label="To Address"
                                    value={formatAddress(
                                        transaction.toAddress
                                    )}
                                    title={
                                        transaction.toAddress
                                    }
                                />

                                <DetailRow
                                    label="Transaction Hash"
                                    value={formatAddress(
                                        transaction.transactionHash
                                    )}
                                    title={
                                        transaction.transactionHash
                                    }
                                />

                                <DetailRow
                                    label="Blockchain Verified"
                                    value={
                                        transaction.blockchainVerified
                                            ? "Yes"
                                            : "No"
                                    }
                                />

                                <DetailRow
                                    label="Verified By"
                                    value={
                                        transaction.verifiedBy ??
                                        "Not verified"
                                    }
                                />

                            </div>
                            )}

                            {/* Metadata / Notes */}
                            {transaction.metadata && (
                                <div className="space-y-2 rounded-lg border p-4">

                                    <p className="font-semibold">
                                        Notes
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {transaction.metadata.notes ?? "No notes"}
                                    </p>

                                    {transaction.metadata
                                        .duplicateTransactionHash && (
                                            <DetailRow
                                                label="Duplicate Hash"
                                                value={formatAddress(
                                                    transaction
                                                        .metadata
                                                        .duplicateTransactionHash
                                                )}
                                                title={
                                                    transaction
                                                        .metadata
                                                        .duplicateTransactionHash
                                                }
                                            />
                                        )}

                                </div>
                            )}

                            {/* Dates */}
                            <div className="space-y-3">

                                <DetailRow
                                    label="Created At"
                                    value={formatDate(
                                        transaction.createdAt
                                    )}
                                />

                                {/* <DetailRow
                                    label="Updated At"
                                    value={formatDate(
                                        transaction.updatedAt
                                    )}
                                /> */}

                            </div>

                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
