"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useI18n } from "@/components/providers/i18n-context";
import { Languages } from "lucide-react";
import logo from "@/assets/logo.png";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const { t, lang, setLang, dir } = useI18n();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(t("login.error_invalid"));
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError(t("login.error_generic"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/50 p-4" dir={dir}>
            <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                >
                    <Languages className="h-4 w-4" />
                    {lang === "ar" ? "English" : "العربية"}
                </Button>
            </div>

            <div className="flex justify-center mb-8">
                {mounted && (
                    <img
                        src={logo.src}
                        alt="Logo"
                        className="h-32 w-auto object-contain"
                    />
                )}
            </div>

            <Card className="w-full max-w-md shadow-sm border-primary/5">
                <CardHeader className="text-center space-y-2 pt-8">
                    <CardTitle className="text-2xl font-bold font-sans">{t("login.title")}</CardTitle>
                    <CardDescription>{t("login.welcome")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t("login.email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t("login.password")}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t("login.loading") : t("login.button")}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center text-sm text-muted-foreground flex justify-center">
                    &copy; {new Date().getFullYear()} {t("login.footer")}
                </CardFooter>
            </Card>
        </div>
    );
}
