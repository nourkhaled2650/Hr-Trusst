# Layout Shells Design Spec

**Date**: 2026-03-04
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation

---

## Overview

Two persistent layout shells wrap every authenticated screen. Neither shell contains any feature content — they are pure navigation chrome. Features are rendered inside them via TanStack Router outlet.

- `_admin.tsx` layout: sidebar + top navbar — used by Sub-Admin and Super Admin
- `_employee.tsx` layout: top navbar only — used by Employee

Design language: Modern, low-friction, daily-use. Closer to Linear/Notion than Workday. Neutral palette with a single brand accent. All components from shadcn/ui; icons from lucide-react.

---

## Shared Design Tokens

| Token | Value |
|---|---|
| Brand accent | `violet-600` |
| Brand accent hover | `violet-700` |
| Sidebar background | `neutral-950` |
| Sidebar text default | `neutral-400` |
| Sidebar text active | `white` |
| Sidebar active bg | `neutral-800` |
| Sidebar hover bg | `neutral-800/60` |
| Top navbar background | `white` |
| Top navbar border | `border-b border-neutral-200` |
| Top navbar height | `h-14` (56px) |
| Sidebar width expanded | `w-60` (240px) |
| Sidebar width collapsed | `w-14` (56px) |
| Content area background | `bg-neutral-50` |
| Border radius on active pill | `rounded-md` |

---

## Admin Layout

### Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  SIDEBAR (fixed, full height)  │  TOP NAVBAR (fixed, full width) │
│  w-60 expanded / w-14 collapsed│  h-14                           │
│                                │─────────────────────────────────│
│  [Logo]                        │  [Page title]    [Bell] [Avatar]│
│  ─────────────────             │─────────────────────────────────│
│  Dashboard                     │                                  │
│  Employees                     │   <Outlet /> — feature content   │
│  Attendance                    │                                  │
│  Leave                         │                                  │
│  Projects                      │                                  │
│  Payroll                       │                                  │
│  Configuration (gated)         │                                  │
│  Permissions (super admin only)│                                  │
│  ─────────────────             │                                  │
│  [User mini-card]              │                                  │
└──────────────────────────────────────────────────────────────────┘
```

The sidebar is fixed to the left edge, full viewport height. The main area has a left margin equal to the sidebar width (`ml-60` or `ml-14`) so content is never obscured. Both sidebar and main area are independent scroll containers — sidebar content does not scroll with the page.

### Sidebar

**Shell component**: `src/components/shared/AdminSidebar.tsx`

**Dimensions**:
- Expanded: `w-60` (240px)
- Collapsed: `w-14` (56px)
- Height: `h-screen`, `fixed top-0 left-0`
- Transition: `transition-all duration-200 ease-in-out` on width

**Background**: `bg-neutral-950`

**Internal layout (top to bottom)**:
1. Logo zone — `h-14 flex items-center` (matches navbar height)
2. Nav list — `flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1`
3. User mini-card — `border-t border-neutral-800 p-2`

**Logo zone**:
- Expanded: `public/logo-white.png` — `h-7 w-auto ml-3`
- Collapsed: `public/logo-icon.png` (icon/square variant) — `h-7 w-7 mx-auto`
- If a separate icon variant does not exist, use the first letter of "Trusst" in a `w-8 h-8 rounded-md bg-violet-600 text-white text-sm font-bold flex items-center justify-center` chip as the collapsed state fallback
- No toggle button inside the logo zone

**Collapse toggle**:
- A `<Button variant="ghost" size="icon">` button rendered at the top-right edge of the sidebar, overlapping the seam between sidebar and main area
- Position: `absolute -right-3 top-[68px] z-50`
- Visual: `h-6 w-6 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center`
- Icon: `ChevronLeft` when expanded, `ChevronRight` when collapsed — `h-3 w-3 text-neutral-600`
- State stored in `useUIStore` (`sidebarOpen: boolean`) — already scaffolded in `src/stores/ui.store.ts`

**User mini-card (bottom of sidebar)**:
- Expanded state:
  - `flex items-center gap-2 rounded-md p-2 w-full`
  - shadcn `<Avatar>` — `h-8 w-8`, fallback initials from `user.username` (first letter uppercase)
  - Username: `text-sm font-medium text-neutral-200 truncate`
  - Email: `text-xs text-neutral-500 truncate`
  - Not clickable — navigation to profile is in the top navbar dropdown
- Collapsed state: avatar only, centered — `mx-auto`
- Avatar fallback background: `bg-violet-600 text-white text-xs font-semibold`

### Top Navbar

**Shell component**: `src/components/shared/AdminNavbar.tsx`

**Dimensions**: `h-14`, `fixed top-0 left-60` (shifts to `left-14` when sidebar collapsed), full remaining width
- Width: `right-0` (stretches to screen edge)
- Transition: `transition-all duration-200 ease-in-out` on `left`

**Background**: `bg-white border-b border-neutral-200`

**Internal layout**:
```
[Page title area]                    [notification bell]  [avatar dropdown]
flex-1 pl-6                          flex items-center gap-2 pr-4
```

**Page title**:
- Text: current route's human-readable name (e.g., "Dashboard", "Employees")
- Style: `text-base font-semibold text-neutral-900`
- Source: defined per-route via TanStack Router's `context` or a `usePageTitle` hook — not hardcoded in the navbar component
- Implementation note: the navbar reads title from router context. Each route file sets `context: { title: 'Employees' }` in its `createRoute` config.

**Notification bell**:
- shadcn `<Button variant="ghost" size="icon">`
- Icon: `Bell` from lucide-react — `h-5 w-5 text-neutral-500`
- No badge in this shell (notification count is a future feature — do not add badge markup now)

**User avatar dropdown**:
- shadcn `<DropdownMenu>`
- Trigger: `<DropdownMenuTrigger asChild>` wrapping a `<Button variant="ghost" className="flex items-center gap-2 px-2">`:
  - shadcn `<Avatar>` — `h-8 w-8`, same fallback logic as sidebar mini-card
  - Username: `text-sm font-medium text-neutral-700` (hidden on `sm` breakpoint — show avatar only)
  - `ChevronDown` icon — `h-4 w-4 text-neutral-400` (hidden on `sm`)
- `<DropdownMenuContent align="end" className="w-48">`:
  - `<DropdownMenuLabel>` — `user.email`, `text-xs text-neutral-500 font-normal`
  - `<DropdownMenuSeparator />`
  - `<DropdownMenuItem>` — `UserCircle` icon + "Profile" — navigates to `/profile`
  - `<DropdownMenuSeparator />`
  - `<DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">` — `LogOut` icon + "Sign out" — calls `clearAuth()` then `router.navigate({ to: '/login', replace: true })`

