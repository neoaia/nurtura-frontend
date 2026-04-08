# Navigation Quick Reference

## Import

```typescript
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { useRouter } from "expo-router";
```

## Setup

```typescript
const router = useRouter();
const navService = new NavigationService(router);
```

## Common Operations

### Navigate Deeper (Allow Back)

```typescript
navService.push(ROUTES.TABS.RACKS.DETAIL(rackId));
navService.push(ROUTES.AUTH.SIGNUP.CREATE_ACCOUNT);
navService.goToAddPlantStep(2);
```

### Replace Screen (Prevent Back)

```typescript
navService.replace(ROUTES.TABS.HOME.INDEX);
navService.replace(ROUTES.AUTH.LOGIN);
```

### Complete Flow (Reset Stack)

```typescript
navService.completeFlow(); // → Home
navService.reset(ROUTES.TABS.ADD.RACK.STEP_1); // → Restart
```

### Special Flows

```typescript
// Logout
navService.logout();

// Go back
navService.goBack();

// Signup step
navService.goToSignupStep("account"); // Step 1
navService.goToSignupStep("otp"); // Step 2

// Add plant
navService.goToAddPlantStep(1);
navService.goToAddPlantStep("success");

// Password reset
navService.goToForgotPasswordStep(2);
```

## Routes Quick Access

### Auth

- `ROUTES.AUTH.LOGIN`
- `ROUTES.AUTH.SIGNUP.CREATE_ACCOUNT`
- `ROUTES.AUTH.FORGOT_PASSWORD.STEP_1`

### Tabs

- `ROUTES.TABS.HOME.INDEX`
- `ROUTES.TABS.RACKS.DETAIL(rackId)`
- `ROUTES.TABS.ADD.PLANT.STEP_1`
- `ROUTES.TABS.ACCOUNT.INDEX`

## Pattern Reference

### Multi-Step Flow

```typescript
// Step 1 → Step 2
navService.push(ROUTES.TABS.ADD.PLANT.STEP_2, { data });

// Step 2 → Success
navService.push(ROUTES.TABS.ADD.PLANT.SUCCESS, { message });

// Success → Home
navService.completeFlow();
```

### Modal Flow

```typescript
const handleAddPlant = () => {
  onClose();
  setTimeout(() => {
    navService.push(ROUTES.TABS.ADD.PLANT.STEP_1);
  }, 100);
};
```

### Auth Guard

```typescript
useEffect(() => {
  if (!user && !inAuthGroup) {
    navService.replace(ROUTES.AUTH.LOGIN);
  }
}, [user]);
```

## When to Use What

| Scenario                     | Method      | Reason                    |
| ---------------------------- | ----------- | ------------------------- |
| Drill deeper into screens    | `push()`    | User expects back to work |
| Logout, prevent back to auth | `replace()` | Protects flow             |
| Signup complete              | `reset()`   | Clear all auth screens    |
| Add another in flow          | `reset()`   | Restart flow cleanly      |
| Update email/password        | `replace()` | Prevent stack buildup     |

## ❌ Never Do This

```typescript
❌ router.push("/(tabs)/(home)" as any)           // Use ROUTES instead
❌ router.dismissAll(); router.push(...)          // Use reset() instead
❌ navigation.navigate("signup" as never)         // Use navService instead
❌ router.push(hardcodedString)                   // Define in ROUTES
❌ Use replace() for multi-step drilling          // Use push() instead
```

---

**For Full Details**: See [NAVIGATION.md](./NAVIGATION.md)
