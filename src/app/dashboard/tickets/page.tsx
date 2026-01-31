import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { prisma } from "@/lib/db";
import { TicketsClient } from "@/components/tickets/tickets-client";
import { getTickets } from "@/lib/actions/ticket-actions";

export default async function TicketsPage() {
    const tickets = await getTickets();
    const customers = await prisma.customer.findMany({ select: { id: true, name: true } });

    return (
        <TicketsClient
            tickets={tickets}
            customers={customers}
        />
    );
}
