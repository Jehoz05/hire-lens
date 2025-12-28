// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Redirect based on user role
    if (session.user?.role === "recruiter") {
      router.push("/recruiter/dashboard");
    } else if (session.user?.role === "candidate") {
      router.push("/candidate/dashboard");
    } else {
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="ml-4">Redirecting to your dashboard...</p>
    </div>
  );
}
