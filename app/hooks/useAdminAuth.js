"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch("/api/auth/admin", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();

        if (data.user && data.user.role === "admin") {
          setUser(data.user);
          setIsAuthorized(true);
        } else {
          setUser(null);
          setIsAuthorized(false);
          router.push("/admin-login");
        }
      } catch (error) {
        console.error("Admin auth check error:", error);
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
