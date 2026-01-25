"use client";

import { useState } from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import SectionWrapper from "@/components/layout/section-wrapper";
import { STORAGE_KEYS } from "@/lib/constants";
import { formatDate, readFromStorage, saveToStorage } from "@/lib/utils";
import { generateJournalSummary, type JournalSummary } from "@/lib/api";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const JournalPage = () => {
  const initialEntries =
    typeof window === "undefined"
      ? []
      : readFromStorage<JournalEntry[]>(STORAGE_KEYS.journal, []);
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [selected, setSelected] = useState<JournalEntry | null>(
    initialEntries[0] ?? null,
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...entries];
    setEntries(next);
    setSelected(entry);
    saveToStorage(STORAGE_KEYS.journal, next);
    setTitle("");
    setContent("");

    // Generate summary for the new entry
    setGeneratingSummary(true);
    try {
      const summary = await generateJournalSummary(
        entry.id,
        entry.title,
        entry.content
      );
      const existingSummaries = readFromStorage<JournalSummary[]>(
        STORAGE_KEYS.journalSummaries,
        []
      );
      // Remove any existing summary for this journal entry (in case of duplicates)
      const filteredSummaries = existingSummaries.filter(
        (s) => s.journalId !== entry.id
      );
      const updatedSummaries = [summary, ...filteredSummaries].slice(0, 50); // Keep last 50
      saveToStorage(STORAGE_KEYS.journalSummaries, updatedSummaries);
    } catch (error) {
      console.error("Failed to generate journal summary:", error);
      // Don't show error to user, just log it - summary generation is optional
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    setSelected(next[0] ?? null);
    saveToStorage(STORAGE_KEYS.journal, next);
    
    // Also delete the associated summary
    const existingSummaries = readFromStorage<JournalSummary[]>(
      STORAGE_KEYS.journalSummaries,
      []
    );
    const updatedSummaries = existingSummaries.filter((s) => s.journalId !== id);
    saveToStorage(STORAGE_KEYS.journalSummaries, updatedSummaries);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cp-secondary)]">Journal</p>
        <h2 className="text-3xl font-bold text-[var(--cp-foreground)]">A calm space for daily reflections</h2>
        <p className="text-[var(--cp-secondary)]">Capture what happened today, how you felt, and what you learned.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <SectionWrapper subdued>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="What did you experience today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleAdd} fullWidth loading={generatingSummary}>
              {generatingSummary ? "Generating summary..." : "Add entry"}
            </Button>
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[var(--cp-foreground)]">Entries</p>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="cursor-pointer border-[var(--cp-border)] transition hover:border-[var(--cp-accent)]"
                    onClick={() => setSelected(entry)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--cp-foreground)]">{entry.title}</p>
                        <p className="text-xs text-[var(--cp-secondary)]">{formatDate(entry.createdAt)}</p>
                      </div>
                      <button
                        className="rounded-lg p-1 text-[var(--cp-secondary)] transition hover:bg-[var(--cp-muted)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        aria-label="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
                {entries.length === 0 && (
                  <Card className="text-sm text-[var(--cp-secondary)]">
                    No journal entries yet. Start with one reflection today.
                  </Card>
                )}
              </div>
            </div>

            <Card className="min-h-[300px]">
              {selected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--cp-foreground)]">{selected.title}</p>
                      <p className="text-xs text-[var(--cp-secondary)]">{formatDate(selected.createdAt)}</p>
                    </div>
                    <NotebookPen className="h-4 w-4 text-[var(--cp-accent)]" />
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-[var(--cp-secondary)]">{selected.content}</p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--cp-secondary)]">
                  Select or create a journal entry to view it here.
                </div>
              )}
            </Card>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
};

export default JournalPage;

