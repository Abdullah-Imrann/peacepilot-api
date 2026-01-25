import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface)] px-3 py-2 text-sm text-[var(--cp-foreground)] shadow-sm outline-none transition focus:border-[var(--cp-accent)] focus:ring-2 focus:ring-[var(--cp-accent)]/40",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export default Input;

