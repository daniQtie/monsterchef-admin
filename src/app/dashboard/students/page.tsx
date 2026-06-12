"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { AppUser } from "@/lib/types";

export default function StudentsPage() {
  const { appUser } = useAuth();
  const [students, setStudents] = useState<AppUser[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!appUser) return;
    const q = query(
      collection(db, "users"),
      where("role", "==", "student")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
      setStudents(list);
    });
    return () => unsub();
  }, [appUser]);

  const visible = students.filter((s) => {
    if (filter === "pending" && s.approved) return false;
    if (filter === "approved" && !s.approved) return false;
    if (search && !s.displayName?.toLowerCase().includes(search.toLowerCase()) &&
        !s.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const approve = async (uid: string) => {
    await updateDoc(doc(db, "users", uid), { approved: true });
  };

  const reject = async (uid: string) => {
    if (!confirm("Reject and delete this student account?")) return;
    await updateDoc(doc(db, "users", uid), { approved: false });
  };

  const remove = async (uid: string) => {
    if (!confirm("Delete this student permanently?")) return;
    await deleteDoc(doc(db, "users", uid));
  };

  const pendingCount = students.filter((s) => !s.approved).length;
  const approvedCount = students.filter((s) => s.approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-neutral-400 text-sm">Approve registrations and manage accounts</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label={`All (${students.length})`} />
        <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")} label={`Pending (${pendingCount})`} color="amber" />
        <FilterButton active={filter === "approved"} onClick={() => setFilter("approved")} label={`Approved (${approvedCount})`} color="green" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="ml-auto px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm w-64"
        />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800 text-neutral-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Grade</th>
              <th className="text-left px-4 py-3">Section</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  No students {filter !== "all" ? `(${filter})` : ""} found.
                </td>
              </tr>
            )}
            {visible.map((s) => (
              <tr key={s.uid} className="hover:bg-neutral-800/50">
                <td className="px-4 py-3 font-medium">{s.displayName || "—"}</td>
                <td className="px-4 py-3 text-neutral-400">{s.email}</td>
                <td className="px-4 py-3">{s.gradeLevel || "—"}</td>
                <td className="px-4 py-3">{s.sectionName || "—"}</td>
                <td className="px-4 py-3">
                  {s.approved ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-900/40 text-green-400 border border-green-700">
                      Approved
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-amber-900/40 text-amber-400 border border-amber-700">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {!s.approved && (
                      <button
                        onClick={() => approve(s.uid)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium"
                      >
                        Approve
                      </button>
                    )}
                    {s.approved && (
                      <button
                        onClick={() => reject(s.uid)}
                        className="px-3 py-1 bg-amber-700 hover:bg-amber-600 rounded text-xs font-medium"
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => remove(s.uid)}
                      className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  color = "amber",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: "amber" | "green";
}) {
  const activeClass =
    color === "green" ? "bg-green-600 text-white" : "bg-amber-500 text-neutral-900";
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
        active ? activeClass : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
      }`}
    >
      {label}
    </button>
  );
}
