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
  skipOnboarding: () => Promise<void>;
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
    let isCancelled = false;

    if (!userId) {
      setIsLoading(false);
      setHasCompletedOnboarding(false);
      setCompletedPages([]);
      return;
    }

    const loadLocal = async () => {
      try {
        // 1. Check if already fully completed locally
        const completedFlag = await SecureStore.getItemAsync(
          COMPLETED_KEY(userId),
        );
        if (isCancelled) return;

        if (completedFlag === "true") {
          setHasCompletedOnboarding(true);
          setCompletedPages([...ALL_ONBOARDING_PAGES]);
          return;
        }

        // 2. Load partial progress locally
        const stored = await SecureStore.getItemAsync(storageKey(userId));
        if (isCancelled) return;

        let valid: OnboardingPageKey[] = [];
        if (stored) {
          const parsed: OnboardingPageKey[] = JSON.parse(stored);
          valid = parsed.filter((p): p is OnboardingPageKey =>
            (ALL_ONBOARDING_PAGES as readonly string[]).includes(p),
          );
          setCompletedPages(valid);
        }

        if (isCancelled) return;

        // 3. Try backend sync whenever local completion is not full
        let response;
        try {
          response = await userService.getUser(getUser);
        } catch (err) {
          if (isCancelled) return;

          const shouldIgnoreBackendError =
            err instanceof Error &&
            err.message?.toLowerCase().includes("user not found");

          if (shouldIgnoreBackendError) {
            console.warn(
              "[Onboarding] Backend user not found yet, continuing with local progress",
            );
            return;
          }

          throw err;
        }

        if (isCancelled) return;

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
        if (isCancelled) return;
        console.error("[Onboarding] Failed to load onboarding progress:", err);
        // Keep any local progress already loaded so onboarding can continue.
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadLocal();

    return () => {
      isCancelled = true;
    };
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
          // 2a. All pages done — persist locally first so completion survives logout
          setHasCompletedOnboarding(true);
          await SecureStore.setItemAsync(COMPLETED_KEY(userId), "true");
          await SecureStore.deleteItemAsync(storageKey(userId)); // cleanup partial

          const body: UserDetails = {
            completedPages: updatedPages,
            hasCompletedOnboarding: true,
          };

          try {
            hasSyncedToBackend.current = true;
            await userService.updateUser(patchUser, body);
          } catch (backendError) {
            hasSyncedToBackend.current = false;
            console.warn(
              "[Onboarding] Failed to sync completed onboarding to backend, keeping local completion:",
              backendError,
            );
          }
        } else {
          // 2b. Still in progress — only save locally, no backend call
          await SecureStore.setItemAsync(
            storageKey(userId),
            JSON.stringify(updatedPages),
          );
        }
      } catch (err) {
        console.error("[Onboarding] Failed to save progress:", err);

        // If local store failed, preserve optimistic UI state and retry later
      } finally {
        isPatchingRef.current = false;
      }
    },
    [userId, hasCompletedOnboarding, completedPages, patchUser],
  );

  const skipOnboarding = useCallback(async () => {
    if (!userId) return;
    if (hasCompletedOnboarding) return;
    if (isPatchingRef.current) return;

    isPatchingRef.current = true;

    const updatedPages: OnboardingPageKey[] = [...ALL_ONBOARDING_PAGES];

    setCompletedPages(updatedPages);
    setHasCompletedOnboarding(true);

    try {
      await SecureStore.setItemAsync(COMPLETED_KEY(userId), "true");
      await SecureStore.deleteItemAsync(storageKey(userId));

      const body: UserDetails = {
        completedPages: updatedPages,
        hasCompletedOnboarding: true,
      };

      try {
        hasSyncedToBackend.current = true;
        await userService.updateUser(patchUser, body);
      } catch (backendError) {
        hasSyncedToBackend.current = false;
        console.warn(
          "[Onboarding] Failed to sync skipped onboarding to backend, keeping local completion:",
          backendError,
        );
      }
    } catch (err) {
      console.error("[Onboarding] Failed to skip onboarding:", err);
    } finally {
      isPatchingRef.current = false;
    }
  }, [userId, hasCompletedOnboarding, patchUser]);

  const value: OnboardingState = {
    isLoading,
    hasCompletedOnboarding,
    completedPages,
    markPageComplete,
    shouldShowTutorial,
    skipOnboarding,
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
