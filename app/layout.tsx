import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { NotificationInit } from "@/components/shared/NotificationInit";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "GEMA",
  description: "Green Emerald Mobility Apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, plusJakartaSans.variable)}>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, plusJakartaSans.variable)}>
        <QueryProvider>
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
        <NotificationInit />
      </body>
    </html>
  );
}
