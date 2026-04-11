# Navigation Architecture Diagram

## App Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Root Layout (Stack)                             │
│                    Navigation Guard & Auth Check                         │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      │                               │
                      ▼                               ▼
          ┌─────────────────────┐        ┌─────────────────────┐
          │   Auth Stack (*)    │        │   Tabs (Bottom Nav) │
          │                     │        │                     │
          │ - login             │        │ (5 Tabs)            │
          │ - signup (nested)   │        │ - Home              │
          │ - forgotPassword    │        │ - Racks             │
          │   (nested - 3 steps)│        │ - Add               │
          └─────────────────────┘        │ - Activity          │
                                         │ - Account           │
                                         └─────────────────────┘
                                                    │
                      ┌─┬──────────────┬──────┬─────┼─────┬──────┐
                      │ │              │      │     │     │      │
                      ▼ ▼              ▼      ▼     ▼     ▼      ▼
                   ┌──────────┐  ┌──────┐ ┌───┐ ┌─────┐ ┌───────┐
                   │  Home    │  │Racks │ │Add│ │Actv │ │Account│
                   │ Stack    │  │Stack │ │Stk│ │Stack│ │ Stack │
                   └──────────┘  └──────┘ └───┘ └─────┘ └───────┘
                        │             │        │       │         │
         ┌──────────┐   │   ┌─────────┴──┐     ▼       │    ┌────┤
         │notifications  │   │            │   Plant    │    │    │
         └──────────┘    │   │ [rackId]   │   Add      │    │    │
                         ▼   ▼            │   Stack    │    ▼    ▼
                      ┌──────────────┐    │            │ ┌──────────┐
                      │Detail Routes │    │            │ │Settings  │
                      │- edit        │    │            │ │Stacks    │
                      │- care        │    │            │ │- user-..│
                      │- harvest     │    │            │ │- security│
                      │- success     │    │            │ │- pwd chg │
                      └──────────────┘    │            │ │- email.. │
                                          │            │ └──────────┘
                                          ▼            ▼
                                      ┌────────────────────────┐
                                      │   Add Stacks           │
                                      │ (Plant/Rack)           │
                                      │ - step-1, 2, 3, [4]    │
                                      │ - success              │
                                      └────────────────────────┘

