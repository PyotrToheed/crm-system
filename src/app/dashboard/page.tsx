import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { sql } from "@/lib/db-lite";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = session.user as any;

    // As per user feedback, "Operations Manager" and others feel counts are "mocked"
    // when they only see their own. We will show global counts for all dashboard cards.
    // Full record access remains filtered in the specific tables if needed, 
    // but the high-level overview should be representative of the whole system.

    const [customers, leads, tickets] = await Promise.all([
        sql`SELECT count(*) as count FROM "Customer"`,
        sql`SELECT count(*) as count FROM "Lead" WHERE ("status" != 'CONVERTED')`,
        sql`SELECT count(*) as count FROM "Ticket" WHERE ("status" != 'CLOSED')`,
    ]);

    // Fetch trend data for charts
    const activityTrend = await sql`
        SELECT 
            TO_CHAR(date_trunc('day', "createdAt"), 'MM-DD') as "day",
            count(*) as "value"
        FROM "Activity"
        WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY 1
        ORDER BY 1 ASC
    `;

    return (
        <DashboardClient
            customerCount={Number(customers[0].count)}
            leadCount={Number(leads[0].count)}
            ticketCount={Number(tickets[0].count)}
            userName={user.name}
            activityTrend={activityTrend}
        />
    );
}
