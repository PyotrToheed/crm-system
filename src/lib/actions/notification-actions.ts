"use server";

import { sql } from "@/lib/db-lite";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface NotificationDisplay {
    id: string;
    userId: string;
    title: string;
    content: string;
    type: "INFO" | "REMINDER" | "URGENT";
    read: boolean;
    relatedId: string | null;
    createdAt: Date;
}

export async function getNotifications() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    const rows = await sql`
        SELECT * FROM "Notification" 
        WHERE "userId" = ${userId} 
        ORDER BY "createdAt" DESC
    `;

    return rows.map((row: any) => ({
        id: row.id,
        userId: row.userId,
        title: row.title,
        content: row.content,
        type: row.type as any,
        read: row.read,
        relatedId: row.relatedId,
        createdAt: new Date(row.createdAt)
    } as NotificationDisplay));
}

export async function markNotificationAsRead(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    await sql`
        UPDATE "Notification" SET "read" = TRUE 
        WHERE "id" = ${id}
    `;

    revalidatePath("/dashboard");
    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    await sql`
        UPDATE "Notification" SET "read" = TRUE 
        WHERE "userId" = ${userId} AND "read" = FALSE
    `;

    revalidatePath("/dashboard");
    return { success: true };
}

export async function createNotification(data: { userId: string; title: string; content: string; type: "INFO" | "REMINDER" | "URGENT"; relatedId?: string }) {
    const [notification] = await sql`
        INSERT INTO "Notification" (
            "id", "userId", "title", "content", "type", "read", "relatedId", "createdAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${data.userId}, ${data.title}, ${data.content}, ${data.type}, FALSE, ${data.relatedId || null}, NOW()
        ) RETURNING *
    `;
    return notification;
}
