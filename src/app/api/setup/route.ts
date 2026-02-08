import { NextResponse } from "next/server";
import { sql } from "@/lib/db-lite";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // 1. Diagnostics: List all tables in the 'public' schema
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        const tableNames = tables.map(t => t.table_name);

        // 2. Try to seed ONLY if the User table exists
        if (tableNames.includes('User')) {
            const password = await hash("admin123", 12);

            await sql`
                INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
                VALUES (${crypto.randomUUID()}, 'Admin User', 'admin@example.com', ${password}, 'ADMIN', NOW(), NOW())
                ON CONFLICT ("email") DO UPDATE SET "password" = ${password}, "updatedAt" = NOW()
            `;

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
            nextStep: "Go to Supabase > SQL Editor > Paste the SQL schema to create tables."
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Connection failed.",
            error: error.message
        }, { status: 500 });
    }
}
