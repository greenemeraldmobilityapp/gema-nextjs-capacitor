import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { NotificationInit } from "@/components/shared/NotificationInit";
import { AndroidBackHandler } from "@/components/shared/AndroidBackHandler";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEMA",
  description: "Green Emerald Mobility Apps",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.webp",
    apple: "/icons/icon-192.webp",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, plusJakartaSans.variable, bodoniModa.variable, jost.variable)}>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, plusJakartaSans.variable, bodoniModa.variable, jost.variable)}>
        <QueryProvider>
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
        <NotificationInit />
        <AndroidBackHandler />
      </body>
    </html>
  );
}
