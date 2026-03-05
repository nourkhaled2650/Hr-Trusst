# Design Spec — Admin System Configuration
**Date**: 2026-03-05
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation

---

## Route

`/admin/config`

**Navbar title**: "System Configuration"

**Permission gate**: Super Admin only. Sub-admins with no `PERMISSIONS.MANAGE_CONFIGURATION` access should not see this route in the sidebar, and the route itself must check the permission — redirect to `/admin` if unauthorized.

---

## Navigation Flow

```
/admin/config
    │
    ├── Page loads → GET /api/payroll-settings/latest
    │                GET /api/payroll-settings/all
    │
    ├── Config exists → form pre-fills with current values
    │       │
    │       └── Admin edits fields → Save Configuration
    │                 │
    │                 ├── success → toast + form reset to saved values
    │                 └── error  → inline error alert
    │
    └── No config exists → empty state with "Create Initial Configuration" prompt
              │
              └── Admin fills form → Create Configuration
                        │
                        ├── success → toast + form resets
                        └── error  → inline error alert
```

Data strategy: Two queries run in parallel on mount — `['payroll-settings', 'latest']` for the form and `['payroll-settings', 'all']` for the history table. The form mutation calls `PUT /api/payroll-settings/update/{settingId}` when a config exists, or `POST /api/payroll-settings/create` when none exists yet.

---

## Overall Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN NAVBAR (fixed, h-14)  →  title: "System Configuration"       │
├─────────────────────────────────────────────────────────────────────┤
│  bg-neutral-50, pt-14, px-6, py-6                                   │
│                                                                     │
│  [Page header row]                                                  │
│  "System Configuration"   text-2xl font-semibold                   │
│  "Manage company-wide HR policy values."   text-sm text-neutral-500 │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  SECTION 1 — Current Configuration (Card)                     │  │
│  │                                                               │  │
│  │  [Amber banner — system-wide warning]                         │  │
│  │                                                               │  │
│  │  ── Overtime ──────────────────────────────────               │  │
│  │  Normal OT Rate            Special OT Rate                    │  │
│  │                                                               │  │
│  │  ── Attendance ────────────────────────────────               │  │
│  │  Standard Working Hours    Working Day Start Time             │  │
│  │  Late Balance Limit                                           │  │
│  │                                                               │  │
│  │  ── Leave ─────────────────────────────────────               │  │
│  │  Leave Balance Limit                                          │  │
│  │                                                               │  │
│  │                              [Save Configuration]             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  SECTION 2 — Configuration History (Card)                     │  │
│  │  Read-only audit table                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

Outer wrapper: `<div className="p-6 space-y-6">` inside the admin layout content area (`pt-14 bg-neutral-50 min-h-screen`).

---

---

## Section 1 — Current Configuration

### Purpose

Allows the super admin to view and edit the single active system configuration record. All 6 editable fields are presented in logical groups within a single Card. A prominent amber warning makes it clear that changes are system-wide. A single Save button at the bottom submits the whole form.

---

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Card                                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CardHeader                                             │   │
│  │  "Current Configuration"   [CardTitle]                  │   │
│  │  "Edit the active HR policy values."  [CardDescription] │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CardContent  space-y-6                                 │   │
│  │                                                         │   │
│  │  [Amber Alert banner]                                   │   │
│  │                                                         │   │
│  │  [Group label: "Overtime"]  ─────────────────────────   │   │
│  │  ┌────────────────────────┐  ┌────────────────────────┐ │   │
│  │  │ Normal Overtime Rate   │  │ Special Overtime Rate  │ │   │
│  │  │ [description text]     │  │ [description text]     │ │   │
│  │  │ [number input]         │  │ [number input]         │ │   │
│  │  │ [inline error]         │  │ [inline error]         │ │   │
│  │  └────────────────────────┘  └────────────────────────┘ │   │
│  │                                                         │   │
│  │  [Group label: "Attendance"]  ───────────────────────   │   │
│  │  ┌────────────────────────┐  ┌────────────────────────┐ │   │
│  │  │ Standard Working Hours │  │ Working Day Start Time │ │   │
│  │  │ [description text]     │  │ [description text]     │ │   │
│  │  │ [number input]         │  │ [time input]           │ │   │
│  │  │ [inline error]         │  │ [inline error]         │ │   │
│  │  └────────────────────────┘  └────────────────────────┘ │   │
│  │  ┌────────────────────────┐                             │   │
│  │  │ Late Balance Limit     │                             │   │
│  │  │ [description text]     │                             │   │
│  │  │ [number input]         │                             │   │
│  │  │ [inline error]         │                             │   │
│  │  └────────────────────────┘                             │   │
│  │                                                         │   │
│  │  [Group label: "Leave"]  ────────────────────────────   │   │
│  │  ┌────────────────────────┐                             │   │
│  │  │ Leave Balance Limit    │                             │   │
│  │  │ [description text]     │                             │   │
│  │  │ [number input]         │                             │   │
│  │  │ [inline error]         │                             │   │
│  │  └────────────────────────┘                             │   │
│  │                                                         │   │
│  │  [API error Alert — conditional]                        │   │
│  │                                                         │   │
│  │                     [Save Configuration button]         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Components

