"use client";

import { useI18n } from "../providers/i18n-context";
import { Button } from "@/components/ui/button";
import { Plus, History, MessageSquare, Mail, Phone, FileText, CheckSquare } from "lucide-react";
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
import { ActivityForm } from "./activity-form";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ActivitiesClientProps {
    activities: any[];
    customers: any[];
    leads: any[];
}

export function ActivitiesClient({ activities, customers, leads }: ActivitiesClientProps) {
    const { t, dir } = useI18n();
    const [open, setOpen] = useState(false);

    const typeIcons: any = {
        WHATSAPP: <MessageSquare className="h-4 w-4 text-green-500" />,
        EMAIL: <Mail className="h-4 w-4 text-blue-500" />,
        CALL: <Phone className="h-4 w-4 text-orange-500" />,
        NOTE: <FileText className="h-4 w-4 text-muted-foreground" />,
        TASK: <CheckSquare className="h-4 w-4 text-purple-500" />,
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-primary">{t("nav.activities")}</h1>
                    <p className="text-muted-foreground mt-2">{t("dashboard.activities_desc")}</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("activities.add")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t("activities.add")}</DialogTitle>
                        </DialogHeader>
                        <ActivityForm
                            onSuccess={() => setOpen(false)}
                            customers={customers}
                            leads={leads}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {activities.length === 0 ? (
                <Card className="border-dashed border-2 bg-white/50">
                    <CardContent className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <History className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{t("activities.no_activities")}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("customers.date")}</TableHead>
                                <TableHead>{t("activities.type")}</TableHead>
                                <TableHead>{t("activities.related_to")}</TableHead>
                                <TableHead>{t("activities.content")}</TableHead>
                                <TableHead>{t("leads.userId") || "User"}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(activity.createdAt), "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {typeIcons[activity.type]}
                                            {t(`activities.types.${activity.type}`)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {activity.customer && (
                                            <Badge variant="outline">{t("nav.customers")}: {activity.customer.name}</Badge>
                                        )}
                                        {activity.lead && (
                                            <Badge variant="secondary">{t("nav.leads")}: {activity.lead.name}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">
                                        {activity.content}
                                        {activity.reminderDate && (
                                            <div className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                                                <CheckSquare className="h-3 w-3" />
                                                {format(new Date(activity.reminderDate), "dd/MM/yyyy HH:mm")}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{activity.user.name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
