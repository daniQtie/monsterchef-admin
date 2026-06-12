"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { AppUser } from "@/lib/types";

export default function LiveViewPage() {
  const { appUser } = useAuth();
  const [students, setStudents] = useState<AppUser[]>([]);

  useEffect(() => {
    if (!appUser) return;
    const q = query(
      collection(db, "users"),
      where("role", "==", "student")
    );
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
      // filter approved client-side to avoid composite index
      setStudents(all.filter((u) => u.approved));
    });
    return () => unsub();
  }, [appUser]);

  const onlineThreshold = Date.now() - 5 * 60 * 1000; // last 5 min

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Live View</h1>
      <p className="text-neutral-400 text-sm mb-6">
        Watch students play in real time. Request access to a student&apos;s game view below.
      </p>

      <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4 mb-6 text-sm">
        <p className="text-blue-300 font-medium mb-1">📡 WebRTC Live Streaming</p>
        <p className="text-neutral-400 text-xs">
          Click on a student to request a live view. The student must be playing the game on their phone.
        </p>
      </div>

      <h2 className="text-sm uppercase tracking-wide text-neutral-400 mb-3">
        Active Students ({students.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.length === 0 && (
          <div className="col-span-full bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-500">
            No approved students yet.
          </div>
        )}
        {students.map((s) => {
          const lastSeenMs = s.lastSeen?.toMillis ? s.lastSeen.toMillis() : 0;
          const online = lastSeenMs > onlineThreshold;
          return (
            <div key={s.uid} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{s.displayName}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{s.sectionName || "No section"}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    online
                      ? "bg-green-900/40 text-green-400 border border-green-700"
                      : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {online ? "● Online" : "○ Offline"}
                </span>
              </div>

              <a
                href={`/dashboard/live/${s.uid}`}
                className="block w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-medium rounded-lg text-sm text-center"
              >
                📺 Open Live View
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
