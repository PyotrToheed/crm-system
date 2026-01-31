"use client";

import { useI18n } from "@/components/providers/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Target, TrendingUp, FileSpreadsheet, FileText } from "lucide-react";
import { CSVLink } from "react-csv";
import dynamic from "next/dynamic";
import { ReportPDF } from "./report-pdf";

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

interface ReportData {
    totals: {
        customers: number;
        leads: number;
        convertedLeads: number;
        conversionRate: number;
    };
    employeePerformance: {
        name: string;
        activities: number;
        tickets: number;
    }[];
}

export function ReportsClient({ data }: { data: ReportData }) {
    const { t, dir } = useI18n();

    const csvData = data.employeePerformance.map(e => ({
        [t("reports.user_name")]: e.name,
        [t("reports.activity_count")]: e.activities,
        [t("reports.ticket_count")]: e.tickets,
    }));

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-primary">{t("reports.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("reports.desc")}</p>
                </div>
                <div className="flex gap-2">
                    <CSVLink data={csvData} filename="employee_performance.csv">
                        <Button variant="outline" className="gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            {t("reports.export_excel")}
                        </Button>
                    </CSVLink>
                    <PDFDownloadLink
                        document={<ReportPDF data={data} translations={t("reports", { returnObjects: true })} />}
                        fileName="performance_report.pdf"
                    >
                        {({ loading }: { loading: boolean }) => (
                            <Button variant="outline" className="gap-2" disabled={loading}>
                                <FileText className="h-4 w-4" />
                                {loading ? "..." : t("reports.export_pdf")}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">{t("reports.total_customers")}</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-black text-blue-600">{data.totals.customers}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">{t("reports.total_leads")}</CardTitle>
                        <Target className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-black text-orange-600">{data.totals.leads}</p>
                        <p className="text-xs text-muted-foreground mt-1">{data.totals.convertedLeads} {t("reports.leads_converted")}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-bold">{t("reports.conversion_rate")}</CardTitle>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-black text-green-600">{data.totals.conversionRate}%</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("reports.employee_performance")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("reports.user_name")}</TableHead>
                                <TableHead className="text-center">{t("reports.activity_count")}</TableHead>
                                <TableHead className="text-center">{t("reports.ticket_count")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.employeePerformance.map((emp, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{emp.name}</TableCell>
                                    <TableCell className="text-center">{emp.activities}</TableCell>
                                    <TableCell className="text-center">{emp.tickets}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
