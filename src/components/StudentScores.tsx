"use client";

/**
 * Released-scores feed for the student. Subscribes to scores authored by this
 * student where the teacher has set sentAt (meaning: released for the student
 * to see). Newest first; shows the teacher's note when present.
 */
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Score } from "@/lib/types";

export function StudentScores({ uid }: { uid: string }) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "scores"), where("studentId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Score))
        .filter((s) => !!s.sentAt);
      all.sort((a, b) => (b.sentAt?.toMillis?.() || 0) - (a.sentAt?.toMillis?.() || 0));
      setScores(all);
      setLoaded(true);
    });
    return () => unsub();
  }, [uid]);

  if (!loaded) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-20" />
        <div className="skeleton h-20" />
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="tile p-6 text-center hover:[transform:none] hover:[box-shadow:none]">
        <p className="text-[color:var(--color-fg-muted)] text-sm">
          Wala pang ipinadalang score ang iyong guro.
        </p>
        <p className="text-[color:var(--color-fg-dim)] text-xs mt-1">
          Released scores from your teacher will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scores.map((s, i) => (
        <article
          key={s.id}
          className={`tile p-4 sm:p-5 hover:[transform:none] hover:[box-shadow:none] rise-${(i % 4) + 1}`}
        >
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-semibold text-lg leading-tight">{s.recipe}</h3>
                <span className="text-[color:var(--color-gold)] text-sm">
                  {"★".repeat(s.stars)}
                  <span className="text-[color:var(--color-border-strong)]">{"★".repeat(3 - s.stars)}</span>
                </span>
              </div>
              <p className="text-[11px] text-[color:var(--color-fg-dim)] mt-0.5">
                {s.sentAt?.toDate ? s.sentAt.toDate().toLocaleDateString() : ""}
                {s.completedAt?.toDate ? ` · cooked ${s.completedAt.toDate().toLocaleDateString()}` : ""}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-semibold text-[color:var(--color-gold)] text-3xl tabular-nums leading-none">
                {s.score}
              </div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-dim)] mt-1">Score</div>
            </div>
          </header>

          <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
            <Stat label="Errors" value={String(s.errors)} accent={s.errors === 0 ? "sage" : undefined} />
            <Stat label="Time" value={`${(s.timeSeconds / 60).toFixed(1)} min`} />
            <Stat label="Stars" value={`${s.stars} / 3`} />
          </dl>

          {s.teacherNote && (
            <blockquote className="mt-4 border-l-2 border-[color:var(--color-gold)] pl-3 text-[13px] text-[color:var(--color-fg-muted)] italic">
              “{s.teacherNote}”
              <footer className="not-italic mt-1 text-[11px] text-[color:var(--color-fg-dim)] tracking-[0.05em]">
                — your teacher
              </footer>
            </blockquote>
          )}
        </article>
      ))}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "sage" }) {
  return (
    <div className="bg-[color:var(--color-bg-3)] rounded-lg px-2.5 py-2 border border-[color:var(--color-border-soft)]">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-fg-dim)]">{label}</dt>
      <dd className={`mt-0.5 font-medium tabular-nums ${accent === "sage" ? "text-[color:var(--color-sage)]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
