"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getReportData() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const [customerCount, leadCount, convertedLeadsCount] = await Promise.all([
        prisma.customer.count(),
        prisma.lead.count(),
        prisma.lead.count({ where: { status: "CONVERTED" } }),
    ]);

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            _count: {
                select: {
                    activities: true,
                    tickets: true,
                },
            },
        },
    });

    const conversionRate = leadCount > 0 ? (convertedLeadsCount / leadCount) * 100 : 0;

    return {
        totals: {
            customers: customerCount,
            leads: leadCount,
            convertedLeads: convertedLeadsCount,
            conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
        employeePerformance: users.map(u => ({
            name: u.name,
            activities: u._count.activities,
            tickets: u._count.tickets,
        })),
    };
}
