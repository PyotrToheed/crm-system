import { getCustomers } from "@/lib/actions/customer-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CustomersClient } from "@/components/customers/customers-client";

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const session = await getServerSession(authOptions);
    const customers = await getCustomers(q);

    return (
        <CustomersClient
            data={customers}
            userRole={(session?.user as any).role}
            initialSearch={q}
        />
    );
}
