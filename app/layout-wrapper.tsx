"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <AuthProvider>
      <CartProvider>
        {!isAdminRoute && <Navbar />}
        {children}
        {!isAdminRoute && <Footer />}
      </CartProvider>
    </AuthProvider>
  );
}
