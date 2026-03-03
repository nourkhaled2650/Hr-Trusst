# Design Spec — Login Screen
**Date**: 2026-03-02
**Designer**: UI/UX Designer Agent
**Status**: Implemented

---

## Screen Purpose
A centered login card that authenticates all user roles (Employee, Sub-Admin, Super Admin) through a single portal entry point.

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│          dot-grid background (neutral-50 + #d4d4d4)     │
│                                                         │
│              ┌─────────────────────────┐               │
│              │  [full-logo.png]        │               │
│              │  Welcome back           │               │
│              │  Sign in to your...     │               │
│              │  [email input]          │               │
│              │  [password input]       │               │
│              │  [error alert]          │               │
│              │  [Sign in button]       │               │
│              └─────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

- Layout owner: `_auth.tsx` — provides full-page background + centering
- Card owner: `LoginForm.tsx` — renders the card only

---

## Background
- `bg-neutral-50` base
- Dot grid: `radial-gradient(circle, #d4d4d4 1px, transparent 1px)` at `20px 20px`
- Applied via inline style on the `_auth.tsx` wrapper

---

## Card
- `w-full max-w-md` (448px max)
- `rounded-2xl border border-neutral-200 shadow-lg`
- `p-8` inner padding
- `bg-white`

---

## Contents (top to bottom)

### Logo
- `public/full-logo.png` — `h-10 w-auto`, centered

### Heading
- `"Welcome back"` — `text-2xl font-semibold tracking-tight text-neutral-900`
- `"Sign in to your Trusst account"` — `text-sm text-neutral-500`
- Centered

### Form Fields
| Field | Type | Placeholder | Autocomplete |
|---|---|---|---|
| Email | `email` | `you@company.com` | `email` |
| Password | `password` | `••••••••` | `current-password` |

### Error Alert
- shadcn `<Alert variant="destructive">` with `AlertCircle` icon
- Conditional — not in DOM when no error
- Three messages:
  - `invalid_credentials` → "Invalid email or password. Please try again."
  - `account_inactive` → "Your account has been deactivated. Please contact HR."
  - `network` → "Something went wrong. Please try again."
- Clears on any field change

### Button
- `"Sign in"` / loading: `<Loader2 animate-spin /> "Signing in..."`
- `w-full`, `variant="default"`, disabled while pending
- Fields also disabled while pending

---

## Redirect Logic
| Role | Destination |
|---|---|
| `employee` | `/` |
| `sub_admin` | `/admin` |
| `super_admin` | `/admin` |
- Uses `router.navigate({ to, replace: true })` — not `window.location`

---

## shadcn Components Used
`Card`, `CardContent`, `Input`, `Label`, `Button`, `Alert`, `AlertDescription`, `Form`, `FormField`, `FormItem`, `FormControl`, `FormMessage`

Icons: `Loader2`, `AlertCircle` from `lucide-react`
