export type ClarityEntry = {
  id: string;
  prompt: string;
  summary: string;
  feelings: string[];
  actionPlan: string[];
  reflectionPrompts: string[];
  createdAt: string;
};

export type JournalSummary = {
  id: string;
  journalId: string;
  journalTitle: string;
  summary: string;
  feelings: string[];
  createdAt: string;
};

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const fallbackEntry: Omit<ClarityEntry, "prompt" | "id" | "createdAt"> = {
  summary:
    "It sounds like you're carrying a lot right now. The core issue is juggling expectations and feeling unsure how to prioritise yourself.",
  feelings: [
    "Overwhelm from competing demands",
    "Guilt for not meeting everyone's expectations",
    "Anxiety about making the wrong call",
  ],
  actionPlan: [
    "Name your top three priorities for this week and schedule them first.",
    "Communicate one clear boundary to someone close to reduce pressure.",
    "Break your problem into a next tiny step you can do today (15 minutes).",
    "Plan a short decompression ritual (walk, breathwork, or journaling) daily.",
  ],
  reflectionPrompts: [
    "What do I need most right now, and what's one way to honour it?",
    "Where am I saying yes when I really mean no?",
    "If I were advising a friend, what next step would I suggest?",
  ],
};

function coerceJson(content: string | undefined) {
  if (!content) return null;
  
  // Try to find JSON in markdown code blocks first
  const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]) as Partial<ClarityEntry>;
    } catch (e) {
      console.warn("Failed to parse JSON from code block:", e);
    }
  }
  
  // Try to find JSON object directly
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as Partial<ClarityEntry>;
  } catch (e) {
    console.warn("Failed to parse JSON:", e);
    return null;
  }
}

