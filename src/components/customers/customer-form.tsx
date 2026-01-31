"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createCustomer, updateCustomer } from "@/lib/actions/customer-actions";

const formSchema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
    email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
    phone: z.string().min(8, "رقم الهاتف غير صحيح"),
    company: z.string().optional(),
    address: z.string().optional(),
});

import { useI18n } from "../providers/i18n-context";

interface CustomerFormProps {
    initialData?: any;
    onSuccess?: () => void;
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
    const { t, dir } = useI18n();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            company: "",
            address: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (initialData) {
                await updateCustomer(initialData.id, values);
                toast.success(t("common.success_update"));
            } else {
                await createCustomer(values);
                toast.success(t("common.success_add"));
            }
            onSuccess?.();
        } catch (error) {
            toast.error(t("common.error"));
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir={dir}>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("customers.name")}</FormLabel>
                            <FormControl>
                                <Input placeholder={t("customers.name")} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("customers.phone")}</FormLabel>
                                <FormControl>
                                    <Input placeholder="05xxxxxxxx" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("nav.tickets")}</FormLabel>
                                <FormControl>
                                    <Input placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("customers.company")}</FormLabel>
                            <FormControl>
                                <Input placeholder={t("customers.company")} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    {initialData ? t("customers.save") : t("customers.create")}
                </Button>
            </form>
        </Form>
    );
}
