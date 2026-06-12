"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Score } from "@/lib/types";

export default function ScoresPage() {
  const { appUser } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [filterRecipe, setFilterRecipe] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");

  useEffect(() => {
    if (!appUser) return;
    const q = query(
      collection(db, "scores"),
      where("teacherId", "==", appUser.uid),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Score));
      // Sort client-side (newest first)
      all.sort((a, b) => {
        const aTime = a.completedAt?.toMillis?.() || 0;
        const bTime = b.completedAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setScores(all);
    });
    return () => unsub();
  }, [appUser]);

  const recipes = Array.from(new Set(scores.map((s) => s.recipe)));
  const sections = Array.from(new Set(scores.map((s) => s.sectionName).filter(Boolean)));

  const visible = scores.filter((s) => {
    if (filterRecipe !== "all" && s.recipe !== filterRecipe) return false;
    if (filterSection !== "all" && s.sectionName !== filterSection) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = "Timestamp,Student,Section,Recipe,Score,Errors,Time(s),Stars\n";
    const rows = visible.map((s) => {
      const ts = s.completedAt?.toDate ? s.completedAt.toDate().toISOString() : "";
      return `"${ts}","${s.studentName}","${s.sectionName}",${s.recipe},${s.score},${s.errors},${s.timeSeconds.toFixed(1)},${s.stars}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monsterchef_scores_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Scores</h1>
          <p className="text-neutral-400 text-sm">Student cooking results</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={visible.length === 0}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm disabled:opacity-50"
        >
          ⬇ Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="text-xs text-neutral-500 block mb-1">Recipe</label>
          <select
            value={filterRecipe}
            onChange={(e) => setFilterRecipe(e.target.value)}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
          >
            <option value="all">All recipes</option>
            {recipes.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-neutral-500 block mb-1">Section</label>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
          >
            <option value="all">All sections</option>
            {sections.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800 text-neutral-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">When</th>
              <th className="text-left px-4 py-3">Student</th>
              <th className="text-left px-4 py-3">Section</th>
              <th className="text-left px-4 py-3">Recipe</th>
              <th className="text-right px-4 py-3">Score</th>
              <th className="text-right px-4 py-3">Errors</th>
              <th className="text-right px-4 py-3">Time</th>
              <th className="text-center px-4 py-3">Stars</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                  No scores yet. Students need to complete recipes in the game.
                </td>
              </tr>
            )}
            {visible.map((s) => (
              <tr key={s.id} className="hover:bg-neutral-800/50">
                <td className="px-4 py-3 text-neutral-400 text-xs">
                  {s.completedAt?.toDate
                    ? s.completedAt.toDate().toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3 font-medium">{s.studentName}</td>
                <td className="px-4 py-3 text-neutral-400">{s.sectionName}</td>
                <td className="px-4 py-3">{s.recipe}</td>
                <td className="px-4 py-3 text-right font-bold text-amber-400">{s.score}</td>
                <td className="px-4 py-3 text-right text-red-400">{s.errors}</td>
                <td className="px-4 py-3 text-right">{s.timeSeconds.toFixed(0)}s</td>
                <td className="px-4 py-3 text-center">
                  {"⭐".repeat(s.stars)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        Showing latest {visible.length} of {scores.length} scores.
      </p>
    </div>
  );
}
