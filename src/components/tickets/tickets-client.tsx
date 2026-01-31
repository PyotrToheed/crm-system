"use client";

import { useI18n } from "../providers/i18n-context";
import { Button } from "@/components/ui/button";
import { Plus, Ticket, Eye } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { TicketForm } from "./ticket-form";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface TicketsClientProps {
    tickets: any[];
    customers: any[];
}

export function TicketsClient({ tickets, customers }: TicketsClientProps) {
    const { t, dir } = useI18n();
    const [open, setOpen] = useState(false);

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

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-primary">{t("nav.tickets")}</h1>
                    <p className="text-muted-foreground mt-2">{t("dashboard.tickets_desc_page")}</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("tickets.add")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t("tickets.add")}</DialogTitle>
                        </DialogHeader>
                        <TicketForm
                            onSuccess={() => setOpen(false)}
                            customers={customers}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {tickets.length === 0 ? (
                <Card className="border-dashed border-2 bg-white/50">
                    <CardContent className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <Ticket className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{t("tickets.no_tickets")}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("tickets.subject")}</TableHead>
                                <TableHead>{t("nav.customers")}</TableHead>
                                <TableHead>{t("tickets.priority")}</TableHead>
                                <TableHead>{t("tickets.status")}</TableHead>
                                <TableHead>{t("customers.date")}</TableHead>
                                <TableHead className="w-[100px]">{t("customers.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">{ticket.title}</TableCell>
                                    <TableCell>{ticket.customer.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={priorityColors[ticket.priority]}>
                                            {t(`tickets.priorities.${ticket.priority}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusColors[ticket.status]}>
                                            {t(`tickets.statuses.${ticket.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(ticket.createdAt), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/dashboard/tickets/${ticket.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
