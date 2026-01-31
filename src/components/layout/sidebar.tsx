"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Target,
    History,
    Ticket,
    BarChart,
    UserCog,
    Menu,
    Languages,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-context";
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";
import logoSidebar from "@/assets/logo-sidebar.png";

// Dynamic imports to resolve 'Module factory not available' and hydration issues
const NotificationBell = dynamic(() => import("./notification-bell").then(mod => mod.NotificationBell), { ssr: false });
const GlobalSearchBar = dynamic(() => import("./global-search-bar").then(mod => mod.GlobalSearchBar), { ssr: false });

interface SidebarProps {
    className?: string;
    userRole?: string;
}

interface SidebarContentProps {
    pathname: string;
    setOpen: (open: boolean) => void;
    userRole?: string;
    t: (key: string) => string;
    dir: "ltr" | "rtl";
    lang: "ar" | "en";
    setLang: (lang: "ar" | "en") => void;
}

function SidebarContent({ pathname, setOpen, userRole, t, dir, lang, setLang }: SidebarContentProps) {
    const [mounted, setMounted] = useState(false); // Added mounted state for SidebarContent

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { title: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { title: t("nav.customers"), href: "/dashboard/customers", icon: Users },
        { title: t("nav.leads"), href: "/dashboard/leads", icon: Target },
        { title: t("nav.activities"), href: "/dashboard/activities", icon: History },
        { title: t("nav.tickets"), href: "/dashboard/tickets", icon: Ticket },
        { title: t("nav.reports"), href: "/dashboard/reports", icon: BarChart },
    ];

    const adminItems = [
        { title: t("nav.users"), href: "/dashboard/users", icon: UserCog },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-white border-primary/10", dir === "rtl" ? "border-l" : "border-r")}>
            <div className="p-6 border-b border-primary/5 space-y-2">
                <div className="flex items-center justify-between">
                    {mounted && (
                        <img
                            src={logoSidebar.src}
                            alt="Logo"
                            className="h-32 w-auto object-contain transition-all duration-500 hover:scale-110"
                        />
                    )}
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLang(lang === "en" ? "ar" : "en")}
                            title={lang === "en" ? "Switch to Arabic" : "التغيير إلى الإنجليزية"}
                            className="h-9 w-9 hover:bg-primary/5 rounded-full"
                        >
                            <Languages className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                <div className="text-center sm:text-left rtl:sm:text-right pb-2">
                    <h2 className="text-2xl font-black font-sans tracking-[0.1em] text-primary uppercase drop-shadow-xl leading-tight">
                        {lang === "ar" ? "نظام إدارة العملاء" : "CRM System"}
                    </h2>
                </div>
            </div>

            <div className="px-5 py-6">
                <GlobalSearchBar />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 transition-colors">
                <div className="px-4 space-y-1.5 pb-8">
                    <h3 className={cn("mb-3 px-3 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]", dir === "rtl" ? "text-right" : "text-left")}>
                        {t("nav.main_menu")}
                    </h3>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                        >
                            <Button
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-4 h-12 px-5 rounded-xl transition-all duration-300",
                                    pathname === item.href
                                        ? "bg-primary/10 text-primary font-bold shadow-sm border-s-4 border-primary rounded-s-none"
                                        : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                                    dir === "rtl" ? "text-right" : "text-left"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                                <span className="text-base">{item.title}</span>
                            </Button>
                        </Link>
                    ))}

                    {userRole === "ADMIN" && (
                        <div className="mt-10">
                            <h3 className={cn("mb-3 px-3 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]", dir === "rtl" ? "text-right" : "text-left")}>
                                {t("nav.admin")}
                            </h3>
                            <div className="space-y-1.5">
                                {adminItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                    >
                                        <Button
                                            variant={pathname === item.href ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start gap-4 h-12 px-5 rounded-xl transition-all duration-300",
                                                pathname === item.href
                                                    ? "bg-primary/10 text-primary font-bold shadow-sm border-s-4 border-primary rounded-s-none"
                                                    : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                                                dir === "rtl" ? "text-right" : "text-left"
                                            )}
                                        >
                                            <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                                            <span className="text-base">{item.title}</span>
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto border-t p-4 bg-muted/5">
                <Button
                    variant="ghost"
                    className={cn("group w-full justify-start gap-3 h-14 rounded-xl hover:bg-destructive/5 transition-all duration-300", dir === "rtl" ? "text-right" : "text-left")}
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary group-hover:bg-destructive/10 group-hover:text-destructive transition-all duration-300">
                        {userRole === "ADMIN" ? "A" : "U"}
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-sm font-bold text-foreground">
                            {userRole === "ADMIN" ? "Administrator" : "User"}
                        </span>
                        <span className="text-[10px] text-destructive font-medium group-hover:underline">
                            {t("nav.logout")}
                        </span>
                    </div>
                    <LogOut className="h-3.5 w-3.5 ms-auto text-muted-foreground/30 group-hover:text-destructive transition-colors" />
                </Button>
            </div>
        </div>
    );
}

export function Sidebar({ className, userRole }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { lang, setLang, t, dir } = useI18n();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className={cn("hidden md:flex flex-col w-72 h-screen bg-white border-r", className)} />;
    }

    return (
        <>
            {/* Mobile Sidebar */}
            <div className={cn("md:hidden fixed top-4 z-40", dir === "rtl" ? "right-4" : "left-4")}>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shadow-sm">
                            <Menu className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side={dir === "rtl" ? "right" : "left"} className="p-0 w-72 border-none">
                        <SidebarContent
                            pathname={pathname}
                            setOpen={setOpen}
                            userRole={userRole}
                            t={t}
                            dir={dir}
                            lang={lang}
                            setLang={setLang}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className={cn("hidden md:flex flex-col w-72 h-screen sticky top-0", className)}>
                <SidebarContent
                    pathname={pathname}
                    setOpen={setOpen}
                    userRole={userRole}
                    t={t}
                    dir={dir}
                    lang={lang}
                    setLang={setLang}
                />
            </aside>
        </>
    );
}
