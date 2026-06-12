"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
    } else if (appUser?.role === "student") {
      // Always go to /pending — that page handles both pending + approved states
      if (!appUser.gradeLevel || !appUser.sectionId) router.push("/profile");
      else router.push("/pending");
    } else if (appUser?.role === "teacher" || appUser?.role === "admin") {
      router.push("/dashboard");
    }
  }, [loading, user, appUser, router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-neutral-400">
      Loading...
    </main>
  );
}
