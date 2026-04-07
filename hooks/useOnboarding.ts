import {
    OnboardingPageKey,
    useOnboardingContext,
} from "@/contexts/OnboardingContext";
import { useCallback, useState } from "react";

interface UseOnboardingReturn {
  /** Whether this page's tutorial should render at all */
  shouldShow: boolean;
  /** Current tutorial step (1-based). 0 means tutorial is dismissed. */
  tutorialStep: number;
  /** Call on every "Next / Close" press inside the tutorial */
  handleNextStep: () => void;
}

/**
 * Per-screen hook that wires tutorial visibility to the global
 * OnboardingContext.
 *
 * @param pageKey   - The unique key for this screen (must be in ALL_ONBOARDING_PAGES)
 * @param totalSteps - Total number of steps in this page's tutorial
 *
 * @example
 * const { shouldShow, tutorialStep, handleNextStep } = useOnboarding("home", 5);
 */
export function useOnboarding(
  pageKey: OnboardingPageKey,
  totalSteps: number,
): UseOnboardingReturn {
  const { shouldShowTutorial, markPageComplete } = useOnboardingContext();

  const shouldShow = shouldShowTutorial(pageKey);

  // Start at step 1 only if the tutorial should be shown, otherwise 0
  const [tutorialStep, setTutorialStep] = useState<number>(shouldShow ? 1 : 0);

  const handleNextStep = useCallback(() => {
    setTutorialStep((prev) => {
      const next = prev + 1;

      if (next > totalSteps) {
        // Tutorial finished — mark complete in background, dismiss UI
        markPageComplete(pageKey);
        return 0;
      }

      return next;
    });
  }, [totalSteps, pageKey, markPageComplete]);

  return {
    shouldShow: shouldShow && tutorialStep > 0,
    tutorialStep,
    handleNextStep,
  };
}
