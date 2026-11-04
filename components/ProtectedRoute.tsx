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

    if (!token || !user) {
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

    if (allowedRoles && !allowedRoles.includes(user.role)) {
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-neutral-700" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
          </div>
          <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Verifying security & access...
          </p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

