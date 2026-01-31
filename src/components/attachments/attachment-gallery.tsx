"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Image, Film, Trash2, Download, X } from "lucide-react";
import { createAttachment, deleteAttachment } from "@/lib/actions/attachment-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    user?: { name: string };
    createdAt: Date;
}

interface AttachmentGalleryProps {
    attachments: Attachment[];
    customerId?: string;
    leadId?: string;
    activityId?: string;
    ticketId?: string;
}

export function AttachmentGallery({ attachments, customerId, leadId, activityId, ticketId }: AttachmentGalleryProps) {
    const { t } = useI18n();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <Image className="h-8 w-8 text-blue-500" />;
        if (type.startsWith("video/")) return <Film className="h-8 w-8 text-purple-500" />;
        return <FileText className="h-8 w-8 text-gray-500" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // For demo purposes, we'll create a mock URL. In production, use UploadThing or similar.
            // This simulates the upload process.
            const mockUrl = `/uploads/${Date.now()}_${file.name}`;

            await createAttachment({
                name: file.name,
                url: mockUrl,
                type: file.type,
                size: file.size,
                customerId,
                leadId,
                activityId,
                ticketId,
            });

            toast.success(t("common.success_add"));
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(t("common.error"));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("attachments.delete_confirm"))) return;
        try {
            await deleteAttachment(id);
            toast.success(t("common.success_delete"));
            router.refresh();
        } catch (error) {
            toast.error(t("common.error"));
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{t("attachments.title")}</CardTitle>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Upload className="h-4 w-4" />
                            {t("attachments.upload")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("attachments.upload")}</DialogTitle>
                        </DialogHeader>
                        <div className="py-6">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                                    </p>
                                </div>
                                <Input
                                    type="file"
                                    className="hidden"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {attachments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {t("attachments.no_files")}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="group relative p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    {getFileIcon(attachment.type)}
                                    <p className="text-sm font-medium text-center truncate w-full" title={attachment.name}>
                                        {attachment.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatSize(attachment.size)}
                                    </p>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500 hover:text-red-600"
                                        onClick={() => handleDelete(attachment.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
