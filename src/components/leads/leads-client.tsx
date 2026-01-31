"use client";

import { LeadsTable } from "@/components/leads/leads-table";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LeadForm } from "@/components/leads/lead-form";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-context";
import { cn } from "@/lib/utils";

interface LeadsClientProps {
    data: any[];
    userRole: string;
    initialSearch?: string;
}

export function LeadsClient({ data, userRole, initialSearch }: LeadsClientProps) {
    const { t, dir } = useI18n();

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <h1 className="text-3xl font-bold font-sans text-primary">{t("leads.title")}</h1>
                    <p className="text-muted-foreground mt-2">{t("nav.leads")}</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t("leads.add")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" dir={dir}>
                        <DialogHeader>
                            <DialogTitle>{t("leads.add")}</DialogTitle>
                        </DialogHeader>
                        <LeadForm />
                    </DialogContent>
                </Dialog>
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

            <LeadsTable
                data={data}
                userRole={userRole}
            />
        </div>
    );
}
