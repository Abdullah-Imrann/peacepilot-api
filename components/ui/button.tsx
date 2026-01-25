"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md";
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--cp-accent)] text-[var(--cp-accent-foreground)] shadow-sm hover:shadow-md hover:-translate-y-[1px]",
  secondary:
    "bg-[var(--cp-muted)] text-[var(--cp-foreground)] hover:bg-[var(--cp-border)]",
  ghost:
    "bg-transparent text-[var(--cp-foreground)] hover:bg-[var(--cp-muted)]",
  destructive:
    "bg-[var(--cp-danger)] text-white hover:bg-red-600 focus-visible:ring-red-300",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, fullWidth, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cp-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2",
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
      )}
      {children}
    </button>
  ),
);

Button.displayName = "Button";

export default Button;

