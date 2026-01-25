"use client";

import { X } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import Button from "./button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

const Modal = ({ open, onClose, title, description, children, className }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-6 shadow-xl",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[var(--cp-secondary)] transition hover:bg-[var(--cp-muted)]"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        {title && <h3 className="text-lg font-semibold text-[var(--cp-foreground)]">{title}</h3>}
        {description && <p className="mt-2 text-sm text-[var(--cp-secondary)]">{description}</p>}
        <div className="mt-4 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

