"use client";

import { useEffect, useState } from "react";
import {
  collection, doc, query, where, onSnapshot, limit,
  updateDoc, serverTimestamp, getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Score, AppUser } from "@/lib/types";
import { sendScoreEmail, isEmailConfigured } from "@/lib/email";

export default function ScoresPage() {
  const { appUser } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [filterRecipe, setFilterRecipe] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterSent, setFilterSent] = useState<"all" | "unsent" | "sent">("all");

  // Modal state for sending a score
  const [sending, setSending] = useState<Score | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    if (!appUser) return;
    const q = query(
      collection(db, "scores"),
      where("teacherId", "==", appUser.uid),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Score));
      all.sort((a, b) => {
        const aTime = a.completedAt?.toMillis?.() || 0;
        const bTime = b.completedAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setScores(all);
    });
    return () => unsub();
  }, [appUser]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const recipes = Array.from(new Set(scores.map((s) => s.recipe)));
  const sections = Array.from(new Set(scores.map((s) => s.sectionName).filter(Boolean)));

  const visible = scores.filter((s) => {
    if (filterRecipe !== "all" && s.recipe !== filterRecipe) return false;
    if (filterSection !== "all" && s.sectionName !== filterSection) return false;
    if (filterSent === "unsent" && s.sentAt) return false;
    if (filterSent === "sent" && !s.sentAt) return false;
    return true;
  });

  const unsentCount = scores.filter((s) => !s.sentAt).length;

  const exportCSV = () => {
    const headers = "Timestamp,Student,Section,Recipe,Score,Errors,Time(s),Stars,Sent\n";
    const rows = visible.map((s) => {
      const ts = s.completedAt?.toDate ? s.completedAt.toDate().toISOString() : "";
      const sent = s.sentAt?.toDate ? s.sentAt.toDate().toISOString() : "";
      return `"${ts}","${s.studentName}","${s.sectionName}",${s.recipe},${s.score},${s.errors},${s.timeSeconds.toFixed(1)},${s.stars},"${sent}"`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monsterchef_scores_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openSend = (s: Score) => {
    setSending(s);
    setNote("");
  };

  const handleSend = async () => {
    if (!sending || !appUser) return;
    setBusy(true);
    try {
      // 1) Look up the student's email + display name from the users collection.
      const userSnap = await getDoc(doc(db, "users", sending.studentId));
      const student = userSnap.exists() ? (userSnap.data() as AppUser) : null;

      // 2) Mark the score as released in Firestore.
      await updateDoc(doc(db, "scores", sending.id), {
        sentAt: serverTimestamp(),
        teacherNote: note.trim() || null,
      });

      // 3) Best-effort email — does not block dashboard release if it fails.
      let emailMsg = "";
      if (student?.email) {
        const trimmedNote = note.trim();
        const result = await sendScoreEmail({
          to_email: student.email,
          to_name: student.displayName || sending.studentName,
          recipe: sending.recipe,
          score: sending.score,
          stars: sending.stars,
          stars_visual: "★".repeat(sending.stars) + "☆".repeat(3 - sending.stars),
          errors: sending.errors,
          time_minutes: (sending.timeSeconds / 60).toFixed(1),
          teacher_name: appUser.displayName || "Your teacher",
          teacher_note: trimmedNote,
          has_note: trimmedNote ? "yes" : "no",
          recipe_emoji: recipeEmoji(sending.recipe),
        });
        if (result.ok) emailMsg = " · Email sent.";
        else if (result.reason === "not-configured") emailMsg = " · Email skipped (EmailJS not configured).";
        else emailMsg = ` · Email failed: ${result.message || result.reason}.`;
      } else {
        emailMsg = " · No email on file for this student.";
      }

      setToast({ kind: "ok", msg: `Score released to ${sending.studentName}.${emailMsg}` });
      setSending(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setToast({ kind: "err", msg: `Send failed: ${msg}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-3xl tracking-[-0.02em] font-semibold">Scores</h1>
          <p className="text-[color:var(--color-fg-muted)] text-sm mt-1">
            Student cooking results. Release each one to share with your student.
            {unsentCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-[color:var(--color-gold)]">
                · {unsentCount} not yet sent
              </span>
            )}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={visible.length === 0}
          className="btn-ghost px-4 py-2 text-sm self-start sm:self-auto disabled:opacity-50"
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <Filter label="Recipe" value={filterRecipe} onChange={setFilterRecipe} options={[["all", "All recipes"], ...recipes.map((r) => [r, r] as [string, string])]} />
        <Filter label="Section" value={filterSection} onChange={setFilterSection} options={[["all", "All sections"], ...sections.map((s) => [s, s] as [string, string])]} />
        <Filter label="Status" value={filterSent} onChange={(v) => setFilterSent(v as "all" | "unsent" | "sent")} options={[
          ["all", "All scores"],
          ["unsent", "Not yet sent"],
          ["sent", "Sent"],
        ]} />
      </div>

      {/* Table — desktop */}
      <div className="tile hidden md:block overflow-hidden hover:[transform:none] hover:[box-shadow:none]">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--color-bg-3)] text-[color:var(--color-fg-dim)] text-[11px] uppercase tracking-[0.14em]">
            <tr>
              <th className="text-left px-4 py-3 font-medium">When</th>
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-left px-4 py-3 font-medium">Recipe</th>
              <th className="text-right px-4 py-3 font-medium">Score</th>
              <th className="text-center px-4 py-3 font-medium">Stars</th>
              <th className="text-right px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-border-soft)]">
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[color:var(--color-fg-dim)]">
                  No scores match these filters.
                </td>
              </tr>
            )}
            {visible.map((s) => (
              <tr key={s.id} className="hover:bg-[color:var(--color-bg-3)]/40 transition-colors">
                <td className="px-4 py-3 text-[color:var(--color-fg-dim)] text-xs whitespace-nowrap">
                  {s.completedAt?.toDate ? s.completedAt.toDate().toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{s.studentName}</div>
                  <div className="text-[11px] text-[color:var(--color-fg-dim)]">{s.sectionName}</div>
                </td>
                <td className="px-4 py-3">{s.recipe}</td>
                <td className="px-4 py-3 text-right">
                  <span className="font-display font-semibold text-[color:var(--color-gold)] tabular-nums">{s.score}</span>
                </td>
                <td className="px-4 py-3 text-center text-[color:var(--color-gold)] text-sm">
                  {"★".repeat(s.stars)}
                  <span className="text-[color:var(--color-border-strong)]">{"★".repeat(3 - s.stars)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <SendButton score={s} onClick={() => openSend(s)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {visible.length === 0 && (
          <div className="tile p-6 text-center text-[color:var(--color-fg-dim)] hover:[transform:none] hover:[box-shadow:none]">
            No scores match these filters.
          </div>
        )}
        {visible.map((s) => (
          <div key={s.id} className="tile p-4 hover:[transform:none] hover:[box-shadow:none]">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{s.studentName}</div>
                <div className="text-[11px] text-[color:var(--color-fg-dim)]">{s.sectionName} · {s.recipe}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-semibold text-[color:var(--color-gold)] text-xl tabular-nums">{s.score}</div>
                <div className="text-[color:var(--color-gold)] text-[13px]">
                  {"★".repeat(s.stars)}
                  <span className="text-[color:var(--color-border-strong)]">{"★".repeat(3 - s.stars)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-[color:var(--color-fg-dim)]">
                {s.completedAt?.toDate ? s.completedAt.toDate().toLocaleString() : "—"}
              </span>
              <SendButton score={s} onClick={() => openSend(s)} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[color:var(--color-fg-dim)] mt-4">
        Showing {visible.length} of {scores.length} scores.
      </p>

      {!isEmailConfigured() && (
        <p className="text-xs text-[color:var(--color-fg-dim)] mt-2 italic">
          EmailJS not configured — students will still see released scores in their dashboard, but no email goes out. See <code>src/lib/email.ts</code> for setup.
        </p>
      )}

      {/* ──────────────── Send modal ──────────────── */}
      {sending && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm rise">
          <div
            role="dialog"
            aria-modal
            aria-labelledby="send-title"
            className="w-full max-w-md tile p-6 hover:[transform:none] hover:[box-shadow:none] bg-[color:var(--color-bg-2)]"
          >
            <h2 id="send-title" className="font-display text-xl font-semibold mb-1">
              Send score to {sending.studentName.split(" ")[0]}
            </h2>
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              <span className="text-[color:var(--color-gold)] font-medium">{sending.recipe}</span> · score {sending.score} · {"★".repeat(sending.stars)}
            </p>

            <label className="block mt-5">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg-muted)]">
                Feedback note (optional)
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Magaling! Suriin mo lang yung pagsukat ng toyo next time."
                className="field w-full mt-1.5 px-3 py-2.5 text-sm resize-none"
              />
              <span className="text-[11px] text-[color:var(--color-fg-dim)]">{note.length}/500</span>
            </label>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setSending(null)}
                disabled={busy}
                className="btn-ghost px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={busy}
                className="btn-primary px-4 py-2.5 text-sm min-w-[120px]"
              >
                {busy ? "Sending..." : sending.sentAt ? "Resend" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rise">
          <div className={`px-4 py-3 rounded-xl text-sm border shadow-lg ${
            toast.kind === "ok"
              ? "bg-[rgba(107,143,94,.12)] border-[color:var(--color-sage)] text-[color:var(--color-foreground)]"
              : "bg-[rgba(194,85,58,.12)] border-[color:var(--color-paprika)] text-[color:var(--color-foreground)]"
          }`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

function Filter({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg-muted)] block mb-1">
        {label}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field w-full px-3 py-2 text-sm">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function SendButton({ score, onClick }: { score: Score; onClick: () => void }) {
  if (score.sentAt) {
    const when = score.sentAt.toDate ? score.sentAt.toDate().toLocaleDateString() : "";
    return (
      <button
        onClick={onClick}
        title={`Sent ${when}. Click to resend.`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-[color:var(--color-sage)] bg-[rgba(107,143,94,.1)] border border-[rgba(107,143,94,.3)] hover:bg-[rgba(107,143,94,.18)] transition-colors"
      >
        <Check /> Sent
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#1a120a] bg-[color:var(--color-gold)] hover:bg-[#f1b656] transition-colors"
    >
      <Paper /> Send
    </button>
  );
}

function Paper() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2L7.5 9" /><path d="M14 2l-5 12-2.5-5.5L1 6l13-4z" />
    </svg>
  );
}
function Check() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3.5 3.5L13 5" />
    </svg>
  );
}

function recipeEmoji(recipe: string): string {
  const r = recipe.toLowerCase();
  if (r.includes("adobo")) return "🍗";
  if (r.includes("sinigang")) return "🍲";
  if (r.includes("kaldereta")) return "🥘";
  if (r.includes("curry")) return "🍛";
  return "🍴";
}
