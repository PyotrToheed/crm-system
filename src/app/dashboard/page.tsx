import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const user = session.user as any;

    const [customerCount, leadCount, ticketCount, userName] = await Promise.all([
        prisma.customer.count({
            where: user.role === "EMPLOYEE"
                ? { userId: user.id }
                : {}
        }),
        prisma.lead.count({
            where: {
                status: { not: "CONVERTED" },
                ...(user.role === "EMPLOYEE" ? { userId: user.id } : {})
            }
        }),
        prisma.ticket.count({
            where: {
                status: { not: "CLOSED" },
                ...(user.role === "EMPLOYEE" ? { userId: user.id } : {})
            }
        }),
        Promise.resolve(user.name || "User")
    ]);

    return (
        <DashboardClient
            customerCount={customerCount}
            leadCount={leadCount}
            ticketCount={ticketCount}
            userName={userName}
        />
    );
}
