"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck, ShieldOff, Sparkles } from "lucide-react";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import SectionWrapper from "@/components/layout/section-wrapper";
import { useUser } from "@/hooks/useUser";

const AuthPage = () => {
  const { hasPasscode, locked, setPasscode, unlock, lock, clearPasscode } = useUser();
  const [mode, setMode] = useState<"create" | "unlock" | "change">("create");
  const [passcode, setPasscodeInput] = useState("");
  const [confirm, setConfirm] = useState("");
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stateLabel = useMemo(() => {
    if (!hasPasscode) return "No protection set";
    if (locked) return "Locked on this device";
    return "Protected, currently unlocked";
  }, [hasPasscode, locked]);

  useEffect(() => {
    if (!hasPasscode) {
      setMode("create");
      return;
    }
    if (locked) {
      setMode("unlock");
      return;
    }
    setMode("change");
  }, [hasPasscode, locked]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (passcode !== confirm) {
      setStatus("Passcodes do not match.");
      return;
    }
    setLoading(true);
    try {
      await setPasscode(passcode);
      setStatus("Local protection enabled. You’re unlocked.");
      setPasscodeInput("");
      setConfirm("");
      setMode("change");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await unlock(passcode);
      setStatus("Unlocked for this session.");
      setPasscodeInput("");
      setMode("change");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (passcode !== confirm) {
      setStatus("New passcodes do not match.");
      return;
    }
    setLoading(true);
    try {
      if (current) {
        await unlock(current);
      }
      await setPasscode(passcode);
      setStatus("Passcode updated.");
      setPasscodeInput("");
      setConfirm("");
      setCurrent("");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    clearPasscode();
    setPasscodeInput("");
    setConfirm("");
    setCurrent("");
    setStatus("Protection removed. Your entries stay on this device, just without a lock.");
  };

  const handleLockNow = () => {
    if (!hasPasscode) return;
    lock();
    setStatus("App locked on this device. Unlock with your passcode.");
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cp-secondary)]">
          Local Protection
        </p>
        <h2 className="text-3xl font-bold text-[var(--cp-foreground)]">Protect your space</h2>
        <p className="text-[var(--cp-secondary)]">
          All data stays on this device. Set a local passcode while we keep cloud sign-in disabled.
        </p>
      </div>

      <SectionWrapper>
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[var(--cp-muted)] px-4 py-3">
          <div className="space-y-0.5 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cp-secondary)]">
              Protection status
            </p>
            <p className="text-sm font-medium text-[var(--cp-foreground)]">{stateLabel}</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleLockNow}
              disabled={!hasPasscode || locked}
            >
              Lock now
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMode(hasPasscode ? "change" : "create")}
            >
              {hasPasscode ? "Change" : "Set up"}
            </Button>
          </div>
        </div>

        {!hasPasscode && (
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--cp-foreground)]">Passcode</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Choose a passcode"
                  value={passcode}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="pl-9"
                  required
                />
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-[var(--cp-secondary)]" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--cp-foreground)]">Confirm</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Re-enter passcode"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-9"
                  required
                />
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-[var(--cp-secondary)]" />
              </div>
            </div>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Saving..." : "Enable local protection"}
            </Button>
            {status && <Card className="text-sm text-[var(--cp-secondary)]">{status}</Card>}
          </form>
        )}

        {hasPasscode && locked && (
          <form className="space-y-4" onSubmit={handleUnlock}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--cp-foreground)]">Enter passcode</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="pl-9"
                  required
                />
                <ShieldCheck className="absolute left-2 top-2.5 h-4 w-4 text-[var(--cp-secondary)]" />
              </div>
            </div>
            <Button type="submit" fullWidth disabled={loading || !hasPasscode}>
              {loading ? "Unlocking..." : locked ? "Unlock" : "Unlock anyway"}
            </Button>
            {status && <Card className="text-sm text-[var(--cp-secondary)]">{status}</Card>}
          </form>
        )}

        {hasPasscode && !locked && mode === "change" && (
          <form className="space-y-4" onSubmit={handleChange}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--cp-foreground)]">Current passcode</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter current passcode"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="pl-9"
                  required
                />
                <ShieldCheck className="absolute left-2 top-2.5 h-4 w-4 text-[var(--cp-secondary)]" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--cp-foreground)]">New passcode</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Choose a new passcode"
                  value={passcode}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="pl-9"
                  required
                />
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-[var(--cp-secondary)]" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--cp-foreground)]">Confirm new passcode</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Re-enter new passcode"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-9"
                  required
                />
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-[var(--cp-secondary)]" />
              </div>
            </div>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Updating..." : "Update passcode"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              fullWidth
              onClick={handleClear}
              className="mt-1"
            >
              Remove protection
            </Button>
            {status && <Card className="text-sm text-[var(--cp-secondary)]">{status}</Card>}
          </form>
        )}
      </SectionWrapper>

      <SectionWrapper className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--cp-accent)] text-[var(--cp-accent-foreground)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--cp-foreground)]">Cloud sign-in coming later</p>
            <p className="text-sm text-[var(--cp-secondary)]">
              We’ll keep this page ready for email/Google/Microsoft when you opt into cloud sync or
              paid features. For now, everything stays on-device.
            </p>
          </div>
        </div>
        {!hasPasscode && (
          <Card className="flex items-start gap-3 text-sm text-[var(--cp-secondary)]">
            <ShieldOff className="mt-0.5 h-4 w-4 text-[var(--cp-foreground)]" />
            <div>
              <p className="font-semibold text-[var(--cp-foreground)]">No protection set</p>
              <p>Add a local passcode to prevent casual access on this device.</p>
            </div>
          </Card>
        )}
      </SectionWrapper>
    </div>
  );
};

export default AuthPage;

