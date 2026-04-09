/**
 * Navigation Utilities for Nurtura Frontend
 *
 * This file provides centralized navigation helpers to ensure:
 * - Consistent routing patterns throughout the app
 * - Proper stack management and cleanup
 * - Prevention of duplicate screens and broken back navigation
 * - Clear separation between push (add to stack) and replace (replace current screen) operations
 */

import { Router } from "expo-router";

export interface NavigationParams {
  [key: string]: any;
}

/**
 * Navigation action types to clarify intent
 */
export enum NavigationAction {
  /** Add new screen to stack (allows back navigation) */
  PUSH = "push",
  /** Replace current screen (prevents going back to it) */
  REPLACE = "replace",
  /** Replace entire navigation stack (app routing) */
  RESET = "reset",
}

/**
 * Core navigation paths - single source of truth
 */
export const ROUTES = {
  // Auth routes
  AUTH: {
    ROOT: "/(auth)",
    LOGIN: "/(auth)/login",
    SIGNUP: {
      ROOT: "/(auth)/signup",
      CREATE_ACCOUNT: "/(auth)/signup/createAccount",
      EMAIL_OTP: "/(auth)/signup/emailOTP",
      CREATE_PASSWORD: "/(auth)/signup/createPassword",
      CREATE_USER_INFO: "/(auth)/signup/createUserInfo",
      CONSENT: "/(auth)/signup/consent",
    },
    FORGOT_PASSWORD: {
      ROOT: "/(auth)/forgotPassword",
      STEP_1: "/(auth)/forgotPassword/forgotPassword1",
      STEP_2: "/(auth)/forgotPassword/forgotPassword2",
      STEP_3: "/(auth)/forgotPassword/forgotPassword3",
    },
  },

  // Main app routes
  TABS: {
    ROOT: "/(tabs)",
    HOME: {
      ROOT: "/(tabs)/(home)",
      INDEX: "/(tabs)/(home)/index",
      NOTIFICATIONS: "/(tabs)/notifications",
    },
    RACKS: {
      ROOT: "/(tabs)/(racks)",
      INDEX: "/(tabs)/(racks)/index",
      DETAIL: (rackId: string) => `/(tabs)/(racks)/${rackId}`,
      EDIT: (rackId: string) => `/(tabs)/(racks)/${rackId}/edit`,
      EDIT_NAME: (rackId: string) => `/(tabs)/(racks)/${rackId}/edit-rack-name`,
      CARE: (rackId: string) => `/(tabs)/(racks)/${rackId}/plant-care-activity`,
      HARVEST_HISTORY: (rackId: string) =>
        `/(tabs)/(racks)/${rackId}/harvest-history`,
      PREVIOUSLY_OWNED: "/(tabs)/(racks)/previously-owned",
      SUCCESS: (rackId: string) => `/(tabs)/(racks)/${rackId}/success-screen`,
    },
    ADD: {
      ROOT: "/(tabs)/(add_pages)",
      PLANT: {
        STEP_1: "/(tabs)/(add_pages)/(addNewPlant)/step-1",
        STEP_2: "/(tabs)/(add_pages)/(addNewPlant)/step-2",
        STEP_3: "/(tabs)/(add_pages)/(addNewPlant)/step-3",
        SUCCESS: "/(tabs)/(add_pages)/(addNewPlant)/successScreen",
      },
      RACK: {
        STEP_1: "/(tabs)/(add_pages)/(addNewRack)/step-1",
        STEP_2: "/(tabs)/(add_pages)/(addNewRack)/step-2",
        STEP_3: "/(tabs)/(add_pages)/(addNewRack)/step-3",
        STEP_4: "/(tabs)/(add_pages)/(addNewRack)/step-4",
        SUCCESS: "/(tabs)/(add_pages)/(addNewRack)/successScreen",
      },
    },
    ACTIVITY: {
      ROOT: "/(tabs)/(activity)",
      INDEX: "/(tabs)/(activity)/index",
      PLANT_CARE: "/(tabs)/(activity)/plant-care",
      HARVEST: "/(tabs)/(activity)/harvest",
      PLANTING: "/(tabs)/(activity)/planting",
      RACK: "/(tabs)/(activity)/rack",
    },
    ACCOUNT: {
      ROOT: "/(tabs)/(account)",
      INDEX: "/(tabs)/(account)/index",
      USER_INFO: "/(tabs)/(account)/user-info",
      SECURITY: "/(tabs)/(account)/security",
      CHANGE_PASSWORD_1: "/(tabs)/(account)/change-password-1",
      CHANGE_PASSWORD_2: "/(tabs)/(account)/change-password-2",
      UPDATE_EMAIL_1: "/(tabs)/(account)/update-email-1",
      UPDATE_EMAIL_2: "/(tabs)/(account)/update-email-2",
      UPDATE_EMAIL_3: "/(tabs)/(account)/update-email-3",
      SUCCESS: "/(tabs)/(account)/successScreen",
    },
  },
} as const;

/**
 * Navigation service class
 * Provides methods for consistent navigation with proper state management
 */
