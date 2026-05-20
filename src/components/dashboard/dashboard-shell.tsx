"use client";

import { useState } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardHeader } from "./header";
import type { Session } from "next-auth";

interface DashboardShellProps {
  children: React.ReactNode;
  locale: string;
  session: Session;
}

export function DashboardShell({ children, locale, session }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden relative w-full">
      <DashboardSidebar
        locale={locale}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        role={session.user.role}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          session={session}
          locale={locale}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 page-transition">
          {children}
        </main>
      </div>
    </div>
  );
}
