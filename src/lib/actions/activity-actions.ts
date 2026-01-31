"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ActivityType } from "@prisma/client";

export async function getActivities() {
    return await prisma.activity.findMany({
        include: {
            customer: true,
            lead: true,
            user: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createActivity(data: {
    type: ActivityType;
    content: string;
    customerId?: string;
    leadId?: string;
    reminderDate?: Date | null;
}) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const activity = await prisma.activity.create({
        data: {
            ...data,
            userId: (session.user as any).id,
        },
    });

    revalidatePath("/dashboard/activities");
    if (data.customerId) revalidatePath(`/dashboard/customers/${data.customerId}`);
    if (data.leadId) revalidatePath(`/dashboard/leads/${data.leadId}`);

    return activity;
}
