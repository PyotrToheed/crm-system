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
import { createTicket } from "@/lib/actions/ticket-actions";
import { toast } from "sonner";
import { TicketPriority } from "@prisma/client";

const formSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    customerId: z.string().min(1, "Required"),
    priority: z.nativeEnum(TicketPriority),
});

interface TicketFormProps {
    onSuccess?: () => void;
    customers?: { id: string; name: string }[];
    initialCustomerId?: string;
}

export function TicketForm({ onSuccess, customers = [], initialCustomerId }: TicketFormProps) {
    const { t } = useI18n();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            customerId: initialCustomerId || "",
            priority: "MEDIUM" as TicketPriority,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createTicket(values);
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
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("tickets.subject")}</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!initialCustomerId && (
                    <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("nav.customers")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("nav.customers")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("tickets.priority")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("tickets.priority")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.values(TicketPriority).map((p) => (
                                        <SelectItem key={p} value={p}>
                                            {t(`tickets.priorities.${p}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("activities.content")}</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    {t("tickets.add")}
                </Button>
            </form>
        </Form>
    );
}
