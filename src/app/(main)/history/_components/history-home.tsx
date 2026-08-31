"use client";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { apiFetch } from "@/lib/api";
import { DataTable } from "./data-table";

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
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    transactionId: string;
};

type TransactionResponse = {
    transactions: Transaction[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
};


export const HistoryHome = () => {
    const [page, setPage] = useState(1);
    const searchFromUrl = "";

    const [search, setSearch] = useState(searchFromUrl);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("all");
    const [joinedDateFilter, setJoinedDateFilter] = useState("all");

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);

            const result = await apiFetch(
                `/wallet/transactions?type=all&page=${page}&limit=${limit}&search=${searchFromUrl}`,
                {
                    method: "GET",
                }
            );

            const data: TransactionResponse = result.data;

            setTransactions(data.transactions || []);
        } catch (error) {
            console.error(
                "Failed to fetch transactions:",
                error
            );

            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [
    ]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);


    return (
        <div className="flex flex-col gap-4">

            <DataTable data={transactions} loading={loading}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                limit={limit}
                setPage={setPage}
                setLimit={setLimit}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                joinedDateFilter={joinedDateFilter}
                setJoinedDateFilter={setJoinedDateFilter}
                searchQuery={search}
                setSearchQuery={setSearch}
                type="home"
            />
        </div>
    );
};
