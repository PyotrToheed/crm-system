"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useI18n } from "@/components/providers/i18n-context";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, type NotificationDisplay } from "@/lib/actions/notification-actions";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export function NotificationBell() {
    const { t, lang } = useI18n();
    const [notifications, setNotifications] = useState<NotificationDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        loadNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "URGENT": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "REMINDER": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-semibold">{t("notifications.title")}</h4>
                    {unreadCount > 0 && (
                        <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={handleMarkAllAsRead}>
                            {t("notifications.mark_all_read")}
                        </Button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground text-sm">
                            {t("notifications.no_notifications")}
                        </div>
                    ) : (
                        notifications.slice(0, 5).map(notification => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Badge variant="outline" className={getTypeColor(notification.type)}>
                                        {t(`notifications.types.${notification.type}`)}
                                    </Badge>
                                    {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-500 ms-auto" />}
                                </div>
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{notification.content}</p>
                                <p className="text-xs text-muted-foreground/70">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: lang === "ar" ? ar : enUS })}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
