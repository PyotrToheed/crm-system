"use server";

import { sql } from "@/lib/db-lite";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getLeads(search?: string) {
    if (search) {
        return await sql`
            SELECT * FROM "Lead" 
            WHERE ("name" ILIKE ${'%' + search + '%'} 
               OR "email" ILIKE ${'%' + search + '%'} 
               OR "phone" ILIKE ${'%' + search + '%'} 
               OR "company" ILIKE ${'%' + search + '%'})
            ORDER BY "createdAt" DESC
        `;
    }
    return await sql`
        SELECT * FROM "Lead" 
        WHERE "status" != 'CONVERTED' 
        ORDER BY "createdAt" DESC
    `;
}

export async function createLead(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const [lead] = await sql`
        INSERT INTO "Lead" (
            "id", "name", "email", "phone", "address", "company", "status", "userId", "createdAt", "updatedAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${data.name}, ${data.email}, ${data.phone}, ${data.address}, ${data.company}, ${data.status || 'NEW'}, ${(session.user as any).id}, NOW(), NOW()
        ) RETURNING *
    `;

    revalidatePath("/dashboard/leads");
    return lead;
}

export async function updateLead(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    // Dynamic update query
    const [lead] = await sql`
        UPDATE "Lead" SET ${sql(data)}, "updatedAt" = NOW()
        WHERE "id" = ${id}
        RETURNING *
    `;

    revalidatePath("/dashboard/leads");
    return lead;
}

export async function convertLeadToCustomer(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    // Use transaction for atomic migration
    return await sql.begin(async (sql: any) => {
        const [lead] = await sql`SELECT * FROM "Lead" WHERE "id" = ${id}`;
        if (!lead) throw new Error("Lead not found");

        const [customer] = await sql`
            INSERT INTO "Customer" (
                "id", "name", "email", "phone", "company", "address", "userId", "createdAt", "updatedAt"
            ) VALUES (
                ${crypto.randomUUID()}, ${lead.name}, ${lead.email}, ${lead.phone}, ${lead.company}, ${lead.address}, ${(session.user as any).id}, NOW(), NOW()
            ) RETURNING *
        `;

        await sql`
            UPDATE "Activity" 
            SET "leadId" = NULL, "customerId" = ${customer.id} 
            WHERE "leadId" = ${id}
        `;

        await sql`
            UPDATE "Lead" 
            SET "status" = 'CONVERTED', "updatedAt" = NOW()
            WHERE "id" = ${id}
        `;

        revalidatePath("/dashboard/leads");
        revalidatePath("/dashboard/customers");
        return customer;
    });
}

export async function deleteLead(id: string) {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("يسمح فقط للمديرين بحذف الليدز");
    }

    await sql`DELETE FROM "Lead" WHERE "id" = ${id}`;
    revalidatePath("/dashboard/leads");
}

export async function getLeadById(id: string) {
    const [lead] = await sql`SELECT * FROM "Lead" WHERE "id" = ${id}`;
    if (!lead) return null;

    const activities = await sql`
        SELECT a.*, u.name as "userName" 
        FROM "Activity" a
        JOIN "User" u ON a."userId" = u."id"
        WHERE a."leadId" = ${id}
        ORDER BY a."createdAt" DESC
    `;

    // Map to match the nested structure expected by the frontend
    return {
        ...lead,
        activities: activities.map(a => ({
            ...a,
            user: { name: (a as any).userName }
        }))
    };
}
