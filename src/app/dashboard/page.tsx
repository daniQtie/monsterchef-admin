"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getCountFromServer, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  IconStudents,
  IconSections,
  IconScores,
  IconLive,
  IconClock,
  IconSparkle,
} from "@/components/Icon";

type Stats = {
  totalStudents: number;
  pendingStudents: number;
  totalScores: number;
  totalSections: number;
};

export default function DashboardPage() {
  const { appUser } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!appUser) return;
    (async () => {
      const usersRef = collection(db, "users");
      const sectionsRef = collection(db, "sections");
      const scoresRef = collection(db, "scores");

      const [studentsSnap, sectionsSnap, scoresSnap] = await Promise.all([
        getDocs(query(usersRef, where("role", "==", "student"))),
        getCountFromServer(query(sectionsRef, where("teacherId", "==", appUser.uid))),
        getCountFromServer(query(scoresRef, where("teacherId", "==", appUser.uid))),
      ]);
      const students = studentsSnap.docs.map((d) => d.data());
      setStats({
        totalStudents: students.filter((s) => s.approved).length,
        pendingStudents: students.filter((s) => !s.approved).length,
        totalSections: sectionsSnap.data().count,
        totalScores: scoresSnap.data().count,
      });
    })().catch(console.error);
  }, [appUser]);

  return (
    <div>
      {/* Greeting */}
      <header className="rise">
        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[color:var(--color-gold)] mb-3">
          {greeting()} chef
        </p>
        <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] font-semibold text-balance">
          Welcome back, {firstName(appUser?.displayName, appUser?.email)}.
        </h1>
        <p className="text-[color:var(--color-fg-muted)] mt-3 text-[15px] max-w-xl">
          Approve incoming students, peek into live sessions, and review how
          everyone did on Adobo, Sinigang, Kaldereta and Curry.
        </p>
      </header>

      {/* ── Stat row — asymmetric: hero stat (pending) is wider/taller ── */}
      <section className="mt-10 grid grid-cols-12 gap-4 auto-rows-[minmax(0,_auto)]">
        {/* Pending — the most actionable, given the visual weight */}
        <PendingHero
          count={stats?.pendingStudents}
          loading={stats === null}
          className="col-span-12 lg:col-span-7 rise-1"
        />

        <StatTile
          label="Active students"
          value={stats?.totalStudents}
          loading={stats === null}
          Icon={IconStudents}
          tone="gold"
          className="col-span-6 lg:col-span-5 rise-2"
        />

        <StatTile
          label="Sections"
          value={stats?.totalSections}
          loading={stats === null}
          Icon={IconSections}
          tone="sage"
          className="col-span-6 lg:col-span-3 rise-3"
        />

        <StatTile
          label="Total cooks logged"
          value={stats?.totalScores}
          loading={stats === null}
          Icon={IconScores}
          tone="paprika"
          className="col-span-6 lg:col-span-4 rise-4"
        />

        <StatTile
          label="Live now"
          value={0}
          loading={stats === null}
          Icon={IconLive}
          tone="gold"
          className="col-span-12 lg:col-span-5 rise-4"
          subtitle="No one is cooking right now"
        />
      </section>

      {/* ── Two-column action zone ── */}
      <section className="mt-10 grid lg:grid-cols-[1.15fr_1fr] gap-4">
        <QuickActions />
        <StartGuide />
      </section>

      {/* ── Recipes row — visual identity of the four dishes ── */}
      <RecipesShowcase />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function PendingHero({
  count,
  loading,
  className = "",
}: {
  count?: number;
  loading: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/dashboard/students"
      className={`tile relative overflow-hidden p-6 lg:p-7 flex flex-col justify-between min-h-[180px] ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[color:var(--color-fg-muted)] text-[12px] tracking-[0.14em] uppercase">
            <IconClock size={14} /> Awaiting approval
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            {loading ? (
              <span className="skeleton h-12 w-20" />
            ) : (
              <span className="font-display text-[64px] leading-none tabular-nums font-semibold text-[color:var(--color-gold)]">
                {count ?? 0}
              </span>
            )}
            <span className="text-[color:var(--color-fg-muted)] text-sm">
              {(count ?? 0) === 1 ? "student" : "students"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[13.5px] text-[color:var(--color-fg-muted)]">
          Review and admit them into your sections.
        </p>
        <span className="text-[color:var(--color-gold)] text-[13px] font-medium opacity-80 group-hover:opacity-100">
          Review →
        </span>
      </div>

      {/* Decorative gradient blob */}
      <div
        aria-hidden
        className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-gold), transparent 70%)" }}
      />
    </Link>
  );
}

function StatTile({
  label,
  value,
  loading,
  Icon,
  tone,
  subtitle,
  className = "",
}: {
  label: string;
  value?: number;
  loading: boolean;
  Icon: (p: { size?: number; className?: string }) => React.JSX.Element;
  tone: "gold" | "sage" | "paprika";
  subtitle?: string;
  className?: string;
}) {
  const toneColor =
    tone === "gold"
      ? "var(--color-gold)"
      : tone === "sage"
      ? "var(--color-sage)"
      : "var(--color-paprika)";
  return (
    <div className={`tile p-5 flex flex-col ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-fg-muted)]">
          {label}
        </span>
        <span style={{ color: toneColor }}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-auto">
        {loading ? (
          <span className="skeleton h-8 w-16 block" />
        ) : (
          <div
            className="font-display text-[36px] leading-none tabular-nums font-semibold"
            style={{ color: toneColor }}
          >
            {value ?? 0}
          </div>
        )}
        {subtitle && (
          <p className="text-[12px] text-[color:var(--color-fg-dim)] mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function QuickActions() {
  const items = [
    {
      href: "/dashboard/students",
      title: "Review pending students",
      desc: "Admit registrations into your sections.",
      Icon: IconStudents,
    },
    {
      href: "/dashboard/sections",
      title: "Create a section",
      desc: "Organise your class — e.g. 11-Bonifacio.",
      Icon: IconSections,
    },
    {
      href: "/dashboard/scores",
      title: "Latest cook scores",
      desc: "See who improved, who needs help.",
      Icon: IconScores,
    },
  ];
  return (
    <div className="tile p-5 rise-2 hover:[transform:none] hover:[box-shadow:none] hover:bg-[color:var(--color-bg-2)]">
      <h2 className="font-display text-lg font-semibold tracking-[-0.01em] mb-1">
        Quick actions
      </h2>
      <p className="text-[12.5px] text-[color:var(--color-fg-dim)] mb-4">
        The fastest paths from here.
      </p>
      <div className="space-y-1.5">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[color:var(--color-bg-3)] transition-colors"
          >
            <span className="h-9 w-9 rounded-md bg-[color:var(--color-bg-3)] grid place-items-center text-[color:var(--color-gold)] group-hover:bg-[color:var(--color-surface)] transition-colors">
              <it.Icon size={16} />
            </span>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium">{it.title}</div>
              <div className="text-[12px] text-[color:var(--color-fg-dim)]">{it.desc}</div>
            </div>
            <span className="text-[color:var(--color-fg-dim)] group-hover:text-[color:var(--color-gold)] transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StartGuide() {
  const steps = [
    "Set up your sections.",
    "Share the registration link.",
    "Approve students as they sign up.",
    "Drop into a live cook to coach.",
    "Review scores and patterns.",
  ];
  return (
    <div className="tile p-5 rise-3 hover:[transform:none] hover:[box-shadow:none] hover:bg-[color:var(--color-bg-2)]">
      <div className="flex items-center gap-2 mb-1">
        <IconSparkle size={15} className="text-[color:var(--color-gold)]" />
        <h2 className="font-display text-lg font-semibold tracking-[-0.01em]">
          A quick start
        </h2>
      </div>
      <p className="text-[12.5px] text-[color:var(--color-fg-dim)] mb-4">
        Five steps to running your first VR cook session.
      </p>
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3 text-[13.5px]">
            <span className="font-display tabular-nums text-[color:var(--color-gold)] text-sm mt-0.5 w-5 shrink-0">
              0{i + 1}
            </span>
            <span className="text-[color:var(--color-fg-muted)]">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RecipesShowcase() {
  const recipes = [
    {
      name: "Adobo",
      note: "Chicken · soy · vinegar",
      img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70&auto=format&fit=crop",
    },
    {
      name: "Sinigang",
      note: "Pork · tamarind · kangkong",
      img: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&q=70&auto=format&fit=crop",
    },
    {
      name: "Kaldereta",
      note: "Beef · tomato · liver spread",
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=70&auto=format&fit=crop",
    },
    {
      name: "Curry",
      note: "Chicken · coconut · curry",
      img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=70&auto=format&fit=crop",
    },
  ];
  return (
    <section className="mt-12 rise-4">
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-display text-xl tracking-[-0.01em] font-semibold">
          The four recipes
        </h2>
        <Link
          href="/dashboard/scores"
          className="text-[13px] text-[color:var(--color-gold)] hover:opacity-80"
        >
          See scores →
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {recipes.map((r) => (
          <article
            key={r.name}
            className="group relative overflow-hidden rounded-xl border border-[color:var(--color-border-soft)] aspect-[4/5]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[700ms] group-hover:scale-105"
              style={{ backgroundImage: `url(${r.img})` }}
              aria-hidden
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(22,17,13,0) 30%, rgba(22,17,13,.85) 100%)",
              }}
              aria-hidden
            />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="font-display text-[19px] font-semibold tracking-[-0.01em]">
                {r.name}
              </div>
              <div className="text-[11.5px] text-[color:var(--color-fg-muted)] mt-0.5">
                {r.note}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function firstName(displayName?: string, email?: string): string {
  if (displayName) return displayName.split(" ")[0];
  if (email) return email.split("@")[0];
  return "chef";
}
