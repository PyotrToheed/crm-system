import { notFound } from "next/navigation";
import { getTicketDetails } from "@/lib/actions/ticket-actions";
import { TicketDetailsClient } from "@/components/tickets/ticket-details-client";

export default async function TicketDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const ticket = await getTicketDetails(id);

    if (!ticket) {
        notFound();
    }

    return <TicketDetailsClient ticket={ticket} />;
}