| Component | shadcn name | Usage |
|---|---|---|
| Card container | `<Card>` | Wraps the entire form section |
| Card header | `<CardHeader>` | Title + description |
| Card title | `<CardTitle className="text-base font-semibold text-neutral-900">` | "Current Configuration" |
| Card description | `<CardDescription>` | "Edit the active HR policy values. Changes apply immediately to all payroll calculations." |
| Card content | `<CardContent className="space-y-6">` | All form groups + save button |
| Amber warning banner | `<Alert>` with amber styling | System-wide change warning (see exact markup below) |
| Group label | `<p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">` | "Overtime", "Attendance", "Leave" |
| Group divider | `<Separator />` rendered visually with `<div className="flex items-center gap-3 mb-4"><p ...>Overtime</p><Separator className="flex-1" /></div>` | Horizontal rule after each label |
| Two-column field grid | `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">` | OT rate pair, Standard Hours + Start Time pair |
| Field wrapper | `<Field>` from `@/components/ui/field` | Wraps each individual input |
| Field label | `<FieldLabel>` from `@/components/ui/field` | Label above input |
| Field error | `<FieldError>` from `@/components/ui/field` | Inline validation error below input |
| Field description | `<p className="text-xs text-neutral-500 mt-0.5 mb-1.5">` | One line below FieldLabel, above input |
| Number inputs | `<Input type="number">` | normalOvertimeRate, specialOvertimeRate, standardWorkingHours, lateBalanceLimit, leaveBalanceLimit |
| Time input | `<Input type="time" step="60">` | workingDayStartTime |
| API error alert | `<Alert variant="destructive">` | Only rendered when mutation returns an error |
| Save button | `<Button className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto">` | Single, end-aligned, disabled when form is not dirty or mutation is pending |
| Button footer row | `<div className="flex justify-end pt-2">` | Aligns Save button to the right |
| Metadata row | `<div className="flex items-center gap-2 text-xs text-neutral-400">` | Read-only settingId + validUntil display below the form groups |

**Amber warning banner** (always visible when form is rendered):
```tsx
<Alert className="border-amber-200 bg-amber-50">
  <AlertTriangle className="h-4 w-4 text-amber-600" />
  <AlertTitle className="text-amber-800 font-medium">System-wide impact</AlertTitle>
  <AlertDescription className="text-amber-700">
    Changes apply immediately to all payroll calculations company-wide.
    Review all values carefully before saving.
  </AlertDescription>
</Alert>
```

**Read-only metadata row** (rendered below group sections, above error alert + button):
```tsx
<div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-neutral-400 pt-2 border-t border-neutral-100">
  <span>Config ID: <span className="font-mono text-neutral-500">{config.settingId}</span></span>
  <span>Valid until: <span className="text-neutral-500">{formatDate(config.validUntil)}</span></span>
  {config.isExpired && (
    <Badge variant="outline" className="text-red-500 border-red-200 text-xs">Expired</Badge>
  )}
</div>
```
This row is hidden entirely while in the "no config yet" empty state.

---

### Fields & Validation

