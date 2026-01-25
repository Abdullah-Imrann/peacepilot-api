import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | number | Date) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Lightweight hashing helper for passcodes. Uses SHA-256 when available,
 * otherwise falls back to a tagged plain string. Only intended for
 * client-side/local protection—not a replacement for real auth.
 */
export async function hashString(value: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return `plain:${value}`;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(buffer));
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${hex}`;
}

