"use server";

import { sql } from "@/lib/db-lite";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCustomers(search?: string) {
    if (search) {
        return await sql`
            SELECT * FROM "Customer" 
            WHERE ("name" ILIKE ${'%' + search + '%'} 
               OR "email" ILIKE ${'%' + search + '%'} 
               OR "phone" ILIKE ${'%' + search + '%'} 
               OR "company" ILIKE ${'%' + search + '%'})
            ORDER BY "createdAt" DESC
        `;
    }
    return await sql`
        SELECT * FROM "Customer" 
        ORDER BY "createdAt" DESC
    `;
}

export async function getCustomerById(id: string) {
    const [customer] = await sql`SELECT * FROM "Customer" WHERE "id" = ${id}`;
    if (!customer) return null;

    const activities = await sql`
        SELECT a.*, u.name as "userName" 
        FROM "Activity" a
        JOIN "User" u ON a."userId" = u."id"
        WHERE a."customerId" = ${id}
        ORDER BY a."createdAt" DESC
    `;

    const tickets = await sql`
        SELECT t.*, c.name as "customerName"
        FROM "Ticket" t
        JOIN "Customer" c ON t."customerId" = c.id
        WHERE t."customerId" = ${id} 
        ORDER BY t."createdAt" DESC
    `;

    return {
        ...customer,
        activities: activities.map(a => ({
            ...a,
            user: { name: (a as any).userName }
        })),
        tickets: tickets.map(t => ({
            ...t,
            customer: { name: (t as any).customerName }
        }))
    };
}

export async function createCustomer(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const [customer] = await sql`
        INSERT INTO "Customer" (
            "id", "name", "email", "phone", "address", "company", "userId", "createdAt", "updatedAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${data.name}, ${data.email}, ${data.phone}, ${data.address}, ${data.company}, ${(session.user as any).id}, NOW(), NOW()
        ) RETURNING *
    `;

    revalidatePath("/dashboard/customers");
    return customer;
}

export async function updateCustomer(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const [customer] = await sql`
        UPDATE "Customer" SET ${sql(data)}, "updatedAt" = NOW()
        WHERE "id" = ${id}
        RETURNING *
    `;

    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${id}`);
    return customer;
}

export async function deleteCustomer(id: string) {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("يسمح فقط للمديرين بحذف العملاء");
    }

    await sql`DELETE FROM "Customer" WHERE "id" = ${id}`;

    revalidatePath("/dashboard/customers");
}