Schema lives in `src/features/config/schemas/config.schema.ts`.

**Field spec — all 6 editable fields:**

| Field name | Label | Description text | Input type | step | Min | Max | Validation |
|---|---|---|---|---|---|---|---|
| `normalOvertimeRate` | Normal Overtime Rate | Multiplier applied to the hourly rate for normal overtime hours (e.g. 1.5 = 150% of base rate). | `number` | `0.1` | 0.1 | 10 | Required. Positive decimal, min 0.1, max 10. |
| `specialOvertimeRate` | Special Overtime Rate | Multiplier for overtime worked on public holidays or special occasions (e.g. 2.0 = double pay). | `number` | `0.1` | 0.1 | 10 | Required. Positive decimal, min 0.1, max 10. Must be >= normalOvertimeRate (cross-field rule). |
| `standardWorkingHours` | Standard Working Hours | The expected number of working hours per day for full-time employees (e.g. 8.5). | `number` | `0.5` | 1 | 24 | Required. Decimal, min 1, max 24. |
| `lateBalanceLimit` | Late Grace Hours | Monthly grace period (in hours) before lateness begins affecting payroll (e.g. 6.0). | `number` | `0.5` | 0 | 24 | Required. Decimal, min 0, max 24. |
| `leaveBalanceLimit` | Annual Leave Days | Number of paid leave days granted to each full-time employee per year (e.g. 21). | `number` | `1` | 0 | 365 | Required. Integer, min 0, max 365. |
| `workingDayStartTime` | Working Day Start Time | Official start of the working day. Used to calculate lateness (e.g. 09:00). | `time` | `60` (1 min) | — | — | Required. Valid HH:mm string. |

**Zod schema shape:**
```ts
const configSchema = z.object({
  normalOvertimeRate:   z.coerce.number().min(0.1).max(10),
  specialOvertimeRate:  z.coerce.number().min(0.1).max(10),
  standardWorkingHours: z.coerce.number().min(1).max(24),
  lateBalanceLimit:     z.coerce.number().min(0).max(24),
  leaveBalanceLimit:    z.coerce.number().int().min(0).max(365),
  workingDayStartTime:  z.string().regex(/^\d{2}:\d{2}$/, 'Must be a valid time (HH:mm)'),
}).refine(
  data => data.specialOvertimeRate >= data.normalOvertimeRate,
  {
    message: 'Special overtime rate must be at least equal to the normal overtime rate',
    path: ['specialOvertimeRate'],
  }
);

export type ConfigFormValues = z.infer<typeof configSchema>;
```

`leaveBalanceLimit` uses `z.coerce.number().int()` — coercion handles the string-to-number conversion from the input; `.int()` enforces whole days.

**`workingDayStartTime` format handling:**
- Backend returns `"HH:mm:ss"` (e.g. `"09:00:00"`).
- `<Input type="time">` works with `"HH:mm"`.
- On form init: `value.slice(0, 5)` — strip seconds.
- On submit: append `:00` → `"${formValue}:00"`.

---

### Interactions

| Action | Result |
|---|---|
| Page loads, config exists | Both queries run in parallel. Form pre-fills with current values. `form.formState.isDirty` is false. Save button disabled. |
| Page loads, no config | Loading skeleton shown during fetch. On 404 response from `/latest`, empty state shown with "Create Initial Configuration" callout. |
| Admin edits any field | `form.formState.isDirty` becomes true. Save button enabled. |
| Admin clears a change (resets to original) | RHF tracks dirty state — if all fields match original values, `isDirty` returns to false. Save button disables again. |
| Click "Save Configuration" (valid, dirty form) | `handleSubmit` fires. If settingId exists: call `PUT /api/payroll-settings/update/{settingId}`. If no config: call `POST /api/payroll-settings/create`. Button shows spinner + "Saving…". Inputs disabled. |
| Save success | Toast: `"Configuration saved successfully"`. Invalidate `['payroll-settings', 'latest']` and `['payroll-settings', 'all']`. `form.reset(savedValues)`. `isDirty` clears. Save button disables. |
| Save error | `<Alert variant="destructive">` appears above the save button with server `message` or fallback: `"Failed to save configuration. Please try again."` Inputs re-enabled. |
| Click "Create Initial Configuration" (empty state) | Unhides the form in create mode (same form, no pre-fill). |

