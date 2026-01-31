"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TicketPriority, TicketStatus } from "@prisma/client";

export async function getTickets() {
    return await prisma.ticket.findMany({
        include: {
            customer: true,
            user: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createTicket(data: {
    customerId: string;
    title: string;
    description: string;
    priority: TicketPriority;
}) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const ticket = await prisma.ticket.create({
        data: {
            ...data,
            userId: (session.user as any).id,
            status: "OPEN",
        },
    });

    revalidatePath("/dashboard/tickets");
    revalidatePath(`/dashboard/customers/${data.customerId}`);
    return ticket;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const ticket = await prisma.ticket.update({
        where: { id },
        data: { status },
    });

    revalidatePath("/dashboard/tickets");
    revalidatePath(`/dashboard/tickets/${id}`);
    revalidatePath("/dashboard");
    return ticket;
}

export async function addTicketMessage(ticketId: string, content: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const message = await prisma.ticketMessage.create({
        data: {
            ticketId,
            content,
            userId: (session.user as any).id,
        },
    });

    revalidatePath(`/dashboard/tickets/${ticketId}`);
    return message;
}

export async function getTicketDetails(id: string) {
    if (!prisma.ticket) return null;
    return await prisma.ticket.findUnique({
        where: { id },
        include: {
            customer: true,
            user: {
                select: { name: true }
            },
            messages: {
                include: {
                    user: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: "asc" }
            }
        }
    });
}
