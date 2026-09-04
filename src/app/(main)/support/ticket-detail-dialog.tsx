"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Socket } from "socket.io-client";
import {
  CheckCircle2,
  CircleUserRound,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { createSupportTicketSocket } from "@/lib/supportSocket";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type TicketStatus =
  | "OPEN"
  | "CLOSED"
  | "PENDING"
  | "IN_PROGRESS"
  | "CANCELLED"
  | string;

export type SupportTicket = {
  _id: string;
  userId: string;
  subject: string;
  status: TicketStatus;
  lastMessagePreview: string;
  lastMessageAt: string;
  closedByEmail?: string | null;
  closedByComment?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  senderType: "USER" | "SUPPORT" | string;
  senderId: string;
  body: string;
  attachmentUrls: string[];
  createdAt: string;
};

export type TicketDetail = {
  ticket: SupportTicket;
  messages: TicketMessage[];
  totalMessages: number;
  currentPage: number;
  totalPages: number;
};

type TicketDetailResponse = {
  success: boolean;
  message: string;
  data: TicketDetail;
};

type TicketDetailDialogProps = {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
};

function normalizeTicketMessage(raw: unknown): TicketMessage | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  const id = item.id ?? item._id;
  const ticketId = item.ticketId ?? item.ticket_id;

  if (id == null || ticketId == null) return null;

  return {
    id: String(id),
    ticketId: String(ticketId),
    senderType:
      item.senderType === "SUPPORT" ? "SUPPORT" : "USER",
    senderId: String(item.senderId ?? ""),
    body: typeof item.body === "string" ? item.body : "",
    attachmentUrls: Array.isArray(item.attachmentUrls)
      ? item.attachmentUrls.filter(
          (value): value is string => typeof value === "string"
        )
      : [],
    createdAt:
      typeof item.createdAt === "string"
        ? item.createdAt
        : new Date().toISOString(),
  };
}

function formatMessageDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusBadge(status: TicketStatus) {
  const config = {
    OPEN: {
      className:
        "gap-1 bg-blue-500/10 text-blue-600 hover:bg-blue-500/10",
      icon: MessageCircle,
      label: "Open",
    },
    IN_PROGRESS: {
      className:
        "gap-1 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/10",
      icon: MessageCircle,
      label: "In Progress",
    },
    PENDING: {
      className:
        "gap-1 bg-orange-500/10 text-orange-600 hover:bg-orange-500/10",
      icon: MessageCircle,
      label: "Pending",
    },
    CLOSED: {
      className:
        "gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10",
      icon: CheckCircle2,
      label: "Closed",
    },
    CANCELLED: {
      className:
        "gap-1 bg-red-500/10 text-red-600 hover:bg-red-500/10",
      icon: X,
      label: "Cancelled",
    },
  } as const;

  const item = config[status as keyof typeof config];

  if (!item) {
    return <Badge variant="secondary">{status}</Badge>;
  }

  const Icon = item.icon;

  return (
    <Badge className={item.className}>
      <Icon className="size-3" />
      {item.label}
    </Badge>
  );
}

