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
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react";
import { deleteCustomer } from "@/lib/actions/customer-actions";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "./customer-form";
import { useI18n } from "../providers/i18n-context";

interface CustomersTableProps {
    data: any[];
    userRole?: string;
}

export function CustomersTable({ data, userRole }: CustomersTableProps) {
    const [editingCustomer, setEditingCustomer] = useState<any>(null);

    const { t, dir, lang } = useI18n();

    const onDelete = async (id: string) => {
        if (confirm(t("leads.delete_confirm"))) {
            try {
                await deleteCustomer(id);
                toast.success(t("common.success_delete"));
            } catch (error: any) {
                toast.error(error.message || t("common.error"));
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
                            <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>{t("customers.phone")}</TableHead>
                            <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>{t("customers.company")}</TableHead>
                            <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>{t("customers.date")}</TableHead>
                            <TableHead className={dir === "rtl" ? "text-left w-[100px]" : "text-right w-[100px]"}>{t("customers.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {t("customers.no_records")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{customer.company || "-"}</TableCell>
                                    <TableCell>
                                        {new Date(customer.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                                    </TableCell>
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
                                                    <Link href={`/dashboard/customers/${customer.id}`} className="gap-2">
                                                        <Eye className="h-4 w-4" />
                                                        {t("customers.view")}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setEditingCustomer(customer)}
                                                    className="gap-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    {t("customers.edit")}
                                                </DropdownMenuItem>
                                                {userRole === "ADMIN" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(customer.id)}
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

            <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
                <DialogContent className="sm:max-w-[500px]" dir={dir}>
                    <DialogHeader>
                        <DialogTitle>{t("customers.edit_title")}</DialogTitle>
                    </DialogHeader>
                    <CustomerForm
                        initialData={editingCustomer}
                        onSuccess={() => setEditingCustomer(null)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
