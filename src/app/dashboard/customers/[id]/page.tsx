import { getCustomerById } from "@/lib/actions/customer-actions";
import { notFound } from "next/navigation";
import { CustomerDetailsClient } from "@/components/customers/customer-details-client";

export default async function CustomerDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const customer = await getCustomerById(id);

    if (!customer) {
        notFound();
    }

    return <CustomerDetailsClient customer={customer} />;
}