---

### States

**Loading (initial fetch):**
- Card body renders with skeletons in place of every field:
  ```tsx
  <div className="space-y-6">
    <Skeleton className="h-16 w-full rounded-md" /> {/* amber banner placeholder */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />  {/* group label */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    </div>
    {/* repeat for Attendance and Leave groups */}
  </div>
  ```
- CardTitle and CardDescription render immediately (not skeletonized).

**No configuration set yet (404 from `/latest`):**
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Settings className="h-12 w-12 text-neutral-300 mb-4" />
  <p className="text-base font-medium text-neutral-700">No configuration set yet</p>
  <p className="text-sm text-neutral-400 mt-1 max-w-sm">
    The system has no active payroll settings. Create an initial configuration
    to enable payroll calculations.
  </p>
  <Button
    className="mt-6 bg-violet-600 hover:bg-violet-700"
    onClick={() => setShowCreateForm(true)}
  >
    <Plus className="h-4 w-4 mr-2" />
    Create Initial Configuration
  </Button>
</div>
```
When `showCreateForm` is true, hide the empty state and render the form with all fields empty, Save button labeled "Create Configuration".

**Fetch error (network or non-404 server error):**
```tsx
<Alert variant="destructive" className="mx-auto max-w-lg mt-4">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    Failed to load configuration. Please refresh the page.
  </AlertDescription>
</Alert>
```

**Saving (mutation pending):**
- All form inputs `disabled`.
- Save button: `<Loader2 className="animate-spin h-4 w-4 mr-2" /> "Saving…"`, `disabled`.
- No full-page overlay — fields disable in place.

**Saved (mutation success):**
- Form re-initializes: `form.reset(savedData)`. `isDirty` clears. Save button disables.
- Toast appears bottom-right.

**API save error (mutation error):**
- `<Alert variant="destructive">` appears above the button row inside the card.
- Inputs re-enabled. Save button re-enabled.
- Alert clears when any field value changes (`useEffect` watching `form.watch()` to clear `mutationError`).

---

### Dev Notes

1. **Route title**: Set `context: { title: 'System Configuration' }` in the route definition so `AdminNavbar` picks it up.
2. **Permission gate**: Add `beforeLoad` guard in the route: check `useHasPermission(PERMISSIONS.MANAGE_CONFIGURATION)` or equivalent. If unauthorized, redirect to `/admin`.
3. **Parallel queries**:
   ```ts
   const latestQuery  = useQuery({ queryKey: ['payroll-settings', 'latest'], queryFn: fetchLatestConfig });
   const historyQuery = useQuery({ queryKey: ['payroll-settings', 'all'],    queryFn: fetchAllConfigs });
   ```
   Both are independent — do not wait for one before the other.
4. **404 vs error distinction**: The `GET /api/payroll-settings/latest` endpoint returns 404 with `status: "error"` when no config exists. In `fetchLatestConfig`, catch 404 and return `null` (not throw). The component checks `latestQuery.data === null` to trigger the empty state. Any other error code should still throw and populate `latestQuery.error`.
5. **Mutation routing**: Determine `PUT` vs `POST` at submit time:
   ```ts
   const mutate = useSaveConfig(); // wraps both mutations
   // inside onSubmit:
   if (latestConfig?.settingId) {
     updateMutation.mutate({ id: latestConfig.settingId, data: payload });
   } else {
     createMutation.mutate(payload);
   }
   ```
6. **`workingDayStartTime` format**: Backend returns `"HH:mm:ss"`. On form init: `value.slice(0, 5)`. On submit: `formValue + ':00'`.
7. **`leaveBalanceLimit` coercion**: `<Input type="number" step="1">` returns a string. The Zod `z.coerce.number().int()` handles conversion and enforces integer constraint.
8. **Cross-field validation for OT rates**: The `specialOvertimeRate >= normalOvertimeRate` rule is enforced at schema level via `.refine()` on the root object. The error is attached to `specialOvertimeRate` so it renders under that field.
9. **Save button enabled logic**: `disabled={!form.formState.isDirty || isPending}`. `isPending` is the combined state of whichever mutation is currently running.
10. **Form reset after success**: After a successful mutation, call `form.reset(mapApiToFormValues(savedConfig))` where `mapApiToFormValues` strips seconds from `workingDayStartTime`. This re-establishes the "clean" baseline so `isDirty` works correctly if the admin edits again.
11. **`validUntil` display format**: Format with `new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(config.validUntil))`.
12. **No `validFrom` field in the form**: The backend has no `validFrom` field. Do not add it to the submission. The read-only metadata row shows `validUntil` for transparency. See deviation report: `backend/docs/deviations/backend-review-2026-02-28.md`.
13. **Feature folder**: `src/features/config/`. See Feature Folder Structure at end of this spec.
14. **lucide-react icons needed**: `AlertTriangle`, `AlertCircle`, `Settings`, `Plus`, `Loader2`, `History`.
15. **shadcn components needed**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Alert`, `AlertTitle`, `AlertDescription`, `Badge`, `Separator`, `Skeleton`, `Button`, `Input`.

