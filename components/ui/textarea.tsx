import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[140px] rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface)] px-3 py-2 text-sm text-[var(--cp-foreground)] shadow-sm outline-none transition focus:border-[var(--cp-accent)] focus:ring-2 focus:ring-[var(--cp-accent)]/40",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

export default Textarea;

