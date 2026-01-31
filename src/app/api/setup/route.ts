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
                dns.lookup(host, { family: 4 }, (err2, address) => {
                    resolve(address ? [address] : []);
                });
            } else {
                resolve(addresses || []);
            }
        });
    });
}

async function checkPort(ip: string, port: number, timeout = 3000): Promise<{ open: boolean; error?: string }> {
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
    const projectRef = "xtmpjzhkqfprertebfjp";
    const region = "ap-southeast-1";
    const password = "pEWYHxWZIE0m139y";

    const hostVariations = [
        `aws-0-${region}.pooler.supabase.co`,
        `aws-0-${region}.pooler.supabase.com`,
        `aws-1-${region}.pooler.supabase.co`,
        `aws-1-${region}.pooler.supabase.com`,
        `db.${projectRef}.supabase.co`,
        `db.${projectRef}.supabase.com`,
        `${projectRef}.supabase.co`,
        `${projectRef}.supabase.com`
    ];

    const ports = [5432, 6543];
    const bruteForceResults: any[] = [];

    for (const host of hostVariations) {
        const ips = await resolveHost(host);
        const hostResult: any = { host, ips: ips.length, checks: [] };

        for (const ip of ips) {
            for (const port of ports) {
                const check = await checkPort(ip, port);
                hostResult.checks.push({ ip, port, ...check });
            }
        }
        bruteForceResults.push(hostResult);
    }

    // Try to find ANY successful combination
    let recoveryUrl = "";
    const winner = bruteForceResults.find(r => r.checks.some((c: any) => c.open));
    if (winner) {
        const winningCheck = winner.checks.find((c: any) => c.open);
        const protocol = "postgresql";
        const user = winner.host.includes("pooler") ? `postgres.${projectRef}` : "postgres";
        const pgbouncer = winningCheck.port === 6543 ? "?pgbouncer=true" : "";
        recoveryUrl = `${protocol}://${user}:${password}@${winner.host}:${winningCheck.port}/postgres${pgbouncer}`;
    }

    let prismaRes = "Not attempted";
    if (recoveryUrl) {
        try {
            const prisma = new PrismaClient({ datasources: { db: { url: recoveryUrl } } });
            await prisma.$connect();
            const pwHash = await hash("admin123", 12);
            await prisma.user.upsert({
                where: { email: "admin@example.com" },
                update: { password: pwHash },
                create: { email: "admin@example.com", name: "Admin User", password: pwHash, role: "ADMIN" },
            });
            prismaRes = "SUCCESS! Database Recovered.";
            await prisma.$disconnect();
        } catch (e: any) {
            prismaRes = `Failed with Winning URL: ${e.message}`;
        }
    }

    return NextResponse.json({
        status: prismaRes.includes("SUCCESS") ? "success" : "error",
        prismaRes,
        recoveryUrl: recoveryUrl ? recoveryUrl.replace(/:[^:@]+@/, ":****@") : "None found",
        bruteForceResults,
        help: "If everything says ips: 0, the project might be PAUSED in Supabase. Otherwise, please check if port 5432 or 6543 is OPEN in any result."
    });
}