export async function runClarityOnServer(prompt: string): Promise<ClarityEntry> {
  const key = process.env.GEMINI_API_KEY;
  const now = new Date().toISOString();

  if (!key) {
    console.warn("GEMINI_API_KEY not found in environment variables. Using fallback response.");
    return {
      ...fallbackEntry,
      prompt,
      createdAt: now,
      id: crypto.randomUUID(),
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
You are ClarityPath, an empathetic personal growth coach.
Provide a concise JSON response with the following keys:
- summary: short explanation of the core issue
- feelings: array of 3-6 feelings the person might experience
- actionPlan: array of 4-6 ordered steps that are realistic
- reflectionPrompts: array of 3-4 short journal prompts

Keep the tone warm, practical, and specific. User input: ${prompt}
`.trim(),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.6,
      topP: 0.8,
      responseMimeType: "application/json",
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);
      throw new Error(`Gemini request failed: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    
    if (!text) {
      console.error("No text in Gemini response:", JSON.stringify(json, null, 2));
      throw new Error("No text content in Gemini response");
    }

    const parsed = coerceJson(text);
    
    if (!parsed || !parsed.summary) {
      console.warn("Failed to parse JSON from Gemini response. Raw text:", text);
      console.warn("Parsed result:", parsed);
    }

    return {
      id: crypto.randomUUID(),
      prompt,
      createdAt: now,
      summary: parsed?.summary ?? fallbackEntry.summary,
      feelings: parsed?.feelings ?? fallbackEntry.feelings,
      actionPlan: parsed?.actionPlan ?? fallbackEntry.actionPlan,
      reflectionPrompts: parsed?.reflectionPrompts ?? fallbackEntry.reflectionPrompts,
    };
  } catch (error) {
    console.error("Gemini error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      ...fallbackEntry,
      prompt,
      createdAt: now,
      id: crypto.randomUUID(),
    };
  }
}

export async function getClarityInsights(prompt: string): Promise<ClarityEntry> {
  if (typeof window !== "undefined") {
    try {
      // Use Vercel API URL if available (for Firebase hosting), otherwise use relative URL (for localhost/Next.js)
      const apiUrl = process.env.NEXT_PUBLIC_VERCEL_API_URL 
        ? `${process.env.NEXT_PUBLIC_VERCEL_API_URL}/api/diagnosis`
        : "/api/diagnosis";
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`API error (${res.status}): ${errorText}`);
      }

      return res.json();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  // Server-side fallback
  return runClarityOnServer(prompt);
}


export async function generateReport(prompt: string) {
  if (typeof window !== "undefined") {
    try {
      // Use Vercel API URL if available (for Firebase hosting), otherwise use relative URL (for localhost/Next.js)
      const apiUrl = process.env.NEXT_PUBLIC_VERCEL_API_URL 
        ? `${process.env.NEXT_PUBLIC_VERCEL_API_URL}/api/diagnosis`
        : "/api/diagnosis";
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Unable to generate report: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      return {
        ...data,
        report:
          data.summary ??
          "This is a lightweight summary you can share. Focus on one next action, and check in with yourself tomorrow to review how it felt.",
      };
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  const entry = await runClarityOnServer(prompt);
  return {
    ...entry,
    report:
      entry.summary ??
      "This is a lightweight summary you can share. Focus on one next action, and check in with yourself tomorrow to review how it felt.",
  };
}

export async function generateJournalSummary(
  journalId: string,
  journalTitle: string,
  journalContent: string
): Promise<JournalSummary> {
  if (typeof window !== "undefined") {
    try {
      // Use the same diagnosis endpoint that already works
      const apiUrl = process.env.NEXT_PUBLIC_VERCEL_API_URL 
        ? `${process.env.NEXT_PUBLIC_VERCEL_API_URL}/api/diagnosis`
        : "/api/diagnosis";
      
      const requestBody = {
        journalId: String(journalId),
        journalTitle: String(journalTitle),
        journalContent: String(journalContent),
      };
      
      console.log("🔵 CLIENT: Sending journal summary request");
      console.log("🔵 CLIENT: API URL:", apiUrl);
      console.log("🔵 CLIENT: Request body:", requestBody);
      console.log("🔵 CLIENT: journalId type:", typeof journalId, "value:", journalId);
      console.log("🔵 CLIENT: journalTitle type:", typeof journalTitle, "value:", journalTitle);
      console.log("🔵 CLIENT: journalContent type:", typeof journalContent, "length:", journalContent?.length);
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("🔵 CLIENT: Response status:", res.status);
      console.log("🔵 CLIENT: Response ok:", res.ok);

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        console.error("🔵 CLIENT: Error response:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error("🔵 CLIENT: Parsed error data:", JSON.stringify(errorData, null, 2));
          if (errorData.diagnostic) {
            console.error("🔵 CLIENT: Server diagnostic info:", JSON.stringify(errorData.diagnostic, null, 2));
          }
        } catch (e) {
          console.error("🔵 CLIENT: Could not parse error as JSON");
        }
        throw new Error(`API error (${res.status}): ${errorText}`);
      }

      const result = await res.json();
      console.log("🔵 CLIENT: Success! Received:", result);
      return result;
    } catch (error) {
      console.error("🔵 CLIENT: Fetch error:", error);
      throw error;
    }
  }

  // Server-side fallback - call the API route internally
  // This shouldn't normally happen in client-side code, but keeping for completeness
  try {
    const apiUrl = process.env.NEXT_PUBLIC_VERCEL_API_URL 
      ? `${process.env.NEXT_PUBLIC_VERCEL_API_URL}/api/diagnosis`
      : "/api/diagnosis";
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journalId,
        journalTitle,
        journalContent,
      }),
    });

    if (!res.ok) {
      throw new Error(`API error (${res.status})`);
    }

    return res.json();
  } catch (error) {
    console.error("Server-side fallback error:", error);
    // Return a fallback summary
    return {
      id: crypto.randomUUID(),
      journalId,
      journalTitle,
      createdAt: new Date().toISOString(),
      summary: "A thoughtful reflection on your experiences and feelings.",
      feelings: ["Reflective", "Thoughtful", "Present"],
    };
  }
}

