"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsers() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
}

export async function createUser(data: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const { name, email, password, role } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        },
    });

    revalidatePath("/dashboard/users");
    return user;
}

export async function updateUser(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const { name, email, password, role } = data;
    let updateData: any = { name, email, role };

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
        where: { id },
        data: updateData,
    });

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

    await prisma.user.delete({
        where: { id },
    });

    revalidatePath("/dashboard/users");
    return { success: true };
}
