import { prisma } from "@/lib/db";
import { ActivitiesClient } from "@/components/activities/activities-client";
import { getActivities } from "@/lib/actions/activity-actions";

export default async function ActivitiesPage() {
    const activities = await getActivities();
    const customers = await prisma.customer.findMany({ select: { id: true, name: true } });
    const leads = await prisma.lead.findMany({
        where: { status: { not: "CONVERTED" } },
        select: { id: true, name: true }
    });

    return (
        <ActivitiesClient
            activities={activities}
            customers={customers}
            leads={leads}
        />
    );
}
