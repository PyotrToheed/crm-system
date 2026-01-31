import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReportData } from "@/lib/actions/report-actions";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if ((session.user as any).role !== "ADMIN") {
        redirect("/dashboard");
    }

    const data = await getReportData();

    return <ReportsClient data={data} />;
}
