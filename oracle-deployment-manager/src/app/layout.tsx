import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter, IBM_Plex_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Onyx IX | متطلبات تركيب نظام Onyx IX",
  description: "Onyx IX System Installation Requirements - متطلبات تركيب نظام Onyx IX",
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
      className={`${ibmPlexSansArabic.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:*;" />
        <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
          :root {
            --us-green: #18B13A;
            --us-blue: #3A3A96;
            --us-bg: #0B0F17;
            --us-card: #111827;
            --us-success: #22C55E;
            --us-warning: #FF9800;
            --us-danger: #EF4444;
            --us-info: #38BDF8;
            --us-border: rgba(255,255,255,.08);
            --brand-radius: 0.75rem;
            --brand-font: 'IBM Plex Sans Arabic', 'Inter', system-ui, sans-serif;
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