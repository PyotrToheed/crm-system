"use client";

import { InteractionTimeline } from "@/components/activities/interaction-timeline";
import { ActivityForm } from "@/components/activities/activity-form";
import { Plus, Target, Building2, Phone, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/components/providers/i18n-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadDetailsClientProps {
    lead: any;
}

export function LeadDetailsClient({ lead }: LeadDetailsClientProps) {
    const { t, dir } = useI18n();

    const statusMap: any = {
        NEW: { label: t("leads.statuses.NEW"), color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        UNDER_FOLLOWUP: { label: t("leads.statuses.UNDER_FOLLOWUP"), color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
        INTERESTED: { label: t("leads.statuses.INTERESTED"), color: "bg-green-500/10 text-green-500 border-green-500/20" },
        CONVERTED: { label: t("leads.statuses.CONVERTED"), color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    };

    const timelineItems = lead.activities.map((a: any) => ({
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
                        <Link href="/dashboard/leads">
                            {dir === "rtl" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-sans">{t("leads.details")}</h1>
                    <Badge variant="outline" className={statusMap[lead.status].color}>
                        {statusMap[lead.status].label}
                    </Badge>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("activities.add")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("activities.add")}</DialogTitle>
                        </DialogHeader>
                        <ActivityForm initialLeadId={lead.id} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                {t("leads.contact_info")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("customers.name")}</p>
                                <p className="font-medium text-lg">{lead.name}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("customers.phone")}</p>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium" dir="ltr">{lead.phone || "-"}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("nav.tickets")}</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{lead.email || "-"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t("customers.company")}</p>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{lead.company || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{t("leads.follow_up_history")}</CardTitle>
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
