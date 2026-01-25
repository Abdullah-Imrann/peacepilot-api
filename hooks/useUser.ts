"use client";

import { useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { hashString, readFromStorage, saveToStorage } from "@/lib/utils";

type LocalGuardState = {
  passcodeHash: string | null;
  locked: boolean;
  updatedAt: number;
};

const defaultState: LocalGuardState = {
  passcodeHash: null,
  locked: false,
  updatedAt: Date.now(),
};

let store: LocalGuardState | null = null;
type Listener = (state: LocalGuardState) => void;
const listeners = new Set<Listener>();

function getStore(): LocalGuardState {
  if (store) return store;
  const initial = readFromStorage<LocalGuardState>(STORAGE_KEYS.localPasscode, defaultState);
  store = initial;
  return store;
}

function setStore(next: LocalGuardState) {
  store = next;
  saveToStorage(STORAGE_KEYS.localPasscode, next);
  listeners.forEach((listener) => listener(next));
}

/**
 * Local-only protection hook backed by a tiny shared store.
 * All consumers share the same in-memory state, persisted to localStorage.
 * This keeps the API small so future cloud auth can replace this easily.
 */
export function useUser() {
  const [state, setState] = useState<LocalGuardState>(() => getStore());

  useEffect(() => {
    const listener: Listener = (next) => setState(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const hasPasscode = useMemo(() => Boolean(state.passcodeHash), [state.passcodeHash]);
  const locked = state.locked && hasPasscode;

  const persist = (next: LocalGuardState) => {
    setStore(next);
  };

  const setPasscode = async (passcode: string) => {
    if (!passcode || passcode.length < 4) {
      throw new Error("Passcode must be at least 4 characters.");
    }
    const passcodeHash = await hashString(passcode);
    persist({ passcodeHash, locked: false, updatedAt: Date.now() });
  };

  const unlock = async (passcode: string) => {
    if (!hasPasscode) {
      throw new Error("No passcode has been set yet.");
    }
    const attempt = await hashString(passcode);
    if (attempt !== state.passcodeHash) {
      throw new Error("Incorrect passcode. Please try again.");
    }
    persist({ ...state, locked: false, updatedAt: Date.now() });
  };

  const lock = () => {
    if (!hasPasscode) return;
    persist({ ...state, locked: true, updatedAt: Date.now() });
  };

  const clearPasscode = () => {
    persist({ ...defaultState, updatedAt: Date.now() });
  };

  return {
    hasPasscode,
    locked,
    setPasscode,
    unlock,
    lock,
    clearPasscode,
  };
}

