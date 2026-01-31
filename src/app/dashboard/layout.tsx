import { Sidebar } from "@/components/layout/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
// Triggering HMR restart for Prisma client sync

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-muted/30">
            <Sidebar userRole={(session.user as any).role} />
            <main className="flex-1 w-full overflow-y-auto">
                {children}
            </main>
            <Toaster position="top-center" />
        </div>
    );
}
