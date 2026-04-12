# Nurtura Frontend Walkthrough

This file is the map for the app. If you want to understand how a screen works, trace it in this order:

1. The route file in `app/`
2. The service or hook that loads data
3. The shared UI used by the screen
4. The DTO or interface in `types/`
5. The root context or utility when the behavior crosses screens

The project is an Expo Router app, so the route tree is the product. Most app behavior is split into small route files, shared hooks, service wrappers, and reusable components.

## Quick Lookup

| If you want to change...                     | Start here                                                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| App bootstrap, auth gating, global providers | `app/_layout.tsx`, `contexts/AuthContext.tsx`, `contexts/NetworkContext.tsx`, `contexts/OnboardingContext.tsx` |
| Tab bar, add button, route grouping          | `app/(tabs)/_layout.tsx`, `utils/navigationUtils.ts`                                                           |
| Login, signup, forgot password               | `app/(auth)/login.tsx`, `app/(auth)/signup/*`, `app/(auth)/forgotPassword/*`                                   |
| Home dashboard and notifications             | `app/(tabs)/(home)/index.tsx`, `app/(tabs)/(home)/notifications.tsx`                                           |
| Rack list, rack detail, live sensor state    | `app/(tabs)/(racks)/index.tsx`, `app/(tabs)/(racks)/[rackId]/index.tsx`                                        |
| Add plant wizard                             | `app/(tabs)/(add_pages)/(addNewPlant)/*`, `utils/addPlantDraft.ts`, `services/plantService.ts`                 |
| Add rack wizard and BLE pairing              | `app/(tabs)/(add_pages)/(addNewRack)/*`, `utils/bluetooth/*`, `services/rackService.ts`                        |
| Activity pages and charts                    | `app/(tabs)/(activity)/*`, `components/activity/plantChart.tsx`, `utils/activityChart.ts`                      |
| Account profile and security                 | `app/(tabs)/(account)/*`, `services/userService.ts`, `services/authService.ts`                                 |
| HTTP request handling and cancellation       | `hooks/useFetch.ts`, `utils/apiRequest.ts`, `utils/request.ts`, `utils/requestRegistry.ts`                     |
| Network offline handling and toast           | `contexts/NetworkContext.tsx`, `components/shared/networkToast.tsx`, `utils/networkState.ts`                   |
| Push notifications and notification routing  | `utils/notification.ts`, `hooks/useNotificationHandler.ts`, `app/(tabs)/(home)/notifications.tsx`              |

## How The App Boots

The startup path is controlled by the root layout and the tab/auth child layouts.

### Root startup

- `package.json` points Expo Router at `expo-router/entry`.
- `app/_layout.tsx` loads the custom fonts, then wraps the app in `NetworkProvider` and `AuthProvider`.
- `RootLayoutNav` waits for auth and onboarding state before rendering the route stack.
- The root layout also renders the global `NetworkToast` and the push notification bridge.

If the app is stuck on a blank or white screen, the first places to check are:

- font loading in `app/_layout.tsx`
- auth loading in `contexts/AuthContext.tsx`
- onboarding loading in `contexts/OnboardingContext.tsx`
- the `isReady` guard in `RootLayoutNav`

### Navigation shells

- `app/(auth)/_layout.tsx` holds the auth stack.
- `app/(tabs)/_layout.tsx` creates the bottom tab bar and the add button modal.
- `app/(tabs)/(activity)/_layout.tsx`, `app/(tabs)/(racks)/_layout.tsx`, `app/(tabs)/(account)/_layout.tsx`, and `app/(tabs)/(add_pages)/_layout.tsx` define the nested stacks for each section.

The layouts are not just visual wrappers. They also control back behavior, header styles, and whether the tab bar should hide on deeper screens.

### Route intent

Use `push` when the user should be able to go deeper.
Use `replace` when the current screen should not stay in the back stack.
Use `reset` or `dismissAll` when the flow should be cleared completely, such as logout or a multi-step flow that is finished.

The central route map lives in `utils/navigationUtils.ts`. If you need to change a path, start there first.

## Folder Guide

### `app/`

All screens live here. This is the route tree.

