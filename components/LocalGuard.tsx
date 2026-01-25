"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

function isProtectedPath(pathname: string | null) {
  if (!pathname) return false;
  // Only protect the "app" pages; keep marketing + auth reachable.
  if (pathname === "/" || pathname.startsWith("/auth")) return false;
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/problem") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/settings")
  );
}

export default function LocalGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPasscode, locked } = useUser();

  useEffect(() => {
    if (!hasPasscode) return;
    if (!locked) return;
    if (!isProtectedPath(pathname)) return;
    router.replace("/auth");
  }, [hasPasscode, locked, pathname, router]);

  return null;
}

