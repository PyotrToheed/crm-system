"use server";

import { sql } from "@/lib/db-lite";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function globalSearch(query: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";

    const commonWhere = isAdmin ? sql`` : sql`AND "userId" = ${userId}`;

    const [customers, leads, activities, tickets] = await Promise.all([
        sql`
            SELECT * FROM "Customer" 
            WHERE ("name" ILIKE ${'%' + query + '%'} OR "email" ILIKE ${'%' + query + '%'} OR "phone" ILIKE ${'%' + query + '%'})
            ${commonWhere}
            LIMIT 5
        `,
        sql`
            SELECT * FROM "Lead" 
            WHERE ("name" ILIKE ${'%' + query + '%'} OR "email" ILIKE ${'%' + query + '%'} OR "phone" ILIKE ${'%' + query + '%'})
            AND "status" != 'CONVERTED'
            ${commonWhere}
            LIMIT 5
        `,
        sql`
            SELECT a.*, u.name as "userName"
            FROM "Activity" a
            JOIN "User" u ON a."userId" = u."id"
            WHERE a."content" ILIKE ${'%' + query + '%'}
            ${commonWhere}
            LIMIT 5
        `,
        sql`
            SELECT t.*, c.name as "customerName"
            FROM "Ticket" t
            JOIN "Customer" c ON t."customerId" = c.id
            WHERE (t."title" ILIKE ${'%' + query + '%'} OR t."description" ILIKE ${'%' + query + '%'})
            ${commonWhere}
            LIMIT 5
        `,
    ]);

    return {
        customers,
        leads,
        activities: activities.map(a => ({
            ...a,
            user: { name: (a as any).userName }
        })),
        tickets: tickets.map(t => ({
            ...t,
            customer: { name: (t as any).customerName }
        })),
    };
}