- `app/_layout.tsx` handles global bootstrap
- `app/(auth)/` contains login, signup, and forgot password
- `app/(tabs)/(home)/` contains the dashboard and notifications
- `app/(tabs)/(racks)/` contains rack list and rack detail flows
- `app/(tabs)/(add_pages)/` contains the add plant and add rack wizards
- `app/(tabs)/(activity)/` contains activity feeds and charts
- `app/(tabs)/(account)/` contains profile and security settings

### `components/`

Reusable UI lives here. The folder is split by feature area:

- `components/shared/` for common inputs, buttons, the date picker, the toast, and small helpers
- `components/modals/` for confirmation, info, add-new, harvest, and consent modals
- `components/onboarding/` for the tutorial overlay and skip control
- `components/home/` for dashboard cards and activity bars
- `components/racks/` for rack cards, indicators, and rack-specific UI
- `components/activity/` for activity list items and the chart component
- `components/auth/` for auth inputs and the Google sign-in button
- `components/settings/` for profile and settings UI
- `components/notifications/` for notification list items
- `components/add_plant/` for add-plant specific controls

### `contexts/`

Global state and cross-screen behavior:

- `contexts/AuthContext.tsx` manages Firebase auth, Google sign-in, sign out, and user metadata
- `contexts/NetworkContext.tsx` tracks Wi-Fi state, aborts tracked requests, and controls the network toast
- `contexts/OnboardingContext.tsx` tracks per-user tutorial progress and syncs it to SecureStore and the backend

### `hooks/`

Reusable behavior lives here:

- `hooks/useFetch.ts` is the standard HTTP hook
- `hooks/useSocket.ts` manages the app socket connection
- `hooks/useRackSensor.ts` subscribes to a single rack's realtime sensor data
- `hooks/useOnboarding.ts` wires one screen's tutorial state to the onboarding context
- `hooks/useNotificationHandler.ts` handles push notification routing and permissions
- `hooks/useAsyncState.ts` provides loading/data state for async UI
- `hooks/shared/useBackWarning.tsx` guards destructive back navigation in step flows

### `services/`

Business logic wrappers sit here. Screens should not call axios directly if a service already exists.

- `services/authService.ts`
- `services/userService.ts`
- `services/plantService.ts`
- `services/rackService.ts`
- `services/activityService.ts`
- `services/notificationService.ts`

### `utils/`

Low-level helpers and app-wide plumbing:

- `utils/navigationUtils.ts` for route constants and navigation helpers
- `utils/apiRequest.ts` for safe axios calls with auth, timeout, cancellation, and Wi-Fi gating
- `utils/request.ts` for service-level request normalization and error handling
- `utils/requestRegistry.ts` for tracking and aborting active requests
- `utils/networkState.ts` for the shared network snapshot
- `utils/validation.ts` for email, password, and input cleaning
- `utils/logger.ts` for consistent debug logging
- `utils/addPlantDraft.ts` for draft persistence in the add-plant flow
- `utils/notification.ts` for push registration
- `utils/websocket/socket.ts` for the singleton socket manager
- `utils/bluetooth/*` for BLE scanning, permissions, and device control

### `types/`

This folder is the contract layer. If the backend payload changes, this is often the first place to update.

- `types/interface.ts` contains shared fetch options, fetch results, user details, and normalized error shape
- `types/activity.dto.ts` contains activity DTOs, chart points, and rack activity DTOs
- `types/socket.interface.ts` contains socket event contracts and realtime payloads
- `types/plant.dto.ts`, `types/rack.dto.ts`, `types/notification.dto.ts`, and `types/user.dto.ts` define feature-specific API payloads

### Root config and support files

- `firebase.ts` initializes Firebase
- `lib/firebaseAuth.ts` retrieves the current Firebase ID token
- `app.json`, `eas.json`, `metro.config.js`, `babel.config.js`, `tailwind.config.js`, `eslint.config.js`, and `tsconfig.json` control build, lint, and styling behavior
- `__tests__/`, `tests/unit/`, and `tests/integration/` hold test coverage

## Core Data Flow

### HTTP flow

The standard HTTP path is:

`Screen -> useFetch() -> utils/apiRequest.ts -> axios -> services/* -> UI`

What happens in the middle:

