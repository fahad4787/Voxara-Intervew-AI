"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  UserRound,
  Users,
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
import { PageSpinner } from "@/components/ui/PageSpinner";
import { cn } from "@/lib/utils/cn";
import type { AuthUser } from "@/lib/auth/types";

const primaryNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/interviews", label: "Interviews", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

const adminNav = [
  { href: "/users", label: "Users", icon: Users },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/interviews") {
    return (
      pathname === "/interviews" || pathname.startsWith("/interviews/")
    );
  }
  if (href === "/users") {
    return pathname === "/users" || pathname.startsWith("/users/");
  }
  if (href === "/profile") {
    return pathname === "/profile" || pathname.startsWith("/profile/");
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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        {primaryNav.map((item) => (
          <NavLink key={item.href} {...item} onNavigate={onNavigate} />
        ))}
        {user.role === "superadmin"
          ? adminNav.map((item) => (
              <NavLink key={item.href} {...item} onNavigate={onNavigate} />
            ))
          : null}
      </nav>

      <div className="shrink-0 border-t border-[var(--border)] px-3 py-3">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Link
            href="/profile"
            onClick={onNavigate}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--surface-muted)]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white">
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
          </Link>
          <Button
            variant="dangerGhost"
            size="sm"
            iconOnly
            leadingIcon={LogOut}
            onClick={onSignOut}
            aria-label="Sign out"
          />
        </div>
      </div>
    </div>
  );
}

function HeaderCreateButton() {
  const { openCreateInterview } = useCreateInterview();

  return (
    <Button size="sm" leadingIcon={Plus} onClick={openCreateInterview} brand>
      New interview
    </Button>
  );
}

function DashboardHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.startsWith("/interviews/")) return "Interview";
    if (pathname.startsWith("/interviews")) return "Interviews";
    if (pathname.startsWith("/users")) return "Users";
    if (pathname.startsWith("/profile")) return "Profile";
    return "Dashboard";
  }, [pathname]);

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
          <h1 className="truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--ink)] sm:text-lg">
            {title}
          </h1>
        </div>

        <HeaderCreateButton />
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
        <PageSpinner label="Loading workspace…" fill={false} />
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
        <DashboardHeader onMenuOpen={() => setMobileOpen(true)} />
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
