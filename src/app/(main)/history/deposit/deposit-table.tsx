"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DepositDetails } from "./details";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
export type Transaction = {
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
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  transactionId: string;
};
type DepositTableProps = {
  data: Transaction[];
  loading: boolean;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TransactionTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader className="bg-muted/15">
          <TableRow>
            {[
              "S.No",
              "Transaction ID",
              "Type",
              "Amount",
              "Status",
              "Date",
            ].map((item) => (
              <TableHead
                key={item}
                className="h-11 p-3"
              >
                {item}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 6 }).map((_, row) => (
            <TableRow key={row}>
              {Array.from({ length: 5 }).map((_, column) => (
                <TableCell
                  key={column}
                  className="p-3"
                >
                  <div className="h-4 w-full max-w-32 animate-pulse rounded bg-muted" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const DepositTable = ({
  data,
  loading,
}: DepositTableProps) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  if (loading) {
    return <TransactionTableSkeleton />;
  }
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
  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>

            <TableHeader className="bg-muted/15">
              <TableRow>
                <TableHead className="h-11 p-3 font-medium">
                  S.No
                </TableHead>
                <TableHead className="h-11 p-3 font-medium">
                  Transaction ID
                </TableHead>

                <TableHead className="h-11 p-3 font-medium">
                  Type
                </TableHead>

                <TableHead className="h-11 p-3 font-medium">
                  Amount
                </TableHead>

                <TableHead className="h-11 p-3 font-medium">
                  Status
                </TableHead>

                <TableHead className="h-11 p-3 font-medium">
                  Date
                </TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length ? (
                data.map((transaction, index) => (
                  <TableRow
                    key={transaction._id}
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedTransaction(transaction)
                    }
                  >
                    <TableCell className="p-3 align-middle">
                      {index + 1}
                    </TableCell>
                    <TableCell className="p-3 align-middle">
                      <span className="font-medium">
                        {transaction.transactionId}
                      </span>
                    </TableCell>

                    <TableCell className="p-3 align-middle">
                      <span className="capitalize">
                        {transaction.category.toLowerCase()}
                      </span>
                    </TableCell>

                    <TableCell className="p-3 align-middle">
                      <span className={`font-medium ${transaction.status === "FAILED" ? "text-destructive" : "text-green-700"}`}>
                        +{transaction.amount}{" "}
                        {transaction.currency}
                      </span>
                    </TableCell>

                    <TableCell className="p-3 align-middle">
                      {getStatusBadge(transaction.status)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap p-3 align-middle text-sm text-muted-foreground">
                      {formatDate(
                        transaction.createdAt
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </div>
      </div>

      <DepositDetails
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransaction(null);
          }
        }}
      />
    </>
  );
};
