"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  History,
  Bookmark,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate Guess Paper", icon: FileText },
  { href: "/history", label: "History", icon: History },
  { href: "/saved", label: "Saved Papers", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="gradient-bg min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col p-6">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/dashboard" className="text-xl font-bold">
                <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                  GuessPaper AI
                </span>
              </Link>
              <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--card-border)] p-3">
              <Image
                src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
                unoptimized
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{session?.user?.name}</p>
                <p className="truncate text-xs text-[var(--muted)]">{session?.user?.email}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      active
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    pathname.startsWith("/admin")
                      ? "bg-indigo-600/20 text-indigo-400"
                      : "text-[var(--muted)] hover:bg-[var(--card)]"
                  )}
                >
                  <Shield className="h-5 w-5" />
                  Admin Panel
                </Link>
              )}
            </nav>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--card-border)] bg-[var(--background)]/80 px-6 backdrop-blur-xl">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Image
                src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                alt="Avatar"
                width={36}
                height={36}
                className="rounded-full"
                unoptimized
              />
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
