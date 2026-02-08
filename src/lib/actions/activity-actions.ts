"use server";

import { sql } from "@/lib/db-lite";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getActivities() {
    const rows = await sql`
        SELECT 
            a.*,
            c.name as "customerName",
            l.name as "leadName",
            u.name as "userName"
        FROM "Activity" a
        LEFT JOIN "Customer" c ON a."customerId" = c.id
        LEFT JOIN "Lead" l ON a."leadId" = l.id
        LEFT JOIN "User" u ON a."userId" = u.id
        ORDER BY a."createdAt" DESC
    `;

    return rows.map((row: any) => ({
        ...row,
        customer: row.customerId ? { name: row.customerName } : null,
        lead: row.leadId ? { name: row.leadName } : null,
        user: { name: row.userName }
    }));
}

export async function createActivity(data: {
    type: string;
    content: string;
    customerId?: string;
    leadId?: string;
    reminderDate?: Date | null;
}) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const [activity] = await sql`
        INSERT INTO "Activity" (
            "id", "type", "content", "customerId", "leadId", "userId", "reminderDate", "createdAt", "updatedAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${data.type}, ${data.content}, 
            ${data.customerId || null}, ${data.leadId || null}, 
            ${(session.user as any).id}, ${data.reminderDate || null}, 
            NOW(), NOW()
        ) RETURNING *
    `;

    revalidatePath("/dashboard/activities");
    if (data.customerId) revalidatePath(`/dashboard/customers/${data.customerId}`);
    if (data.leadId) revalidatePath(`/dashboard/leads/${data.leadId}`);

    return activity;
}
