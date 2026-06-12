"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Section } from "@/lib/types";

export default function SectionsPage() {
  const { appUser } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!appUser) return;
    const q = query(
      collection(db, "sections"),
      where("teacherId", "==", appUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setSections(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Section)));
    });
    return () => unsub();
  }, [appUser]);

  // Live count of students per section
  useEffect(() => {
    if (!appUser) return;
    const refresh = async () => {
      const snap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
      const next: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.sectionId) next[data.sectionId] = (next[data.sectionId] || 0) + 1;
      });
      setCounts(next);
    };
    refresh();
    const interval = setInterval(refresh, 10000); // re-poll every 10s
    return () => clearInterval(interval);
  }, [appUser]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !newName.trim()) return;
    setBusy(true);
    try {
      await addDoc(collection(db, "sections"), {
        name: newName.trim(),
        teacherId: appUser.uid,
        studentCount: 0,
        createdAt: serverTimestamp(),
      });
      setNewName("");
    } finally {
      setBusy(false);
    }
  };

  const rename = async (id: string, oldName: string) => {
    const name = prompt("Rename section:", oldName);
    if (!name || name === oldName) return;
    await updateDoc(doc(db, "sections", id), { name });
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete section "${name}"?\nStudents will keep their accounts but lose section assignment.`)) return;
    await deleteDoc(doc(db, "sections", id));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Sections</h1>
      <p className="text-neutral-400 text-sm mb-6">Create and manage class sections</p>

      <form onSubmit={add} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Section name (e.g., 11-Bonifacio)"
          className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg"
        />
        <button
          type="submit"
          disabled={busy || !newName.trim()}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-semibold rounded-lg disabled:opacity-50"
        >
          + Add Section
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.length === 0 && (
          <div className="col-span-full bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-500">
            No sections yet. Create one above.
          </div>
        )}
        {sections.map((s) => (
          <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {counts[s.id] || 0} students
                </p>
              </div>
              <span className="text-2xl">🏫</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => rename(s.id, s.name)}
                className="flex-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs"
              >
                Rename
              </button>
              <button
                onClick={() => remove(s.id, s.name)}
                className="flex-1 px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 rounded text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
