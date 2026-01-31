import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    const dbUrl = process.env.DATABASE_URL || "";
    // Mask password for logging
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");

    console.log("🌱 Starting remote seeding diagnonstics...");
    console.log("📡 Using DATABASE_URL:", maskedUrl);

    try {
        // Test connection
        await prisma.$queryRaw`SELECT 1`;
        console.log("✅ Database connection successful!");

        const password = await hash("admin123", 12);
        const employeePassword = await hash("emp123", 12);

        // 1. Create Users
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

        // 2. Create sample data
        const customerCount = await prisma.customer.count();
        if (customerCount === 0) {
            const customer1 = await prisma.customer.create({
                data: {
                    name: "Ahmed Mohammed",
                    email: "ahmed@example.com",
                    phone: "+966501234567",
                    company: "Riyadh Tech",
                    address: "Riyadh, KSA",
                    userId: admin.id,
                }
            });

            await prisma.lead.create({
                data: {
                    name: "John Doe",
                    email: "john@global.com",
                    phone: "+123456789",
                    company: "Global Corp",
                    status: "NEW",
                    userId: admin.id,
                }
            });
        }

        return NextResponse.json({
            status: "success",
            message: "Database seeded successfully!",
            diagnostics: {
                dbUrlSpecified: !!dbUrl,
                maskedUrl: maskedUrl,
            }
        });
    } catch (error: any) {
        console.error("❌ Setup error:", error);
        return NextResponse.json({
            status: "error",
            error: "Failed to seed database",
            message: error.message,
            code: error.code,
            diagnostics: {
                dbUrlSpecified: !!dbUrl,
                maskedUrl: maskedUrl,
                help: "Check if DATABASE_URL is correct in Vercel settings and ensures IPv4 compatibility is enabled if not using pooler."
            }
        }, { status: 500 });
    }
}
