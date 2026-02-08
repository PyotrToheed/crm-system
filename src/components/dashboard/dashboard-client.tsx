"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Target, Ticket, BarChart3, TrendingUp } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-context";
import { DashboardCharts } from "./dashboard-charts";

interface DashboardClientProps {
    customerCount: number;
    leadCount: number;
    ticketCount: number;
    userName: string;
    activityTrend: any[];
}

export function DashboardClient({
    customerCount,
    leadCount,
    ticketCount,
    userName,
    activityTrend
}: DashboardClientProps) {
    const { t } = useI18n();

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#f8fafc]/50">
            <div>
                <h1 className="text-3xl font-bold font-sans text-primary tracking-tight">{t("dashboard.title")}</h1>
                <p className="text-muted-foreground mt-2">{t("dashboard.welcome")}, <span className="text-primary font-semibold">{userName}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white hover:shadow-lg transition-all border-none shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.customers")}</CardTitle>
                        <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-900">{customerCount}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-blue-600 font-medium">Aggregate</span> total across system
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-lg transition-all border-none shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.leads")}</CardTitle>
                        <div className="p-2 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors">
                            <Target className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-900">{leadCount}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-orange-600 font-medium">{leadCount}</span> active leads in pipeline
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-lg transition-all border-none shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.tickets")}</CardTitle>
                        <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                            <Ticket className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-900">{ticketCount}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-green-600 font-medium">{ticketCount}</span> tickets awaiting response
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg font-bold">Activity Trend (7 Days)</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <DashboardCharts data={activityTrend} />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{t("dashboard.welcome_msg")}</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm leading-relaxed">
                            {t("dashboard.setup_msg")}
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
