import { cn } from "@/lib/utils";
import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)]/90 p-6 shadow-sm backdrop-blur",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;

