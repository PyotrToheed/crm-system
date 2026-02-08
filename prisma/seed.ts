import { PrismaClient, LeadStatus, ActivityType, TicketPriority, TicketStatus, NotificationType } from "../src/generated/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting professional seeding for AlBaker CRM...");

    // 0. Cleanup existing data to ensure a clean demo environment
    console.log("🧹 Cleaning up old data...");
    await prisma.attachment.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.ticketMessage.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.customer.deleteMany();
    // We keep users (upsert handles them)

    const password = await hash("admin123", 12);
    const employeePassword = await hash("emp123", 12);

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: "admin@albaker.qa" },
        update: { password },
        create: {
            email: "admin@albaker.qa",
            name: "Chief Administrator",
            password,
            role: "ADMIN",
        },
    });

    const employee = await prisma.user.upsert({
        where: { email: "manager@albaker.qa" },
        update: { password: employeePassword },
        create: {
            email: "manager@albaker.qa",
            name: "Operations Manager",
            password: employeePassword,
            role: "EMPLOYEE",
        },
    });

    // 2. Create Customers
    const customersData = [
        { name: "Ahmed Al-Mansouri", email: "ahmed.m@qatar-energy.com", phone: "+974 5501 2345", company: "Qatar Energy", address: "West Bay, Doha, Qatar" },
        { name: "Khalid Bin Rashid", email: "khalid@doha-bank.qa", phone: "+974 4409 8765", company: "Doha Bank", address: "Grand Hamad St, Doha" },
        { name: "Sara Al-Thani", email: "sara.th@qf.org.qa", phone: "+974 3322 1100", company: "Qatar Foundation", address: "Education City, Doha" },
        { name: "Mohammed Al-Kuwari", email: "m.kuwari@ooredoo.qa", phone: "+974 6605 4321", company: "Ooredoo", address: "Ooredoo HQ, Doha" },
        { name: "Fatima Al-Marri", email: "fatima.m@qatarairways.com.qa", phone: "+974 7788 9900", company: "Qatar Airways", address: "Doha, Qatar" },
        { name: "Jasim Al-Sulaiti", email: "jasim@mwt.gov.qa", phone: "+974 4455 6677", company: "Minister of Transport", address: "Doha Corniche" },
        { name: "Noura Bin Hamad", email: "noura@qnb.com", phone: "+974 4440 7777", company: "QNB", address: "Al Corniche, Doha" },
        { name: "Yousif Al-Hajri", email: "yousif@ashghal.gov.qa", phone: "+974 4495 2222", company: "Ashghal", address: "Doha, Qatar" },
        { name: "Reem Al-Hashimi", email: "reem@expo2023.qa", phone: "+974 5566 7788", company: "Expo 2023 Doha", address: "Al Bidda Park" },
        { name: "Abdullah Ali", email: "abdullah@qapco.com.qa", phone: "+974 4477 0000", company: "QAPCO", address: "Mesaieed, Qatar" },
    ];

    const customers = [];
    for (const data of customersData) {
        const c = await prisma.customer.create({
            data: { ...data, userId: admin.id }
        });
        customers.push(c);
    }

    // 3. Create Leads (20+)
    const leadNames = [
        "Robert Smith", "Maria Garcia", "Chen Wei", "Elena Petrova", "Omar Hassan",
        "Yuki Tanaka", "Sophie Martin", "Lucas Silva", "Amira Zaid", "Hans Muller",
        "Liam O'Brien", "Isabella Rossi", "Noah Kim", "Emma Wilson", "Ali Al-Farsi",
        "Chloe Lefebvre", "Daniel Santos", "Layla Mubarak", "Ryan Taylor", "Mina Sato",
        "Ahmed Khalil", "Grace Lee", "Ivan Novak", "Sofia Hernandez", "Kenji Yamamoto"
    ];

    const leads = [];
    for (let i = 0; i < leadNames.length; i++) {
        const l = await prisma.lead.create({
            data: {
                name: leadNames[i],
                email: `${leadNames[i].toLowerCase().replace(" ", ".")}@prospect.com`,
                phone: `+971 50 ${Math.floor(Math.random() * 9000000) + 1000000}`,
                company: `${leadNames[i].split(" ")[1]} Solutions`,
                status: (["NEW", "UNDER_FOLLOWUP", "INTERESTED"][Math.floor(Math.random() * 3)]) as LeadStatus,
                userId: i % 2 === 0 ? admin.id : employee.id,
            }
        });
        leads.push(l);
    }

    // 4. Create Activities
    const activityTypes: ActivityType[] = ["CALL", "EMAIL", "WHATSAPP", "NOTE", "TASK"];
    for (let i = 0; i < 30; i++) {
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const isCustomer = Math.random() > 0.3;
        const lead = isCustomer ? null : leads[Math.floor(Math.random() * leads.length)];

        await prisma.activity.create({
            data: {
                type,
                content: `Interaction ${i + 1}: Discussed requirements for upcoming project.`,
                customerId: isCustomer ? customer.id : null,
                leadId: lead ? lead.id : null,
                userId: Math.random() > 0.5 ? admin.id : employee.id,
                reminderDate: type === "TASK" ? new Date(Date.now() + Math.random() * 604800000) : null,
            }
        });
    }

    // 5. Create Tickets (15+)
    const ticketThemes = [
        "Login Issues", "Invoice Discrepancy", "Feature Request", "Bug Report", "Training Needed",
        "Downtime Alert", "Access Control", "Data Export Request", "UI Glitch", "API Token Reset",
        "Contract Renewal", "Payment Failed", "Mobile App Crash", "Slow Performance"
    ];

    for (let i = 0; i < 15; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        await prisma.ticket.create({
            data: {
                title: ticketThemes[i % ticketThemes.length] + ` (#${100 + i})`,
                description: "The client reported an issue during the morning sync. Needs urgent attention.",
                priority: (["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)]) as TicketPriority,
                status: (["OPEN", "IN_PROGRESS", "CLOSED"][Math.floor(Math.random() * 3)]) as TicketStatus,
                customerId: customer.id,
                userId: i % 2 === 0 ? admin.id : employee.id,
            }
        });
    }

    // 6. Notifications
    await prisma.notification.createMany({
        data: [
            { userId: admin.id, title: "Critical Server Load", content: "High CPU usage detected.", type: "URGENT" },
            { userId: admin.id, title: "New Lead", content: "Layla Mubarak just registered.", type: "INFO" },
            { userId: employee.id, title: "Meeting Reminder", content: "Demo at 3 PM.", type: "REMINDER" },
        ]
    });

    console.log("✅ Seeding complete! Database is now a professional showroom.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
