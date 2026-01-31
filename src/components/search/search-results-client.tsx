"use client";

import { useI18n } from "@/components/providers/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Target, MessageSquare, Ticket, ArrowRight, ArrowLeft } from "lucide-react";

interface SearchResultsProps {
    query: string;
    results: {
        customers: any[];
        leads: any[];
        activities: any[];
        tickets: any[];
    };
}

export function SearchResultsClient({ query, results }: SearchResultsProps) {
    const { t, dir } = useI18n();

    const hasResults = results.customers.length > 0 || results.leads.length > 0 || results.activities.length > 0 || results.tickets.length > 0;

    const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold font-sans text-primary">
                {t("search.results")} &quot;{query}&quot;
            </h1>

            {!hasResults && (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        {t("search.no_results")}
                    </CardContent>
                </Card>
            )}

            {results.customers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            {t("search.sections.customers")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {results.customers.map((c: any) => (
                            <Link key={c.id} href={`/dashboard/customers/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                                <div>
                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-sm text-muted-foreground">{c.email || c.phone}</p>
                                </div>
                                <Arrow className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}

            {results.leads.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-orange-500" />
                            {t("search.sections.leads")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {results.leads.map((l: any) => (
                            <Link key={l.id} href={`/dashboard/leads/${l.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                                <div>
                                    <p className="font-medium">{l.name}</p>
                                    <p className="text-sm text-muted-foreground">{l.email || l.phone}</p>
                                </div>
                                <Arrow className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}

            {results.activities.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-green-500" />
                            {t("search.sections.activities")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {results.activities.map((a: any) => (
                            <div key={a.id} className="p-3 rounded-lg bg-muted/30">
                                <p className="text-sm">{a.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">{a.user?.name}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {results.tickets.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-purple-500" />
                            {t("search.sections.tickets")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {results.tickets.map((tk: any) => (
                            <Link key={tk.id} href={`/dashboard/tickets/${tk.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                                <div>
                                    <p className="font-medium">{tk.title}</p>
                                    <p className="text-sm text-muted-foreground">{tk.description?.substring(0, 50)}...</p>
                                </div>
                                <Arrow className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
