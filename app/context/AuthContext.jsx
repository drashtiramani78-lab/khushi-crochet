"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchUser = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch("/api/auth/me", {
        next: { revalidate: 300 },
        credentials: "include",
        signal: controller.signal,
      });
      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data =
        contentType.includes("application/json") && raw ? JSON.parse(raw) : null;

      setUser(data?.user || null);
    } catch (error) {
      console.error("Fetch user error:", error);
      setUser(null);
    } finally {
      clearTimeout(timeoutId);
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      // Logout from regular user endpoint (clears user_token cookie)
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        fetchUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}