---

---

## Section 2 — Configuration History

### Purpose

Provides a read-only audit log of all past and present configuration records. Gives the super admin full visibility into what settings were active at any point in time. No editing, no deletions — audit log only.

---

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Card                                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CardHeader  flex justify-between items-center          │   │
│  │  "Configuration History"  [CardTitle]                   │   │
│  │  "All past configuration records."  [CardDescription]   │   │
│  │                               [History icon — decorative]│  │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CardContent p-0                                        │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │  Table                                            │  │   │
│  │  │  ID  │  Std Hours  │  Normal OT  │  Special OT   │  │   │
│  │  │      │  Late Limit │  Leave Days │  Start Time   │  │   │
│  │  │      │  Valid Until │  Status                    │  │   │
│  │  │  ─────────────────────────────────────────────── │  │   │
│  │  │  row  row  row ...                                │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Components

| Component | shadcn name | Usage |
|---|---|---|
| Card container | `<Card>` | Wraps history section |
| Card header | `<CardHeader className="flex flex-row items-center justify-between">` | Title + icon |
| Card title | `<CardTitle className="text-base font-semibold text-neutral-900">` | "Configuration History" |
| Card description | `<CardDescription>` | "All past configuration records, newest first." |
| Decorative icon | `<History className="h-5 w-5 text-neutral-400">` | Right side of header row |
| Card content | `<CardContent className="p-0">` | Zero padding — table has its own padding |
| Table | shadcn `<Table>` | Full-width, no row actions |
| Table header | `<TableHeader>` + `<TableRow>` + `<TableHead>` | Column labels |
| Table body | `<TableBody>` + `<TableRow>` + `<TableCell>` | Data rows |
| Status badge | `<Badge>` | Active (green) or Expired (neutral) |
| Loading skeleton | `<Skeleton>` | 4 skeleton rows while historyQuery is loading |
| Empty state | Custom `<div>` inside `<TableCell colSpan={8}>` | No history yet |
| Error state | Custom `<div>` inside `<TableCell colSpan={8}>` | Fetch failed |

---

### Table Columns

Sorted newest first (descending by `settingId`).

| Column | Source field | Display | Notes |
|---|---|---|---|
| ID | `settingId` | `<span className="font-mono text-xs text-neutral-500">#{settingId}</span>` | Compact |
| Std Hours | `standardWorkingHours` | `{value} hrs/day` | |
| Normal OT | `normalOvertimeRate` | `{value}×` | |
| Special OT | `specialOvertimeRate` | `{value}×` | |
| Late Limit | `lateBalanceLimit` | `{value} hrs/mo` | |
| Leave Days | `leaveBalanceLimit` | `{value} days/yr` | |
| Start Time | `workingDayStartTime` | `{value.slice(0, 5)}` | Strip seconds |
| Valid Until | `validUntil` | Formatted date (see Dev Notes) | |
| Status | `isExpired` | Badge — see badge spec below | |

**Column headers**: All in `<TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wide whitespace-nowrap">`.

