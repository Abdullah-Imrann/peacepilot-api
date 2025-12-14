// --- IN app/api/diagnosis/route.ts ---
// NEW DUMMY LINE TO FORCE REDEPLOY
console.log("🔥 DIAGNOSIS API HIT");

import { NextRequest, NextResponse } from "next/server";
import { runClarityOnServer } from "@/lib/api";

export const runtime = "nodejs";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
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

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  console.log("📨 POST request from:", origin);
  
  try {
    const body = await request.json();
    const prompt = body?.prompt as string;
    
    if (!prompt) {
      const errorResponse = NextResponse.json(
        { error: "Prompt is required" },
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
