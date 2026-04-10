"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomOrderRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/customorder");
  }, [router]);

  return null;
}

