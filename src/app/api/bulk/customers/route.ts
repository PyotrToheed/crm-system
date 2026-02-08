import { NextResponse } from "next/server";
import { sql } from "@/lib/db-lite";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
            id: crypto.randomUUID(),
            name: item.name || item.Name || "Unknown Customer",
            email: item.email || item.Email || null,
            phone: item.phone || item.Phone || null,
            company: item.company || item.Company || null,
            address: item.address || item.Address || null,
            userId: (session.user as any).id,
            createdAt: new Date(),
            updatedAt: new Date(),
        })).filter((c: any) => c.name !== "Unknown Customer");

        if (customersToCreate.length === 0) {
            return NextResponse.json({ error: "No valid customers found" }, { status: 400 });
        }

        await sql`
            INSERT INTO "Customer" ${sql(customersToCreate)}
        `;

        return NextResponse.json({ count: customersToCreate.length, success: true });
    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
