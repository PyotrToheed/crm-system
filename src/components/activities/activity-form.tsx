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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "../providers/i18n-context";
import { createActivity } from "@/lib/actions/activity-actions";
import { toast } from "sonner";
const ActivityType = ["WHATSAPP", "EMAIL", "CALL", "NOTE", "TASK"] as const;
type ActivityType = typeof ActivityType[number];

const formSchema = z.object({
    type: z.enum(ActivityType as any),
    content: z.string().min(1, "Required"),
    customerId: z.string().optional(),
    leadId: z.string().optional(),
    reminderDate: z.string().optional(),
});

interface ActivityFormProps {
    onSuccess?: () => void;
    customers?: { id: string; name: string }[];
    leads?: { id: string; name: string }[];
    initialCustomerId?: string;
    initialLeadId?: string;
}

export function ActivityForm({ onSuccess, customers = [], leads = [], initialCustomerId, initialLeadId }: ActivityFormProps) {
    const { t, dir } = useI18n();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "NOTE" as ActivityType,
            content: "",
            customerId: initialCustomerId || "none",
            leadId: initialLeadId || "none",
            reminderDate: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createActivity({
                ...values,
                reminderDate: values.reminderDate ? new Date(values.reminderDate) : null,
                customerId: (values.customerId && values.customerId !== "none") ? values.customerId : undefined,
                leadId: (values.leadId && values.leadId !== "none") ? values.leadId : undefined,
            });
            toast.success(t("common.success_add"));
            onSuccess?.();
            form.reset();
        } catch (error) {
            toast.error(t("common.error"));
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("activities.type")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("activities.type")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ActivityType.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {t(`activities.types.${type}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!initialCustomerId && !initialLeadId && (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("nav.customers")}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("nav.customers")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">{t("common.none") || "-"}</SelectItem>
                                            {customers.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="leadId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("nav.leads")}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("nav.leads")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">{t("common.none") || "-"}</SelectItem>
                                            {leads.map((l) => (
                                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("activities.content")}</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder={t("activities.content")} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="reminderDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("activities.reminder")} ({t("common.optional")})</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    {t("activities.add")}
                </Button>
            </form>
        </Form>
    );
}
