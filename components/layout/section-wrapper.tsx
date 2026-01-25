import { cn } from "@/lib/utils";
import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  subdued?: boolean;
};

const SectionWrapper = ({ className, children, subdued = false, ...props }: Props) => (
  <section
    className={cn(
      "w-full rounded-3xl border border-[var(--cp-border)] bg-[var(--cp-surface)]/90 p-6 shadow-sm backdrop-blur",
      subdued && "bg-[var(--cp-muted)]/60",
      className,
    )}
    {...props}
  >
    {children}
  </section>
);

export default SectionWrapper;

