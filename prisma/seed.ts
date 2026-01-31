import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seeding...");

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

    const customer2 = await prisma.customer.create({
        data: {
            name: "Sara Khalil",
            email: "sara@outlook.com",
            phone: "+971509876543",
            company: "Dubai Finance",
            address: "Dubai, UAE",
            userId: employee.id,
        }
    });

    // 3. Create Leads
    const lead1 = await prisma.lead.create({
        data: {
            name: "John Doe",
            email: "john@global.com",
            phone: "+123456789",
            company: "Global Corp",
            status: "NEW",
            userId: admin.id,
        }
    });

    const lead2 = await prisma.lead.create({
        data: {
            name: "Fatima Ali",
            email: "fatima@qatar.qa",
            phone: "+97433221100",
            status: "UNDER_FOLLOWUP",
            userId: employee.id,
        }
    });

    // 4. Create Activities
    await prisma.activity.createMany({
        data: [
            {
                type: "CALL",
                content: "Introduction call with Ahmed",
                customerId: customer1.id,
                userId: admin.id,
            },
            {
                type: "EMAIL",
                content: "Sent proposal to Sara",
                customerId: customer2.id,
                userId: employee.id,
            },
            {
                type: "WHATSAPP",
                content: "WhatsApp follow-up with Fatima",
                leadId: lead2.id,
                userId: employee.id,
            },
            {
                type: "TASK",
                content: "Prepare contract for Riyadh Tech",
                customerId: customer1.id,
                userId: admin.id,
                reminderDate: new Date(Date.now() + 86400000), // Tomorrow
            }
        ]
    });

    // 5. Create Tickets
    const ticket1 = await prisma.ticket.create({
        data: {
            title: "Access Issue",
            description: "Cannot access the portal",
            priority: "HIGH",
            status: "OPEN",
            customerId: customer1.id,
            userId: admin.id,
        }
    });

    await prisma.ticketMessage.create({
        data: {
            content: "We are looking into the access issues.",
            ticketId: ticket1.id,
            userId: admin.id,
        }
    });

    // 6. Create Notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: admin.id,
                title: "New Lead Assigned",
                content: "John Doe has been assigned to you.",
                type: "INFO",
            },
            {
                userId: admin.id,
                title: "Urgent Ticket",
                content: "A high priority ticket has been created.",
                type: "URGENT",
                relatedId: ticket1.id,
            },
            {
                userId: employee.id,
                title: "Task Reminder",
                content: "You have a task due tomorrow.",
                type: "REMINDER",
            }
        ]
    });

    // 7. Create Attachments (Mock URLs)
    await prisma.attachment.create({
        data: {
            name: "proposal_v1.pdf",
            url: "https://example.com/files/proposal.pdf",
            type: "application/pdf",
            size: 1024 * 542,
            customerId: customer1.id,
            userId: admin.id,
        }
    });

    console.log("✅ Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
