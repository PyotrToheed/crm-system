"use client";

import { useI18n } from "../providers/i18n-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Send, History, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { addTicketMessage, updateTicketStatus } from "@/lib/actions/ticket-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

interface TicketDetailsClientProps {
    ticket: any;
}

export function TicketDetailsClient({ ticket }: TicketDetailsClientProps) {
    const { t, dir } = useI18n();
    const [newMessage, setNewMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const priorityColors: any = {
        LOW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        MEDIUM: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        HIGH: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    const statusColors: any = {
        OPEN: "bg-green-500/10 text-green-500 border-green-500/20",
        IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        CLOSED: "bg-muted text-muted-foreground",
    };

    const handleAddMessage = async () => {
        if (!newMessage.trim()) return;
        setIsSubmitting(true);
        try {
            await addTicketMessage(ticket.id, newMessage);
            setNewMessage("");
            toast.success(t("common.success_add"));
        } catch (error) {
            toast.error(t("common.error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (status: string) => {
        try {
            await updateTicketStatus(ticket.id, status as any);
            toast.success(t("common.success_update"));
        } catch (error) {
            toast.error(t("common.error"));
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/tickets">
                            {dir === "rtl" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-sans">{ticket.title}</h1>
                        <p className="text-muted-foreground">#{ticket.id.slice(-6)} - {ticket.customer.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={priorityColors[ticket.priority]}>
                        {t(`tickets.priorities.${ticket.priority}`)}
                    </Badge>
                    <Badge variant="outline" className={statusColors[ticket.status]}>
                        {t(`tickets.statuses.${ticket.status}`)}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("tickets.messages")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1 bg-muted/30 p-4 rounded-lg">
                                <p className="text-sm font-medium mb-2">{t("activities.content")}</p>
                                <p className="text-slate-700">{ticket.description}</p>
                            </div>

                            <Separator />

                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {ticket.messages.map((msg: any) => (
                                    <div key={msg.id} className="flex flex-col space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold">{msg.user.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(msg.createdAt), "dd/MM/yyyy HH:mm")}
                                            </span>
                                        </div>
                                        <div className="bg-white border rounded-lg p-3 text-sm shadow-sm">
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch gap-4 border-t pt-6">
                            <Textarea
                                placeholder={t("tickets.add_message")}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button className="w-full gap-2" onClick={handleAddMessage} disabled={isSubmitting || !newMessage.trim()}>
                                <Send className="h-4 w-4" />
                                {t("tickets.send")}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("tickets.status")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant={ticket.status === "OPEN" ? "default" : "outline"}
                                className="w-full justify-start gap-2"
                                onClick={() => handleStatusChange("OPEN")}
                            >
                                <AlertCircle className="h-4 w-4" />
                                {t("tickets.statuses.OPEN")}
                            </Button>
                            <Button
                                variant={ticket.status === "IN_PROGRESS" ? "default" : "outline"}
                                className="w-full justify-start gap-2"
                                onClick={() => handleStatusChange("IN_PROGRESS")}
                            >
                                <Clock className="h-4 w-4" />
                                {t("tickets.statuses.IN_PROGRESS")}
                            </Button>
                            <Button
                                variant={ticket.status === "CLOSED" ? "default" : "outline"}
                                className="w-full justify-start gap-2"
                                onClick={() => handleStatusChange("CLOSED")}
                            >
                                <CheckCircle className="h-4 w-4" />
                                {t("tickets.statuses.CLOSED")}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("customers.basic_info")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{t("customers.name")}</p>
                                <p className="font-medium">{ticket.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t("customers.phone")}</p>
                                <p className="font-medium" dir="ltr">{ticket.customer.phone || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
