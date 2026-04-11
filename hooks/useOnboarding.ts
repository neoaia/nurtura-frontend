import {
    OnboardingPageKey,
    useOnboardingContext,
} from "@/contexts/OnboardingContext";
import React, { useCallback, useState } from "react";

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
  const [tutorialStep, setTutorialStep] = useState<number>(shouldShow ? 1 : 0);

  const handleNextStep = useCallback(() => {
    const next = tutorialStep + 1;
    const isFinished = next > totalSteps;

    setTutorialStep(isFinished ? 0 : next);

    if (isFinished) {
      markPageComplete(pageKey);
    }
  }, [tutorialStep, totalSteps, pageKey, markPageComplete]);

  React.useEffect(() => {
    if (shouldShow && tutorialStep === 0) {
      setTutorialStep(1);
    }
    if (!shouldShow && tutorialStep > 0) {
      setTutorialStep(0);
    }
  }, [shouldShow, tutorialStep]);

  return {
    shouldShow: shouldShow && tutorialStep > 0,
    tutorialStep,
    handleNextStep,
  };
}
