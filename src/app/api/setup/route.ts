import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import net from "net";

export const dynamic = "force-dynamic";

// Helper to test if a port is open
async function checkPort(host: string, port: number, timeout = 3000): Promise<{ open: boolean; error?: string }> {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        socket.setTimeout(timeout);

        socket.on("connect", () => {
            socket.destroy();
            resolve({ open: true });
        });

        socket.on("timeout", () => {
            socket.destroy();
            resolve({ open: false, error: "Timeout" });
        });

        socket.on("error", (err) => {
            socket.destroy();
            resolve({ open: false, error: err.message });
        });

        socket.connect(port, host);
    });
}

export async function GET() {
    const defaultUrl = process.env.DATABASE_URL || "";
    const mask = (url: string) => url.replace(/:([^:@]+)@/, ":****@");

    console.log("🔍 Starting Deep Network Diagnostics...");

    const networkTests: any[] = [
        { name: "Supabase Pooled (6543)", host: "aws-1-ap-southeast-1.pooler.supabase.co", port: 6543 },
        { name: "Supabase Direct (5432)", host: "db.xtmpjzhkqfprertebfjp.supabase.co", port: 5432 },
    ];

    const networkResults = await Promise.all(
        networkTests.map(async (test) => {
            const result = await checkPort(test.host, test.port);
            return { ...test, ...result };
        })
    );

    const results: any[] = [];
    let successClient: PrismaClient | null = null;

    // Only try Prisma if at least one port is open
    if (networkResults.some(r => r.open)) {
        try {
            console.log("Attempting Prisma with Environment Variable...");
            const client = new PrismaClient({ datasources: { db: { url: defaultUrl } } });
            await client.$connect();
            await client.$queryRaw`SELECT 1`;
            successClient = client;
            results.push({ strategy: "Environment Variable", status: "success" });
        } catch (e: any) {
            results.push({ strategy: "Environment Variable", status: "failed", error: e.message });
        }
    }

    if (successClient) {
        try {
            const prisma = successClient;
            const password = await hash("admin123", 12);
            const employeePassword = await hash("emp123", 12);

            await prisma.user.upsert({
                where: { email: "admin@example.com" },
                update: { password },
                create: {
                    email: "admin@example.com",
                    name: "Admin User",
                    password,
                    role: "ADMIN",
                },
            });

            return NextResponse.json({
                status: "success",
                message: "Database reachable and seeded!",
                networkResults,
                results
            });
        } catch (error: any) {
            return NextResponse.json({
                status: "partial_success",
                message: "Connected, but seeding failed.",
                error: error.message,
                networkResults,
                results
            });
        } finally {
            await successClient.$disconnect();
        }
    }

    return NextResponse.json({
        status: "error",
        message: "No database connection could be established.",
        networkResults,
        results,
        recommendation: networkResults.every(r => !r.open)
            ? "Vercel cannot reach Supabase. Check if the project is 'Paused' or if 'IPv4 compatibility' is enabled in Supabase Settings > Database."
            : "Network ports are OPEN, but Prisma failed to authenticate. Check if the password in Vercel settings is 100% correct."
    }, { status: 500 });
}
