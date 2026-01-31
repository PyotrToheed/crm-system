"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MessageSquare, Mail, Phone, FileText, CheckSquare, User, Ticket } from "lucide-react";
import { useI18n } from "../providers/i18n-context";

interface TimelineItem {
    id: string;
    type: string;
    content: string;
    userName: string;
    createdAt: Date;
    reminderDate?: Date | null;
}

interface InteractionTimelineProps {
    items: TimelineItem[];
}

export function InteractionTimeline({ items }: InteractionTimelineProps) {
    const { t, dir } = useI18n();

    const icons: any = {
        WHATSAPP: <MessageSquare className="h-4 w-4 text-green-500" />,
        EMAIL: <Mail className="h-4 w-4 text-blue-500" />,
        CALL: <Phone className="h-4 w-4 text-orange-500" />,
        NOTE: <FileText className="h-4 w-4 text-muted-foreground" />,
        TASK: <CheckSquare className="h-4 w-4 text-purple-500" />,
        TICKET: <Ticket className="h-4 w-4 text-primary" />,
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                {t("activities.no_activities")}
            </div>
        );
    }

    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {items.map((item, index) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon circle */}
                    <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1",
                        dir === "rtl" ? "md:ml-8 md:mr-0 ml-8 mr-0" : "md:mx-8"
                    )}>
                        {icons[item.type] || <User className="h-4 w-4" />}
                    </div>
                    {/* Content card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow shadow-slate-900/5">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-slate-900">{item.userName}</div>
                            <time className="font-sans text-xs font-medium text-primary">
                                {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                            </time>
                        </div>
                        <div className="text-slate-500 text-sm">{item.content}</div>
                        {item.reminderDate && (
                            <div className="mt-2 text-xs font-medium text-orange-600 flex items-center gap-1">
                                <CheckSquare className="h-3 w-3" />
                                {t("activities.reminder")}: {format(new Date(item.reminderDate), "dd/MM/yyyy HH:mm")}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
