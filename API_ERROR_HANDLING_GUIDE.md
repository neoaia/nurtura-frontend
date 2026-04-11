# API Request & Error Handling Guide

## Overview

This guide explains how to properly handle API requests and errors across the Nurtura app to prevent crashes when users navigate away from screens.

## Key Principles

1. **Automatic Request Cancellation**: In-flight requests are automatically cancelled when components unmount
2. **Safe State Updates**: State updates only occur on mounted components
3. **Distinguished Error Handling**: Cancelled requests are treated separately from real errors
4. **Consistent Patterns**: All API interactions follow the same pattern

## Architecture

### Core Components

#### 1. **useFetch Hook** (`hooks/useFetch.ts`)

- Primary hook for making HTTP requests
- Handles AbortController for cancellation
- Prevents state updates after unmount
- Returns: `{ data, error, loading, refetch }`

```typescript
// Usage
const { data, error, loading, refetch } = useFetch("/endpoint", {
  method: "GET",
  withAuth: true,
  autoFetch: true,
});
```

#### 2. **Error Types** (`types/interface.ts`)

- `NormalizedApiError`: Consistent error object

```typescript
interface NormalizedApiError {
  message: string; // Human-readable error message
  status?: number; // HTTP status code
  isCancelled: boolean; // Request was cancelled
  isNetworkError: boolean; // Network connectivity issue
  isTimeout: boolean; // Request timeout
  originalError: any; // Original error object
}
```

#### 3. **Service Layer** (`services/*.ts`)

- `handleRequest()`: Wrapper for API calls
- Handles error unwrapping
- Filters out cancelled request errors
- Throws on real errors

```typescript
async function handleRequest<T>(
  operation: string,
  requestFn: () => Promise<{
    data: T | null;
    error: NormalizedApiError | null;
  }>,
): Promise<T>;
```

#### 4. **Error Display Utility** (`utils/errorDisplay.ts`)

- `shouldShowError()`: Determine if error should display
- `getDisplayErrorMessage()`: Get UI-friendly error message
- `getErrorType()`: Classify error type

## Usage Patterns

### Pattern 1: Using useFetch with Service (RECOMMENDED)

```typescript
import { rackService } from "@/services/rackService";
import useFetch from "@/hooks/useFetch";

export default function MyScreen() {
  const { refetch: fetchRacks } = useFetch("/racks", {
    method: "GET",
    withAuth: true,
  });

  const loadRacks = useCallback(async () => {
    try {
      const data = await rackService.getAllUserRack(fetchRacks);
      setRacks(data);
    } catch (error) {
      // Service already filters out cancelled requests
      // Only real errors reach here
      showError("Failed to load racks");
    }
  }, [fetchRacks]);

  useEffect(() => {
    loadRacks();
  }, [loadRacks]);

  return <>...</>;
}
```

### Pattern 2: Direct useFetch with Error Display

```typescript
import { shouldShowError, getDisplayErrorMessage } from "@/utils/errorDisplay";

export default function MyScreen() {
  const { data, error, loading, refetch } = useFetch("/endpoint", {
    method: "GET",
    withAuth: true,
  });

  // Only show error if it's not a cancellation
  if (shouldShowError(error)) {
    return <ErrorComponent message={getDisplayErrorMessage(error)} />;
  }

  if (loading) return <LoadingSpinner />;
  if (!data) return <EmptyState />;

  return <Content data={data} />;
}
```

### Pattern 3: Manual API Call with Cancellation Support

```typescript
import { apiGet } from "@/utils/apiRequest";
import { shouldShowError } from "@/utils/errorDisplay";

async function myFunction() {
  const { data, error } = await apiGet<MyDataType>("/endpoint", true);

  if (error) {
    if (error.isCancelled) {
      // Request was cancelled, ignore silently
      return;
    }
    // Real error - handle appropriately
    console.error(error.message);
    return;
  }

  // Use data safely
  processData(data);
}
```

## Key Behaviors

### 1. Automatic Cancellation

```typescript
// Scenario: User navigates away mid-request
// Result: useEffect cleanup automatically aborts the request
useEffect(() => {
  fetchData();

  return () => {
    // Cleanup runs on unmount
    // AbortController automatically aborts
  };
}, [fetchData]);
```

### 2. Safe State Updates

```typescript
// Before (WRONG - causes errors):
const [data, setData] = useState(null);
fetchData().then((result) => {
  setData(result); // ❌ May crash if component unmounted
});

// After (CORRECT - safe):
const isMountedRef = useRef(true);
const fetchData = useCallback(async () => {
  const result = await api();
  if (isMountedRef.current) {
    setData(result); // ✅ Only updates if mounted
  }
}, []);

useEffect(() => {
  return () => {
    isMountedRef.current = false;
  };
}, []);
```

### 3. Error Filtering

