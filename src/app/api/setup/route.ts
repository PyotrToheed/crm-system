import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        console.log("🌱 Starting remote seeding...");

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

        // Check if customers already exist to avoid duplicates if re-visited
        const customerCount = await prisma.customer.count();
        if (customerCount === 0) {
            // 2. Create Customers
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

            // 3. Create Leads
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

            // 4. Create Activities
            await prisma.activity.create({
                data: {
                    type: "CALL",
                    content: "Introduction call with Ahmed",
                    customerId: customer1.id,
                    userId: admin.id,
                }
            });
        }

        return NextResponse.json({
            message: "Database seeded successfully!",
            admin: "admin@example.com / admin123",
            employee: "employee@example.com / emp123"
        });
    } catch (error: any) {
        console.error("Setup error:", error);
        return NextResponse.json({
            error: "Failed to seed database",
            details: error.message
        }, { status: 500 });
    }
}
