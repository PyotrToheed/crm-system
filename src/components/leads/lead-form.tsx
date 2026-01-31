"use client";

import { useForm, SubmitHandler } from "react-hook-form";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createLead, updateLead } from "@/lib/actions/lead-actions";

const formSchema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
    email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
    phone: z.string().min(8, "رقم الهاتف غير صحيح"),
    company: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(["NEW", "UNDER_FOLLOWUP", "INTERESTED", "CONVERTED"]),
});

type LeadFormValues = z.infer<typeof formSchema>;

import { useI18n } from "../providers/i18n-context";

interface LeadFormProps {
    initialData?: any;
    onSuccess?: () => void;
}

export function LeadForm({ initialData, onSuccess }: LeadFormProps) {
    const { t, dir } = useI18n();
    const form = useForm<LeadFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            company: initialData?.company || "",
            address: initialData?.address || "",
            status: initialData?.status || "NEW",
        },
    });

    const onSubmit: SubmitHandler<LeadFormValues> = async (values) => {
        try {
            if (initialData) {
                await updateLead(initialData.id, values);
                toast.success(t("common.success_update"));
            } else {
                await createLead(values);
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
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("leads.status")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("leads.status")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="NEW">{t("leads.statuses.NEW")}</SelectItem>
                                        <SelectItem value="UNDER_FOLLOWUP">{t("leads.statuses.UNDER_FOLLOWUP")}</SelectItem>
                                        <SelectItem value="INTERESTED">{t("leads.statuses.INTERESTED")}</SelectItem>
                                        <SelectItem value="CONVERTED" disabled>{t("leads.statuses.CONVERTED")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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
                    {initialData ? t("customers.save") : t("leads.add")}
                </Button>
            </form>
        </Form>
    );
}
