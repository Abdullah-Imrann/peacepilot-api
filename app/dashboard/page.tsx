"use client";

import { useState } from "react";
import { ArrowRight, NotebookPen, PlusCircle, Settings, Sparkles } from "lucide-react";
import Graph from "@/components/ui/graph";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import SectionWrapper from "@/components/layout/section-wrapper";
import { SAMPLE_GRAPH_POINTS, STORAGE_KEYS } from "@/lib/constants";
import { readFromStorage, formatDate } from "@/lib/utils";
import type { ClarityEntry, JournalSummary } from "@/lib/api";
import Link from "next/link";

type CombinedSummary = {
  id: string;
  type: "clarity" | "journal";
  title?: string;
  summary: string;
  feelings: string[];
  createdAt: string;
  linkTo: string;
  linkLabel: string;
};

const DashboardPage = () => {
  const [summaries] = useState<CombinedSummary[]>(() => {
    if (typeof window === "undefined") return [];
    
    const clarityEntries = readFromStorage<ClarityEntry[]>(STORAGE_KEYS.entries, []);
    const journalSummaries = readFromStorage<JournalSummary[]>(STORAGE_KEYS.journalSummaries, []);
    
    const combined: CombinedSummary[] = [
      ...clarityEntries.map((entry) => ({
        id: entry.id,
        type: "clarity" as const,
        summary: entry.summary,
        feelings: entry.feelings,
        createdAt: entry.createdAt,
        linkTo: "/problem",
        linkLabel: "View in Express & Reflect",
      })),
      ...journalSummaries.map((summary) => ({
        id: summary.id,
        type: "journal" as const,
        title: summary.journalTitle,
        summary: summary.summary,
        feelings: summary.feelings,
        createdAt: summary.createdAt,
        linkTo: "/journal",
        linkLabel: "View in Journal",
      })),
    ];
    
    // Sort by date (newest first) and take the 6 most recent
    return combined
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cp-secondary)]">Dashboard</p>
        <h2 className="text-3xl font-bold text-[var(--cp-foreground)]">Welcome back to PeacePilot</h2>
        <p className="text-[var(--cp-secondary)]">
          Track your emotional progress, revisit clarity summaries, and jump to your next entry.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionWrapper subdued>
          <Graph data={SAMPLE_GRAPH_POINTS} title="Emotional progress" />
        </SectionWrapper>
        <SectionWrapper>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-[var(--cp-foreground)]">Quick links</p>
            <div className="grid gap-3 md:grid-cols-2">
              <Link href="/problem">
                <Button fullWidth className="justify-between">
                  New entry <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/journal">
                <Button variant="secondary" fullWidth className="justify-between">
                  Journal <NotebookPen className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" fullWidth className="justify-between">
                  Settings <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#recent">
                <Button variant="secondary" fullWidth className="justify-between">
                  Recent clarity <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </SectionWrapper>
      </div>

      <div id="recent" className="grid gap-4 md:grid-cols-3">
        {summaries.length === 0 && (
          <Card className="md:col-span-3">
            <div className="flex items-center gap-3 text-[var(--cp-secondary)]">
              <Sparkles className="h-4 w-4 text-[var(--cp-accent)]" />
              <p>No summaries yet. Use Express & Reflect or Journal to see your recent clarity.</p>
            </div>
          </Card>
        )}
        {summaries.map((item) => (
          <Card key={item.id} className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--cp-secondary)]">
                {formatDate(item.createdAt)}
              </p>
              <span className="rounded-full bg-[var(--cp-accent)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cp-accent)]">
                {item.type === "journal" ? "Journal" : "Express & Reflect"}
              </span>
            </div>
            {item.title && (
              <h3 className="mt-2 text-base font-semibold text-[var(--cp-foreground)]">{item.title}</h3>
            )}
            <h3 className={`${item.title ? "mt-1" : "mt-2"} text-lg font-semibold text-[var(--cp-foreground)]`}>
              Summary
            </h3>
            <p className="mt-1 max-h-24 overflow-hidden text-ellipsis text-sm text-[var(--cp-secondary)]">
              {item.summary}
            </p>
            {item.feelings.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.feelings.slice(0, 3).map((feeling) => (
                  <span
                    key={feeling}
                    className="rounded-full bg-[var(--cp-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--cp-secondary)]"
                  >
                    {feeling}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-auto pt-4">
              <Link href={item.linkTo}>
                <Button variant="ghost" fullWidth>
                  {item.linkLabel}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;

