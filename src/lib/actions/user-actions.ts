"use server";

import { sql } from "@/lib/db-lite";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export interface UserDisplay {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
}

export async function getUsers() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const rows = await sql`
        SELECT "id", "name", "email", "role", "createdAt" 
        FROM "User" 
        ORDER BY "createdAt" DESC
    `;

    return rows.map((row: any) => ({
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        role: row.role as string,
        createdAt: new Date(row.createdAt)
    } as UserDisplay));
}

export async function createUser(data: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const { name, email, password, role } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await sql`
        INSERT INTO "User" (
            "id", "name", "email", "password", "role", "createdAt", "updatedAt"
        ) VALUES (
            ${crypto.randomUUID()}, ${name}, ${email}, ${hashedPassword}, ${role}, NOW(), NOW()
        ) RETURNING "id", "name", "email", "role", "createdAt"
    `;

    revalidatePath("/dashboard/users");
    return user;
}

export async function updateUser(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const { name, email, password, role } = data;
    const updateData: any = { name, email, role, updatedAt: new Date() };

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const [user] = await sql`
        UPDATE "User" SET ${sql(updateData)}
        WHERE "id" = ${id}
        RETURNING "id", "name", "email", "role", "createdAt"
    `;

    revalidatePath("/dashboard/users");
    return user;
}

export async function deleteUser(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    // Prevent deleting self
    if ((session.user as any).id === id) {
        throw new Error("Cannot delete your own account");
    }

    await sql`DELETE FROM "User" WHERE "id" = ${id}`;

    revalidatePath("/dashboard/users");
    return { success: true };
}
