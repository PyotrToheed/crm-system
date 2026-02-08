"use server";

import { sql } from "@/lib/db-lite";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Define enums locally since we're removing prisma client
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export async function getTickets() {
    const rows = await sql`
        SELECT t.*, c.name as "customerName", u.name as "userName"
        FROM "Ticket" t
        JOIN "Customer" c ON t."customerId" = c."id"
        JOIN "User" u ON t."userId" = u."id"
        ORDER BY t."createdAt" DESC
    `;

    return rows.map((row: any) => ({
        ...row,
        customer: { name: row.customerName },
        user: { name: row.userName }
    }));
}

export async function createTicket(data: {
    customerId: string;
    title: string;
    description: string;
    priority: TicketPriority;
}) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const [ticket] = await sql`
        INSERT INTO "Ticket" (
            "id", "customerId", "title", "description", "priority", "status", "userId", "createdAt", "updatedAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${data.customerId}, ${data.title}, ${data.description}, ${data.priority}, 'OPEN', ${(session.user as any).id}, NOW(), NOW()
        ) RETURNING *
    `;

    revalidatePath("/dashboard/tickets");
    revalidatePath(`/dashboard/customers/${data.customerId}`);
    return ticket;
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const [ticket] = await sql`
        UPDATE "Ticket" 
        SET "status" = ${status}, "updatedAt" = NOW()
        WHERE "id" = ${id}
        RETURNING *
    `;

    revalidatePath("/dashboard/tickets");
    revalidatePath(`/dashboard/tickets/${id}`);
    revalidatePath("/dashboard");
    return ticket;
}

export async function addTicketMessage(ticketId: string, content: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const [message] = await sql`
        INSERT INTO "TicketMessage" (
            "id", "ticketId", "content", "userId", "createdAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${ticketId}, ${content}, ${(session.user as any).id}, NOW()
        ) RETURNING *
    `;

    revalidatePath(`/dashboard/tickets/${ticketId}`);
    return message;
}

export async function getTicketDetails(id: string) {
    const [ticket] = await sql`SELECT * FROM "Ticket" WHERE "id" = ${id}`;
    if (!ticket) return null;

    const [customer] = await sql`SELECT * FROM "Customer" WHERE "id" = ${ticket.customerId}`;
    const [user] = await sql`SELECT name FROM "User" WHERE "id" = ${ticket.userId}`;

    const messages = await sql`
        SELECT tm.*, u.name as "userName"
        FROM "TicketMessage" tm
        JOIN "User" u ON tm."userId" = u."id"
        WHERE tm."ticketId" = ${id}
        ORDER BY tm."createdAt" ASC
    `;

    return {
        ...ticket,
        customer,
        user: { name: user?.name },
        messages: messages.map(m => ({
            ...m,
            user: { name: (m as any).userName }
        }))
    };
}
