"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { WordMark } from "@/components/BrandMark";
import { IconCheck, IconClock, IconSignOut } from "@/components/Icon";
import { StudentScores } from "@/components/StudentScores";

export default function PendingPage() {
  const { user, appUser, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && appUser && (appUser.role === "teacher" || appUser.role === "admin")) {
      router.replace("/dashboard");
    }
  }, [loading, user, appUser, router]);

  // bfcache guard — re-run auth on back/forward restore.
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
        </div>
      </main>
    );
  }

  const isApproved = appUser.approved;
  const needsProfile = !appUser.gradeLevel || !appUser.sectionId;

  return (
    <main className="min-h-dvh ambient-light flex flex-col">
      <header className="px-6 sm:px-10 py-6">
        <WordMark />
      </header>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-xl rise">
          <div className="text-center mb-8">
            <span
              className={`inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-5 ${
                isApproved
                  ? "bg-[rgba(107,143,94,.15)] text-[color:var(--color-sage)]"
                  : "bg-[rgba(230,169,72,.12)] text-[color:var(--color-gold)] float-slow"
              }`}
            >
              {isApproved ? <IconCheck size={28} /> : <IconClock size={28} />}
            </span>

            <h1 className="font-display text-[34px] tracking-[-0.02em] font-semibold leading-tight text-balance">
              {isApproved ? (
                <>You&apos;re in, <span className="text-[color:var(--color-sage)]">chef</span>.</>
              ) : (
                <>Waiting for your teacher.</>
              )}
            </h1>

            <p className="mt-3 text-[color:var(--color-fg-muted)] text-[15px] max-w-md mx-auto leading-relaxed">
              {isApproved
                ? "Open Monster Chef on your phone, sign in with the same email, and the kitchen is yours."
                : "Your registration was received. Your teacher will admit you into a section shortly."}
            </p>
          </div>

          <div className="tile p-5 sm:p-6 hover:[transform:none] hover:[box-shadow:none] hover:bg-[color:var(--color-bg-2)]">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Row label="Name" value={appUser.displayName || "—"} />
              <Row label="Email" value={appUser.email} />
              <Row label="Grade level" value={appUser.gradeLevel || "Not set"} />
              <Row label="Section" value={appUser.sectionName || "Not set"} />
              <Row label="Role" value={cap(appUser.role)} />
              <Row
                label="Status"
                value={
                  <span
                    className={
                      isApproved
                        ? "text-[color:var(--color-sage)] font-medium"
                        : "text-[color:var(--color-gold)] font-medium"
                    }
                  >
                    {isApproved ? "Approved" : "Pending approval"}
                  </span>
                }
              />
            </dl>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            {needsProfile && (
              <Link href="/profile" className="btn-primary px-4 py-2.5 text-sm text-center flex-1">
                Complete your profile
              </Link>
            )}
            <button
              onClick={logout}
              className="btn-ghost px-4 py-2.5 text-sm flex items-center justify-center gap-2 flex-1"
            >
              <IconSignOut size={15} /> Sign out
            </button>
          </div>

          {/* ───── Released scores from teacher ───── */}
          {isApproved && (
            <section className="mt-10">
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-xl font-semibold tracking-[-0.015em]">My Scores</h2>
                <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg-dim)]">
                  Released by teacher
                </span>
              </header>
              <StudentScores uid={appUser.uid} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-fg-dim)] mb-1">
        {label}
      </dt>
      <dd className="text-[color:var(--color-foreground)]">{value}</dd>
    </div>
  );
}

function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
