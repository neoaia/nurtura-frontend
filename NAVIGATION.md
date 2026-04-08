# Navigation Architecture Guide - Nurtura Frontend

## Overview

This guide documents the refactored navigation system for Nurtura Frontend, implementing React Navigation best practices to ensure clean, predictable navigation behavior without screen stacking issues or broken back navigation.

## Key Principles

### 1. **Single Source of Truth for Routes**

All route paths are defined in `utils/navigationUtils.ts` under the `ROUTES` constant. This prevents typos and inconsistencies.

```typescript
import { ROUTES } from "@/utils/navigationUtils";

// ✅ Good - using defined routes
navService.push(ROUTES.TABS.HOME.INDEX);

// ❌ Bad - hardcoded strings
router.push("/(tabs)/(home)/index");
```

### 2. **Navigation Actions**

Use appropriate navigation methods for the intended behavior:

#### **Push** - Add screen to stack (allows back navigation)

```typescript
// Use when drilling deeper into app
navService.push(ROUTES.TABS.RACKS.DETAIL(rackId));
```

- **When**: Navigating deeper into nested screens
- **Back Behavior**: User can go back to previous screen
- **Stack**: Adds to existing stack

#### **Replace** - Replace current screen (removes from stack)

```typescript
// Use when preventing back to current screen
navService.replace(ROUTES.TABS.HOME.INDEX);
```

- **When**: Login success, preventing back to login screen
- **Back Behavior**: Cannot go back to replaced screen
- **Stack**: Replaces top screen without adding

#### **Reset** - Clear entire stack and start fresh

```typescript
// Use after completing major flows
navService.reset(ROUTES.TABS.HOME.INDEX);
```

- **When**: Completing signup, login, or multi-step flows
- **Back Behavior**: Cannot go back to any intermediate screens
- **Stack**: Clears entire stack and pushes new screen

## Navigation Flows

### Auth Flow

```
Login Screen
    ↓ (push)
Forgot Password Flow (3 steps)
    ↓ (replace on success - back to login)
OR
    → Google Sign-In
      ↓ (push - allow back within signup)
    → Signup Flow (4-5 steps)
      ↓ (reset on completion)
    → Home
```

**Implementation**:

```typescript
// Login → Forgot Password (push)
navService.push(ROUTES.AUTH.FORGOT_PASSWORD.STEP_1);

// Forgot Password success → Back to Login (replace)
navService.replace(ROUTES.AUTH.LOGIN);

// Signup complete → Home (reset entire auth stack)
navService.reset(ROUTES.TABS.HOME.INDEX);
```

### Multi-Step Add Flows (Plant/Rack)

```
Home → Modal
    ↓ (push)
Add Plant/Rack Flow (3-4 steps)
    ↓ (push between steps)
Success Screen
    ↓ (reset) - "Finish"
Home
    OR
    ↓ (reset) - "Add Another"
Step 1
```

**Implementation**:

```typescript
// Step 1 → Step 2
navService.goToAddPlantStep(2, params);

// Success → Home
navService.completeFlow();

// Success → Start New
navService.reset(ROUTES.TABS.ADD.PLANT.STEP_1);
```

### Account Settings Flows

```
Account Home
    ↓ (push)
Update Email/Password Flow (2-3 steps)
    ↓ (push between steps)
Success Screen
    ↓ (replace)
Account Home
```

**Implementation**:

```typescript
// Account → Change Password
navService.push(ROUTES.TABS.ACCOUNT.CHANGE_PASSWORD_1);

// Success → Account (replace to prevent stack buildup)
navService.replace(ROUTES.TABS.ACCOUNT.INDEX);
```

## Navigation Service API

### Core Methods

```typescript
class NavigationService {
  // Add to stack (allows back)
  push(pathname: string, params?: NavigationParams, delay?: number);

  // Replace current screen
  replace(pathname: string, params?: NavigationParams);

  // Clear stack and reset
  reset(pathname: string, params?: NavigationParams);

  // Complete flow - reset to home
  completeFlow(params?: NavigationParams);

  // Native back
  goBack();

  // Logout - clear stacks
  logout();
}
```

### Step Navigation Helpers

For flows with multiple steps, use dedicated helpers:

```typescript
// Signup steps
navService.goToSignupStep("account"); // → Step 1
navService.goToSignupStep("otp"); // → Step 2
navService.goToSignupStep("password"); // → Step 3

// Add plant steps
navService.goToAddPlantStep(1); // → Step 1
navService.goToAddPlantStep("success"); // → Success

// Email update steps
navService.goToUpdateEmailStep(3, params);
```

## Common Patterns

### ✅ Pattern: Multi-Step Flow

```typescript
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { useRouter } from "expo-router";

export default function Step1() {
  const router = useRouter();
  const navService = new NavigationService(router);

  const handleNext = () => {
    // Push to allow back navigation within flow
    navService.push(ROUTES.TABS.ADD.PLANT.STEP_2, { data });
  };

  const handleCancel = () => {
    // Go back to previous
    navService.goBack();
  };

  return (
    // ...
  );
}
```