- `useFetch` adds auth tokens when requested
- `useFetch` and `apiRequest` both enforce a 15 second timeout from `utils/constants.ts`
- requests are blocked when `NetworkContext` says Wi-Fi is unavailable
- all active requests are tracked and can be aborted together when the network drops
- service wrappers call `handleRequest()` from `utils/request.ts` so errors are normalized and cancellations stay silent

### Realtime flow

The realtime path is:

`Screen -> useSocket() or useRackSensor() -> utils/websocket/socket.ts -> Socket.IO server -> UI`

What matters here:

- `socketService` is a singleton, not something you create per screen
- listeners must be cleaned up with the exact same callback reference
- rack screens subscribe to rack IDs and update local state from `sensorData`, `initialData`, `deviceStatus`, and `alert`
- notification screens subscribe to `userNotification`

### Authentication flow

The auth path is:

`Login / Signup screen -> AuthContext -> Firebase auth -> token -> app routing`

Important points:

- Firebase auth state is the source of truth for the signed-in user
- the context stores the Firebase token so protected requests can use it
- Google sign-in has a separate path and uses SecureStore flags to control the signup or onboarding branches
- logout clears auth state and routes the user back to login

### Onboarding and tutorials

Each tutorial page uses the same pattern:

`useOnboarding(pageKey, stepCount) -> OnboardingTutorialModal -> markPageComplete()`

The per-user tutorial completion state is stored in `contexts/OnboardingContext.tsx` and persisted through SecureStore and the backend.

### Persistence flow

Persisted state is split by use case:

- SecureStore for sensitive or session-linked data
- helper utilities for draft state
- backend sync for profile and onboarding completion

If a flow behaves like it already finished, check the matching SecureStore key before anything else.

## Feature Guide

### Authentication

Start here:

- `app/(auth)/login.tsx`
- `app/(auth)/signup/createAccount.tsx`
- `app/(auth)/signup/*`
- `app/(auth)/forgotPassword/*`

Supporting files:

- `contexts/AuthContext.tsx`
- `services/authService.ts`
- `utils/validation.ts`
- `lib/firebaseAuth.ts`
- `firebase.ts`
- `components/auth/*`
- `components/modals/infoModal.tsx`

What it does:

- handles email/password login
- handles Google sign-in and the Google-only branch
- checks onboarding state before routing to home
- manages OTP, consent, and password reset flows

Debug first:

- auth provider flags in SecureStore
- `AuthContext` state
- the route being pushed or replaced
- validation helpers if the button is disabled unexpectedly

### Home Dashboard

Start here:

- `app/(tabs)/(home)/index.tsx`

Supporting files:

- `components/home/summaryCard.tsx`
- `components/home/highlight.tsx`
- `components/home/recentActivityBar.tsx`
- `components/home/skeleton/*`
- `hooks/useSocket.ts`
- `services/plantService.ts`
- `services/rackService.ts`
- `services/notificationService.ts`
- `utils/websocket/socket.ts`

What it does:

- shows the main dashboard summary
- loads user info and counts
- listens for realtime notifications
- renders onboarding tutorial content for the home page

Debug first:

- the user token in `AuthContext`
- the socket connection status
- the last fetch response for summary data
- the onboarding step state if the tutorial is blocking the UI

### Racks

Start here:

- `app/(tabs)/(racks)/index.tsx`
- `app/(tabs)/(racks)/[rackId]/index.tsx`
- `app/(tabs)/(racks)/[rackId]/care.tsx`
- `app/(tabs)/(racks)/[rackId]/connection.tsx`
- `app/(tabs)/(racks)/[rackId]/edit.tsx`
- `app/(tabs)/(racks)/[rackId]/harvest-history.tsx`
- `app/(tabs)/(racks)/previously-owned.tsx`

Supporting files:

- `hooks/useRackSensor.ts`
- `services/rackService.ts`
- `services/plantService.ts`
- `utils/websocket/socket.ts`
- `components/racks/*`
- `components/modals/harvestModal.tsx`
- `components/shared/bottomButton.tsx`

What it does:

- fetches active racks for the signed-in user
- subscribes to each rack's realtime sensor updates
- shows the live rack cards and alert state
- opens rack detail pages for editing, care, harvest history, and connection management

Debug first:

