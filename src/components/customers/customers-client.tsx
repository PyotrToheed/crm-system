"use client";

import { CustomersTable } from "@/components/customers/customers-table";
import { BulkImportDialog } from "@/components/bulk-import-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/customers/customer-form";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-context";

interface CustomersClientProps {
    data: any[];
    userRole: string;
    initialSearch?: string;
}

export function CustomersClient({ data, userRole, initialSearch }: CustomersClientProps) {
    const { t, dir } = useI18n();

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <h1 className="text-3xl font-bold font-sans text-primary">{t("customers.title")}</h1>
                    <p className="text-muted-foreground mt-2">{t("nav.customers")}</p>
                </div>

                <div className="flex gap-2">
                    <BulkImportDialog type="customers" />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t("customers.add")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]" dir={dir}>
                            <DialogHeader>
                                <DialogTitle>{t("customers.add_title")}</DialogTitle>
                            </DialogHeader>
                            <CustomerForm />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
                <div className="relative flex-1">
                    <Search className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                        dir === "rtl" ? "right-3" : "left-3"
                    )} />
                    <form>
                        <Input
                            name="q"
                            placeholder={t("customers.search")}
                            className={dir === "rtl" ? "pr-10" : "pl-10"}
                            defaultValue={initialSearch}
                        />
                    </form>
                </div>
            </div>

            <CustomersTable
                data={data}
                userRole={userRole}
            />
        </div>
    );
}

import { cn } from "@/lib/utils";
