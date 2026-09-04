"use client";

import { useRef, useState } from "react";
import { Paperclip, PlusCircle, X } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function NewTicketDialog({
    onCreated,
}: {
    onCreated?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const selected = Array.from(files);
        setAttachmentPreviews(selected.map((file) => URL.createObjectURL(file)));
        setAttachments((prev) => [
            ...prev,
            ...selected,
        ].slice(0, 5));
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };
    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim() || loading) return;

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("subject", subject.trim());
            formData.append("message", message.trim());

            attachments.forEach((file) => {
                formData.append("attachments", file);
            });

            await apiFetch("/support-tickets", {
                method: "POST",
                body: formData,
            });

            // Reset form
            setSubject("");
            setMessage("");
            setAttachments([]);

            // Close dialog
            setOpen(false);

            // Refresh parent ticket list
            onCreated?.();
        } catch (error) {
            console.error("Failed to create support ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    const canSubmit =
        subject.trim().length > 0 &&
        message.trim().length > 0 &&
        !loading;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusCircle />
                    New Ticket
                </Button>
            </DialogTrigger>

            <DialogContent>
                {/* Header */}
                <DialogHeader>
                    <DialogTitle>
                        New Support Ticket
                    </DialogTitle>
                </DialogHeader>

                {/* Body */}
                <div className="space-y-5">
                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Subject
                        </label>

                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief description of your issue"
                            className="rounded-lg"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Message
                        </label>

                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Provide more details about your concern"
                            className="min-h-32 resize-none rounded-lg"
                        />
                    </div>

                    {/* Attachments */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Attachments{" "}
                            <span className="text-muted-foreground">
                                (Max 5 images)
                            </span>
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                                handleFiles(e.target.files)
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="flex h-20 w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition hover:bg-muted/50">
                            <Paperclip className="size-5" />
                            Attach Images
                        </button>
                        {/* Selected files */}
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
                                            className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Submit */}
                    <Button
                        type="button"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                        className="
              w-full
              rounded-lg
              bg-blue-600
              text-base
              hover:bg-blue-700
            "
                    >
                        {loading ? "Submitting..." : "Submit Ticket"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
