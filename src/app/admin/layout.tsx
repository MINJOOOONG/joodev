"use client";

import PawSnow from "@/components/ui/paw-snow";
import { ToastProvider } from "@/components/ui/toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-dark-950">
        <PawSnow />
        <div className="relative z-10">{children}</div>
      </div>
    </ToastProvider>
  );
}
