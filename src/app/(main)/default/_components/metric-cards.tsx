"use client"
import { DollarSign, Trophy, WalletIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/lib/hooks";
import { QuickActions } from "./quick-actions";
import { formatCurrency } from "@/lib/utils";

export function MetricCards() {
  const isVisible = useAppSelector(
    (state) => state.visible.isVisible
  );
  const user = useAppSelector(
    (state) => state.user.user
  );
  console.log("user", user);
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <DollarSign className="size-6" />
            </div>
          </CardTitle>
          <CardDescription className="text-[16px]">Total Balance</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {isVisible ? formatCurrency(user?.wallet?.totalBalance ?? 0) : "******"}
              </div>

          </div>
          <p className="text-muted-foreground text-sm">
            +{user?.wallet?.monthlyChange?.percentage}%{' '}
            {user?.wallet?.monthlyChange?.period}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <WalletIcon className="size-6" />
            </div>
          </CardTitle>
          <CardDescription className="text-[16px]">ROI Wallet</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {isVisible ? formatCurrency(user?.wallet?.roiWallet ?? 0) : "******"}
            </div>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            <span className="h-2 w-2 bg-green-700 rounded-full"></span> Active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Trophy className="size-6" />
            </div>
          </CardTitle>
          <CardDescription className="text-[16px]">Game Wallet</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {isVisible ? formatCurrency(user?.wallet?.gamingWallet ?? 0) : "******"}
            </div>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            <span className="h-2 w-2 bg-green-700 rounded-full"></span> Active
          </p>
        </CardContent>
      </Card>

      <QuickActions />
    </div>
  );
}
