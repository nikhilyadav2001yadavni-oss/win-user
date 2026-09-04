"use client";

import { useState } from "react";
import {
    Check,
    Copy,
    DotIcon,
    Ellipsis,
    Mail,
    MessageCircle,
    MessageSquare,
    Send,
    Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useAppSelector } from "@/lib/hooks";

type ReferEarnProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

export function ReferEarn({
    open,
    setOpen,
}: ReferEarnProps) {
    const user = useAppSelector(
        (state) => state.user.user
    );

    const [copied, setCopied] = useState(false);

    const referralCode = user?.referralCode ?? "";

    const referralLink =
        typeof window !== "undefined" && referralCode
            ? `${window.location.origin}/signup?ref=${encodeURIComponent(
                referralCode
            )}`
            : "";
    const shareMessage = `Join me and earn rewards! 🎁

    Use my referral code: ${referralCode}

    Sign up here: ${referralLink}`;

    /*
     * Copy referral link
     */
    const handleCopy = async () => {
        if (!referralCode) return;

        try {
            await navigator.clipboard.writeText(
                referralCode
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error(
                "Failed to copy referral link:",
                error
            );
        }
    };
    const handleEmailShare = () => {
        if (!referralLink) return;

        const subject = encodeURIComponent(
            "Join me and earn rewards!"
        );

        const body = encodeURIComponent(
            shareMessage
        );

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };
    const handleSmsShare = () => {
        if (!referralLink) return;

        const body = encodeURIComponent(
            shareMessage
        );

        // iOS uses &body, Android commonly accepts ?body
        window.location.href = `sms:?body=${body}`;
    };

    /*
     * Native share
     */
    const handleNativeShare = async () => {
        if (!referralLink) return;

        const shareData = {
            title: "Join me and earn rewards!",
            text: `Join me using my referral code ${referralCode} and start earning rewards.`,
            url: referralLink,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return;
            }

            await handleCopy();
        } catch (error) {
            /*
             * User cancelling native share is not an error
             */
            if (
                error instanceof DOMException &&
                error.name === "AbortError"
            ) {
                return;
            }

            console.error(
                "Share failed:",
                error
            );
        }
    };

    /*
     * WhatsApp
     */
    const handleWhatsAppShare = () => {
        if (!referralLink) return;

        const text = encodeURIComponent(
            `Join me and earn rewards! 🎁\n\nUse my referral code: ${referralCode}\n\n${referralLink}`
        );

        window.open(
            `https://wa.me/?text=${text}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    /*
     * Telegram
     */
    const handleTelegramShare = () => {
        if (!referralLink) return;

        const text = encodeURIComponent(
            `Join me and earn rewards! 🎁 Use my referral code: ${referralCode}`
        );

        const url = encodeURIComponent(
            referralLink
        );

        window.open(
            `https://t.me/share/url?url=${url}&text=${text}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    /*
     * Facebook
     */
    const handleFacebookShare = () => {
        if (!referralLink) return;

        const url = encodeURIComponent(
            referralLink
        );

        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogContent className="max-w-lg overflow-hidden p-0">
                <DialogHeader className="gap-1 border-b px-6 py-1">
                    <DialogTitle className="mb-0 text-center text-lg font-bold">
                        Refer & Earn
                    </DialogTitle>

                    <p className="text-center text-xs text-muted-foreground">
                        Share and earn rewards
                    </p>
                </DialogHeader>

                <div className="-mx-4 max-h-[80vh] overflow-y-auto px-4 no-scrollbar">
                    <div className="space-y-3 px-6 pb-5 pt-1">

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Total Referrals
                                    </CardTitle>

                                    <CardDescription>
                                        {user?.totalReferrals ?? 0}
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Total Earned
                                    </CardTitle>

                                    <CardDescription>
                                        $ {user?.totalEarning ?? 0}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Referral Code */}
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>
                                    Your Referral Code
                                </CardTitle>

                                <span
                                    className="bg-green-500 h-2 w-2 rounded-full"
                                />
                            </CardHeader>

                            <CardContent>
                                <CardDescription className="text-xs">
                                    CODE
                                </CardDescription>

                                <div className="flex items-center gap-3">
                                    <p className="min-w-0 flex-1 break-all text-lg font-semibold">
                                        {referralCode || "—"}
                                    </p>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCopy}
                                        disabled={!referralLink}
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
                                <div className="flex min-w-0 flex-col">
                                    <span className="text-xs text-muted-foreground">
                                        Direct signup link:
                                    </span>

                                    <button
                                        type="button"
                                        className="cursor-pointer break-all text-left text-xs text-primary hover:underline"
                                    >
                                        {referralLink || "—"}
                                    </button>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Share */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Share via
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="grid grid-cols-3 gap-3 text-center text-xs">


                                {/* Email */}
                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon-lg"
                                        onClick={handleEmailShare}
                                        disabled={!referralLink}
                                        className="cursor-pointer"
                                    >
                                        <Mail className="size-5" />
                                    </Button>

                                    <span className="text-muted-foreground">
                                        Email
                                    </span>
                                </div>

                                {/* SMS */}
                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon-lg"
                                        onClick={handleSmsShare}
                                        disabled={!referralLink}
                                        className="cursor-pointer"
                                    >
                                        <MessageSquare className="size-5" />
                                    </Button>

                                    <span className="text-muted-foreground">
                                        SMS
                                    </span>
                                </div>

                                {/* WhatsApp */}
                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon-lg"
                                        onClick={
                                            handleWhatsAppShare
                                        }
                                        disabled={
                                            !referralLink
                                        }
                                        className="cursor-pointer bg-green-500 text-white hover:bg-green-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                                        </svg>
                                    </Button>

                                    <span className="text-muted-foreground">
                                        WhatsApp
                                    </span>
                                </div>

                                {/* Telegram */}
                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon-lg"
                                        onClick={
                                            handleTelegramShare
                                        }
                                        disabled={
                                            !referralLink
                                        }
                                        className="cursor-pointer bg-sky-500 text-white hover:bg-sky-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telegram" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09" />
                                        </svg>
                                    </Button>

                                    <span className="text-muted-foreground">
                                        Telegram
                                    </span>
                                </div>

                                {/* Facebook */}
                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon-lg"
                                        onClick={
                                            handleFacebookShare
                                        }
                                        disabled={
                                            !referralLink
                                        }
                                        className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                                            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                                        </svg>
                                    </Button>

                                    <span className="text-muted-foreground">
                                        Facebook
                                    </span>
                                </div>

                                {/* Native Share */}
                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon-lg"
                                        onClick={
                                            handleNativeShare
                                        }
                                        disabled={
                                            !referralLink
                                        }
                                        className="cursor-pointer"
                                    >
                                        <Ellipsis className="size-5" />
                                    </Button>

                                    <span className="text-muted-foreground">
                                        More
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How it works */}
                        <Card
                            size="sm"
                            className="mx-auto w-full max-w-xs"
                        >
                            <CardHeader>
                                <CardTitle>
                                    How it works
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <ul className="grid gap-2 py-2 text-xs">
                                    <li>
                                        1. Share your referral
                                        link with friends.
                                    </li>

                                    <li>
                                        2. Your friend signs up
                                        using your link.
                                    </li>

                                    <li>
                                        3. You earn rewards from
                                        eligible referrals.
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* How it works */}
                        <Card
                            size="sm"
                            className="mx-auto w-full max-w-xs"
                        >
                            <CardHeader>
                                <CardTitle>
                                    Earn up to $50
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-xs">
                                    For each friend who sign up and makes their first deposit.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
