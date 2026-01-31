import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    const adminEmail = "admin@example.com";
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log("Admin user already exists.");
        return;
    }

    const hashedPassword = await hash("changeme", 12);

    await prisma.user.create({
        data: {
            name: "مدير النظام",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: changeme");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
