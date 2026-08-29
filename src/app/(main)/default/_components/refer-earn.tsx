"use client";

import { useState } from "react";
import { ArrowBigUp, Check, Copy, DotIcon, Info, Share2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useAppSelector } from "@/lib/hooks";
type ReferEarnProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};
export function ReferEarn({ open, setOpen }: ReferEarnProps) {
    const user = useAppSelector(
        (state) => state.user.user
    );
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(user?.referralCode!);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg overflow-hidden p-0">
                    <DialogHeader className="border-b px-6 py-1 gap-1">
                        <DialogTitle className="text-center text-lg mb-0 font-bold">
                            Refer & Earn
                        </DialogTitle>

                        <p className="text-center text-xs text-muted-foreground">
                            Share and earn rewards
                        </p>
                    </DialogHeader>
                    <div className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4">

                        <div className="space-y-3 px-6 pb-5 pt-1">
                            <div className="grid grid-cols-2 gap-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Total Referrals</CardTitle>
                                        <CardDescription>{user?.totalReferrals}</CardDescription>
                                    </CardHeader>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Total Earned</CardTitle>
                                        <CardDescription>$ {user?.totalEarning}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Referral Code</CardTitle>
                                    <CardAction><DotIcon fill="green" size={24} /></CardAction>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-xs">
                                        CODE
                                    </CardDescription>
                                    <div className="flex items-center gap-3">
                                        <p className="min-w-0 flex-1 break-all text-lg font-semibold">
                                            {user?.referralCode}
                                        </p>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleCopy}
                                            className="shrink-0 cursor-pointer"
                                        >
                                            {copied ? (
                                                <Check className="size-5 text-emerald-500" />
                                            ) : (
                                                <Copy className="size-5" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-0 bg-transparent pt-1">
                                    <span className="text-xs text-muted-foreground">
                                        Direct signup link:
                                    </span>
                                    <a href="#" className="text-xs text-muted-foreground">
                                        https://app.referral.xyz
                                    </a>
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Share via</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-4 gap-2 text-center text-xs">
                                    <div className="flex flex-col items-center gap-1">
                                        <Button size="icon-lg">
                                            <ArrowBigUp className="size-5" />
                                        </Button>

                                        <span className="text-muted-foreground">
                                            Deposit
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <Button size="icon-lg">
                                            <ArrowBigUp className="size-5" />
                                        </Button>

                                        <span className="text-muted-foreground">
                                            Deposit
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <Button size="icon-lg">
                                            <ArrowBigUp className="size-5" />
                                        </Button>

                                        <span className="text-muted-foreground">
                                            Deposit
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <Button size="icon-lg">
                                            <ArrowBigUp className="size-5" />
                                        </Button>

                                        <span className="text-muted-foreground">
                                            Deposit
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card size="sm" className="mx-auto w-full max-w-xs">
                                <CardHeader>
                                    <CardTitle>How it works</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="grid gap-2 py-2 text-xs">
                                        <li className="flex gap-2">
                                            <span>Choose a schedule (daily, or weekly).</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span>Send to channels or specific teammates.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span>Include charts, tables, and key metrics.</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
