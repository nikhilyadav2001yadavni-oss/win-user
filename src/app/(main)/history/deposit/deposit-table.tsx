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
                      <Badge
                        variant={getStatusVariant(
                          transaction.status
                        )}
                      >
                        {transaction.status}
                      </Badge>
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
