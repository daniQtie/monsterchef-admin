"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { WordMark } from "@/components/BrandMark";
import type { AppUser } from "@/lib/types";
import {
  IconDashboard,
  IconStudents,
  IconSections,
  IconScores,
  IconLive,
  IconSignOut,
} from "@/components/Icon";

const NAV = [
  { href: "/dashboard", label: "Overview", Icon: IconDashboard },
  { href: "/dashboard/students", label: "Students", Icon: IconStudents },
  { href: "/dashboard/sections", label: "Sections", Icon: IconSections },
  { href: "/dashboard/scores", label: "Scores", Icon: IconScores },
  { href: "/dashboard/live", label: "Live view", Icon: IconLive },
];

function NavLinks({
  pathname,
  stagger,
  onNavigate,
}: {
  pathname: string;
  stagger?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {NAV.map(({ href, label, Icon }, i) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${
              stagger ? `rise-${(i % 4) + 1}` : ""
            } ${
              active
                ? "text-[color:var(--color-gold)] bg-[rgba(230,169,72,.08)]"
                : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-foreground)] hover:bg-[color:var(--color-bg-3)]"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[color:var(--color-gold)]" />
            )}
            <Icon size={17} className={active ? "" : "opacity-80 group-hover:opacity-100"} />
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({ appUser, onSignOut }: { appUser: AppUser; onSignOut: () => void }) {
  return (
    <div className="p-3 border-t border-[color:var(--color-border-soft)]">
      <div className="rounded-xl bg-[color:var(--color-bg-3)] border border-[color:var(--color-border-soft)] p-3">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="h-8 w-8 rounded-lg bg-[color:var(--color-gold)] text-[#1a120a] grid place-items-center font-display font-semibold text-sm">
            {initial(appUser.displayName, appUser.email)}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium truncate">{appUser.displayName || "Teacher"}</div>
            <div className="text-[11px] text-[color:var(--color-fg-dim)] truncate">{appUser.email}</div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12.5px] text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface)] transition-colors"
        >
          <IconSignOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, appUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  // Auth guard — redirect (replace, so no protected entry stays in history).
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (appUser && appUser.role === "student") router.replace("/pending");
    }
  }, [loading, user, appUser, router]);

  // bfcache guard — if the page is restored from the back/forward cache (e.g. user
  // signed out then hit Back), force a fresh load so the auth guard runs again.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  if (loading || !appUser) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="space-y-3 w-64">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-3 w-48" />
          <div className="skeleton h-3 w-40" />
        </div>
      </main>
    );
  }

  if (appUser.role === "student") return null;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* ─── Mobile top bar ─── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-[color:var(--color-border-soft)] bg-[color:var(--color-bg-2)]/95 backdrop-blur">
        <Link href="/dashboard"><WordMark /></Link>
        <button
          onClick={() => setDrawer((d) => !d)}
          aria-label="Toggle menu"
          aria-expanded={drawer}
          className="h-9 w-9 grid place-items-center rounded-lg border border-[color:var(--color-border-soft)] bg-[color:var(--color-bg-3)] text-[color:var(--color-fg-muted)]"
        >
          <Burger open={drawer} />
        </button>
      </header>

      {/* ─── Mobile drawer ─── */}
      {drawer && (
        <button
          aria-label="Close menu"
          onClick={() => setDrawer(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/55 backdrop-blur-sm"
        />
      )}
      <aside
        className={`lg:hidden fixed z-40 top-0 left-0 h-dvh w-[270px] bg-[color:var(--color-bg-2)] border-r border-[color:var(--color-border-soft)] flex flex-col transition-transform duration-300 ease-out ${
          drawer ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-[color:var(--color-border-soft)]">
          <Link href="/dashboard" onClick={() => setDrawer(false)}><WordMark /></Link>
          <p className="text-[11px] text-[color:var(--color-fg-dim)] mt-2 tracking-[0.14em] uppercase">
            Teacher Workspace
          </p>
        </div>
        <NavLinks pathname={pathname} onNavigate={() => setDrawer(false)} />
        <UserCard appUser={appUser} onSignOut={logout} />
      </aside>

      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden lg:flex w-[248px] shrink-0 border-r border-[color:var(--color-border-soft)] bg-[color:var(--color-bg-2)] flex-col sticky top-0 h-dvh">
        <div className="px-5 py-6 border-b border-[color:var(--color-border-soft)]">
          <Link href="/dashboard" className="block"><WordMark /></Link>
          <p className="text-[11px] text-[color:var(--color-fg-dim)] mt-2 tracking-[0.14em] uppercase">
            Teacher Workspace
          </p>
        </div>
        <NavLinks pathname={pathname} stagger />
        <UserCard appUser={appUser} onSignOut={logout} />
      </aside>

      {/* ─── Main ─── */}
      <main className="flex-1 ambient-light overflow-auto">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {open ? (
        <>
          <path d="M4 4l10 10" />
          <path d="M14 4L4 14" />
        </>
      ) : (
        <>
          <path d="M2 5h14" />
          <path d="M2 9h14" />
          <path d="M2 13h14" />
        </>
      )}
    </svg>
  );
}

function initial(name: string | undefined, email: string): string {
  const src = (name || email || "?").trim();
  return src.charAt(0).toUpperCase();
}
