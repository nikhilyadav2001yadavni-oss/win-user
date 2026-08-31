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

const tabs = [
  { id: "all", title: "All", category: "ALL" },
  { id: "deposit", title: "Deposit", category: "DEPOSIT" },
  { id: "withdrawal", title: "Withdrawal", category: "WITHDRAWAL" },
  { id: "roi-wallet", title: "ROI Wallet", category: "ROI_CREDIT" },
  { id: "games", title: "Games", category: "GAME" },
  { id: "referral", title: "Referral", category: "REFERRAL_BONUS" },
];

export const History = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "all";
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const searchFromUrl = searchParams.get("search") || "";

  const [search, setSearch] = useState(searchFromUrl);
  const [throttledSearch, setThrottledSearch] =
    useState(searchFromUrl);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [joinedDateFilter, setJoinedDateFilter] = useState("all");
  const type = tabs.find((tab) => tab.id === activeTab)?.category.toLocaleLowerCase();
  useEffect(() => {
    const timer = setInterval(() => {
      setThrottledSearch(search);
    }, 500);

    return () => clearInterval(timer);
  }, [search]);

  useEffect(() => {
    setSearch(searchFromUrl);
    setThrottledSearch(searchFromUrl);
  }, [searchFromUrl]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const result = await apiFetch(
        `/wallet/transactions?type=${type}&page=${page}&limit=${limit}&search=${searchFromUrl}`,
        {
          method: "GET",
        }
      );

      const data: TransactionResponse = result.data;

      setTransactions(data.transactions || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(
        "Failed to fetch transactions:",
        error
      );

      setTransactions([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    page,
    throttledSearch,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, page, limit]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("tab", value);
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">


      {/* ================= TABS ================= */}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs sm:text-sm cursor-pointer"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* ================= DEPOSIT ================= */}

        <TabsContent value={activeTab}>
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
            />
        </TabsContent>
      </Tabs>
    </div>
  );
};