(*) Auth stack is replaced when user authenticates
```

## Navigation Flow Diagrams

### Authentication Flow

```
┌──────────────┐
│ Login Screen │
└──────┬───────┘
       │
       │ Valid credentials
       │ router.replace()
       ▼
  ┌─────────────────────────┐
  │ Home (Authenticated)    │
  │ (Can't go back to login)│
  └─────────────────────────┘


    │           ▲ Forgot Password?
    │           │ router.push()
    │           │
    │      ┌────────────────┐
    │      │ Forgot Pwd Fl. │ ✓ Complete
    │      │ 1 → 2 → 3      │─────────────┐
    │      └────────────────┘             │
    │      Can navigate back within flow  │
    │                                     │
    └─────────────────────────────────────┘
                                      │
                              router.replace()
                                      │
                                      ▼
                              ┌──────────────┐
                              │ Login Screen │
                              └──────────────┘


    │           ▲ Create Account
    │           │ router.push()
    │           │
    │      ┌────────────────────────┐
    │      │ Signup Flow            │ ✓ Complete
    │      │ 1 → 2 → 3 → 4 → Consent│─────────────┐
    │      └────────────────────────┘             │
    │      Can navigate back within flow          │
    │                                             │
    └─────────────────────────────────────────────┘
                                              │
                                      router.reset()
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ Home (Auth)      │
                                    │ (Fresh stack -   │
                                    │ Can't go back)   │
                                    └──────────────────┘
```

### Multi-Step Flow (Add Plant/Rack)

```
┌─────────────┐
│ Home / Modal│
└──────┬──────┘
       │
       │ Click "Add Plant"
       │ router.push()
       ▼
┌─────────────────────┐
│ Plant Step 1        │  ◀─────────┐
│ Fill plant info     │  Can go back│
└──────┬──────────────┘
       │
       │ Next
       │ router.push()
       ▼
┌─────────────────────┐
│ Plant Step 2        │  ◀─────────┐
│ Select rack         │  Can go back│
└──────┬──────────────┘
       │
       │ Next
       │ router.push()
       ▼
┌─────────────────────┐
│ Plant Step 3        │  ◀─────────┐
│ Confirm & Submit    │  Can go back│
└──────┬──────────────┘
       │
       │ Submit
       │ router.push()
       ▼
┌─────────────────────┐
│ Success Screen      │
│ ┌─────────────────┐ │
│ │ Finish    │     │ │  ◀─── router.reset() → Home
│ │ Add Another     │ │  ◀─── router.reset() → Step 1
│ └─────────────────┘ │ │
└─────────────────────┘
      (No back button)
```

### Account Settings Flow

```
┌─────────────────┐
│ Account Screen  │
└────────┬────────┘
         │
         ├─ Edit Email ──┐
         │               │ router.push()
         │               ▼
         │        ┌───────────────────┐
         │        │ Verify Current    │ Update Email 1
         │        │ Email             │
         │        └────────┬──────────┘
         │                 │
         │                 │ Next
         │                 │
         │                 ▼
         │        ┌───────────────────┐
         │        │ Enter New Email   │ Update Email 2
         │        └────────┬──────────┘
         │                 │
         │                 │ Next
         │                 │
         │                 ▼
         │        ┌───────────────────┐
         │        │ Verify OTP        │ Update Email 3
         │        └────────┬──────────┘
         │                 │
         │                 │ Verify
         │                 │
         │                 ▼
         │        ┌───────────────────┐
         │        │ Success Screen    │ router.replace()
         │        └────────┬──────────┘
         │                 │
         │                 ▼
         └─────────────────────────────┐
                                       │
                            ┌──────────┴──────┐
                            │ Account Screen  │
                            │ (Fresh Return)  │
                            └─────────────────┘

         └─ Change Password
                    │ (Similar 2-3 step flow)
                    │
                    ▼
            (Same success pattern)
```

## Navigation Service Decision Tree

```
                    ┌─────────────────────────┐
                    │   Need to Navigate?      │
                    └──────────┬──────────────┘
                               │
                   ┌───────────┴───────────┐
                   │                       │
            Going Deeper?            Transitioning?
                   │                       │
                   ▼                       ▼
         ┌─────────────────┐      ┌──────────────────┐
         │ Multi-step flow?│      │ After flow done? │
         └────┬────────┬───┘      └────┬─────────┬───┘
              │        │               │         │
            YES      NO              YES        NO
              │        │               │         │
         ┌────▼──┐   │         ┌──────▼──┐   │
         │ RESET?│   │         │ COMPLETE│   │
         └────┬──┘   │         │ FLOW() or│   │
              │      │         │ RESET() │   │
      YES/NO  │      │         └────┬────┘   │
         ┌────┴──┐   │              │        │
         ▼       ▼   ▼              ▼        ▼
      ┌──────────────────────────────────────────┐
      │         USE APPROPRIATE METHOD            │
      ├──────────────────────────────────────────┤
      │ • PUSH()    - Allow back (drill deeper)  │
      │ • REPLACE() - Prevent back (transition) │
      │ • RESET()   - Clean slate (complete)    │
      │ • GO_BACK() - Return to previous        │
      └──────────────────────────────────────────┘
```

## Stack States at Each Navigation Point

### Success - Multi Step Flow

```
Initial: [Home]
    ↓ (push("Add Plant"))
Step 1: [Home, Add Plant Step 1]
    ↓ (push("Step 2"))
Step 2: [Home, Add Plant Step 1, Add Plant Step 2]
    ↓ (push("Step 3"))
Step 3: [Home, Add Plant Step 1, Add Plant Step 2, Add Plant Step 3]
    ↓ (push("Success"))
Success: [Home, Add Plant Step 1, Add Plant Step 2, Add Plant Step 3, Success]
    ↓ (completeFlow() → dismissAll + replace)
Home: [Home]  ✓ Back button doesn't go to add flow


Alternative from Success:
    ↓ (reset("Step 1") → cleanAll + replace)
Step 1: [Add Plant Step 1]  ✓ Fresh start, can't go back to previous flow
```

### Bad Pattern (Before Refactoring)

```
Multi-step with dismissAll:
Initial: [Home]
    ↓ (push("Add Plant Step 1"))
Step 1: [Home, Add Plant Step 1]
    ↓ (dismissAll + replace)
Step 2: [Add Plant Step 2]  ❌ Confusing - where is Home?


Multi-step with no cleanup:
Initial: [Home]
    ↓ (push("Step 1"))
    ↓ (push("Step 2"))
    ↓ (push("Step 3"))
    ↓ (push("Success"))
Success: [Home, Step 1, Step 2, Step 3, Success]  ❌ Back goes through all steps
    ↓ (replace home)
Final: [Step 1, Step 2, Step 3, Home]  ❌ Stack corrupted
```

## Route Organization

```
ROUTES
├── AUTH
│   ├── ROOT: "/(auth)"
│   ├── LOGIN: "/(auth)/login"
│   ├── SIGNUP
│   │   ├── ROOT
│   │   ├── CREATE_ACCOUNT
│   │   ├── EMAIL_OTP
│   │   ├── CREATE_PASSWORD
│   │   ├── CREATE_USER_INFO
│   │   └── CONSENT
│   └── FORGOT_PASSWORD
│       ├── ROOT
│       ├── STEP_1
│       ├── STEP_2
│       └── STEP_3
└── TABS
    ├── ROOT: "/(tabs)"
    ├── HOME
    │   ├── ROOT
    │   ├── INDEX
    │   └── NOTIFICATIONS
    ├── RACKS
    │   ├── ROOT
    │   ├── INDEX
    │   ├── DETAIL(rackId) → Function
    │   ├── EDIT(rackId) → Function
    │   ├── PREVIOUSLY_OWNED
    │   └── SUCCESS(rackId) → Function
    ├── ADD
    │   ├── PLANT
    │   │   ├── STEP_1, STEP_2, STEP_3
    │   │   └── SUCCESS
    │   └── RACK
    │       ├── STEP_1, STEP_2, STEP_3, STEP_4
    │       └── SUCCESS
    ├── ACTIVITY
    │   ├── ROOT, INDEX
    │   ├── PLANT_CARE, HARVEST, PLANTING, RACK
    │   └── etc.
    └── ACCOUNT
        ├── ROOT, INDEX
        ├── USER_INFO, SECURITY
        ├── CHANGE_PASSWORD_1, CHANGE_PASSWORD_2
        ├── UPDATE_EMAIL_1, UPDATE_EMAIL_2, UPDATE_EMAIL_3
        └── SUCCESS
```

---

**Diagram Version**: 1.0  
**Updated**: April 8, 2026  
**Format**: ASCII Diagrams
