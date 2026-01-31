"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Target, Ticket, BarChart3 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-context";

interface DashboardClientProps {
    customerCount: number;
    leadCount: number;
    ticketCount: number;
    userName: string;
}

export function DashboardClient({
    customerCount,
    leadCount,
    ticketCount,
    userName
}: DashboardClientProps) {
    const { t } = useI18n();

    return (
        <div className="p-8 space-y-8 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold font-sans text-primary">{t("dashboard.title")}</h1>
                <p className="text-muted-foreground mt-2">{t("dashboard.welcome")}, {userName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white hover:shadow-md transition-shadow border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">{t("dashboard.customers")}</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-primary">{customerCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("dashboard.customers_total")}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-md transition-shadow border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">{t("dashboard.leads")}</CardTitle>
                        <Target className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-primary">{leadCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("dashboard.leads_active")}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-md transition-shadow border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">{t("dashboard.tickets")}</CardTitle>
                        <Ticket className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-primary">{ticketCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("dashboard.tickets_desc")}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-dashed border-2 bg-white/50">
                <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{t("dashboard.welcome_msg")}</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                            {t("dashboard.setup_msg")}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
