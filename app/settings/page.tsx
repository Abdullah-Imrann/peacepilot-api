"use client";

import { useState } from "react";
import { Trash2, Sun, Moon } from "lucide-react";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { STORAGE_KEYS } from "@/lib/constants";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [message, setMessage] = useState<string | null>(null);

  const handleDelete = () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    setMessage("All local data cleared. Fresh start!");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cp-secondary)]">Settings</p>
        <h2 className="text-3xl font-bold text-[var(--cp-foreground)]">Shape PeacePilot to your style</h2>
        <p className="text-[var(--cp-secondary)]">Theme, data, and privacy controls live here.</p>
      </div>

      <SectionWrapper subdued className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--cp-foreground)]">Theme</p>
            <p className="text-xs text-[var(--cp-secondary)]">Switch between light and dark.</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="ml-2">{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </Button>
        </div>
      </SectionWrapper>

      <SectionWrapper className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--cp-foreground)]">Delete local data</p>
            <p className="text-xs text-[var(--cp-secondary)]">
              Clears entries, journal, and account info stored in your browser.
            </p>
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="ml-2">Delete</span>
          </Button>
        </div>
        {message && (
          <Card className="text-sm text-[var(--cp-secondary)]">{message}</Card>
        )}
      </SectionWrapper>
    </div>
  );
};

export default SettingsPage;