### ✅ Pattern: Success Screen

```typescript
export default function SuccessScreen() {
  const router = useRouter();
  const navService = new NavigationService(router);

  const handleFinish = () => {
    // Reset entire flow stack and return to home
    navService.completeFlow({ message: "Success!" });
  };

  const handleAddAnother = () => {
    // Clear stack and restart flow
    navService.reset(ROUTES.TABS.ADD.PLANT.STEP_1);
  };

  return (
    // ...
  );
}
```

### ✅ Pattern: Authentication Guard

```typescript
export default function RootLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const navService = new NavigationService(router);

  useEffect(() => {
    if (!user && !inAuthGroup) {
      // Use replace to prevent back navigation to protected screens
      navService.replace(ROUTES.AUTH.LOGIN);
    }
  }, [user]);

  return (
    // ...
  );
}
```

### ✅ Pattern: Modal Navigation

```typescript
export function AddNewModal({ isVisible, onClose }) {
  const router = useRouter();
  const navService = new NavigationService(router);

  const handleAddPlant = () => {
    onClose();
    // Delay slightly to ensure modal is closed
    setTimeout(() => {
      navService.push(ROUTES.TABS.ADD.PLANT.STEP_1);
    }, 100);
  };

  return (
    // ...
  );
}
```

## Anti-Patterns (Avoid These)

### ❌ Don't: Hardcode route strings

```typescript
// Bad
router.push("/(tabs)/(home)/index" as any);
navService.push("/(tabs)/notifications");

// Good
navService.push(ROUTES.TABS.HOME.NOTIFICATIONS);
```

### ❌ Don't: Mix router and navService

```typescript
// Bad
const router = useRouter();
router.push(ROUTES.TABS.HOME.INDEX); // Inconsistent usage

// Good
const router = useRouter();
const navService = new NavigationService(router);
navService.push(ROUTES.TABS.HOME.INDEX); // Consistent
```

### ❌ Don't: Use replace for screen drilling

```typescript
// Bad - user can't go back to step 1
navService.replace(ROUTES.TABS.ADD.PLANT.STEP_2);

// Good
navService.push(ROUTES.TABS.ADD.PLANT.STEP_2);
```

### ❌ Don't: Dismiss without resetting

```typescript
// Bad - confusing intent
router.dismissAll();
router.push(ROUTES.TABS.HOME.INDEX);

// Good - clear intent
navService.reset(ROUTES.TABS.HOME.INDEX);
```

### ❌ Don't: Use dismissAll frequently

```typescript
// Bad - dangerous and unpredictable
router.dismissAll();

// Good - use reset() instead
navService.reset(pathname);
```

## Debugging Navigation Issues

### Screen Appears Twice

**Cause**: Using `push()` instead of `replace()` when transitioning between major screens
**Fix**: Check navigation logic, likely should use `replace()`

### Can't Go Back

**Cause**: Using `replace()` or forgotten screen in stack
**Fix**: Use `push()` for drill-down navigation; check stack operations

### Navigation Not Working

**Cause**: String typo in route path
**Fix**: Use `ROUTES` constants instead of hardcoded strings

### Stuck in Auth Flow

**Cause**: Not using `replace()` when leaving auth
**Fix**: Use `replace()` when successful login/signup completion

## Testing Navigation

```typescript
// Test case: Signup flow
1. Start at login
2. Click "Sign Up" → pushes to signup/step-1
3. Fill form → push to signup/step-2
4. Verify back works at each step
5. Complete signup → reset to home
6. Verify can't go back to signup

// Test case: Add plant
1. Open modal
2. Click "Add Plant" → push to add-plant/step-1
3. Complete flow → reset to home
4. Click "Add Another" → reset (not push) to step-1
```

## Migration Guide

If you're updating existing screens to use `NavigationService`:

1. Import at top:

   ```typescript
   import { NavigationService, ROUTES } from "@/utils/navigationUtils";
   ```

2. Create service instance:

   ```typescript
   const router = useRouter();
   const navService = new NavigationService(router);
   ```

3. Replace router calls:

   ```typescript
   // Old
   router.push("/(tabs)/(home)");

   // New
   navService.push(ROUTES.TABS.HOME.INDEX);
   ```

4. Update route paths:

   ```typescript
   // Old
   router.push("/(auth)/forgetpassword/forgotPassword1");

   // New
   navService.push(ROUTES.AUTH.FORGOT_PASSWORD.STEP_1);
   ```

## Summary Checklist

- ✅ Use `ROUTES` constants instead of hardcoded strings
- ✅ Use `push()` for drilling deeper
- ✅ Use `replace()` for transitioning between major screens
- ✅ Use `reset()` after completing flows
- ✅ Use `NavigationService` for consistent navigation
- ✅ Prevent back navigation where appropriate
- ✅ Test all navigation flows
- ✅ Document custom navigation patterns in your component

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Maintained By**: Navigation Team
