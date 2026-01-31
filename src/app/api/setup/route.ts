import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    const dbUrl = process.env.DATABASE_URL?.trim() || "";
    const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

    try {
        await prisma.$connect();

        // 1. Diagnostics: List all tables in the 'public' schema
        const tables: any[] = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        const tableNames = tables.map(t => t.table_name);

        // 2. Try to seed ONLY if the User table exists
        if (tableNames.includes('User')) {
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

            return NextResponse.json({
                status: "success",
                message: "Tables found and User seeded!",
                tableNames
            });
        }

        return NextResponse.json({
            status: "error",
            message: "Connection is PERFECT, but the database is empty (no tables).",
            foundTables: tableNames,
            nextStep: "Go to Supabase > SQL Editor > Paste the SQL I just gave you in our chat."
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Connection failed.",
            error: error.message
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
