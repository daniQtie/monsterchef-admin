"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { WordMark } from "@/components/BrandMark";
import { HeroArt } from "@/components/HeroArt";

export default function LoginPage() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Use replace (not push) so an authenticated /login visit doesn't leave a
    // login entry in history behind the dashboard.
    if (!loading && user && appUser) {
      if (appUser.role === "teacher" || appUser.role === "admin") router.replace("/dashboard");
      else router.replace("/pending");
    }
  }, [loading, user, appUser, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError(humanise(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      setError(humanise(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh grid lg:grid-cols-[1.05fr_1fr]">
      {/* ─── Left: warm cooking hero ─── */}
      <aside
        className="relative overflow-hidden hidden lg:block"
        style={{
          background:
            "radial-gradient(120% 80% at 30% 20%, #3a2516, #1a120a 70%), linear-gradient(180deg, #2a1810, #16110d)",
        }}
      >
        {/* Generated vector hero — a "Monster Chef" cooking scene */}
        <HeroArt className="absolute inset-0 h-full w-full" />

        {/* Scrim for text legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(22,17,13,.35) 0%, rgba(22,17,13,.30) 45%, rgba(22,17,13,.88) 100%)",
          }}
        />

        <div className="relative h-full flex flex-col justify-between p-12 z-10">
          <WordMark />

          <div className="max-w-md rise">
            <p className="text-[color:var(--color-gold)] text-xs font-medium tracking-[0.2em] uppercase mb-5">
              VR Cookery Simulator
            </p>
            <h2 className="font-display text-[clamp(40px,5vw,58px)] leading-[1.0] tracking-[-0.025em] font-semibold">
              Monster
              <br />
              <em className="text-[color:var(--color-gold)] not-italic">Chef</em>
            </h2>
            <p className="mt-6 text-[color:var(--color-fg)] text-[17px] font-medium">
              University of Eastern Pangasinan
            </p>
            <p className="mt-3 text-[color:var(--color-fg-muted)] text-[15px] leading-relaxed max-w-sm">
              A virtual kitchen where Cookery students slice, season and simmer —
              while teachers approve, review and watch every cook in real time.
            </p>
          </div>

          <p className="text-xs text-[color:var(--color-fg-dim)]">
            Capstone Project · University of Eastern Pangasinan
          </p>
        </div>
      </aside>

      {/* ─── Right: form ─── */}
      <section className="ambient-light flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rise">
          <div className="lg:hidden flex justify-center mb-8">
            <WordMark />
          </div>

          <header className="mb-7">
            <h1 className="font-display text-3xl tracking-[-0.015em] font-semibold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-[color:var(--color-fg-muted)] text-sm mt-1.5">
              {mode === "login"
                ? "Sign in to manage your students and watch them cook."
                : "Register first — your teacher will approve you to enter the kitchen."}
            </p>
          </header>

          {/* Segmented toggle (smaller, less generic than tabs) */}
          <div className="inline-flex p-0.5 rounded-full bg-[color:var(--color-bg-3)] border border-[color:var(--color-border-soft)] mb-6 text-[13px]">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-full font-medium transition ${
                  mode === m
                    ? "bg-[color:var(--color-gold)] text-[#1a120a]"
                    : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-foreground)]"
                }`}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="field w-full px-3.5 py-3 text-sm"
                placeholder="juan.delacruz@school.com"
              />
            </Field>

            <Field label="Password" hint={mode === "signup" ? "Minimum 6 characters" : undefined}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="field w-full px-3.5 py-3 text-sm"
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <div
                role="alert"
                className="text-[13px] text-[color:var(--color-paprika)] bg-[rgba(194,85,58,.08)] border border-[rgba(194,85,58,.3)] rounded-lg px-3.5 py-2.5"
              >
                {error}
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full py-3 text-sm">
              {busy ? <Spinner /> : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[color:var(--color-border-soft)]" />
            <span className="text-[11px] tracking-[0.18em] text-[color:var(--color-fg-dim)]">
              or
            </span>
            <div className="flex-1 h-px bg-[color:var(--color-border-soft)]" />
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="btn-ghost w-full py-3 text-sm flex items-center justify-center gap-2.5"
          >
            <GoogleG />
            Continue with Google
          </button>

          <p className="text-center text-xs text-[color:var(--color-fg-dim)] mt-7 max-w-xs mx-auto leading-relaxed">
            Students need teacher approval before the VR game unlocks. Bring your
            Cardboard headset and a paired Bluetooth gamepad.
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg-muted)]">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-[color:var(--color-fg-dim)]">{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}

function Spinner() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-3.5 w-3.5 rounded-full border-2 border-[#1a120a] border-r-transparent animate-spin" />
      <span>Working...</span>
    </span>
  );
}

function GoogleG() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function humanise(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("invalid-credential")) return "Email or password is incorrect.";
  if (msg.includes("email-already-in-use")) return "That email is already registered. Try signing in.";
  if (msg.includes("weak-password")) return "Use at least 6 characters for the password.";
  if (msg.includes("network-request-failed")) return "Connection failed. Please try again.";
  return msg.replace("Firebase: ", "");
}
