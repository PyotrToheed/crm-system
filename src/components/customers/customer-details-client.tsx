"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Building2, Mail, MapPin, Phone, User, History, Plus, Ticket } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/components/providers/i18n-context";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { InteractionTimeline } from "@/components/activities/interaction-timeline";
import { TicketForm } from "@/components/tickets/ticket-form";
import { ActivityForm } from "@/components/activities/activity-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CustomerDetailsClientProps {
    customer: any;
}

export function CustomerDetailsClient({ customer }: CustomerDetailsClientProps) {
    const { t, dir } = useI18n();

    const timelineItems = customer.activities.map((a: any) => ({
        id: a.id,
        type: a.type,
        content: a.content,
        userName: a.user.name,
        createdAt: a.createdAt,
        reminderDate: a.reminderDate,
    }));

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/customers">
                            {dir === "rtl" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-sans">{t("customers.details")}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t("activities.add")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("activities.add")}</DialogTitle>
                            </DialogHeader>
                            <ActivityForm initialCustomerId={customer.id} />
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t("tickets.add")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("tickets.add")}</DialogTitle>
                            </DialogHeader>
                            <TicketForm initialCustomerId={customer.id} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                {t("customers.basic_info")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("customers.name")}</p>
                                <p className="font-medium text-lg">{customer.name}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("customers.phone")}</p>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium" dir="ltr">{customer.phone || "-"}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("nav.tickets")}</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{customer.email || "-"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("customers.company")}</p>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{customer.company || "-"}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("leads.address") || "Address"}</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{customer.address || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-primary" />
                                {t("nav.tickets")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {customer.tickets.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">{t("tickets.no_tickets")}</p>
                                ) : (
                                    customer.tickets.map((ticket: any) => (
                                        <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium line-clamp-1">{ticket.title}</span>
                                                <Badge variant="outline" className="text-[10px] scale-90">
                                                    {t(`tickets.statuses.${ticket.status}`)}
                                                </Badge>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {format(new Date(ticket.createdAt), "dd/MM/yyyy")}
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{t("customers.interaction_history")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InteractionTimeline items={timelineItems} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
