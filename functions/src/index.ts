import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { randomUUID } from "crypto";

admin.initializeApp();

// Import the logic from your Next.js API route
type ClarityEntry = {
  id: string;
  prompt: string;
  summary: string;
  feelings: string[];
  actionPlan: string[];
  reflectionPrompts: string[];
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

async function runClarityOnServer(prompt: string): Promise<ClarityEntry> {
  // Access Firebase Functions config (set via firebase functions:config:set)
  const key = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;
  const now = new Date().toISOString();

  if (!key) {
    console.warn("GEMINI_API_KEY not found in Firebase config or environment variables. Using fallback response.");
    return {
      ...fallbackEntry,
      prompt,
      createdAt: now,
      id: randomUUID(),
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
      id: randomUUID(),
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
      id: randomUUID(),
    };
  }
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://peacepilot-ai.web.app",
];

function setCorsHeaders(response: functions.Response, origin: string | null) {
  if (origin && allowedOrigins.includes(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
  } else if (allowedOrigins.length > 0) {
    response.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }
  
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  response.set("Access-Control-Max-Age", "86400");
}

export const diagnosis = functions.https.onRequest(async (req, res) => {
  const origin = req.get("origin") || null;
  
  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    setCorsHeaders(res, origin);
    res.status(200).send("");
    return;
  }

  // Handle POST request
  if (req.method !== "POST") {
    setCorsHeaders(res, origin);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const prompt = req.body?.prompt as string;
    
    if (!prompt) {
      setCorsHeaders(res, origin);
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const data = await runClarityOnServer(prompt);
    setCorsHeaders(res, origin);
    res.status(200).json(data);
  } catch (error) {
    console.error("Diagnosis API error", error);
    setCorsHeaders(res, origin);
    res.status(500).json({ error: "Failed to generate diagnosis" });
  }
});

