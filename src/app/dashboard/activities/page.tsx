import { sql } from "@/lib/db-lite";
import { ActivitiesClient } from "@/components/activities/activities-client";
import { getActivities } from "@/lib/actions/activity-actions";

export default async function ActivitiesPage() {
    const activities = await getActivities();
    const customers = await sql`SELECT id, name FROM "Customer"`;
    const leads = await sql`SELECT id, name FROM "Lead" WHERE ("status" != 'CONVERTED')`;

    return (
        <ActivitiesClient
            activities={activities}
            customers={customers}
            leads={leads}
        />
    );
}