- rack fetch response from `rackService.getAllUserRack()`
- socket subscriptions and listener cleanup
- stable callback references for sensor listeners
- route params for rack detail pages

### Add Plant Wizard

Start here:

- `app/(tabs)/(add_pages)/(addNewPlant)/step-1.tsx`
- `app/(tabs)/(add_pages)/(addNewPlant)/step-2.tsx`
- `app/(tabs)/(add_pages)/(addNewPlant)/step-3.tsx`
- `app/(tabs)/(add_pages)/(addNewPlant)/successScreen.tsx`

Supporting files:

- `utils/addPlantDraft.ts`
- `services/plantService.ts`
- `services/rackService.ts`
- `components/shared/dropdown.tsx`
- `components/shared/quantityPicker.tsx`
- `components/shared/smallDescription.tsx`
- `components/modals/confirmationModal.tsx`
- `components/modals/infoModal.tsx`
- `hooks/shared/useBackWarning.tsx`

What it does:

- step 1 chooses the target rack
- step 2 chooses the plant
- step 3 checks the rack conditions, confirms the seed amount, and submits the assignment
- draft state is persisted per rack so the user does not lose progress between steps

Debug first:

- the rack ID in the route params
- `add_plant_draft_<rackId>` in SecureStore
- the condition check endpoint and payload
- the final assign request
- the back warning handler if the flow keeps resetting unexpectedly

### Add Rack Wizard

Start here:

- `app/(tabs)/(add_pages)/(addNewRack)/step-1.tsx`
- `app/(tabs)/(add_pages)/(addNewRack)/step-2.tsx`
- `app/(tabs)/(add_pages)/(addNewRack)/step-3.tsx`
- `app/(tabs)/(add_pages)/(addNewRack)/step-4.tsx`
- `app/(tabs)/(add_pages)/(addNewRack)/successScreen.tsx`

Supporting files:

- `utils/bluetooth/bleManager.ts`
- `utils/bluetooth/permissions.ts`
- `utils/bluetooth/scan.ts`
- `services/rackService.ts`
- `components/shared/textInputField.tsx`
- `components/modals/confirmationModal.tsx`
- `hooks/shared/useBackWarning.tsx`

What it does:

- scans for BLE devices
- requests Bluetooth and location permissions
- connects to the rack device
- writes the rack name to the device
- registers the rack on the backend

Debug first:

- BLE permissions on the device
- Bluetooth state and connection logs
- the device ID passed between steps
- the registration payload in `rackService.registerRack()`

### Activity

Start here:

- `app/(tabs)/(activity)/index.tsx`
- `app/(tabs)/(activity)/plant-care.tsx`
- `app/(tabs)/(activity)/harvest.tsx`
- `app/(tabs)/(activity)/planting.tsx`
- `app/(tabs)/(activity)/rack.tsx`

Supporting files:

- `components/activity/activityItem.tsx`
- `components/activity/harvestItem.tsx`
- `components/activity/plantingItem.tsx`
- `components/activity/rackActivityItem.tsx`
- `components/activity/sensorToggle.tsx`
- `components/activity/plantChart.tsx`
- `components/shared/datetimepicker.tsx`
- `utils/activityChart.ts`
- `services/activityService.ts`
- `services/plantService.ts`
- `services/rackService.ts`

What it does:

- shows filtered histories for plant care, harvesting, planting, and rack events
- lets the user narrow results by date range and rack
- groups items by day for readable sections
- uses the shared chart component for the top chart area

Debug first:

- the date range picker values
- the rack filter value
- the query params sent to the activity endpoints
- the grouping helper if the section headings look wrong
- `components/activity/plantChart.tsx` if the chart axis or tooltip looks off

### Account

Start here:

- `app/(tabs)/(account)/index.tsx`
- `app/(tabs)/(account)/user-info.tsx`
- `app/(tabs)/(account)/security.tsx`
- `app/(tabs)/(account)/change-password-1.tsx`
- `app/(tabs)/(account)/change-password-2.tsx`
- `app/(tabs)/(account)/update-email-1.tsx`
- `app/(tabs)/(account)/update-email-2.tsx`
- `app/(tabs)/(account)/successScreen.tsx`

Supporting files:

