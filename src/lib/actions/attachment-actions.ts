"use server";

import { sql } from "@/lib/db-lite";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAttachments(filters: { customerId?: string; leadId?: string; activityId?: string; ticketId?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    // Dynamic WHERE clause
    const where = [];
    if (filters.customerId) where.push(sql`"customerId" = ${filters.customerId}`);
    if (filters.leadId) where.push(sql`"leadId" = ${filters.leadId}`);
    if (filters.activityId) where.push(sql`"activityId" = ${filters.activityId}`);
    if (filters.ticketId) where.push(sql`"ticketId" = ${filters.ticketId}`);

    const query = sql`
        SELECT a.*, u.name as "userName" 
        FROM "Attachment" a
        JOIN "User" u ON a."userId" = u."id"
        ${where.length > 0 ? sql`WHERE ${where.reduce((acc, curr) => sql`${acc} AND ${curr}`)}` : sql``}
        ORDER BY a."createdAt" DESC
    `;

    const attachments = await query;
    return attachments.map(a => ({
        ...a,
        user: { name: (a as any).userName }
    }));
}

export async function createAttachment(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const [attachment] = await sql`
        INSERT INTO "Attachment" (
            "id", "name", "url", "type", "size", "customerId", "leadId", "activityId", "ticketId", "userId", "createdAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${data.name}, ${data.url}, ${data.type}, ${data.size}, ${data.customerId || null}, ${data.leadId || null}, ${data.activityId || null}, ${data.ticketId || null}, ${(session.user as any).id}, NOW()
        ) RETURNING *
    `;

    revalidatePath("/dashboard");
    return attachment;
}

export async function deleteAttachment(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    await sql`DELETE FROM "Attachment" WHERE "id" = ${id}`;

    revalidatePath("/dashboard");
    return { success: true };
}
