"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    if (!prisma.notification) {
        console.error("Prisma notification model is missing!");
        return [];
    }

    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}

export async function markNotificationAsRead(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (!prisma.notification) return { success: false };

    await prisma.notification.update({
        where: { id },
        data: { read: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const userId = (session.user as any).id;

    if (!prisma.notification) return { success: false };

    await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

export async function createNotification(data: { userId: string; title: string; content: string; type: "INFO" | "REMINDER" | "URGENT"; relatedId?: string }) {
    if (!prisma.notification) return null;
    // This can be called from other server actions to trigger notifications
    const notification = await prisma.notification.create({
        data,
    });
    return notification;
}
