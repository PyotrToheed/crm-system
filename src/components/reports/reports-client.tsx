"use client";

import { useI18n } from "@/components/providers/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Target, TrendingUp, FileSpreadsheet, FileText, ClipboardList } from "lucide-react";
import { CSVLink } from "react-csv";
import dynamic from "next/dynamic";
import { ReportPDF } from "./report-pdf";
import { format } from "date-fns";

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
    detailedLogs: {
        type: string;
        subject: string;
        userName: string;
        date: string;
    }[];
}

export function ReportsClient({ data }: { data: ReportData }) {
    const { t, dir } = useI18n();

    const csvData = data.detailedLogs.map(log => ({
        [t("reports.date") || "Date"]: format(new Date(log.date), "dd/MM/yyyy HH:mm"),
        [t("reports.user_name") || "User"]: log.userName,
        [t("reports.action_type") || "Type"]: log.type,
        [t("reports.subject") || "Subject"]: log.subject,
    }));

    return (
        <div className="p-8 space-y-8 bg-[#f8fafc]/50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-primary">{t("reports.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("reports.desc")}</p>
                </div>
                <div className="flex gap-2">
                    <CSVLink data={csvData} filename="activity_report.csv">
                        <Button variant="outline" className="gap-2 bg-white border-slate-200">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            {t("reports.export_excel")}
                        </Button>
                    </CSVLink>
                    <PDFDownloadLink
                        document={<ReportPDF data={data} translations={t("reports", { returnObjects: true })} />}
                        fileName="activity_report.pdf"
                    >
                        {({ loading }: { loading: boolean }) => (
                            <Button variant="outline" className="gap-2 bg-white border-slate-200" disabled={loading}>
                                <FileText className="h-4 w-4 text-red-600" />
                                {loading ? "..." : t("reports.export_pdf")}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-none shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("reports.total_customers")}</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-slate-900">{data.totals.customers}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("reports.total_leads")}</CardTitle>
                        <Target className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-slate-900">{data.totals.leads}</p>
                        <p className="text-xs text-muted-foreground mt-1">{data.totals.convertedLeads} {t("reports.leads_converted")}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("reports.conversion_rate")}</CardTitle>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-slate-900">{data.totals.conversionRate}%</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-slate-50 flex flex-row items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-bold">Itemized Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="pl-6 w-[150px]">Date</TableHead>
                                <TableHead className="w-[150px]">User</TableHead>
                                <TableHead className="w-[120px]">Action</TableHead>
                                <TableHead>Subject</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.detailedLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No recent activities found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.detailedLogs.map((log, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-6 text-sm text-slate-500 font-medium">
                                            {format(new Date(log.date), "dd/MM/yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell className="text-sm font-semibold text-slate-700">
                                            {log.userName}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${log.type === 'Activity' ? 'bg-purple-100 text-purple-700' :
                                                    log.type === 'Ticket' ? 'bg-blue-100 text-blue-700' :
                                                        log.type === 'Customer' ? 'bg-green-100 text-green-700' :
                                                            'bg-orange-100 text-orange-700'
                                                }`}>
                                                {log.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600 font-medium">
                                            {log.subject}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
