import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "../context/AuthContext";
import { usePrivacyConsent } from "../context/PrivacyConsentContext";
import { MOVING_CHECKLIST_STORAGE_KEY, parseMovingChecklistProgress } from "../lib/movingChecklist";
import { loadMovingChecklistProgress, saveMovingChecklistProgress } from "../lib/movingChecklistSupabase";
import { createChecklistProgressStore } from "../lib/checklistProgressStore";
import { readPreferenceStorage, writePreferenceStorage } from "../lib/privacyConsent";
import { supabase } from "../lib/supabaseClient";

const stores = new Map<string, ReturnType<typeof createChecklistProgressStore>>();

export function useMovingChecklistProgress() {
  const { currentUser } = useAuth();
  const { isPreferencesAllowed } = usePrivacyConsent();
  const userId = currentUser?.id;
  const store = useMemo(() => {
    // Never import the old shared key or guest progress into an account.
    const key = userId ? `account:${userId}` : `guest:${isPreferencesAllowed}`;
    const existing = stores.get(key);
    if (existing) return existing;
    const guestKey = `${MOVING_CHECKLIST_STORAGE_KEY}:guest`;
    const created = createChecklistProgressStore(
      async () => userId ? loadMovingChecklistProgress(supabase, userId)
        : typeof window === "undefined" ? [] : parseMovingChecklistProgress(readPreferenceStorage(window.localStorage, guestKey, isPreferencesAllowed)),
      async (next) => {
        if (userId) await saveMovingChecklistProgress(supabase, userId, next);
        else if (typeof window !== "undefined") writePreferenceStorage(window.localStorage, guestKey, JSON.stringify(next), isPreferencesAllowed);
      },
    );
    stores.set(key, created);
    return created;
  }, [userId, isPreferencesAllowed]);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => { void store.initialize(); }, [store]);
  useEffect(() => {
    for (const key of stores.keys()) {
      if (key.startsWith("account:") && key !== `account:${userId}`) stores.delete(key);
      if (key.startsWith("guest:") && key !== `guest:${isPreferencesAllowed}`) stores.delete(key);
    }
  }, [userId, isPreferencesAllowed]);
  return { ...snapshot, isLoading: snapshot.isLoading || snapshot.error === "load", toggle: store.toggle, reset: store.reset, retry: store.retry };
}
