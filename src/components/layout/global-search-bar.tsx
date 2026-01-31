"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-context";

export function GlobalSearchBar() {
    const { t, dir } = useI18n();
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${dir === "rtl" ? "right-3" : "left-3"}`} />
            <Input
                type="text"
                placeholder={t("search.placeholder")}
                value={query}
                onChange={e => setQuery(e.target.value)}
                className={`${dir === "rtl" ? "pr-9" : "pl-9"} bg-muted/50`}
            />
        </form>
    );
}
