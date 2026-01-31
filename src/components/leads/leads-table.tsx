"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Eye, UserPlus, Loader2 } from "lucide-react";
import { deleteLead, convertLeadToCustomer } from "@/lib/actions/lead-actions";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LeadForm } from "./lead-form";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useI18n } from "../providers/i18n-context";
import { cn } from "@/lib/utils";

interface LeadsTableProps {
    data: any[];
    userRole?: string;
}

export function LeadsTable({ data, userRole }: LeadsTableProps) {
    const { t, dir } = useI18n();
    const [editingLead, setEditingLead] = useState<any>(null);
    const [isConverting, setIsConverting] = useState<string | null>(null);
    const router = useRouter();

    const statusMap: any = {
        NEW: { label: t("leads.statuses.NEW"), color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        UNDER_FOLLOWUP: { label: t("leads.statuses.UNDER_FOLLOWUP"), color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
        INTERESTED: { label: t("leads.statuses.INTERESTED"), color: "bg-green-500/10 text-green-500 border-green-500/20" },
        CONVERTED: { label: t("leads.statuses.CONVERTED"), color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    };

    const onDelete = async (id: string) => {
        if (confirm(t("leads.delete_confirm"))) {
            try {
                await deleteLead(id);
                toast.success(t("common.success_delete"));
            } catch (error: any) {
                toast.error(error.message || t("common.error"));
            }
        }
    };

    const onConvert = async (lead: any) => {
        if (confirm(t("leads.convert_confirm").replace("{name}", lead.name))) {
            try {
                setIsConverting(lead.id);
                const customer = await convertLeadToCustomer(lead.id);
                toast.success("تم تحويل الليد إلى عميل بنجاح");
                router.push(`/dashboard/customers/${customer.id}`);
            } catch (error: any) {
                toast.error("حدث خطأ أثناء التحويل");
            } finally {
                setIsConverting(null);
            }
        }
    };

    return (
        <>
            <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>{t("customers.name")}</TableHead>
                            <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>{t("leads.status")}</TableHead>
                            <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>{t("customers.phone")}</TableHead>
                            <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>{t("customers.company")}</TableHead>
                            <TableHead className={dir === "rtl" ? "text-left w-[100px]" : "text-right w-[100px]"}>{t("customers.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {t("leads.no_records")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((lead) => (
                                <TableRow key={lead.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{lead.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusMap[lead.status].color}>
                                            {statusMap[lead.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell dir="ltr">{lead.phone}</TableCell>
                                    <TableCell>{lead.company || "-"}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align={dir === "rtl" ? "end" : "start"}>
                                                <DropdownMenuLabel>{t("customers.actions")}</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/leads/${lead.id}`} className="gap-2">
                                                        <Eye className="h-4 w-4" />
                                                        {t("customers.view")}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setEditingLead(lead)}
                                                    className="gap-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    {t("customers.edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onConvert(lead)}
                                                    className="text-green-600 gap-2"
                                                    disabled={isConverting === lead.id}
                                                >
                                                    {isConverting === lead.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="h-4 w-4" />
                                                    )}
                                                    {t("leads.convert")}
                                                </DropdownMenuItem>
                                                {userRole === "ADMIN" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(lead.id)}
                                                            className="text-red-500 gap-2"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                            {t("customers.delete")}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
                <DialogContent className="sm:max-w-[500px]" dir={dir}>
                    <DialogHeader>
                        <DialogTitle>{t("leads.details")}</DialogTitle>
                    </DialogHeader>
                    <LeadForm
                        initialData={editingLead}
                        onSuccess={() => setEditingLead(null)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
