"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "@/lib/translations.json";

type Language = "ar" | "en";

interface I18nContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string, options?: { returnObjects?: boolean }) => any;
    dir: "rtl" | "ltr";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>("ar");

    useEffect(() => {
        const savedLang = localStorage.getItem("crm-lang") as Language;
        if (savedLang) {
            setLangState(savedLang);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem("crm-lang", newLang);
    };

    const t = (path: string, options?: { returnObjects?: boolean }) => {
        const keys = path.split(".");
        let result: any = (translations as any)[lang];
        for (const key of keys) {
            result = result?.[key];
        }

        if (options?.returnObjects) {
            return result;
        }

        return (typeof result === "string" ? result : path);
    };

    const dir = lang === "ar" ? "rtl" : "ltr";

    return (
        <I18nContext.Provider value={{ lang, setLang, t, dir }}>
            <div dir={dir} lang={lang} className={lang === 'ar' ? 'font-sans' : ''}>
                {children}
            </div>
        </I18nContext.Provider>
    );
}

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
};
