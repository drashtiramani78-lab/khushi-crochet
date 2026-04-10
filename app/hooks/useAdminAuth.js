"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async (retries = 3) => {
      try {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            const res = await fetch("/api/auth/admin", {
              cache: "no-store",
              credentials: "include",
            });
            const data = await res.json();

            if (data.user && data.user.role === "admin") {
              setUser(data.user);
              setIsAuthorized(true);
              return;
            }
          } catch (error) {
            console.warn(`Admin auth check attempt ${attempt} failed:`, error);
          }

          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
          }
        }

        // All retries failed
        setUser(null);
        setIsAuthorized(false);
        router.push("/admin-login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  const logout = async () => {
    try {
      await fetch("/api/admin-logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setIsAuthorized(false);
      router.push("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/admin-login");
    }
  };

  return {
    user,
    authLoading,
    isAuthorized,
    logout,
  };
}
