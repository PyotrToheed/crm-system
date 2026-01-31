import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    // We are now using the CORRECT .com TLD as seen on your dashboard
    const dbUrl = process.env.DATABASE_URL?.trim() || "";

    console.log("🏁 Final Setup Attempt...");

    const prisma = new PrismaClient({
        datasources: {
            db: { url: dbUrl }
        }
    });

    try {
        await prisma.$connect();

        const password = await hash("admin123", 12);

        // Final Seeding
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
            message: "DATABASE RECOVERED! You can log in now.",
            credentials: {
                url: "admin@example.com",
                password: "admin123"
            }
        });
    } catch (error: any) {
        console.error("Setup failed:", error.message);
        return NextResponse.json({
            status: "error",
            message: "Database connection failed again.",
            error: error.message,
            tip: "Check your Vercel Environment Variables. The URL must end in .com (not .co) and use port 6543."
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
