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
    // CRITICAL: .trim() the URL in case the user pasted a space in Vercel settings
    const rawUrl = process.env.DATABASE_URL || "";
    const cleanUrl = rawUrl.trim();

    const mask = (url: string) => url.replace(/:([^:@]+)@/, ":****@").trim();

    console.log("🔍 Starting Deep Network Diagnostics...");

    // Extract host from cleanUrl
    let extractedHost = "";
    let extractedPort = 5432;
    try {
        const urlMatch = cleanUrl.match(/@([^:\/?# ]+):?(\d+)?/);
        if (urlMatch) {
            extractedHost = urlMatch[1];
            extractedPort = urlMatch[2] ? parseInt(urlMatch[2]) : 5432;
        }
    } catch (e) { }

    const networkTests: any[] = [
        { name: "Current Settings Host", host: extractedHost, port: extractedPort },
        { name: "Direct Link Test", host: "db.xtmpjzhkqfprertebfjp.supabase.co", port: 5432 },
        { name: "Pooled Link Test", host: "aws-1-ap-southeast-1.pooler.supabase.co", port: 6543 },
    ];

    const networkResults = await Promise.all(
        networkTests.map(async (test) => {
            if (!test.host) return { ...test, open: false, error: "No host provided" };
            const result = await checkPort(test.host, test.port);
            return { ...test, ...result };
        })
    );

    let successClient: PrismaClient | null = null;
    let strategyLog = "";

    try {
        console.log("Attempting Prisma with Clean URL...");
        const client = new PrismaClient({ datasources: { db: { url: cleanUrl } } });
        await client.$connect();
        await client.$queryRaw`SELECT 1`;
        successClient = client;
        strategyLog = "Connection Successful";
    } catch (e: any) {
        strategyLog = `Failed: ${e.message}`;
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
                diagnostics: {
                    urlCleaned: rawUrl !== cleanUrl,
                    maskedUrl: mask(cleanUrl),
                    strategyLog
                },
                networkResults
            });
        } catch (error: any) {
            return NextResponse.json({
                status: "partial_success",
                message: "Connected, but seeding failed.",
                error: error.message,
                networkResults
            });
        } finally {
            await successClient.$disconnect();
        }
    }

    return NextResponse.json({
        status: "error",
        message: "No database connection could be established.",
        diagnostics: {
            urlCleaned: rawUrl !== cleanUrl,
            maskedUrl: mask(cleanUrl),
            strategyLog,
            envVarDefined: !!process.env.DATABASE_URL
        },
        networkResults,
        recommendation: "If networkResults show ENOTFOUND, verify there are NO SPACES in your Vercel Environment Variables. Also, check if your Supabase project is 'Paused' in the Supabase Dashboard."
    }, { status: 500 });
}
