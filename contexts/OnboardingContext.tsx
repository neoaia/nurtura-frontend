import useFetch from "@/hooks/useFetch";
import { userService } from "@/services/userService";
import { UserDetails } from "@/types/interface";
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
 * All onboarding page keys in completion order.
 * Add/remove keys here if you add new screens with tutorials.
 */
export const ALL_ONBOARDING_PAGES = [
  "home",
  "racks",
  "rack-info",
  "activity",
  "plant-care",
  "harvest",
  "planting",
  "rack-activity",
  "account",
] as const;

export type OnboardingPageKey = (typeof ALL_ONBOARDING_PAGES)[number];

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingState {
  /** Whether the GET /users/onboarding-state has finished loading */
  isLoading: boolean;
  /** True once the user has completed every page's tutorial */
  hasCompletedOnboarding: boolean;
  /** Pages the user has already seen */
  completedPages: OnboardingPageKey[];
  /**
   * Call this at the END of a page's tutorial (last step dismissed).
   * It will PATCH the backend and update local state.
   */
  markPageComplete: (page: OnboardingPageKey) => Promise<void>;
  /** Returns true if this specific page's tutorial should be shown */
  shouldShowTutorial: (page: OnboardingPageKey) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingState | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [completedPages, setCompletedPages] = useState<OnboardingPageKey[]>([]);

  // Prevent race conditions if markPageComplete is called rapidly
  const isPatchingRef = useRef(false);

  // ── useFetch hooks ──────────────────────────────────────────────────────────

  const { refetch: fetchOnboardingState } = useFetch(
    "/users/onboarding-state",
    { method: "GET", autoFetch: false, withAuth: true },
  );

  const { refetch: patchUser } = useFetch("/users", {
    method: "PATCH",
    autoFetch: false,
    withAuth: true,
  });

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadState = async () => {
      try {
        // fetchOnboardingState returns the raw response; adjust if your
        // useFetch wrapper shapes it differently.
        const response = await fetchOnboardingState();
        const data = response?.data ?? response; // handle both shaped & raw

        const pages: OnboardingPageKey[] = (data?.completedPages ?? []).filter(
          (p: string): p is OnboardingPageKey =>
            (ALL_ONBOARDING_PAGES as readonly string[]).includes(p),
        );

        setCompletedPages(pages);
        setHasCompletedOnboarding(data?.hasCompletedOnboarding ?? false);
      } catch (err) {
        // If the endpoint fails (e.g. network error on first launch),
        // treat as new user — tutorials will show and retry on next open.
        console.error("[Onboarding] Failed to load onboarding state:", err);
        setCompletedPages([]);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

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
      // Guard: already completed or currently patching
      if (hasCompletedOnboarding) return;
      if (completedPages.includes(page)) return;
      if (isPatchingRef.current) return;

      isPatchingRef.current = true;

      const updatedPages: OnboardingPageKey[] = [...completedPages, page];
      const allDone = ALL_ONBOARDING_PAGES.every((p) =>
        updatedPages.includes(p),
      );

      // Optimistically update local state so UI responds instantly
      setCompletedPages(updatedPages);
      if (allDone) setHasCompletedOnboarding(true);

      try {
        const body: UserDetails = {
          completedPages: updatedPages,
          ...(allDone ? { hasCompletedOnboarding: true } : {}),
        };

        await userService.updateUser(patchUser, body);
      } catch (err) {
        // Roll back optimistic update on failure
        console.error("[Onboarding] Failed to save page completion:", err);
        setCompletedPages(completedPages);
        if (allDone) setHasCompletedOnboarding(false);
      } finally {
        isPatchingRef.current = false;
      }
    },
    [hasCompletedOnboarding, completedPages, patchUser],
  );

  // ── Value ───────────────────────────────────────────────────────────────────

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
