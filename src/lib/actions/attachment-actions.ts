"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAttachments(filters: { customerId?: string; leadId?: string; activityId?: string; ticketId?: string }) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (!prisma.attachment) {
        console.error("Prisma attachment model is missing!");
        return [];
    }

    return await prisma.attachment.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
    });
}

export async function createAttachment(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (!prisma.attachment) return null;

    const attachment = await prisma.attachment.create({
        data: {
            ...data,
            userId: (session.user as any).id,
        },
    });

    revalidatePath("/dashboard");
    return attachment;
}

export async function deleteAttachment(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (!prisma.attachment) return { success: false };

    // In a real app, we would also delete the file from storage (Uploadthing, S3, etc.)
    await prisma.attachment.delete({
        where: { id },
    });

    revalidatePath("/dashboard");
    return { success: true };
}
