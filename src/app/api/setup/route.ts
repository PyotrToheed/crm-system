import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    const defaultUrl = process.env.DATABASE_URL || "";
    // Mask password
    const mask = (url: string) => url.replace(/:([^:@]+)@/, ":****@");

    console.log("🚀 Starting ultimate database setup rescue...");

    const results: any[] = [];
    let successClient: PrismaClient | null = null;

    // Strategy 1: Use the Environment Variable (Current setting)
    try {
        console.log("Attempting Strategy 1: Default Environment Variable...");
        const client = new PrismaClient({ datasources: { db: { url: defaultUrl } } });
        await client.$connect();
        await client.$queryRaw`SELECT 1`;
        successClient = client;
        results.push({ strategy: "Environment Variable", status: "success", url: mask(defaultUrl) });
    } catch (e: any) {
        results.push({ strategy: "Environment Variable", status: "failed", error: e.message, code: e.code });
        console.error("Strategy 1 failed:", e.message);
    }

    // Strategy 2: Direct Fallback (Port 5432) if the pooler is failing
    if (!successClient) {
        try {
            // Reconstruct direct URL from pooled URL pieces if possible, 
            // otherwise try the direct host manually.
            const directUrl = defaultUrl
                .replace("aws-1-ap-southeast-1.pooler.supabase.co:6543", "db.xtmpjzhkqfprertebfjp.supabase.co:5432")
                .replace("postgres.xtmpjzhkqfprertebfjp", "postgres")
                .split("?")[0]; // Remove ?pgbouncer=true

            console.log("Attempting Strategy 2: Direct Connection Fallback...");
            const client = new PrismaClient({ datasources: { db: { url: directUrl } } });
            await client.$connect();
            await client.$queryRaw`SELECT 1`;
            successClient = client;
            results.push({ strategy: "Direct Fallback", status: "success", url: mask(directUrl) });
        } catch (e: any) {
            results.push({ strategy: "Direct Fallback", status: "failed", error: e.message });
        }
    }

    if (!successClient) {
        return NextResponse.json({
            status: "error",
            message: "All database connection strategies failed.",
            results,
            troubleshooting: "Please verify that the password pEWYHxWZIE0m139y is correct on Supabase and that IPv4 is enabled."
        }, { status: 500 });
    }

    try {
        const prisma = successClient;
        const password = await hash("admin123", 12);
        const employeePassword = await hash("emp123", 12);

        // Seed Users
        const admin = await prisma.user.upsert({
            where: { email: "admin@example.com" },
            update: { password },
            create: {
                email: "admin@example.com",
                name: "Admin User",
                password,
                role: "ADMIN",
            },
        });

        const employee = await prisma.user.upsert({
            where: { email: "employee@example.com" },
            update: { password: employeePassword },
            create: {
                email: "employee@example.com",
                name: "Employee User",
                password: employeePassword,
                role: "EMPLOYEE",
            },
        });

        // Seed some sample customers if empty
        const count = await prisma.customer.count();
        if (count === 0) {
            await prisma.customer.create({
                data: {
                    name: "Ali Al-Ahmed",
                    company: "Example Law Firm",
                    userId: admin.id,
                }
            });
        }

        return NextResponse.json({
            status: "success",
            message: "Connection recovered and database seeded!",
            strategyUsed: results.find(r => r.status === "success")?.strategy,
            results
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "partial_success",
            message: "Connection worked, but seeding failed.",
            error: error.message,
            results
        }, { status: 500 });
    } finally {
        if (successClient) await successClient.$disconnect();
    }
}
