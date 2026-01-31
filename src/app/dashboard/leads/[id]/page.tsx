import { getLeadById } from "@/lib/actions/lead-actions";
import { notFound } from "next/navigation";
import { LeadDetailsClient } from "@/components/leads/lead-details-client";

export default async function LeadDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const lead = await getLeadById(id);

    if (!lead) {
        notFound();
    }

    return <LeadDetailsClient lead={lead} />;
}
