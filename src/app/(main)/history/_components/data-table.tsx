"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepositTable } from "../deposit/deposit-table";
import { Filters } from "./fiters";
import { Pagination } from "@/components/pagination";

type DataTableProps = {
  data: any;
  loading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  statusFilter: string;
  setStatusFilter: (statusFilter: string) => void;
  joinedDateFilter: string;
  setJoinedDateFilter: (joinedDateFilter: string) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  type?: string;
};
export function DataTable({
  data,
  loading,
  page,
  totalPages,
  totalCount,
  limit,
  setPage,
  setLimit,
  statusFilter,
  setStatusFilter,
  joinedDateFilter,
  setJoinedDateFilter,
  searchQuery,
  setSearchQuery,
  type,
}: DataTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">
          {type == "home" ? "Recent transactions" : "Transaction history"}
        </CardTitle>
        <CardDescription>Recent transactions with status, amount, and date.</CardDescription>
        {type !== "home" && (
        <CardAction>
          <Button variant="outline" size="sm">
            <Download />
            Export
          </Button>
        </CardAction>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {type !== "home" && (
        <Filters 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        joinedDateFilter={joinedDateFilter}
        setJoinedDateFilter={setJoinedDateFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        />
        )}

        <DepositTable
            loading={loading}
            data={data}
            page={page}
            limit={limit}
          />
          {type !== "home" && (
          <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit}
          onPageChange={(newPage) => { setPage(newPage); }}
          onLimitChange={(newLimit) => { setLimit(newLimit); }}
        />
            )}
      </CardContent>
    </Card>
  );
}
