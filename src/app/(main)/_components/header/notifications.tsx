"use client";

import { useCallback, useEffect, useState } from "react";
import { BellDotIcon, CheckCheck, DollarSignIcon, Loader2, Trash2Icon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { apiFetch } from "@/lib/api";

type Notification = {
    _id: string;
    userId: string;
    type: string;
    channel: string[];
    title: string;
    message: string;
    status: "READ" | "UNREAD";
    priority: string;
    readAt?: string | null;
    failureReason?: string;
    retryCount?: number;
    createdAt: string;
    updatedAt: string;
};

type NotificationResponse = {
    notifications: Notification[];
    totalCount: number;
    unreadCount: number;
    currentPage: number;
    totalPages: number;
};

function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export function Notifications() {
    const [open, setOpen] = useState(false);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);

            const result = await apiFetch("/notifications/list", {
                method: "GET",
            });

            const data: NotificationResponse = result.data;

            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleOpenChange = (value: boolean) => {
        setOpen(value);

        if (value) {
            fetchNotifications();
        }
    };

    const handleMarkAsRead = async (notification: Notification) => {
        if (notification.status === "READ") {
            return;
        }

        try {
            await apiFetch(
                `/notifications/${notification._id}/read`,
                {
                    method: "PATCH",
                }
            );

            setNotifications((prev) =>
                prev.map((item) =>
                    item._id === notification._id
                        ? {
                            ...item,
                            status: "READ",
                            readAt: new Date().toISOString(),
                        }
                        : item
                )
            );

            setUnreadCount((prev) => Math.max(prev - 1, 0));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) {
            return;
        }

        try {
            setMarkingAll(true);

            await apiFetch("/notifications/read-all", {
                method: "PATCH",
            });

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    status: "READ",
                    readAt: notification.readAt || new Date().toISOString(),
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );
        } finally {
            setMarkingAll(false);
        }
    };
    const handleDelete = async (notification: Notification) => {
        try {
            await apiFetch(
                `/notifications/${notification._id}`,
                {
                    method: "DELETE",
                }
            );
            setNotifications((prev) => prev.filter((item) => item._id !== notification._id));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="relative"
                    aria-label="Notifications"
                >
                    <BellDotIcon className="size-5" />

                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-[380px] p-0"
            >
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="space-y-1">
                            <h4 className="font-medium text-sm leading-none">
                                Notifications
                            </h4>

                            <p className="text-muted-foreground text-xs">
                                {unreadCount} unread{" "}
                                {unreadCount === 1
                                    ? "notification"
                                    : "notifications"}
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                disabled={markingAll}
                                className="h-8 text-xs"
                            >
                                {markingAll ? (
                                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                ) : (
                                    <CheckCheck className="mr-1.5 size-3.5" />
                                )}

                                Mark all as read
                            </Button>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {loading ? (
                            <div className="space-y-4 p-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="space-y-2"
                                    >
                                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                        <div className="h-3 w-full animate-pulse rounded bg-muted" />
                                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex h-32 items-center justify-center px-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No notifications
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => {
                                    const isUnread =
                                        notification.status !== "READ";

                                    return (
                                        <button
                                            key={notification._id}
                                            type="button"
                                            onClick={() =>
                                                handleMarkAsRead(notification)
                                            }
                                            className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 ${isUnread ? "bg-muted/30" : ""
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                {/* Unread indicator */}
                                                <div className="pt-1.5">
                                                    <div className="p-1 rounded-md bg-primary">
                                                        <DollarSignIcon className="h-4 w-4" />
                                                    </div>
                                                </div>

                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium">
                                                            {notification.title}
                                                        </p>

                                                        {isUnread && (
                                                            <span className="shrink-0 text-[10px] font-medium text-primary">
                                                                NEW
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                        {notification.message}
                                                    </p>


                                                    <p className="pt-1 text-[11px] text-muted-foreground/70">
                                                        {formatDate(notification.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="pt-1.5">
                                                    <div className="p-1 rounded-md bg-primary cursor-pointer" onClick={() => handleDelete(notification)}>
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
