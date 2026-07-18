import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oracle Deployment Manager",
  description: "Professional Oracle Forms & Reports Deployment Platform",
};

export const viewport = "width=device-width, initial-scale=1, maximum-scale=5";

const RTL_LOCALES = new Set(['ar']);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "ar";
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
          :root {
            --brand-primary: #16a34a;
            --brand-secondary: #2563eb;
            --brand-success: #22c55e;
            --brand-warning: #f59e0b;
            --brand-error: #ef4444;
            --brand-radius: 0.625rem;
            --brand-font: Inter, system-ui, sans-serif;
            --brand-font-size: 14px;
          }
        `}} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