- `services/userService.ts`
- `services/authService.ts`
- `components/shared/menubtn.tsx`
- `components/modals/confirmationModal.tsx`
- `components/modals/infoModal.tsx`

What it does:

- shows the profile summary and settings entry points
- loads and edits user profile information
- exposes password and email update flows for password-auth users
- shows logout confirmation and handles sign out

Debug first:

- the saved auth provider in SecureStore
- the profile fetch response
- the form state vs saved state in the user info screen
- the logout flow if the app returns to the wrong route

### Notifications

Start here:

- `app/(tabs)/(home)/notifications.tsx`

Supporting files:

- `services/notificationService.ts`
- `hooks/useNotificationHandler.ts`
- `utils/notification.ts`
- `utils/websocket/socket.ts`
- `components/notifications/notificationItem.tsx`

What it does:

- loads the notification list
- subscribes to live notification events
- marks notifications read when the user exits the screen
- lets push notifications navigate to a route when tapped

Debug first:

- the push token registration path in `utils/notification.ts`
- the socket subscription to `userNotification`
- the route embedded in the notification payload
- the mark-all-read request on screen exit

### Charts

Start here:

- `components/activity/plantChart.tsx`
- `utils/activityChart.ts`
- `components/shared/datetimepicker.tsx`
- `types/activity.dto.ts`

What it does:

- renders the reusable chart UI
- formats axis labels from real timestamps
- keeps the x-axis labels and the selected date range in sync
- uses chart data points that are shaped as `{ timestamp, value }`

Debug first:

- the input array passed to `PlantChart`
- the timestamp values in the chart points
- the selected date range from the picker
- the aggregation helper when the chart looks flat or empty

### Global Network And Offline Handling

Start here:

- `contexts/NetworkContext.tsx`
- `components/shared/networkToast.tsx`
- `utils/networkState.ts`
- `utils/requestRegistry.ts`
- `utils/apiRequest.ts`
- `hooks/useFetch.ts`

What it does:

- listens to NetInfo for connectivity state
- stores a shared network snapshot
- aborts tracked requests when Wi-Fi drops
- blocks new requests when Wi-Fi is unavailable
- shows a global toast for offline and recovery states

Debug first:

- the current network snapshot
- whether the request was aborted or genuinely failed
- whether a screen is using `useFetch` or direct network calls
- whether a request is waiting on auth or a timeout

## Shared Patterns

### Screen lifecycle

Most screens follow this shape:

- `useEffect` for initial hydration or one-time work
- `useFocusEffect` when the screen should refresh every time it becomes active
- `useMemo` for derived values like chart series or filtered arrays
- `useCallback` for handlers passed to child components, modals, or sockets
- `useRef` for mounted flags, stable listeners, and one-time guard values

If a screen feels stale, check whether it should refetch on focus instead of only on mount.

### Forms and inputs

The app prefers shared inputs and validators instead of ad hoc text fields.

Common helpers:

- `components/shared/textInputField.tsx`
- `components/auth/emailInput.tsx`
- `components/auth/passwordInput.tsx`
- `components/shared/dropdown.tsx`
- `components/shared/quantityPicker.tsx`
- `utils/validation.ts`

If a button never enables, the first thing to inspect is usually the validation helper or the cleaned input value.

### Modals

Modal behavior is standardized.

- `components/modals/confirmationModal.tsx` for two-button decisions
- `components/modals/infoModal.tsx` for one-button informational messages
- `components/modals/addNewModal.tsx` for the add flow launcher
- `components/modals/harvestModal.tsx` for harvest-specific choices
- `components/auth/modal/consentModal.tsx` for signup consent

### Navigation

The app tries to keep navigation intent explicit.

- `push` means drill deeper
- `replace` means the current screen should not remain in history
- `reset` or `dismissAll` means the whole flow should be cleared

The most important navigation file is `utils/navigationUtils.ts` because it holds the route constants and the helper methods.

### Realtime state

For socket-driven features, use stable listener references and clean up on unmount.

Common files:

- `utils/websocket/socket.ts`
- `hooks/useSocket.ts`
- `hooks/useRackSensor.ts`
- `types/socket.interface.ts`

If a socket event fires twice, the likely cause is duplicate listener registration.

### Onboarding and tutorials

