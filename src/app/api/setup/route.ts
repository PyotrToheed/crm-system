import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import net from "net";
import dns from "dns";

export const dynamic = "force-dynamic";

// Manual DNS Resolver to bypass Vercel's EBUSY errors
async function resolveHost(host: string): Promise<string[]> {
    return new Promise((resolve) => {
        dns.resolve4(host, (err, addresses) => {
            if (err) {
                // Fallback to lookup
                dns.lookup(host, { family: 4 }, (err2, address) => {
                    resolve(address ? [address] : []);
                });
            } else {
                resolve(addresses || []);
            }
        });
    });
}

async function checkPort(ip: string, port: number, timeout = 5000): Promise<{ open: boolean; error?: string }> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);

        socket.on("connect", () => {
            socket.destroy();
            resolve({ open: true });
        });

        socket.on("timeout", () => {
            socket.destroy();
            resolve({ open: false, error: "TCP Timeout" });
        });

        socket.on("error", (err) => {
            socket.destroy();
            resolve({ open: false, error: err.message });
        });

        socket.connect(port, ip);
    });
}

export async function GET() {
    const rawUrl = (process.env.DATABASE_URL || "").trim();
    const mask = (url: string) => url.replace(/:([^:@]+)@/, ":****@");

    const diagnosticLogs: string[] = [];
    diagnosticLogs.push(`Starting Hospital Check at ${new Date().toISOString()}`);

    const hostsToTest = [
        "aws-1-ap-southeast-1.pooler.supabase.co",
        "db.xtmpjzhkqfprertebfjp.supabase.co",
        "google.com"
    ];

    const hostReports: any[] = [];

    for (const host of hostsToTest) {
        const ips = await resolveHost(host);
        const portToTest = host.includes("pooler") ? 6543 : (host.includes("google") ? 80 : 5432);

        const results = [];
        for (const ip of ips) {
            const portCheck = await checkPort(ip, portToTest);
            results.push({ ip, port: portToTest, ...portCheck });
        }

        hostReports.push({ host, ips, results });
    }

    let prismaSuccess = false;
    let prismaError = "";

    try {
        const prisma = new PrismaClient({ datasources: { db: { url: rawUrl } } });
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;

        // Seed
        const password = await hash("admin123", 12);
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

        prismaSuccess = true;
        await prisma.$disconnect();
    } catch (e: any) {
        prismaError = e.message;
    }

    return NextResponse.json({
        status: prismaSuccess ? "success" : "error",
        message: prismaSuccess ? "DATABASE RECOVERED! Login now." : "Connection still failing.",
        recommendation: "If pooler IPs are found but port is closed, check Supabase 'IPv4 Compatibility'. If no IPs found, check Vercel DNS settings.",
        diagnostics: {
            urlSpecified: !!rawUrl,
            maskedUrl: mask(rawUrl),
            prismaError
        },
        hostReports
    });
}
