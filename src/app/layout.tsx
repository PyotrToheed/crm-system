import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { I18nProvider } from "@/components/providers/i18n-context";
import { Providers } from "@/components/providers/session-provider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "CRM System | نظام إدارة العملاء",
  description: "Advanced CRM System",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <I18nProvider>
          <Providers>
            {children}
            <Toaster position="top-center" richColors />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
