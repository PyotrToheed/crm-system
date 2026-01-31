import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/lib/actions/user-actions";
import { UsersClient } from "@/components/users/users-client";

export default async function UsersPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if ((session.user as any).role !== "ADMIN") {
        redirect("/dashboard");
    }

    const users = await getUsers();

    return <UsersClient users={users} />;
}
