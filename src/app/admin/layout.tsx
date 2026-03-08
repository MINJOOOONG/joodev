"use client";

import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="relative min-h-screen bg-dark-950">
          <div className="relative z-10">{children}</div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
