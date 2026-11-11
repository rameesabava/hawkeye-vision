"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "admin")[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading } = useAuth();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    const savedToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("hawkeye_token") : null);

    if (!savedToken) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        toast.error("Authentication required", {
          description: "Please sign in to access this page.",
        });
        const target = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
        router.replace(target);
      }
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        toast.error("Access Denied", {
          description: "You do not have administrative privileges to access this area.",
        });
        router.replace(user.role === "admin" ? "/admin" : "/");
      }
    }
  }, [user, token, loading, allowedRoles, redirectTo, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-blue-200" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#081F4D] border-t-transparent" />
          </div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Verifying security & access...
          </p>
        </div>
      </div>
    );
  }

  const savedToken =
    token || (typeof window !== "undefined" ? localStorage.getItem("hawkeye_token") : null);

  if (!savedToken) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

