"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Heart } from "lucide-react";
import Button from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import Card from "@/components/ui/card";
import SectionWrapper from "@/components/layout/section-wrapper";
import { PLACEHOLDER_PROMPTS } from "@/lib/constants";
import { getGreeting } from "@/lib/utils";

const highlights = [
  "Compassionate, action-first guidance",
  "Clear steps tailored to your situation",
  "Private by default — lives on your device",
];

export default function Home() {
  const router = useRouter();
  const [problem, setProblem] = useState(PLACEHOLDER_PROMPTS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push(`/problem?q=${encodeURIComponent(problem)}`);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),transparent_40%),radial-gradient(circle_at_30%_30%,_rgba(14,165,233,0.18),transparent_35%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl flex-col gap-12 px-4 py-12 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6 animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cp-secondary)]">
              {getGreeting()}, welcome back
            </p>
            <h1 className="text-4xl font-bold leading-tight text-[var(--cp-foreground)] md:text-5xl">
              PeacePilot helps you turn tangled feelings into calm, actionable plans.
            </h1>
            <p className="text-lg text-[var(--cp-secondary)]">
              Share what’s bothering you today. Get a clear explanation of the problem, what you might be feeling, an action plan, and gentle prompts to move forward.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--cp-secondary)]">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--cp-muted)] px-3 py-1"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[var(--cp-accent)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <SectionWrapper className="animate-fade-in">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-[var(--cp-foreground)]">
                    What’s bothering you today?
                  </label>
                  <span className="text-[var(--cp-secondary)]">We’ll craft a clarity plan.</span>
                </div>
                <Textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe the situation, how you’re feeling, and what you need."
                  className="mt-2"
                  required
                />
              </div>
              <Button type="submit" loading={loading} fullWidth>
                Navigate This Issue <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Card className="flex items-start gap-3 border-dashed border-[var(--cp-border)] bg-[var(--cp-muted)]/70">
                <div className="rounded-lg bg-[var(--cp-accent)]/10 p-2 text-[var(--cp-accent)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cp-foreground)]">Private & local</p>
                  <p className="text-xs text-[var(--cp-secondary)]">Entries live in your browser storage.</p>
                </div>
              </Card>
              <Card className="flex items-start gap-3 border-dashed border-[var(--cp-border)] bg-[var(--cp-muted)]/70">
                <div className="rounded-lg bg-[var(--cp-accent)]/10 p-2 text-[var(--cp-accent)]">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cp-foreground)]">Gentle coaching</p>
                  <p className="text-xs text-[var(--cp-secondary)]">Actionable steps with empathy built-in.</p>
                </div>
              </Card>
            </div>
          </SectionWrapper>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLACEHOLDER_PROMPTS.map((prompt) => (
            <Card key={prompt} className="h-full shadow-sm">
              <p className="text-sm font-semibold text-[var(--cp-foreground)]">Try this</p>
              <p className="mt-2 text-[var(--cp-secondary)]">{prompt}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