```typescript
// Cancelled requests don't trigger error handlers
try {
  const result = await serviceCall();
} catch (err) {
  // err here is NEVER a cancelled request
  // handleError safely displays error
  handleError(err);
}
```

## Common Scenarios

### Scenario 1: Rapid Screen Navigation

**Before Fix:**

- User navigates to Screen A
- API request starts
- User quickly navigates to Screen B
- Request completes while Screen B is active
- State updates crash the app

**After Fix:**

- Request is automatically cancelled
- No state updates occur
- App remains stable

### Scenario 2: Slow Network Connections

**Before Fix:**

- User starts request on Screen A
- Network is slow (30+ seconds)
- User leaves screen after 5 seconds
- Request still pending
- Crashes when it eventually completes

**After Fix:**

- Request is cancelled when user leaves
- Network traffic is eliminated
- No crash occurs

### Scenario 3: Retry Logic

```typescript
async function fetchWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const { data, error } = await apiGet("/endpoint");

    if (error?.isCancelled) {
      // Request was cancelled, don't retry
      return { data: null, error };
    }

    if (!error) {
      // Success
      return { data, error: null };
    }

    // Real error, retry if attempts left
    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  return { data: null, error };
}
```

## Testing

### Test Case 1: Cancellation on Unmount

```typescript
describe("Screen unmount cancellation", () => {
  it("should cancel request when component unmounts", async () => {
    const { unmount } = render(<MyScreen />);

    // Unmount immediately
    unmount();

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should have no errors or state updates
  });
});
```

### Test Case 2: Rapid Navigation

```typescript
describe("Rapid navigation", () => {
  it("should handle rapid screen changes", async () => {
    const { rerender } = render(<ScreenA />);
    // Request starts

    rerender(<ScreenB />);
    // Request cancelled

    rerender(<ScreenC />);
    // Should not crash

    // Verify no error state in any screen
  });
});
```

## Best Practices

### ✅ DO

1. **Use useFetch for HTTP requests**

   ```typescript
   const { data, error, refetch } = useFetch("/api/endpoint");
   ```

2. **Let hook handle cleanup automatically**

   ```typescript
   // No manual abort necessary
   // useEffect cleanup handles it
   ```

3. **Check if error should be displayed**

   ```typescript
   if (shouldShowError(error)) {
     showErrorToUser(error.message);
   }
   ```

4. **Use services for business logic**

   ```typescript
   const data = await rackService.getAllUserRack(refetch);
   ```

5. **Handle cancellations gracefully**
   ```typescript
   if (error.isCancelled) {
     // Ignore, it's expected
     return;
   }
   ```

### ❌ DON'T

1. **Don't use plain fetch without AbortController**

   ```typescript
   // ❌ WRONG
   fetch("/api").then((r) => setData(r));
   ```

2. **Don't set state without checking isMounted**

   ```typescript
   // ❌ WRONG
   apiCall().then(() => setState(newValue));
   ```

3. **Don't show errors for cancelled requests**

   ```typescript
   // ❌ WRONG
   if (error) showErrorDialog(error);

   // ✅ RIGHT
   if (shouldShowError(error)) showErrorDialog(error);
   ```

4. **Don't catch cancellation as unexpected error**

   ```typescript
   // ❌ WRONG
   catch (err) => {
     console.error("Unexpected error", err);
   }

   // ✅ RIGHT
   catch (err) => {
     if (err.isCancelled) return;
     console.error("Unexpected error", err);
   }
   ```

5. **Don't manually abort unless you have a specific reason**

   ```typescript
   // ❌ WRONG - Unnecessary
   const abort = () => controller.abort();

   // ✅ RIGHT - Let cleanup handle it
   // cleanup runs automatically on unmount
   ```

## Troubleshooting

### Issue: Still seeing "Can't perform a React state update on an unmounted component"

**Solution:** Ensure all async functions use the updated useFetch hook with isMounted checks.

### Issue: Errors appearing for cancelled requests

**Solution:** Use `shouldShowError()` before displaying errors.

```typescript
if (shouldShowError(error)) {
  // Show error
}
```

### Issue: Request not being cancelled on unmount

**Solution:** Verify cleanup function is returning the unmount handler:

```typescript
useEffect(() => {
  fetchData();

  return () => {
    // This MUST run on unmount
    abortController.abort();
  };
}, []);
```

## Summary

The API request handling system ensures:

- ✅ **No crashes** from unmounted component state updates
- ✅ **No memory leaks** from pending requests
- ✅ **Clean cancellations** when users navigate away
- ✅ **Proper error handling** distinguishing real errors from cancellations
- ✅ **Consistent patterns** across the entire codebase
- ✅ **Network efficiency** by cancelling unused requests

Follow these patterns and your app will be stable even under rapid navigation and poor network conditions.
