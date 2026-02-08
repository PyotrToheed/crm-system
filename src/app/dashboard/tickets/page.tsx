import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { sql } from "@/lib/db-lite";
import { TicketsClient } from "@/components/tickets/tickets-client";
import { getTickets } from "@/lib/actions/ticket-actions";

export default async function TicketsPage() {
    const tickets = await getTickets();
    const customers = await sql`SELECT id, name FROM "Customer"`;

    return (
        <TicketsClient
            tickets={tickets}
            customers={customers}
        />
    );
}
