// --- IN app/api/diagnosis/route.ts ---
console.log("🔥 DIAGNOSIS API HIT");

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { runClarityOnServer } from "@/lib/api";

export const runtime = "nodejs";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://peacepilot-ai.web.app",
  "https://peacepilot-ai.web.app/"
];

function setCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  } else {
    // For requests without origin (like same-origin) or disallowed origins
    // Don't set credentials header if using wildcard
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0] || "*");
  }
  
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  response.headers.set("Access-Control-Max-Age", "86400");
  
  return response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  console.log("🔍 OPTIONS preflight from:", origin);
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response, origin);
}

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const fallbackJournalSummary = {
  summary: "A thoughtful reflection on your experiences and feelings.",
  feelings: ["Reflective", "Thoughtful", "Present"],
};

function coerceJson(content: string | undefined) {
  if (!content) return null;
  
  const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      console.warn("Failed to parse JSON from code block:", e);
    }
  }
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn("Failed to parse JSON:", e);
    return null;
  }
}

async function runJournalSummaryOnServer(
  journalTitle: string,
  journalContent: string
): Promise<{ summary: string; feelings: string[] }> {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    console.warn("GEMINI_API_KEY not found in environment variables. Using fallback response.");
    return fallbackJournalSummary;
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
A user has written a journal entry. Provide a brief, warm summary and identify 2-4 feelings they might be experiencing.

Journal Title: ${journalTitle}
Journal Content: ${journalContent}

Provide a concise JSON response with the following keys:
- summary: a brief, empathetic summary (2-3 sentences) of what they wrote and what they might be feeling. If the user mentions problematic behaviors (like excessive phone scrolling, procrastination, unhealthy habits, or negative patterns), gently acknowledge this in the summary and suggest they reflect on it. For example: "You noticed you spent too much time on your phone today - this might be worth reflecting on and considering what you could do differently tomorrow."
- feelings: array of 2-4 feelings the person might be experiencing based on their journal entry

Keep the tone warm, understanding, and supportive. When pointing out areas for reflection, be gentle and non-judgmental.
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
      summary: parsed?.summary ?? fallbackJournalSummary.summary,
      feelings: parsed?.feelings ?? fallbackJournalSummary.feelings,
    };
  } catch (error) {
    console.error("Gemini error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return fallbackJournalSummary;
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  console.log("SERVER: POST request from origin:", origin);
  
  try {
    // Try using request.json() directly - it's the standard Next.js way
    let body;
    try {
      body = await request.json();
      console.log("SERVER: Parsed body successfully");
      console.log("SERVER: Body type:", typeof body);
      console.log("SERVER: Body keys:", body ? Object.keys(body) : "null");
      console.log("SERVER: Full request body:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("SERVER: JSON parse error:", parseError);
      // Fallback: try reading as text
      try {
        const rawBody = await request.text();
        console.log("SERVER: Fallback - Raw body:", rawBody.substring(0, 200));
        body = JSON.parse(rawBody);
        console.log("SERVER: Fallback parse successful");
      } catch (fallbackError) {
        console.error("SERVER: Fallback parse also failed:", fallbackError);
        const errorResponse = NextResponse.json(
          { error: "Invalid JSON in request body", parseError: String(parseError) },
          { status: 400 }
        );
        return setCorsHeaders(errorResponse, origin);
      }
    }
    
    // PRIORITY: Check for journal request FIRST (before checking for prompt)
    // SIMPLIFIED CHECK: If body has journalId property, it's a journal request
    const isJournalRequest = body && typeof body === "object" && "journalId" in body;
    
    console.log("SERVER: isJournalRequest check:", isJournalRequest);
    console.log("SERVER: body keys:", body ? Object.keys(body) : "no body");
    
    if (isJournalRequest && body.journalId && body.journalTitle && body.journalContent) {
      console.log("📝 DETECTED JOURNAL REQUEST");
      console.log("📝 Journal ID:", body.journalId);
      console.log("📝 Journal Title:", body.journalTitle);
      console.log("📝 Journal Content length:", body.journalContent?.length || 0);
      
      const summaryData = await runJournalSummaryOnServer(
        String(body.journalTitle),
        String(body.journalContent)
      );
      
      const result = {
        id: randomUUID(),
        journalId: String(body.journalId),
        journalTitle: String(body.journalTitle),
        createdAt: new Date().toISOString(),
        ...summaryData,
      };
      
      console.log("✅ Journal summary generated successfully");
      const successResponse = NextResponse.json(result, { status: 200 });
      return setCorsHeaders(successResponse, origin);
    }
    
    // Otherwise, treat it as a regular Express & Reflect prompt
    const prompt = body?.prompt;
    
    if (!prompt || typeof prompt !== "string") {
      console.error("❌ INVALID REQUEST - Missing required fields");
      console.error("❌ Body received:", JSON.stringify(body, null, 2));
      console.error("❌ Body type:", typeof body);
      console.error("❌ Has prompt:", !!body?.prompt);
      console.error("❌ Has journalId:", !!body?.journalId, "value:", body?.journalId);
      console.error("❌ Has journalTitle:", !!body?.journalTitle, "value:", body?.journalTitle);
      console.error("❌ Has journalContent:", !!body?.journalContent, "length:", body?.journalContent?.length);
      console.error("❌ All body keys:", body ? Object.keys(body) : "no body");
      console.error("❌ isJournalRequest:", isJournalRequest);
      
      const diagnosticInfo = {
        hasPrompt: !!body?.prompt,
        hasJournalId: !!body?.journalId,
        hasJournalTitle: !!body?.journalTitle,
        hasJournalContent: !!body?.journalContent,
        journalIdValue: body?.journalId,
        journalTitleValue: body?.journalTitle,
        journalContentLength: body?.journalContent?.length,
        keys: body ? Object.keys(body) : [],
        bodyType: typeof body,
        isJournalRequest: isJournalRequest,
      };
      
      console.error("❌ Full diagnostic:", JSON.stringify(diagnosticInfo, null, 2));
      
      const errorResponse = NextResponse.json(
        { 
          error: "Prompt is required (or provide journalId, journalTitle, and journalContent)",
          diagnostic: diagnosticInfo
        },
        { status: 400 }
      );
      return setCorsHeaders(errorResponse, origin);
    }

    console.log("🤖 Processing prompt:", prompt.substring(0, 50) + "...");
    const data = await runClarityOnServer(prompt);
    
    const successResponse = NextResponse.json(data, { status: 200 });
    return setCorsHeaders(successResponse, origin);
  } catch (error) {
    console.error("❌ Diagnosis API error:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to generate diagnosis" },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse, origin);
  }
}

