"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { SupportTable } from "./support-table";
import { NewTicketDialog } from "./new-ticket-dialog";

type SupportTicket = {
  _id: string;
  userId: string;
  subject: string;
  status: "OPEN" | "CLOSED" | "PENDING";
  lastMessagePreview: string;
  lastMessageAt: string;
  closedByEmail?: string;
  closedByComment?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type TicketResponse = {
  success: boolean;
  message: string;
  data: {
    tickets: SupportTicket[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
};

export function SupportCard() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [data, setData] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);

      const response: TicketResponse = await apiFetch(
        `/support-tickets/my?page=${page}&limit=${limit}`,
        {
          method: "GET",
        }
      );

      setData(response.data.tickets);
      setTotalCount(response.data.totalCount);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);

      setData([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">
          Support Ticket
        </CardTitle>

        <CardDescription>
          Manage your support conversation with the support team.
        </CardDescription>

        <CardAction>
          <NewTicketDialog onCreated={fetchTickets} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <SupportTable
          loading={loading}
          data={data}
          page={page}
          limit={limit}
          onTicketClosed={() => {
        fetchTickets();
    }}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </CardContent>
    </Card>
  );
}