Tutorials are page-scoped, but the completion state is global per user.

Files to know:

- `contexts/OnboardingContext.tsx`
- `hooks/useOnboarding.ts`
- `components/onboarding/tutorialModal.tsx`

If a tutorial never appears, check the completion key and the page key first.

### Persistence

The app uses SecureStore for state that should survive screen changes or app restarts.

Useful keys to know:

- `signup_email`
- `verified_email`
- `signup_password`
- `signup_confirm_password`
- `fromGoogle`
- `firebaseToken`
- `auth_provider`
- `user_email`
- `forgotPasswordInProgress`
- `onboarding_progress_<userId>`
- `onboarding_completed_<userId>`
- `add_plant_draft_<rackId>`
- `rack_info_tutorial_completed_<rackId>`

If a flow seems to skip steps, clear the matching key and retry.

## Debugging Playbook

### 1. Small UI bug

Start at the leaf component.

- inspect the props being passed
- check the local state values
- confirm the shared component still matches the expected prop shape
- if the bug is in a modal or button, inspect `components/shared/*` or `components/modals/*`

### 2. Screen does not open

Start with routing.

- confirm the route exists in `utils/navigationUtils.ts`
- confirm the file exists under `app/`
- confirm the correct layout is mounting the stack
- check whether a `replace` call is sending the user somewhere else

### 3. Data is wrong or missing

Start in the service layer.

- check the screen's `useFetch` call
- check the matching service wrapper in `services/*`
- inspect the DTO in `types/*`
- inspect the backend params being sent from the screen

### 4. Request fails only sometimes

Start in the request plumbing.

- inspect `hooks/useFetch.ts`
- inspect `utils/apiRequest.ts`
- inspect `utils/request.ts`
- inspect `utils/requestRegistry.ts`
- confirm the auth token and Wi-Fi state

### 5. Realtime data is stale

Start in the socket plumbing.

- confirm the socket is connected with the current token
- confirm the screen registers listeners only once
- confirm the listener cleanup uses the same callback reference
- confirm the server is emitting the expected event name from `types/socket.interface.ts`

### 6. Draft state or onboarding state looks wrong

Start with persistence.

- check SecureStore keys first
- check `contexts/OnboardingContext.tsx`
- check `utils/addPlantDraft.ts`
- check whether the screen is writing or clearing the key on the wrong step

### 7. Back navigation is broken in a wizard

Start with navigation intent.

- check whether the flow should be using `push` or `replace`
- check `hooks/shared/useBackWarning.tsx`
- check `utils/navigationUtils.ts`
- check whether a cleanup function is deleting the draft or connection too early

### 8. BLE rack setup fails

Start with permissions and device state.

- check `utils/bluetooth/permissions.ts`
- check `utils/bluetooth/bleManager.ts`
- confirm Bluetooth is on and the device is discoverable
- confirm the device ID and service UUID being passed between steps

### 9. Activity charts look empty or flat

Start with the date range and the plotted data.

- check `components/shared/datetimepicker.tsx`
- check the data returned by the activity endpoint
- check `utils/activityChart.ts` if the data is being aggregated
- check `components/activity/plantChart.tsx` for axis and label formatting

## Useful Commands

These are the commands that matter most when validating a change:

- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run lint`
- `npm test`
- `npm run test:unit`
- `npm run test:integration`
- `npx tsc --noEmit`

## Practical Rules For This Codebase

If you are changing behavior, keep these rules in mind:

- keep route strings centralized in `utils/navigationUtils.ts`
- keep API calls behind `useFetch` and the service wrappers when possible
- keep socket listeners stable and clean them up on unmount
- use the shared modal and input components instead of creating one-off versions
- use `useFocusEffect` when the screen should refresh on return
- use SecureStore for the small pieces of state that need to survive a flow
- keep DTO changes in `types/` before spreading them through screens

## Short Version

If you only remember five files, remember these:

- `app/_layout.tsx` - bootstraps the whole app
- `utils/navigationUtils.ts` - the route map and navigation helper
- `hooks/useFetch.ts` - the standard HTTP path
- `contexts/AuthContext.tsx` - the signed-in user and token
- `utils/websocket/socket.ts` - the realtime socket singleton

Everything else in the app usually hangs off one of those five.
