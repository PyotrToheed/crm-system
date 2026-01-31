"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function globalSearch(query: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";

    const commonWhere = !isAdmin ? { userId } : {};

    const results = await Promise.all([
        prisma.customer ? prisma.customer.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                    { phone: { contains: query } },
                ],
                ...commonWhere,
            },
            take: 5,
        }) : Promise.resolve([]),
        prisma.lead ? prisma.lead.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                    { phone: { contains: query } },
                ],
                status: { not: "CONVERTED" },
                ...commonWhere,
            },
            take: 5,
        }) : Promise.resolve([]),
        prisma.activity ? prisma.activity.findMany({
            where: {
                content: { contains: query },
                ...commonWhere,
            },
            include: { user: { select: { name: true } } },
            take: 5,
        }) : Promise.resolve([]),
        prisma.ticket ? prisma.ticket.findMany({
            where: {
                OR: [
                    { title: { contains: query } },
                    { description: { contains: query } },
                ],
                ...commonWhere,
            },
            take: 5,
        }) : Promise.resolve([]),
    ]);

    const [customers, leads, activities, tickets] = results;

    return {
        customers,
        leads,
        activities,
        tickets,
    };
}
