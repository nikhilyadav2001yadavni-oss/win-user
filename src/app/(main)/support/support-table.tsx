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

import {
    CheckCircle2,
    Clock3,
    Loader2,
    MessageCircle,
    XCircle,
} from "lucide-react";

import { TicketDetailDialog } from "./ticket-detail-dialog";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type SupportTicket = {
    _id: string;
    userId: string;
    subject: string;
    status: "OPEN" | "CLOSED" | "PENDING" | "IN_PROGRESS" | string;
    lastMessagePreview: string;
    lastMessageAt: string;
    closedByEmail?: string;
    closedByComment?: string;
    closedAt?: string;
    createdAt: string;
    updatedAt: string;
};

type SupportTableProps = {
    data: SupportTicket[];
    loading: boolean;
    page: number;
    limit: number;
    onTicketClosed?: (ticketId: string) => void;
};


function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function SupportTableSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
                <TableHeader className="bg-muted/15">
                    <TableRow>
                        {[
                            "S.No",
                            "Subject",
                            "Last Message",
                            "Status",
                            "Created",
                            "Updated",
                            "Actions",
                        ].map((item) => (
                            <TableHead
                                key={item}
                                className="h-11 p-3 font-medium"
                            >
                                {item}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {Array.from({ length: 7 }).map((_, row) => (
                        <TableRow key={row}>
                            {Array.from({ length: 7 }).map((_, column) => (
                                <TableCell key={column} className="p-3">
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

function getStatusBadge(status: string) {
    switch (status) {
        case "OPEN":
            return (
                <Badge className="gap-1 bg-blue-500/10 text-blue-600 hover:bg-blue-500/10">
                    <MessageCircle className="size-3" />
                    Open
                </Badge>
            );

        case "IN_PROGRESS":
            return (
                <Badge className="gap-1 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/10">
                    <Clock3 className="size-3" />
                    In Progress
                </Badge>
            );

        case "PENDING":
            return (
                <Badge className="gap-1 bg-orange-500/10 text-orange-600 hover:bg-orange-500/10">
                    <Clock3 className="size-3" />
                    Pending
                </Badge>
            );

        case "CLOSED":
            return (
                <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                    <CheckCircle2 className="size-3" />
                    Closed
                </Badge>
            );

        case "CANCELLED":
            return (
                <Badge className="gap-1 bg-red-500/10 text-red-600 hover:bg-red-500/10">
                    <XCircle className="size-3" />
                    Cancelled
                </Badge>
            );

        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export const SupportTable = ({
    data,
    loading,
    page,
    limit,
    onTicketClosed,
}: SupportTableProps) => {

    const skip = (page - 1) * limit;

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
        null
    );

    const [dialogOpen, setDialogOpen] = useState(false);

    /**
     * Close confirmation state
     */
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [ticketToClose, setTicketToClose] =
        useState<SupportTicket | null>(null);
    const [closing, setClosing] = useState(false);

    /**
     * Open ticket details
     */
    const handleOpenTicket = (ticketId: string) => {
        setSelectedTicketId(ticketId);
        setDialogOpen(true);
    };

    /**
     * Ticket detail dialog close
     */
    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);

        if (!open) {
            setSelectedTicketId(null);
        }
    };

    /**
     * Open close confirmation modal
     */
    const handleOpenCloseConfirmation = (
        ticket: SupportTicket
    ) => {
        if (ticket.status === "CLOSED") {
            return;
        }

        setTicketToClose(ticket);
        setCloseDialogOpen(true);
    };

    /**
     * Cancel closing
     */
    const handleCancelClose = () => {
        if (closing) {
            return;
        }

        setCloseDialogOpen(false);
        setTicketToClose(null);
    };

    /**
     * Confirm and close ticket
     */
    const handleConfirmClose = async () => {
        if (!ticketToClose?._id || closing) {
            return;
        }

        try {
            setClosing(true);

            const response = await apiFetch(
                `/support-tickets/${ticketToClose._id}/close`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        comment: "",
                    }),
                }
            );

            /**
             * Close confirmation modal
             */
            onTicketClosed?.(ticketToClose._id);
            setCloseDialogOpen(false);
            setTicketToClose(null);

            /**
             * If the closed ticket is currently open
             * inside TicketDetailDialog, close that dialog too.
             */
            if (selectedTicketId === ticketToClose._id) {
                setDialogOpen(false);
                setSelectedTicketId(null);
            }

            toast.success(response.message);
        } catch (error: any) {
            console.error(
                "Failed to close ticket:",
                error
            );
            toast.error(error?.message ?? "Failed to close ticket");
        } finally {
            setClosing(false);
        }
    };

    if (loading) {
        return <SupportTableSkeleton />;
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
                                    Subject
                                </TableHead>

                                <TableHead className="h-11 p-3 font-medium">
                                    Last Message
                                </TableHead>

                                <TableHead className="h-11 p-3 font-medium">
                                    Status
                                </TableHead>

                                <TableHead className="h-11 p-3 font-medium">
                                    Created
                                </TableHead>

                                <TableHead className="h-11 p-3 font-medium">
                                    Updated
                                </TableHead>

                                <TableHead className="h-11 p-3 font-medium">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.length ? (
                                data.map((ticket, index) => (
                                    <TableRow
                                        key={ticket._id}
                                        className="transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell className="p-3 align-middle">
                                            {skip + index + 1}
                                        </TableCell>

                                        <TableCell className="p-3 align-middle">
                                            <span className="font-medium">
                                                {ticket.subject}
                                            </span>
                                        </TableCell>

                                        <TableCell className="max-w-80 p-3 align-middle">
                                            <span className="block truncate text-sm text-muted-foreground">
                                                {ticket.lastMessagePreview ||
                                                    "No messages"}
                                            </span>
                                        </TableCell>

                                        <TableCell className="p-3 align-middle">
                                            {getStatusBadge(ticket.status)}
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap p-3 align-middle text-sm text-muted-foreground">
                                            {formatDate(ticket.createdAt)}
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap p-3 align-middle text-sm text-muted-foreground">
                                            {formatDate(ticket.updatedAt)}
                                        </TableCell>

                                        <TableCell className="whitespace-nowrap p-3 align-middle">
                                            <div className="flex items-center gap-2">
                                                {/* View */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleOpenTicket(
                                                            ticket._id
                                                        )
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <MessageCircle className="size-3 text-primary-600" />

                                                    <span className="ml-0.5">
                                                        View
                                                    </span>
                                                </Button>

                                                {/* Close */}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={
                                                        ticket.status ===
                                                            "CLOSED" ||
                                                        closing
                                                    }
                                                    onClick={() =>
                                                        handleOpenCloseConfirmation(
                                                            ticket
                                                        )
                                                    }
                                                >
                                                    <XCircle className="size-3" />

                                                    <span className="ml-0.5">
                                                        {ticket.status ===
                                                        "CLOSED"
                                                            ? "Closed"
                                                            : "Close"}
                                                    </span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No support tickets found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Ticket detail */}
            <TicketDetailDialog
                ticketId={selectedTicketId}
                open={dialogOpen}
                onOpenChange={handleDialogChange}
            />

            {/* Close confirmation */}
            <Dialog
                open={closeDialogOpen}
                onOpenChange={(open) => {
                    if (!closing) {
                        setCloseDialogOpen(open);

                        if (!open) {
                            setTicketToClose(null);
                        }
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Close support ticket?
                        </DialogTitle>

                        <DialogDescription>
                            Are you sure you want to close this
                            support ticket?
                        </DialogDescription>
                    </DialogHeader>

                    {ticketToClose && (
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <p className="text-sm font-medium">
                                {ticketToClose.subject}
                            </p>

                            {ticketToClose.lastMessagePreview && (
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {ticketToClose.lastMessagePreview}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelClose}
                            disabled={closing}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmClose}
                            disabled={closing}
                        >
                            {closing ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Closing...
                                </>
                            ) : (
                                <>
                                    <XCircle className="mr-2 size-4" />
                                    Yes, Close Ticket
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
