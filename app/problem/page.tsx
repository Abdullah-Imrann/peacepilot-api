"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import Card from "@/components/ui/card";
import SectionWrapper from "@/components/layout/section-wrapper";
import { getClarityInsights, type ClarityEntry } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/constants";
import { readFromStorage, saveToStorage, formatDate } from "@/lib/utils";

const ExpressReflectPageContent = () => {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<ClarityEntry | null>(null);
  const [history, setHistory] = useState<ClarityEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initial = searchParams?.get("q");
    if (initial) setPrompt(initial);
    const stored = readFromStorage<ClarityEntry[]>(STORAGE_KEYS.entries, []);
    setHistory(stored);
    setEntry(stored[0] ?? null);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const response = await getClarityInsights(prompt.trim());
      setEntry(response);
      const nextHistory = [response, ...history].slice(0, 20);
      setHistory(nextHistory);
      saveToStorage(STORAGE_KEYS.entries, nextHistory);
    } catch (err) {
      setError("Something went wrong while getting clarity. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cp-secondary)]">Express & Reflect</p>
        <h2 className="text-3xl font-bold text-[var(--cp-foreground)]">Get clarity on what you’re feeling</h2>
        <p className="text-[var(--cp-secondary)]">
          Describe what’s happening. We’ll return a summary, feelings, action plan, and prompts you can journal on.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionWrapper>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Textarea
              placeholder="I’ve been feeling..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={loading}>
                Navigate This Issue
              </Button>
              {error && <p className="text-sm text-[var(--cp-danger)]">{error}</p>}
            </div>
          </form>
          {history.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-[var(--cp-secondary)]">Recent entries</p>
              <div className="flex flex-wrap gap-3">
                {history.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    className="rounded-lg border border-[var(--cp-border)] bg-[var(--cp-muted)] px-3 py-2 text-left text-sm text-[var(--cp-secondary)] transition hover:border-[var(--cp-accent)]"
                    onClick={() => setEntry(item)}
                    type="button"
                  >
                    {item.prompt.slice(0, 64)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </SectionWrapper>

        <div className="space-y-4">
          <Card className="h-full">
            {entry ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--cp-secondary)]">Clarity summary</p>
                    <p className="mt-1 text-sm text-[var(--cp-secondary)]">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--cp-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--cp-accent)]">
                    New
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--cp-foreground)]">{entry.summary}</h3>
                <div>
                  <p className="text-sm font-semibold text-[var(--cp-foreground)]">What you might be feeling</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.feelings.map((feeling) => (
                      <span
                        key={feeling}
                        className="rounded-full bg-[var(--cp-muted)] px-3 py-1 text-xs font-medium text-[var(--cp-secondary)]"
                      >
                        {feeling}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cp-foreground)]">Action plan</p>
                  <ul className="mt-2 space-y-2 text-sm text-[var(--cp-secondary)]">
                    {entry.actionPlan.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--cp-muted)] text-[10px] font-semibold text-[var(--cp-secondary)]">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cp-foreground)]">Reflection prompts</p>
                  <ul className="mt-2 space-y-2 text-sm text-[var(--cp-secondary)]">
                    {entry.reflectionPrompts.map((promptItem, idx) => (
                      <li key={idx}>{promptItem}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-[var(--cp-secondary)]">
                <p className="text-sm font-medium">Run Express & Reflect to see your clarity plan.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const ExpressReflectPage = () => {
  return (
    <Suspense fallback={
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cp-secondary)]">Express & Reflect</p>
          <h2 className="text-3xl font-bold text-[var(--cp-foreground)]">Get clarity on what you're feeling</h2>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="text-[var(--cp-secondary)]">Loading...</p>
        </div>
      </div>
    }>
      <ExpressReflectPageContent />
    </Suspense>
  );
};

export default ExpressReflectPage;

