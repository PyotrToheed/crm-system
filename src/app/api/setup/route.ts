import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import net from "net";
import dns from "dns";
import { promisify } from "util";

export const dynamic = "force-dynamic";

const lookup = promisify(dns.lookup);

async function checkPort(host: string, port: number, timeout = 3000): Promise<{ open: boolean; ip?: string; error?: string }> {
    try {
        // Try DNS resolution first
        const resolve = await lookup(host).catch(e => ({ address: undefined, error: e.message }));
        const ip = (resolve as any).address;

        if (!ip) return { open: false, error: `DNS Failed: ${(resolve as any).error}` };

        return new Promise((resolvePromise) => {
            const socket = new net.Socket();
            socket.setTimeout(timeout);

            socket.on("connect", () => {
                socket.destroy();
                resolvePromise({ open: true, ip });
            });

            socket.on("timeout", () => {
                socket.destroy();
                resolvePromise({ open: false, ip, error: "TCP Timeout" });
            });

            socket.on("error", (err) => {
                socket.destroy();
                resolvePromise({ open: false, ip, error: err.message });
            });

            socket.connect(port, ip); // Connect to IP directly
        });
    } catch (e: any) {
        return { open: false, error: e.message };
    }
}

export async function GET() {
    const rawUrl = process.env.DATABASE_URL || "";
    const cleanUrl = rawUrl.trim();

    console.log("🕵️ Ultimate Connection Investigation...");

    const networkTests = [
        { name: "Global DNS (Google)", host: "google.com", port: 80 },
        { name: "Supabase Pooled", host: "aws-1-ap-southeast-1.pooler.supabase.co", port: 6543 },
        { name: "Supabase Direct", host: "db.xtmpjzhkqfprertebfjp.supabase.co", port: 5432 },
        { name: "Supabase Raw Host", host: "xtmpjzhkqfprertebfjp.supabase.co", port: 5432 }
    ];

    const networkResults = await Promise.all(
        networkTests.map(async (test) => {
            const result = await checkPort(test.host, test.port);
            return { ...test, ...result };
        })
    );

    let prismaResult = "Skipped";
    let seedResult = "Skipped";

    if (networkResults.some(r => r.open)) {
        try {
            const client = new PrismaClient({ datasources: { db: { url: cleanUrl } } });
            await client.$connect();
            prismaResult = "Connected!";

            // Seed
            const password = await hash("admin123", 12);
            await client.user.upsert({
                where: { email: "admin@example.com" },
                update: { password },
                create: {
                    email: "admin@example.com",
                    name: "Admin User",
                    password,
                    role: "ADMIN",
                },
            });
            seedResult = "Success!";
            await client.$disconnect();
        } catch (e: any) {
            prismaResult = `Failed: ${e.message}`;
            seedResult = "Failed";
        }
    }

    return NextResponse.json({
        status: seedResult === "Success!" ? "success" : "error",
        diagnostics: {
            processEnvUrlExists: !!rawUrl,
            urlWasTrimmed: rawUrl !== cleanUrl,
            prismaResult,
            seedResult
        },
        networkResults,
        help: "Check networkResults. If google.com is closed, Vercel outgoing is blocked. If only Supabase is closed, check Supabase status."
    });
}
