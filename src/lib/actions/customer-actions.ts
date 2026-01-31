"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCustomers(search?: string) {
    return await prisma.customer.findMany({
        where: search
            ? {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                    { phone: { contains: search } },
                    { company: { contains: search } },
                ],
            }
            : undefined,
        orderBy: { createdAt: "desc" },
    });
}

export async function getCustomerById(id: string) {
    if (!prisma.customer) return null;
    return await prisma.customer.findUnique({
        where: { id },
        include: {
            activities: {
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
            },
            tickets: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
}

export async function createCustomer(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const customer = await prisma.customer.create({
        data: {
            ...data,
            userId: (session.user as any).id,
        },
    });

    revalidatePath("/dashboard/customers");
    return customer;
}

export async function updateCustomer(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const customer = await prisma.customer.update({
        where: { id },
        data,
    });

    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${id}`);
    return customer;
}

export async function deleteCustomer(id: string) {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("يسمح فقط للمديرين بحذف العملاء");
    }

    await prisma.customer.delete({
        where: { id },
    });

    revalidatePath("/dashboard/customers");
}
