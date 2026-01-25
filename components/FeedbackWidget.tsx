"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { push, ref } from "firebase/database";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import Textarea from "@/components/ui/textarea";
import { getFirebaseDatabase } from "@/lib/firebaseClient";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function FeedbackWidget() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = message.trim().length >= 3 && state !== "submitting";

  const metadata = useMemo(() => {
    if (typeof window === "undefined") return null;
    return {
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    };
  }, [open]);

  async function submit() {
    if (!canSubmit) return;

    setState("submitting");
    setErrorMessage(null);

    try {
      const db = getFirebaseDatabase();
      await push(ref(db, "feedback"), {
        message: message.trim(),
        email: email.trim() || null,
        path: pathname ?? null,
        createdAt: new Date().toISOString(),
        metadata,
      });

      setState("success");
      setEmail("");
      setMessage("");
      setTimeout(() => setOpen(false), 700);
      setTimeout(() => setState("idle"), 900);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit feedback.";
      setErrorMessage(msg);
      setState("error");
    }
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <Button
          variant="primary"
          onClick={() => setOpen(true)}
          className="rounded-full shadow-lg"
          aria-label="Open feedback form"
        >
          <MessageSquareText className="h-4 w-4" />
          Feedback
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setState("idle");
          setErrorMessage(null);
        }}
        title="Send feedback"
        description="Tell me what’s working, what’s confusing, or what you’d like changed."
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--cp-foreground)]">Your feedback</label>
            <Textarea
              placeholder="Type your feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-[var(--cp-secondary)]">
              Please avoid sharing sensitive personal info.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--cp-foreground)]">
              Email (optional)
            </label>
            <Input
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-[var(--cp-border)] bg-[var(--cp-muted)] px-3 py-2 text-sm text-[var(--cp-secondary)]">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={state === "submitting"}>
              Cancel
            </Button>
            <Button onClick={submit} loading={state === "submitting"} disabled={!canSubmit}>
              {state === "success" ? "Sent" : "Submit"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

