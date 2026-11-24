"use client";

import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NavigationGuardProvider } from "@/components/ui/navigation-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NavigationGuardProvider>
          <div className="relative min-h-screen bg-dark-950">
            <div className="relative z-10">{children}</div>
          </div>
        </NavigationGuardProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
