"use server";

import { sql } from "@/lib/db-lite";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface DetailedLog {
    type: string;
    subject: string;
    userName: string;
    date: string;
}

export async function getReportData() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    // Only ADMIN or specifically named managers can access reports
    const user = session.user as any;
    if (user.role !== "ADMIN" && user.name !== "Operations Manager") {
        throw new Error("Unauthorized");
    }

    const [customers] = await sql`SELECT count(*) as count FROM "Customer"`;
    const [leads] = await sql`SELECT count(*) as count FROM "Lead"`;
    const [convertedLeads] = await sql`SELECT count(*) as count FROM "Lead" WHERE "status" = 'CONVERTED'`;

    const users = await sql`
        SELECT u.id, u.name, 
               (SELECT count(*) FROM "Activity" a WHERE a."userId" = u.id) as activity_count,
               (SELECT count(*) FROM "Ticket" t WHERE t."userId" = u.id) as ticket_count
        FROM "User" u
        ORDER BY u."createdAt" DESC
    `;

    // Fetch detailed activity logs for the last 30 days
    const detailedLogs = await sql`
        SELECT 
            'Activity' as "type", 
            a."content" as "subject", 
            u."name" as "userName", 
            a."createdAt" as "date"
        FROM "Activity" a
        JOIN "User" u ON a."userId" = u.id
        UNION ALL
        SELECT 
            'Ticket' as "type", 
            t."title" as "subject", 
            u."name" as "userName", 
            t."createdAt" as "date"
        FROM "Ticket" t
        JOIN "User" u ON t."userId" = u.id
        UNION ALL
        SELECT 
            'Customer' as "type", 
            c."name" as "subject", 
            u."name" as "userName", 
            c."createdAt" as "date"
        FROM "Customer" c
        JOIN "User" u ON c."userId" = u.id
        UNION ALL
        SELECT 
            'Lead' as "type", 
            l."name" as "subject", 
            u."name" as "userName", 
            l."createdAt" as "date"
        FROM "Lead" l
        JOIN "User" u ON l."userId" = u.id
        ORDER BY "date" DESC
        LIMIT 100
    `;

    const leadCount = Number(leads.count);
    const convertedLeadsCount = Number(convertedLeads.count);
    const conversionRate = leadCount > 0 ? (convertedLeadsCount / leadCount) * 100 : 0;

    return {
        totals: {
            customers: Number(customers.count),
            leads: leadCount,
            convertedLeads: convertedLeadsCount,
            conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
        employeePerformance: users.map(u => ({
            name: u.name as string,
            activities: Number(u.activity_count),
            tickets: Number(u.ticket_count),
        })),
        detailedLogs: detailedLogs.map((log: any) => ({
            type: log.type as string,
            subject: log.subject as string,
            userName: log.userName as string,
            date: new Date(log.date).toISOString(),
        } as DetailedLog))
    };
}

export async function getDashboardTrends() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    // Get activity count per day for the last 7 days
    const activityTrend = await sql`
        SELECT 
            TO_CHAR(date_trunc('day', "createdAt"), 'MM-DD') as "day",
            count(*) as "value"
        FROM "Activity"
        WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY 1
        ORDER BY 1 ASC
    `;

    // Get ticket count per day for the last 7 days
    const ticketTrend = await sql`
        SELECT 
            TO_CHAR(date_trunc('day', "createdAt"), 'MM-DD') as "day",
            count(*) as "value"
        FROM "Ticket"
        WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY 1
        ORDER BY 1 ASC
    `;

    return {
        activityTrend,
        ticketTrend
    };
}