**Status badge:**
- `isExpired === false`: `<Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs font-medium">Active</Badge>`
- `isExpired === true`: `<Badge variant="outline" className="text-neutral-400 text-xs font-medium">Expired</Badge>`

**Newest first sort**: Sort the array client-side: `[...configs].sort((a, b) => b.settingId - a.settingId)` before rendering rows.

---

### Fields & Validation

No form fields. Read-only display only.

---

### Interactions

| Action | Result |
|---|---|
| Page loads | `GET /api/payroll-settings/all` runs in parallel with the `/latest` fetch |
| Mutation success (save config) | `queryClient.invalidateQueries({ queryKey: ['payroll-settings', 'all'] })` — table refreshes to include new/updated record |
| — | No row-level interactions. No click, no hover expansion, no actions. |

---

### States

**Loading:**
```tsx
<TableBody>
  {Array.from({ length: 4 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 9 }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full rounded" />
        </TableCell>
      ))}
    </TableRow>
  ))}
</TableBody>
```

**Empty (no history records):**
```tsx
<TableRow>
  <TableCell colSpan={9} className="text-center py-12 text-sm text-neutral-400">
    No configuration history yet.
  </TableCell>
</TableRow>
```

**Error (fetch failed):**
```tsx
<TableRow>
  <TableCell colSpan={9} className="text-center py-12">
    <p className="text-sm text-red-500">Failed to load configuration history.</p>
  </TableCell>
</TableRow>
```

---

### Dev Notes

1. **Query key**: `['payroll-settings', 'all']` for `GET /api/payroll-settings/all`.
2. **Invalidation on save**: When the save mutation succeeds, invalidate both `['payroll-settings', 'latest']` and `['payroll-settings', 'all']` so both the form and the history table refresh.
3. **Sort**: Sort descending by `settingId` on the client — do not rely on server ordering.
4. **`validUntil` display**: Use `new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(config.validUntil))` — compact date, no time, to keep columns narrow.
5. **Table overflow**: Wrap `<CardContent>` in `<div className="overflow-x-auto">` so the table scrolls horizontally on small screens without breaking the card layout.
6. **No pagination**: The number of historical config records is expected to be small (tens, not thousands). No pagination required.

---

---

## Feature Folder Structure

```
src/features/config/
├── api/
│   └── config.api.ts              # fetchLatestConfig, fetchAllConfigs, createConfig, updateConfig
├── components/
│   ├── config-form.tsx            # Section 1: form card (groups, fields, save button)
│   ├── config-form-fields/
│   │   ├── overtime-group.tsx     # normalOvertimeRate + specialOvertimeRate field pair
│   │   ├── attendance-group.tsx   # standardWorkingHours + workingDayStartTime + lateBalanceLimit
│   │   └── leave-group.tsx        # leaveBalanceLimit
│   └── config-history-table.tsx   # Section 2: read-only history table
├── hooks/
│   ├── use-latest-config.ts       # useQuery(['payroll-settings', 'latest'])
│   ├── use-all-configs.ts         # useQuery(['payroll-settings', 'all'])
│   └── use-save-config.ts         # wraps create + update mutations
├── schemas/
│   └── config.schema.ts           # configSchema, ConfigFormValues type
├── types/
│   └── config.types.ts            # PayrollSettings interface
└── index.ts                       # Public exports only
```

---

## shadcn Components Summary

| Component | Section(s) |
|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | Both |
| `Alert`, `AlertTitle`, `AlertDescription` | Section 1 (warning banner, error) |
| `Badge` | Section 1 (metadata isExpired), Section 2 (status column) |
| `Separator` | Section 1 (group dividers) |
| `Input` | Section 1 (all 6 fields) |
| `Button` | Section 1 (save) |
| `Skeleton` | Both (loading states) |
| `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` | Section 2 |

## lucide-react Icons Summary

| Icon | Used in |
|---|---|
| `AlertTriangle` | Section 1 — amber warning banner |
| `AlertCircle` | Section 1 — API error alert |
| `Settings` | Section 1 — empty state illustration |
| `Plus` | Section 1 — "Create Initial Configuration" empty state button |
| `Loader2` | Section 1 — save button spinner |
| `History` | Section 2 — card header decorative icon |
