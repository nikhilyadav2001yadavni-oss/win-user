"use client";

import { useState } from "react";
import {
  ArrowBigUp,
  Banknote,
  EyeIcon,
  EyeOffIcon,
  MoreHorizontal,
  NetworkIcon,
  SendHorizontal,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DepositDialog } from "./DepositDialog";
import { ReferEarn } from "./refer-earn";
import { useAppSelector } from "@/lib/hooks";
import { useDispatch } from "react-redux";
import { setVisible } from "@/lib/features/loading/visibleSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WithdrawalModal } from "./withdrawal";

export const QuickActions = () => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [referOpen, setReferOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const isVisible = useAppSelector(
    (state) => state.visible.isVisible
  );

  const dispatch = useDispatch();

  const handleVisibility = () => {
    dispatch(setVisible(!isVisible));
  };

  const shortcuts = [
    {
      id: 1,
      label: "Deposit",
      icon: SendHorizontal,
      onClick: () => setDepositOpen(true),
      disabled: false,
    },
    {
      id: 2,
      label: "Withdraw",
      icon: ArrowBigUp,
      onClick: () => setWithdrawOpen(true),
      disabled: false,
    },
    {
      id: 3,
      label: "Refer",
      icon: Share2,
      onClick: () => setReferOpen(true),
      disabled: false,
    },
    {
      id: 4,
      label: isVisible ? "Hide" : "Show",
      icon: isVisible ? EyeOffIcon : EyeIcon,
      onClick: handleVisibility,
      disabled: false,
    },
    {
      id: 5,
      label: "Team",
      icon: NetworkIcon,
      onClick: () => {
        // open team
      },
      disabled: false,
    },
    {
      id: 6,
      label: "More",
      icon: MoreHorizontal,
      onClick: () => {
        // open more
      },
      disabled: true,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;

              return (
                <div
                  key={shortcut.id}
                  className="flex flex-col items-center gap-1"
                >
                  <Button
                    variant="outline"
                    size="icon-lg"
                    className="rounded-full cursor-pointer"
                    onClick={shortcut.onClick}
                    disabled={shortcut.disabled}
                  >
                    <Icon className="size-5" />
                  </Button>

                  <span className="text-xs text-muted-foreground">
                    {shortcut.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs live outside the shortcuts array */}
      <DepositDialog
        open={depositOpen}
        setOpen={setDepositOpen}
      />

      <WithdrawalModal open={withdrawOpen} setOpen={setWithdrawOpen} />

      <ReferEarn
        open={referOpen}
        setOpen={setReferOpen}
      />
    </>
  );
};
