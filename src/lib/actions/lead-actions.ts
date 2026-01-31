"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getLeads(search?: string) {
    return await prisma.lead.findMany({
        where: search
            ? {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                    { phone: { contains: search } },
                    { company: { contains: search } },
                ],
            }
            : {
                status: { not: "CONVERTED" },
            },
        orderBy: { createdAt: "desc" },
    });
}

export async function createLead(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const lead = await prisma.lead.create({
        data: {
            ...data,
            userId: (session.user as any).id,
        },
    });

    revalidatePath("/dashboard/leads");
    return lead;
}

export async function updateLead(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const lead = await prisma.lead.update({
        where: { id },
        data,
    });

    revalidatePath("/dashboard/leads");
    return lead;
}

export async function convertLeadToCustomer(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const lead = await prisma.lead.findUnique({
        where: { id },
    });

    if (!lead) throw new Error("Lead not found");

    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create Customer
        const customer = await (tx as any).customer.create({
            data: {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company,
                address: lead.address,
                userId: (session.user as any).id,
            },
        });

        // 2. Move Activities
        await (tx as any).activity.updateMany({
            where: { leadId: id },
            data: {
                leadId: null,
                customerId: customer.id,
            },
        });

        // 3. Update Lead Status
        await (tx as any).lead.update({
            where: { id },
            data: { status: "CONVERTED" },
        });

        return customer;
    });

    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/customers");
    return result;
}

export async function deleteLead(id: string) {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("يسمح فقط للمديرين بحذف الليدز");
    }

    await prisma.lead.delete({
        where: { id },
    });

    revalidatePath("/dashboard/leads");
}

export async function getLeadById(id: string) {
    if (!prisma.lead) return null;
    return await prisma.lead.findUnique({
        where: { id },
        include: {
            activities: {
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
            },
        },
    });
}