### Nav Items (Admin)

Each nav item is a `<NavLink>` wrapper (custom component wrapping TanStack Router's `<Link>`) that applies active styles based on `isActive` from the router.

**Nav item anatomy (expanded)**:
```
<Link to={item.href}>
  <span class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
               text-neutral-400 hover:bg-neutral-800/60 hover:text-white
               [active]: bg-neutral-800 text-white">
    <Icon class="h-4 w-4 shrink-0" />
    <span class="truncate">{label}</span>   ← hidden when collapsed
  </span>
</Link>
```

**Nav item anatomy (collapsed)**:
- Same span, but label `<span>` is `hidden`
- Wrap each item in shadcn `<Tooltip>` with `<TooltipContent side="right">` showing the label — activated only when sidebar is collapsed
- `<TooltipProvider>` wraps the entire sidebar nav list

**Full nav item table**:

| Label | Icon (lucide-react) | Route | Permission gate |
|---|---|---|---|
| Dashboard | `LayoutDashboard` | `/admin` | None — always visible |
| Employees | `Users` | `/admin/employees` | `PERMISSIONS.VIEW_EMPLOYEES` |
| Attendance | `Clock` | `/admin/attendance` | None — always visible to admins |
| Leave | `CalendarDays` | `/admin/leave` | None — always visible to admins |
| Projects | `FolderKanban` | `/admin/projects` | None — always visible to admins |
| Payroll | `Wallet` | `/admin/payroll` | `PERMISSIONS.VIEW_PAYROLL` |
| Configuration | `Settings2` | `/admin/settings` | `PERMISSIONS.MANAGE_SETTINGS` |
| Permissions | `ShieldCheck` | `/admin/permissions` | Super Admin only — see note below |

**Permission gate implementation**:
- Items with a `PERMISSIONS.X` gate: rendered only when `useHasPermission(PERMISSIONS.X)` returns `true`
- "Permissions" item: rendered only when `user.roles.includes(UserRole.SUPER_ADMIN)`
- Never render a disabled or locked state — absent from the DOM entirely when the user lacks access

**Exact permission imports**:
```ts
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/hooks/use-has-permission';
import { useCurrentUser } from '@/stores/auth.store';
import { UserRole } from '@/types';
```

**Active state**:
- TanStack Router `<Link>` provides `data-status="active"` when the current route matches
- Use `activeProps={{ className: 'bg-neutral-800 text-white' }}` on the `<Link>` component
- Icon inherits color via `currentColor` — no separate icon color class needed

**Divider**:
- A subtle `<div className="my-2 h-px bg-neutral-800 mx-2" />` separator rendered between the main nav group and the "Configuration" + "Permissions" items (i.e., before the admin-only tools section)

### States

**Nav item states**:

| State | Classes |
|---|---|
| Default | `text-neutral-400` |
| Hover | `bg-neutral-800/60 text-white` |
| Active (current route) | `bg-neutral-800 text-white` |
| Active icon | inherits `text-white` via `currentColor` |

**Sidebar states**:

| State | Width | Logo | Labels | Toggle icon |
|---|---|---|---|---|
| Expanded | `w-60` | `logo-white.png h-7` | visible | `ChevronLeft` |
| Collapsed | `w-14` | icon chip or `logo-icon.png` | `hidden` | `ChevronRight` |

**Main content area left margin**:
- Expanded: `ml-60`
- Collapsed: `ml-14`
- Applied on the wrapper div in `_admin.tsx`

### Responsive Behavior

The admin layout targets desktop-first (HR tools are primarily desktop). No mobile sidebar in this release.

- **Below `lg` breakpoint** (`< 1024px`): sidebar auto-collapses to icon-only (`w-14`). The `sidebarOpen` store flag is set to `false` automatically when viewport drops below `lg`. Implement via a `useEffect` with a `ResizeObserver` or `window.matchMedia('(min-width: 1024px)')` listener in the layout component.
- **`md` and below** (`< 768px`): top navbar username and chevron hidden — avatar only. Page title truncates at `max-w-[160px] truncate`.
- No hamburger / sheet drawer in this release — icon-only sidebar is sufficient for tablet use.

### Handoff Notes

1. **Missing routes in `src/constants/routes.ts`**: The following admin routes are referenced in the nav but not yet defined. Add them before implementing the sidebar:
   ```ts
   ADMIN_ATTENDANCE: '/admin/attendance',
   ADMIN_PROJECTS: '/admin/projects',
   ADMIN_PERMISSIONS: '/admin/permissions',
   ```
   `ADMIN_SETTINGS` already exists (maps to Configuration).

2. **Missing PERMISSIONS keys**: The current `permissions.ts` does not have keys that map directly to Attendance or Leave visibility for admins. Those nav items are shown to all admin roles unconditionally — no permission gate needed. `VIEW_EMPLOYEES`, `VIEW_PAYROLL`, and `MANAGE_SETTINGS` cover the remaining gated items.

3. **`AppUser` type**: `src/types/index.ts` has a JSDoc comment referencing `AppUser` but the type itself is not defined in the file visible to this spec. Confirm `AppUser` extends `SessionUser` and is exported before implementing the user mini-card and avatar dropdown.

4. **`ui.store.ts`**: The `sidebarOpen` field is already scaffolded. The sidebar component reads/writes only via `useUIStore`.

5. **Logo assets**: Spec assumes `public/logo-white.png` (white variant for dark sidebar) and an optional `public/logo-icon.png`. If only `public/full-logo.png` exists, use the letter-chip fallback for collapsed state.

6. **`<TooltipProvider>`**: Must wrap the entire nav list — place it in `AdminSidebar.tsx` at the list root, not per-item.

7. **Scroll**: Main content area: `overflow-y-auto h-screen pt-14` (accounts for fixed navbar height). Sidebar nav list: `overflow-y-auto` with `flex-1` so it scrolls independently if nav list is tall.

8. **Active matching**: For `/admin` (Dashboard), use `exact: true` on the `<Link>` to prevent it being active on every `/admin/*` route.

---

## Employee Layout

### Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP NAVBAR (fixed, full width, h-14)                            │
│  [Logo]  [Dashboard] [Attendance] [Leave] [Projects] [Payslips]  │
│                                              [Bell] [Avatar]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   <Outlet /> — feature content                                   │
│   bg-neutral-50, pt-14, min-h-screen                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

No sidebar. All navigation is horizontal in the top navbar.

### Top Navbar

**Shell component**: `src/components/shared/EmployeeNavbar.tsx`

**Dimensions**: `h-14`, `fixed top-0 left-0 right-0 z-40`

**Background**: `bg-white border-b border-neutral-200`

**Internal layout**:
```
[Logo]   [Nav links — desktop]          flex-1    [Bell] [Avatar dropdown]
```

Full flex row: `flex items-center h-14 px-4 gap-6`

**Logo**:
- `public/full-logo.png` — `h-7 w-auto`
- Wrapped in `<Link to="/">` — clicking logo navigates to employee dashboard
- Right of logo: a `<div className="hidden md:flex items-center gap-1">` containing the nav links

**Nav links (desktop — `md` and above)**:
- Each link: TanStack Router `<Link>` rendered as a pill/tab
- Anatomy:
  ```
  <Link to={item.href}
        activeProps={{ className: 'text-violet-600 font-semibold' }}
        className="text-sm font-medium text-neutral-500 hover:text-neutral-900
                   px-3 py-1.5 rounded-md hover:bg-neutral-100
                   transition-colors duration-150">
    {label}
  </Link>
  ```
- No icons in the desktop navbar links — text only for density and readability
- Active indicator: `text-violet-600 font-semibold` text color shift only (no underline, no background fill on desktop nav links) — keeps the navbar clean

**Right side**:
- `flex items-center gap-2`
- Notification bell: same as admin — `<Button variant="ghost" size="icon">` + `Bell` icon
- Avatar dropdown: same as admin layout (see Admin Top Navbar section)
  - Profile link navigates to `/profile`
  - Sign out clears auth and redirects to `/login`

### Nav Items (Employee)

All employee nav items are visible to all employees — no permission gates.

| Label | Route | Desktop display |
|---|---|---|
| Dashboard | `/` | Text link |
| Attendance | `/attendance` | Text link |
| Leave | `/leave` | Text link |
| Projects | `/projects` | Text link |
| Payslips | `/payslips` | Text link |

**Active state**:
- `text-violet-600 font-semibold` via `activeProps`
- For Dashboard (`/`), use `exact: true` to prevent matching on all routes

**Missing routes in `src/constants/routes.ts`**:
The following employee routes are referenced but not yet defined:
```ts
EMPLOYEE_ATTENDANCE: '/attendance',
EMPLOYEE_PROJECTS: '/projects',
```
`EMPLOYEE_HOME`, `EMPLOYEE_LEAVE`, and `EMPLOYEE_PAYSLIPS` already exist.

### Mobile Navigation (Sheet drawer)

Below `md` breakpoint (`< 768px`), inline nav links are hidden. A hamburger button replaces them.

**Hamburger button**:
- `<Button variant="ghost" size="icon" className="md:hidden">` placed immediately after the logo
- Icon: `Menu` from lucide-react — `h-5 w-5`
- On click: opens a shadcn `<Sheet side="left">`

**Sheet content**:
- `<SheetContent side="left" className="w-64 pt-6">`:
  - Logo at top: `public/full-logo.png` — `h-7 w-auto mb-6`
  - Nav links as vertical list:
    ```
    <nav className="flex flex-col gap-1 px-2">
      <Link to={item.href}
            onClick={closeSheet}
            className="flex items-center gap-3 rounded-md px-3 py-2.5
                       text-sm font-medium text-neutral-600
                       hover:bg-neutral-100 hover:text-neutral-900">
        <Icon className="h-4 w-4 shrink-0 text-neutral-400" />
        {label}
      </Link>
    </nav>
    ```
  - Icons ARE shown in mobile sheet (aids scannability on small screens)
  - Active state in sheet: `bg-violet-50 text-violet-700 font-semibold` + icon `text-violet-600`
  - Sheet closes automatically `onClick` of any nav item

**Mobile sheet nav icons**:

| Label | Icon (lucide-react) |
|---|---|
| Dashboard | `LayoutDashboard` |
| Attendance | `Clock` |
| Leave | `CalendarDays` |
| Projects | `FolderKanban` |
| Payslips | `Receipt` |

**Sheet open state**:
- Local `useState<boolean>` inside `EmployeeNavbar.tsx` — not stored in Zustand (transient UI, single component)

### States

**Desktop nav link states**:

| State | Classes |
|---|---|
| Default | `text-neutral-500 font-medium` |
| Hover | `text-neutral-900 bg-neutral-100` |
| Active | `text-violet-600 font-semibold` |

**Mobile sheet nav link states**:

| State | Classes |
|---|---|
| Default | `text-neutral-600 font-medium` |
| Hover | `bg-neutral-100 text-neutral-900` |
| Active | `bg-violet-50 text-violet-700 font-semibold` |

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `md` and above (`>= 768px`) | Inline text nav links visible; hamburger hidden |
| Below `md` (`< 768px`) | Inline links hidden; hamburger + Sheet drawer active |

The employee layout is fully responsive. At mobile sizes, the sheet provides full navigation access.

### Handoff Notes

1. **Content area**: `<main className="pt-14 min-h-screen bg-neutral-50">` — `pt-14` offsets the fixed navbar. `<Outlet />` renders inside this `<main>`.

2. **Avatar dropdown sign-out**: Both layouts share identical sign-out logic. Consider extracting to a `<UserDropdown />` shared component in `src/components/shared/UserDropdown.tsx` to avoid duplication between `AdminNavbar.tsx` and `EmployeeNavbar.tsx`.

3. **Missing employee routes**: `/attendance` and `/projects` routes do not exist in `src/constants/routes.ts` yet. Add them before building the navbar. The route files `src/routes/_employee/attendance.tsx` and `src/routes/_employee/projects.tsx` will also need to be created as placeholders.

4. **Sheet import**: shadcn `Sheet` component must be installed. Run `npx shadcn@latest add sheet` if not already present in `src/components/ui/`.

5. **Tooltip import**: shadcn `Tooltip` component must be installed for the admin sidebar collapsed state. Run `npx shadcn@latest add tooltip` if not already present.

6. **Active route for `/`**: Both layouts must use `exact` matching for the dashboard route to avoid the dashboard link appearing active on every page.

7. **`AppUser` fields used in both navbars**: `user.username` (for avatar fallback initial + display name) and `user.email` (for dropdown label). Both are on `SessionUser` and therefore on `AppUser`.

---

## shadcn Components Summary

| Component | Used in |
|---|---|
| `Avatar`, `AvatarFallback`, `AvatarImage` | Both layouts |
| `Button` | Both layouts (toggle, bell, dropdown trigger, hamburger) |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuSeparator` | Both layouts |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | Admin layout (collapsed sidebar) |
| `Sheet`, `SheetContent`, `SheetTrigger` | Employee layout (mobile nav) |

## lucide-react Icons Summary

| Icon | Used for |
|---|---|
| `LayoutDashboard` | Dashboard (admin + employee mobile) |
| `Users` | Employees (admin) |
| `Clock` | Attendance (admin + employee mobile) |
| `CalendarDays` | Leave (admin + employee mobile) |
| `FolderKanban` | Projects (admin + employee mobile) |
| `Wallet` | Payroll (admin) |
| `Settings2` | Configuration (admin) |
| `ShieldCheck` | Permissions (admin, super admin only) |
| `Receipt` | Payslips (employee mobile) |
| `Bell` | Notification bell (both layouts) |
| `ChevronLeft` | Sidebar collapse toggle (expanded state) |
| `ChevronRight` | Sidebar collapse toggle (collapsed state) |
| `ChevronDown` | Avatar dropdown chevron |
| `UserCircle` | Profile menu item |
| `LogOut` | Sign out menu item |
| `Menu` | Mobile hamburger (employee layout) |
