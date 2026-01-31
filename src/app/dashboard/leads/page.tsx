import { getLeads } from "@/lib/actions/lead-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LeadsClient } from "@/components/leads/leads-client";

export default async function LeadsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const session = await getServerSession(authOptions);
    const leads = await getLeads(q);

    return (
        <LeadsClient
            data={leads}
            userRole={(session?.user as any).role}
            initialSearch={q}
        />
    );
}