export function TicketDetailDialog({
  ticketId,
  open,
  onOpenChange,
  onUpdated,
}: TicketDetailDialogProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const ticketIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ticketIdRef.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    const urls = attachments.map((file) =>
      URL.createObjectURL(file)
    );

    setAttachmentPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachments]);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;

    try {
      setLoading(true);

      const response = (await apiFetch(
        `/support-tickets/${ticketId}`,
        { method: "GET" }
      )) as TicketDetailResponse;

      setTicket(response.data);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (open && ticketId) {
      fetchTicket();
    }

    if (!open) {
      setTicket(null);
      setMessage("");
      setAttachments([]);
      setSocketError(null);
    }
  }, [open, ticketId, fetchTicket]);

  /**
   * Socket is only used for receiving realtime messages.
   */
  useEffect(() => {
    if (!open || !ticketId) return;

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("user_token");

    if (!token) {
      setSocketError("Authentication token not found");
      return;
    }

    socketRef.current?.removeAllListeners();
    socketRef.current?.disconnect();

    const socket = createSupportTicketSocket(token);

    socketRef.current = socket;
    setSocketConnected(false);
    setSocketError(null);

    const handleConnect = () => {
      setSocketConnected(true);

      const currentTicketId = ticketIdRef.current;

      if (!currentTicketId) return;

      socket.emit(
        "join_room",
        { ticketId: currentTicketId },
        (response: unknown) => {
          if (
            response &&
            typeof response === "object" &&
            "ok" in response &&
            (response as { ok?: boolean }).ok === false
          ) {
            setSocketError(
              (response as { message?: string }).message ||
                "Unable to join ticket"
            );
          }
        }
      );
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleConnectError = (error: Error) => {
      setSocketConnected(false);
      setSocketError(
        error.message || "Socket connection failed"
      );
    };

    const handleTicketError = (error: { message?: string }) => {
      setSocketError(error?.message || "Socket error");
    };

    const handleReceiveMessage = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;

      const incoming = normalizeTicketMessage(
        (payload as { message?: unknown }).message
      );

      if (!incoming) return;

      const activeTicketId = ticketIdRef.current;

      if (
        !activeTicketId ||
        String(incoming.ticketId) !== String(activeTicketId)
      ) {
        return;
      }

      setTicket((current) => {
        if (!current) return current;

        const exists = current.messages.some(
          (item) => String(item.id) === String(incoming.id)
        );

        if (exists) return current;

        return {
          ...current,
          messages: [...current.messages, incoming],
          totalMessages: current.totalMessages + 1,
          ticket: {
            ...current.ticket,
            lastMessagePreview: incoming.body,
            lastMessageAt: incoming.createdAt,
            updatedAt: incoming.createdAt,
          },
        };
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("ticket_error", handleTicketError);
    socket.on("receive_message", handleReceiveMessage);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("ticket_error", handleTicketError);
      socket.off("receive_message", handleReceiveMessage);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      setSocketConnected(false);
    };
  }, [open, ticketId]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [ticket?.messages]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const selected = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setAttachments((prev) =>
      [...prev, ...selected].slice(0, 5)
    );
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /**
   * Send message + images.
   *
   * REST handles:
   * Multer -> Cloudinary -> MongoDB -> Socket.IO
   */
  const handleSendMessage = async () => {
    const text = message.trim();

    if (
      (!text && attachments.length === 0) ||
      !ticketId ||
      sending ||
      loading
    ) {
      return;
    }

    try {
      setSending(true);
      setSocketError(null);

      const formData = new FormData();

      formData.append("message", text.trim());

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await apiFetch(
        `/support-tickets/${ticketId}/messages`,
        {
          method: "POST",
          body: formData,
        }
      );

      setMessage("");
      setAttachments([]);

      onUpdated?.();
    } catch (error) {
      console.error("Failed to send message:", error);

      setSocketError(
        error instanceof Error
          ? error.message
          : "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketId || closing) return;

    try {
      setClosing(true);

      await apiFetch(
        `/support-tickets/${ticketId}/close`,
        {
          method: "PATCH",
          body: JSON.stringify({ comment: "" }),
        }
      );

      await fetchTicket();
      onUpdated?.();
    } catch (error) {
      console.error("Failed to close ticket:", error);
    } finally {
      setClosing(false);
    }
  };

  const isClosed = ticket?.ticket?.status === "CLOSED";

  const canSend =
    (message.trim().length > 0 || attachments.length > 0) &&
    !sending &&
    !loading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-1.5">
          <DialogTitle className="truncate text-lg">
            {ticket?.ticket?.subject || "Support Ticket"}
          </DialogTitle>

          {ticket && (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Ticket #
                  {ticket.ticket._id.slice(-6).toUpperCase()}
                </span>

                <span
                  className={
                    socketConnected
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                      : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                  }
                >
                  {socketConnected ? "Live" : "Connecting..."}
                </span>
              </div>

              {getStatusBadge(ticket.ticket.status)}
            </div>
          )}
        </DialogHeader>

        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-4 py-6 sm:px-6"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !ticket ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Unable to load ticket.
            </div>
          ) : ticket.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No messages yet.
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {ticket.messages.map((item) => {
                const isUser = item.senderType === "USER";

                return (
                  <div
                    key={item.id}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                        isUser
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md border bg-background"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <CircleUserRound className="size-3.5" />

                        <span className="text-xs font-medium">
                          {isUser ? "You" : "Support Team"}
                        </span>
                      </div>

                      {item.body && (
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {item.body}
                        </p>
                      )}

                      {item.attachmentUrls?.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-1">
                          {item.attachmentUrls.map(
                            (url, index) => (
                              <a
                                key={`${url}-${index}`}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-sm bg-muted/20 p-1"
                              >
                                <img
                                  src={url}
                                  alt=""
                                  className="size-24 rounded-sm object-cover"
                                />
                              </a>
                            )
                          )}
                        </div>
                      )}

                      <p
                        className={`mt-2 text-[11px] ${
                          isUser
                            ? "text-blue-100"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatMessageDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {socketError && (
          <div className="shrink-0 border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {socketError}
          </div>
        )}

        <div className="shrink-0 border-t">
          {!isClosed ? (
            <>
              <div className="p-4">
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="relative"
                      >
                        <img
                          src={attachmentPreviews[index]}
                          alt={file.name}
                          className="size-16 rounded-lg border object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeAttachment(index)
                          }
                          disabled={sending}
                          className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                  }}
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    disabled={
                      sending ||
                      loading ||
                      attachments.length >= 5
                    }
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <Paperclip className="size-5" />
                  </Button>

                  <Input
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={sending || loading}
                  />

                  <Button
                    type="button"
                    size="icon"
                    className="shrink-0"
                    disabled={!canSend}
                    onClick={handleSendMessage}
                  >
                    {sending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Send className="size-5" />
                    )}
                  </Button>
                </div>

                {attachments.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {attachments.length}/5 images selected
                  </p>
                )}
              </div>

              <div className="px-4 pb-4 sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                  onClick={handleCloseTicket}
                  disabled={closing || loading}
                >
                  {closing ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 size-5" />
                  )}

                  {closing
                    ? "Closing Ticket..."
                    : "Close Ticket"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 px-6 py-5 text-sm text-emerald-600">
              <CheckCircle2 className="size-5" />

              <span>This ticket has been closed.</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
