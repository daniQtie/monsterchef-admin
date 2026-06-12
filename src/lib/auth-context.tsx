"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { AppUser } from "./types";

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Load or create user document in Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data() as AppUser;
          setAppUser({ ...data, uid: firebaseUser.uid });
          // Update lastSeen
          await setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true });
        } else {
          // First-time user — create stub. Default role = student, unapproved.
          // Admin email auto-promoted to teacher.
          const isAdminEmail = firebaseUser.email === "umipigdani@gmail.com";
          const stub: Record<string, unknown> = {
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            role: isAdminEmail ? "teacher" : "student",
            approved: isAdminEmail ? true : false,
          };
          // Only include photoURL if it exists (Firestore rejects undefined)
          if (firebaseUser.photoURL) stub.photoURL = firebaseUser.photoURL;

          await setDoc(userRef, {
            ...stub,
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
          });
          const fresh = await getDoc(userRef);
          setAppUser({ ...(fresh.data() as AppUser), uid: firebaseUser.uid });
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Sign out, then do a FULL navigation with history replace. `location.replace`
  // drops the dashboard from history so the browser Back button can't return to it,
  // and the hard navigation guarantees no bfcache-restored authenticated page lingers.
  const logout = async () => {
    setUser(null);
    setAppUser(null);
    try {
      await signOut(auth);
    } finally {
      if (typeof window !== "undefined") window.location.replace("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
