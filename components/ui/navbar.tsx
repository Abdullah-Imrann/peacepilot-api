"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Moon, Sparkles, Sun, Menu } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import Button from "./button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--cp-border)] bg-[var(--cp-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[var(--cp-foreground)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cp-accent)] text-[var(--cp-accent-foreground)] shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span>PeacePilot</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 transition hover:bg-[var(--cp-muted)]",
                pathname?.startsWith(link.href) &&
                  "bg-[var(--cp-muted)] text-[var(--cp-foreground)] font-medium",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={toggleTheme} className="hidden md:inline-flex">
            {!mounted ? (
              <span className="h-4 w-4" />
            ) : theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Link href="/auth">
            <Button variant="primary" className="hidden md:inline-flex">
              Protect app
            </Button>
          </Link>
          <button
            className="rounded-lg p-2 hover:bg-[var(--cp-muted)] md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.90)" }}
            onClick={() => setOpen(false)}
            onTouchStart={() => setOpen(false)}
            onMouseDown={() => setOpen(false)}
            aria-label="Close navigation"
          />
          <div
            className="absolute inset-y-0 right-0 flex w-72 max-w-[80%] flex-col gap-4 border-l border-[var(--cp-border)] bg-[var(--cp-surface)] px-4 py-6 shadow-2xl shadow-black/40 ring-1 ring-[var(--cp-border)]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--cp-foreground)]">Menu</span>
              <button
                className="rounded-md px-2 py-1 text-xs font-semibold text-[var(--cp-secondary)] hover:bg-[var(--cp-muted)]"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 text-base">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg bg-[var(--cp-muted)] px-3 py-2 text-sm font-semibold text-[var(--cp-foreground)] transition hover:bg-[var(--cp-muted)] hover:text-[var(--cp-foreground)]",
                    pathname?.startsWith(link.href) && "bg-[var(--cp-muted)]",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onClick={toggleTheme} fullWidth>
                {!mounted ? "Theme" : theme === "light" ? "Dark mode" : "Light mode"}
              </Button>
              <Link href="/auth">
                <Button fullWidth onClick={() => setOpen(false)}>
                  Protect app
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

