import useFetch from "@/hooks/useFetch";
import { userService } from "@/services/userService";
import { UserDetails } from "@/types/interface";
import * as SecureStore from "expo-secure-store";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Remove "rack-info" since no screen uses it.
 * This must match exactly the pages that call useOnboarding().
 */
export const ALL_ONBOARDING_PAGES = [
  "home",
  "racks",
  "activity",
  "plant-care",
  "harvest",
  "planting",
  "rack-activity",
  "account",
] as const;

export type OnboardingPageKey = (typeof ALL_ONBOARDING_PAGES)[number];

// SecureStore key prefix — scoped per user
const storageKey = (userId: string) => `onboarding_progress_${userId}`;
const COMPLETED_KEY = (userId: string) => `onboarding_completed_${userId}`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingState {
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  completedPages: OnboardingPageKey[];
  markPageComplete: (page: OnboardingPageKey) => Promise<void>;
  shouldShowTutorial: (page: OnboardingPageKey) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OnboardingProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string | null;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [completedPages, setCompletedPages] = useState<OnboardingPageKey[]>([]);

  const isPatchingRef = useRef(false);
  const hasSyncedToBackend = useRef(false);

  const { refetch: patchUser } = useFetch("/users", {
    method: "PATCH",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: getUser } = useFetch("/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  // ── Load from SecureStore / backend on mount ────────────────────────────────

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadLocal = async () => {
      try {
        // 1. Check if already fully completed locally
        const completedFlag = await SecureStore.getItemAsync(
          COMPLETED_KEY(userId),
        );
        if (completedFlag === "true") {
          setHasCompletedOnboarding(true);
          setCompletedPages([...ALL_ONBOARDING_PAGES]);
          return;
        }

        // 2. Load partial progress locally
        const stored = await SecureStore.getItemAsync(storageKey(userId));
        let valid: OnboardingPageKey[] = [];
        if (stored) {
          const parsed: OnboardingPageKey[] = JSON.parse(stored);
          valid = parsed.filter((p): p is OnboardingPageKey =>
            (ALL_ONBOARDING_PAGES as readonly string[]).includes(p),
          );
          setCompletedPages(valid);
        }

        // 3. Try backend sync whenever local completion is not full
        const response = await userService.getUser(getUser);
        const backendPages = response?.userInfo?.completedPages ?? [];
        const backendCompleted = response?.userInfo?.hasCompletedOnboarding;

        if (
          backendCompleted ||
          backendPages.length === ALL_ONBOARDING_PAGES.length
        ) {
          setHasCompletedOnboarding(true);
          setCompletedPages([...ALL_ONBOARDING_PAGES]);
          await SecureStore.setItemAsync(COMPLETED_KEY(userId), "true");
          await SecureStore.deleteItemAsync(storageKey(userId));
          return;
        }

        const backendValidPages = backendPages.filter(
          (p): p is OnboardingPageKey =>
            (ALL_ONBOARDING_PAGES as readonly string[]).includes(p),
        );

        const mergedPages = Array.from(
          new Set([...valid, ...backendValidPages]),
        ) as OnboardingPageKey[];

        if (mergedPages.length > 0) {
          setCompletedPages(mergedPages);
          await SecureStore.setItemAsync(
            storageKey(userId),
            JSON.stringify(mergedPages),
          );
        }
      } catch (err) {
        console.error("[Onboarding] Failed to load local progress:", err);
        setCompletedPages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocal();
  }, [userId, getUser]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const shouldShowTutorial = useCallback(
    (page: OnboardingPageKey): boolean => {
      if (isLoading) return false;
      if (hasCompletedOnboarding) return false;
      return !completedPages.includes(page);
    },
    [isLoading, hasCompletedOnboarding, completedPages],
  );

  const markPageComplete = useCallback(
    async (page: OnboardingPageKey) => {
      if (!userId) return;
      if (hasCompletedOnboarding) return;
      if (completedPages.includes(page)) return;
      if (isPatchingRef.current) return;

      isPatchingRef.current = true;

      const updatedPages: OnboardingPageKey[] = [...completedPages, page];
      const allDone = ALL_ONBOARDING_PAGES.every((p) =>
        updatedPages.includes(p),
      );

      // 1. Optimistically update UI
      setCompletedPages(updatedPages);

      try {
        if (allDone && !hasSyncedToBackend.current) {
          // 2a. All pages done — sync to backend ONCE
          hasSyncedToBackend.current = true;
          setHasCompletedOnboarding(true);

          const body: UserDetails = {
            completedPages: updatedPages,
            hasCompletedOnboarding: true,
          };
          await userService.updateUser(patchUser, body);

          // 3. Persist completion flag locally
          await SecureStore.setItemAsync(COMPLETED_KEY(userId), "true");
          await SecureStore.deleteItemAsync(storageKey(userId)); // cleanup partial
        } else {
          // 2b. Still in progress — only save locally, no backend call
          await SecureStore.setItemAsync(
            storageKey(userId),
            JSON.stringify(updatedPages),
          );
        }
      } catch (err) {
        console.error("[Onboarding] Failed to save progress:", err);

        // Roll back optimistic update on backend failure only
        if (allDone) {
          hasSyncedToBackend.current = false;
          setHasCompletedOnboarding(false);
          setCompletedPages(completedPages);
        }
        // For local storage failure mid-flow, keep optimistic state
        // (will retry next session from whatever was last saved)
      } finally {
        isPatchingRef.current = false;
      }
    },
    [userId, hasCompletedOnboarding, completedPages, patchUser],
  );

  const value: OnboardingState = {
    isLoading,
    hasCompletedOnboarding,
    completedPages,
    markPageComplete,
    shouldShowTutorial,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error(
      "useOnboardingContext must be used inside <OnboardingProvider>",
    );
  }
  return ctx;
}
