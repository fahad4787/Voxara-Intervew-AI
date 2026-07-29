"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/brand/Logo";
import {
  CreateInterviewProvider,
  useCreateInterview,
} from "@/components/interviews/CreateInterviewProvider";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Progress";
import { cn } from "@/lib/utils/cn";
import type { AuthUser } from "@/lib/auth/types";

const primaryNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/interviews", label: "Interviews", icon: Briefcase },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/interviews") {
    return (
      pathname === "/interviews" || pathname.startsWith("/interviews/")
    );
  }
  return pathname === href;
}

function NavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
          : "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

function NewInterviewNavButton({ onNavigate }: { onNavigate?: () => void }) {
  const { openCreateInterview } = useCreateInterview();

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate?.();
        openCreateInterview();
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
    >
      <Plus className="h-4 w-4 shrink-0" />
      New interview
    </button>
  );
}

function SidebarPanel({
  user,
  onSignOut,
  onNavigate,
  showBrand = true,
}: {
  user: AuthUser;
  onSignOut: () => void | Promise<void>;
  onNavigate?: () => void;
  showBrand?: boolean;
}) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {showBrand ? (
        <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
          <Logo href="/dashboard" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
            Workspace
          </p>
          <nav className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <NavLink key={item.href} {...item} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
            Actions
          </p>
          <nav className="flex flex-col gap-1">
            <NewInterviewNavButton onNavigate={onNavigate} />
          </nav>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <div className="rounded-2xl bg-[var(--surface-muted)]/80 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--ink)]">
                {user.name}
              </p>
              <p className="truncate text-xs text-[var(--ink-muted)]">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="mt-3 w-full"
            leadingIcon={LogOut}
            onClick={onSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

function DashboardHeader({
  user,
  onMenuOpen,
}: {
  user: AuthUser;
  onMenuOpen: () => void;
}) {
  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.startsWith("/interviews/")) return "Interview detail";
    if (pathname.startsWith("/interviews")) return "Interviews";
    return "Dashboard";
  }, [pathname]);

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="dashboard-header sticky top-0 z-30">
      <div
        className="flex h-full items-center justify-between gap-4"
        style={{
          paddingLeft: "var(--dashboard-pad-x)",
          paddingRight: "var(--dashboard-pad-x)",
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
            onClick={onMenuOpen}
            iconOnly
            leadingIcon={Menu}
            aria-label="Open menu"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              Dashboard
            </p>
            <h1 className="truncate text-sm font-semibold text-[var(--ink)] sm:text-base">
              {title}
            </h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] py-1 pl-1 pr-3 sm:flex">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white">
            {initials}
          </span>
          <span className="max-w-[10rem] truncate text-xs font-medium text-[var(--ink)]">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}

export function DashboardContent({
  children,
  className,
  narrow,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        narrow ? "max-w-3xl" : "max-w-[88rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DashboardChrome({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const handleSignOut = () => {
    void signOut().then(() => router.replace("/login"));
  };

  return (
    <div className="dashboard-shell min-h-screen bg-[var(--bg)]">
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--border)] bg-[var(--surface)] lg:flex lg:flex-col">
        <SidebarPanel user={user} onSignOut={handleSignOut} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--ink)]/35"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-[var(--border)] bg-[var(--surface)]">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
              <Logo href="/dashboard" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileOpen(false)}
                iconOnly
                leadingIcon={X}
                aria-label="Close menu"
              />
            </div>
            <SidebarPanel
              user={user}
              onSignOut={handleSignOut}
              onNavigate={() => setMobileOpen(false)}
              showBrand={false}
            />
          </aside>
        </div>
      ) : null}

      <div className="dashboard-main min-h-screen">
        <DashboardHeader
          user={user}
          onMenuOpen={() => setMobileOpen(true)}
        />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <CreateInterviewProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </CreateInterviewProvider>
  );
}
