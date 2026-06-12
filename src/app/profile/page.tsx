"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Section } from "@/lib/types";

const GRADE_LEVELS = [
  "Grade 11",
  "Grade 12",
];

export default function ProfilePage() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (appUser) {
      setDisplayName(appUser.displayName || "");
      setGradeLevel(appUser.gradeLevel || "");
      setSectionId(appUser.sectionId || "");
    }
  }, [loading, user, appUser, router]);

  useEffect(() => {
    const loadSections = async () => {
      const q = query(collection(db, "sections"));
      const snap = await getDocs(q);
      setSections(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Section)));
    };
    loadSections();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const selectedSection = sections.find((s) => s.id === sectionId);
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        gradeLevel,
        sectionId,
        sectionName: selectedSection?.name || "",
        teacherId: selectedSection?.teacherId || "",
      });
      router.push("/pending");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !appUser) {
    return <main className="min-h-screen flex items-center justify-center">Loading...</main>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Complete Your Profile</h1>
        <p className="text-neutral-400 text-sm mb-6">
          Required before a teacher can approve you.
        </p>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Grade Level</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg"
            >
              <option value="">Select...</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Section</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg"
            >
              <option value="">Select a section...</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {sections.length === 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                No sections available yet. Ask your teacher to create one.
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold rounded-lg disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
