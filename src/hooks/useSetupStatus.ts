"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";

export const SETUP_CACHE_KEY = "voxara_setup_complete";

export function markSetupCompleteLocal() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETUP_CACHE_KEY, "1");
}

export function clearSetupCompleteLocal() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SETUP_CACHE_KEY);
}

function readCachedSetup(): boolean | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SETUP_CACHE_KEY) === "1" ? true : null;
}

export function useSetupStatus() {
  // Always null on first render so SSR HTML matches the client hydrate pass.
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const cached = readCachedSetup();
    if (cached === true) {
      setSetupComplete(true);
    }

    void getDoc(doc(getClientDb(), "meta", "setup"))
      .then((snap) => {
        if (!active) return;
        const complete = snap.exists() && snap.data()?.complete === true;
        if (complete) {
          window.localStorage.setItem(SETUP_CACHE_KEY, "1");
        } else {
          window.localStorage.removeItem(SETUP_CACHE_KEY);
        }
        setSetupComplete(complete);
      })
      .catch(() => {
        if (!active) return;
        setSetupComplete(cached === true ? true : false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    setupComplete,
    ready: setupComplete !== null,
    needsSetup: setupComplete !== true,
  };
}
