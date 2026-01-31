import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function GET() {
    try {
        const adminExists = await prisma.user.findUnique({
            where: { email: "admin@example.com" },
        });

        if (adminExists) {
            return NextResponse.json({ message: "Admin user already exists" }, { status: 400 });
        }

        const hashedPassword = await hash("changeme", 12);

        const admin = await prisma.user.create({
            data: {
                name: "مدير النظام",
                email: "admin@example.com",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        return NextResponse.json({
            message: "Admin user created successfully",
            user: {
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
