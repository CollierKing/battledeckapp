import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotificationsProvider from "@/contexts/notifications/NotificationProvider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import App from "./app";
import { ThemeProvider } from "next-themes";
import Loading from "@/components/ui/loading";

export const metadata: Metadata = {
  title: "Battledeck.App",
  description: "Generator for Battledecks!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <NotificationsProvider>
          <SidebarProvider>
            <Suspense fallback={<Loading />}>
              <ThemeProvider enableSystem={false} attribute="class">
                <div className="flex w-full">
                  <App />
                  <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-7xl">
                      {children}
                    </div>
                  </div>
                </div>
              </ThemeProvider>
            </Suspense>
          </SidebarProvider>
        </NotificationsProvider>
        <Toaster />
      </body>
    </html>
  );
}
