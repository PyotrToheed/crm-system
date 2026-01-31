import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { data } = body;

        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ error: "No data provided" }, { status: 400 });
        }

        // Map and validate
        const customersToCreate = data.map((item: any) => ({
            name: item.name || item.Name || "Unknown Customer",
            email: item.email || item.Email || null,
            phone: item.phone || item.Phone || null,
            company: item.company || item.Company || null,
            address: item.address || item.Address || null,
            userId: (session.user as any).id,
        })).filter((c: any) => c.name !== "Unknown Customer");

        if (customersToCreate.length === 0) {
            return NextResponse.json({ error: "No valid customers found" }, { status: 400 });
        }

        const result = await prisma.customer.createMany({
            data: customersToCreate,
        });

        return NextResponse.json({ count: result.count, success: true });
    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