export class NavigationService {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  /**
   * Navigate to a route - add to stack (allows back navigation)
   * Use this for drilling deeper into the app
   */
  push(pathname: string, params?: NavigationParams, delay: number = 0) {
    const execute = () => {
      this.router.push({
        pathname: pathname as any,
        params,
      });
    };

    if (delay > 0) {
      setTimeout(execute, delay);
    } else {
      execute();
    }
  }

  /**
   * Replace current screen (removes from stack)
   * Use this to prevent back navigation to this screen
   * Common use case: redirecting authenticated users away from login
   */
  replace(pathname: string, params?: NavigationParams) {
    this.router.replace({
      pathname: pathname as any,
      params,
    });
  }

  /**
   * Reset entire navigation stack to a fresh state
   * Use this after completion of major flows (signup, login, etc.)
   * Prevents users from navigating back to intermediate screens
   */
  reset(pathname: string, params?: NavigationParams) {
    // First dismiss all pending screens
    this.router.dismissAll();

    // Then navigate to the target with replace to prevent back
    setTimeout(() => {
      this.router.replace({
        pathname: pathname as any,
        params,
      });
    }, 50);
  }

  /**
   * Complete a multi-step flow and return to home
   * Cleans up entire stack of flow screens
   */
  completeFlow(params?: NavigationParams) {
    this.reset(ROUTES.TABS.HOME.ROOT, params);
  }

  /**
   * Go back to previous screen
   * Use rarely - typically the system handles back natively
   */
  goBack() {
    this.router.back();
  }

  /**
   * Dismiss all stacked screens (dangerous - use carefully)
   * Only use when you need to clear entire stack
   */
  dismissAll() {
    this.router.dismissAll();
  }

  /**
   * Logout flow - clear all stacks and return to login
   */
  logout() {
    this.router.dismissAll();
    setTimeout(() => {
      this.router.replace(ROUTES.AUTH.LOGIN);
    }, 50);
  }

  /**
   * Navigate through a signup flow step
   */
  goToSignupStep(
    step: "account" | "otp" | "password" | "userInfo" | "consent",
  ) {
    const stepRoutes = {
      account: ROUTES.AUTH.SIGNUP.CREATE_ACCOUNT,
      otp: ROUTES.AUTH.SIGNUP.EMAIL_OTP,
      password: ROUTES.AUTH.SIGNUP.CREATE_PASSWORD,
      userInfo: ROUTES.AUTH.SIGNUP.CREATE_USER_INFO,
      consent: ROUTES.AUTH.SIGNUP.CONSENT,
    };
    this.push(stepRoutes[step]);
  }

  /**
   * Navigate through a password reset flow step
   */
  goToForgotPasswordStep(step: 1 | 2 | 3, params?: NavigationParams) {
    const stepRoutes = {
      1: ROUTES.AUTH.FORGOT_PASSWORD.STEP_1,
      2: ROUTES.AUTH.FORGOT_PASSWORD.STEP_2,
      3: ROUTES.AUTH.FORGOT_PASSWORD.STEP_3,
    };
    this.push(stepRoutes[step], params);
  }

  /**
   * Navigate through add plant flow
   */
  goToAddPlantStep(step: 1 | 2 | 3 | "success", params?: NavigationParams) {
    const stepRoutes = {
      1: ROUTES.TABS.ADD.PLANT.STEP_1,
      2: ROUTES.TABS.ADD.PLANT.STEP_2,
      3: ROUTES.TABS.ADD.PLANT.STEP_3,
      success: ROUTES.TABS.ADD.PLANT.SUCCESS,
    };
    this.push(stepRoutes[step], params);
  }

  /**
   * Navigate through add rack flow
   */
  goToAddRackStep(step: 1 | 2 | 3 | 4 | "success", params?: NavigationParams) {
    const stepRoutes = {
      1: ROUTES.TABS.ADD.RACK.STEP_1,
      2: ROUTES.TABS.ADD.RACK.STEP_2,
      3: ROUTES.TABS.ADD.RACK.STEP_3,
      4: ROUTES.TABS.ADD.RACK.STEP_4,
      success: ROUTES.TABS.ADD.RACK.SUCCESS,
    };
    this.push(stepRoutes[step], params);
  }

  /**
   * Navigate through email update flow
   */
  goToUpdateEmailStep(step: 1 | 2 | 3 | "success", params?: NavigationParams) {
    const stepRoutes = {
      1: ROUTES.TABS.ACCOUNT.UPDATE_EMAIL_1,
      2: ROUTES.TABS.ACCOUNT.UPDATE_EMAIL_2,
      3: ROUTES.TABS.ACCOUNT.UPDATE_EMAIL_3,
      success: ROUTES.TABS.ACCOUNT.SUCCESS,
    };
    this.push(stepRoutes[step], params);
  }

  /**
   * View rack details
   */
  viewRackDetails(rackId: string) {
    this.push(ROUTES.TABS.RACKS.DETAIL(rackId), { rackId });
  }
}
