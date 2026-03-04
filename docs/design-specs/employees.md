# Design Spec — Admin Employee Management
**Date**: 2026-03-04
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation

---

## Navigation Flow

```
/admin/employees  (Screen 1 — Employee List)
    │
    ├── [+ New Employee] button  →  Create Employee Dialog (Screen 2)
    │                                    │
    │                                    └── on success → dismiss dialog,
    │                                        invalidate query, row appears in list
    │
    └── Click any employee row  →  /admin/employees/$employeeId  (Screen 3)
                                        │
                                        └── [← Back] breadcrumb  →  /admin/employees
```

Data strategy: `GET /api/employee` is fetched once on Screen 1. The result is cached via TanStack Query with key `['employees']`. Screen 3 reads from this cache using `queryClient.getQueryData(['employees'])` and finds the employee by ID — no second network request is needed because there is no `GET /api/employee/{id}` endpoint. If the cache is cold (direct URL navigation), Screen 3 falls back to re-fetching the full list and filtering.

---

## Screen 1 — Employee List (`/admin/employees`)

### Purpose
Gives admins a scannable, searchable table of all employees with quick access to create a new employee or drill into any employee's detail.

---

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN NAVBAR (fixed, h-14)  →  title: "Employees"                  │
├─────────────────────────────────────────────────────────────────────┤
│  bg-neutral-50, pt-14, px-6, py-6                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  [Page header row]                                            │  │
│  │  "Employees"  text-2xl font-semibold    [+ New Employee btn]  │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  [Filter / search bar row]                                    │  │
│  │  [Search input]      [Type filter Select]                     │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  [DataTable]                                                  │  │
│  │  Avatar  Name/Code  Email  Department  Position  Type  Action │  │
│  │  ─────────────────────────────────────────────────────────── │  │
│  │  row  row  row  row ...                                       │  │
│  │  [Pagination]                                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

Outer wrapper: `<div className="p-6 space-y-4">` inside the admin layout's content area (`pt-14 bg-neutral-50 min-h-screen`).

---

### Components

| Component | shadcn name | Usage |
|---|---|---|
| Page header container | `<div>` | Flex row, justify-between, items-center |
| Page heading | `<h1>` | `text-2xl font-semibold text-neutral-900` |
| New employee button | `<Button>` | `variant="default"`, `className="bg-violet-600 hover:bg-violet-700"`, `Plus` icon prefix |
| Search field | `<Input>` | type="search", placeholder="Search by name, email, or department..." |
| Type filter | `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>` | Filter by FULL_TIME / PART_TIME / All |
| Employee table | shadcn `DataTable` pattern | TanStack Table v8, columns defined separately |
| Employee type badge | `<Badge>` | variant="secondary" for FULL_TIME, variant="outline" for PART_TIME |
| Row avatar | `<Avatar>` + `<AvatarFallback>` | Initials from firstName + lastName |
| Row action button | `<Button variant="ghost" size="icon">` | `ChevronRight` icon, triggers navigation |
| Empty state | Custom `<div>` | Centered illustration + text (see States) |
| Loading skeleton | shadcn `Skeleton` | Table rows placeholder |
| Error state | shadcn `Alert` | `variant="destructive"` |
| Pagination | shadcn `DataTable` pagination controls | Rows per page selector + prev/next |

---

### Table Columns

| Column | Source field | Display | Width |
|---|---|---|---|
| Employee | `firstName` + `lastName` + `employeeCode` | Avatar + full name bold + code below in `text-xs text-neutral-500` | auto, flex-grow |
| Email | `email` | Plain text, `text-sm text-neutral-600` | auto |
| Department | `department` | Plain text, `—` when null | `w-36` |
| Position | `position` | Plain text, `—` when null | `w-36` |
| Type | `employeeType` | `<Badge>` — see badge spec below | `w-28` |
| Action | — | `<Button variant="ghost" size="icon">` with `ChevronRight` | `w-12` |

**Avatar generation**:
- `<Avatar className="h-8 w-8">` with `<AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-semibold">`
- Fallback initials: first letter of `firstName` + first letter of `lastName` (uppercase). If both null, use first letter of `email`.

**Type badge**:
- `FULL_TIME`: `<Badge variant="secondary" className="bg-violet-50 text-violet-700 border-violet-200 font-medium">Full-time</Badge>`
- `PART_TIME`: `<Badge variant="outline" className="text-neutral-600 font-medium">Part-time</Badge>`
- `null`: `<Badge variant="outline" className="text-neutral-400">Not set</Badge>`

**Name + code cell**:
```tsx
<div className="flex items-center gap-3">
  <Avatar className="h-8 w-8 shrink-0">
    <AvatarFallback>AB</AvatarFallback>
  </Avatar>
  <div className="min-w-0">
    <p className="text-sm font-medium text-neutral-900 truncate">{fullName || "—"}</p>
    <p className="text-xs text-neutral-500">{employeeCode}</p>
  </div>
</div>
```
If both `firstName` and `lastName` are null, render `<p className="text-sm text-neutral-400 italic">Name not set</p>` in place of the full name.

---

### Search & Filter Behavior

- Search input: client-side filter on the in-memory employee list (already loaded from cache). Matches `firstName`, `lastName`, `email`, or `department` — case-insensitive, substring match.
- Type filter `<Select>`:
  - Options: "All types" (default, value `""`), "Full-time" (value `"FULL_TIME"`), "Part-time" (value `"PART_TIME"`)
  - Client-side — no additional API call.
- Both filters compose: both apply simultaneously (AND logic).
- Debounce the search input: 200ms using a local `useState` + `useMemo` — no library needed.
- Filter row layout: `<div className="flex items-center gap-3">` — search input is `flex-1 max-w-xs`, type select is `w-44`.

---

### Fields & Validation

No form fields on this screen. Inputs are filters only — no validation required.

---

### Interactions

| Action | Result |
|---|---|
| Type in search | List filters in real time (200ms debounce) |
| Change type filter | List filters immediately |
| Click [+ New Employee] | Opens Create Employee Dialog (Screen 2) |
| Click any row or `ChevronRight` button | `router.navigate({ to: '/admin/employees/$employeeId', params: { employeeId: String(employee.employeeId) } })` |
| Entire row is clickable | Row has `cursor-pointer hover:bg-neutral-50` — clicking the row body navigates; the chevron button at the end also serves keyboard users |

---

### States

**Loading** (initial fetch):
- Replace table body with 6 `<Skeleton className="h-12 w-full rounded-md" />` rows inside a `space-y-2` container.
- Filter controls and header are rendered immediately (not skeletonized).

**Empty — no employees exist**:
```tsx
<div className="flex flex-col items-center justify-center py-24 text-center">
  <Users className="h-12 w-12 text-neutral-300 mb-4" />
  <p className="text-base font-medium text-neutral-600">No employees yet</p>
  <p className="text-sm text-neutral-400 mt-1">Add your first employee to get started.</p>
  <Button className="mt-6 bg-violet-600 hover:bg-violet-700" onClick={openCreateDialog}>
    <Plus className="h-4 w-4 mr-2" /> New Employee
  </Button>
</div>
```

**Empty — filters produce no results**:
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <SearchX className="h-10 w-10 text-neutral-300 mb-3" />
  <p className="text-sm font-medium text-neutral-600">No employees match your search</p>
  <p className="text-xs text-neutral-400 mt-1">Try adjusting your search or filter.</p>
</div>
```

**Error** (fetch failed):
```tsx
<Alert variant="destructive" className="max-w-lg mx-auto mt-8">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Failed to load employees. Please refresh the page.</AlertDescription>
</Alert>
```

---

### Dev Notes

1. **Route title**: Set `context: { title: 'Employees' }` in the route definition so the admin navbar picks up the page title automatically.
2. **Query key**: Use `['employees']` as the TanStack Query key for `GET /api/employee`. This is the shared cache key that Screen 3 will also read from.
3. **TanStack Table**: Use the shadcn DataTable pattern. Column definitions live in `src/features/employees/components/employee-columns.tsx`. The table component lives in `src/features/employees/components/employee-table.tsx`.
4. **Row click navigation**: Attach an `onClick` to the `<tr>` element via the TanStack Table row `meta` callback pattern. Do not put a `<Link>` inside a `<td>`.
5. **Pagination**: Default page size 10. Provide a rows-per-page selector: 10, 25, 50.
6. **No extra permission gates on this page**: The entire `/admin/employees` route is already protected by the admin guard. No per-element permission checks needed inside this page.
7. **lucide-react icons needed**: `Plus`, `ChevronRight`, `Users`, `SearchX`, `AlertCircle`.
8. **shadcn components to install if not present**: `Skeleton`, `Select`, `Badge`.

---

## Screen 2 — Create Employee (Dialog)

### Purpose
A focused modal form that collects the minimum required data to create an employee account, with a secure password generation helper to reduce admin friction.

---

### Layout

The create flow is a `<Dialog>` — it requires confirmation before closing and contains a compact form. Triggered from Screen 1.

```
┌───────────────────────────────────────────────────────┐
│  Dialog Header                                        │
│  "New Employee"                                       │
│  "Create an employee account. You can complete the   │
│   full profile after creation."                      │
├───────────────────────────────────────────────────────┤
│  [Account section label]                              │
│  Email *            [input]                           │
│  Username *         [input]                           │
│  Password *         [input + eye toggle]              │
│                     [Generate password toggle]        │
│                     [Copy button — visible when auto] │
│                                                       │
│  [Separator]                                          │
│  [Profile section label]                              │
│  First Name [input]         Last Name [input]         │
│  Department         [input]                           │
│  Position           [input]                           │
│  Employee Type      [Select]                          │
│  Basic Salary       [input, number]                   │
│                                                       │
│  [Error alert — conditional]                          │
├───────────────────────────────────────────────────────┤
│  [Cancel]                      [Create Employee]      │
└───────────────────────────────────────────────────────┘
```

Dialog dimensions: `<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">`

---

### Components

| Component | shadcn name | Usage |
|---|---|---|
| Modal container | `<Dialog>`, `<DialogContent>` | Focus trap, close on Escape (with dirty check) |
| Header | `<DialogHeader>`, `<DialogTitle>`, `<DialogDescription>` | Title + subtitle |
| Form | `<Form>` (React Hook Form + Zod) | All fields |
| Section labels | `<p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">` | "Account" and "Profile" visual separators |
| Section divider | `<Separator />` | Between Account and Profile sections |
| Input fields | `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<Input>`, `<FormMessage>` | All text inputs |
| Password input | `<Input type="password">` with eye toggle | Show/hide password |
| Eye toggle button | `<Button variant="ghost" size="icon">` inside `relative` wrapper | `Eye` / `EyeOff` icon, `absolute right-2 top-1/2 -translate-y-1/2` |
| Generate password | `<div className="flex items-center gap-2 mt-1.5">` with shadcn `<Switch>` | Toggles auto-generated password mode |
| Copy button | `<Button variant="outline" size="sm">` with `Copy` / `Check` icon | Visible only when generate mode is on |
| Employee type select | `<Select>` + options | FULL_TIME / PART_TIME |
| Salary input | `<Input type="number" min="0" step="0.01">` | Numeric, no negatives |
| Error alert | `<Alert variant="destructive">` | API-level errors (e.g., email already registered) |
| Footer | `<DialogFooter>` | Cancel + submit buttons |
| Cancel | `<Button variant="outline">` | Closes dialog (dirty check first) |
| Submit | `<Button className="bg-violet-600 hover:bg-violet-700">` | `<Loader2 animate-spin>` when pending |
| Discard confirm | `<AlertDialog>` | "Discard changes?" confirmation when cancelling a dirty form |

---

### Fields & Validation

All validation via Zod schema. Schema lives in `src/features/employees/schemas/create-employee.schema.ts`.

**Account fields** (required at API level):

| Field | Input type | Label | Validation |
|---|---|---|---|
| `email` | `email` | Email | Required. Valid email format. Max 255 chars. |
| `username` | `text` | Username | Required. Min 3 chars. Max 50 chars. Alphanumeric + underscore + hyphen only: `/^[a-zA-Z0-9_-]+$/`. |
| `password` | `password` | Password | Required when generate mode OFF. Min 8 chars. At least one uppercase letter, one digit, one special character (`!@#$%^&*`). |

**Profile fields** (optional at API level):

| Field | Input type | Label | Validation |
|---|---|---|---|
| `firstName` | `text` | First Name | Optional. Max 100 chars. |
| `lastName` | `text` | Last Name | Optional. Max 100 chars. |
| `department` | `text` | Department | Optional. Max 100 chars. |
| `position` | `text` | Position | Optional. Max 100 chars. |
| `employeeType` | `select` | Employee Type | Optional. Enum: `FULL_TIME` \| `PART_TIME`. Placeholder: "Select type". |
| `basicSalary` | `number` | Basic Salary | Optional. Min 0. Positive decimal. |

**Zod schema shape**:
```ts
const createEmployeeSchema = z.object({
  email:        z.string().email().max(255),
  username:     z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  password:     z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
  firstName:    z.string().max(100).optional().or(z.literal('')),
  lastName:     z.string().max(100).optional().or(z.literal('')),
  department:   z.string().max(100).optional().or(z.literal('')),
  position:     z.string().max(100).optional().or(z.literal('')),
  employeeType: z.enum(['FULL_TIME', 'PART_TIME']).optional(),
  basicSalary:  z.coerce.number().min(0).optional(),
});
```
When generate mode is ON, the `password` field is pre-filled by the component and always passes validation.

---

### Password Generate Mode

A UX pattern to reduce the burden of inventing a secure temporary password.

**Toggle UI**: A `<Switch>` with label `"Auto-generate password"` placed below the password input field.

**Behavior when switched ON**:
1. Generate a 16-character random password using `window.crypto.getRandomValues` with a charset of uppercase + lowercase + digits + special chars (`!@#$%^&*`). Guarantee at least one character of each required class.
2. Set the password field value: `form.setValue('password', generatedPassword)`.
3. Switch the `<Input>` to `type="text"` so the admin can see the generated value.
4. Eye toggle button hides (not needed when already visible).
5. A `<Button variant="outline" size="sm">` appears below the password field:
   - Icon: `Copy` (default) → switches to `Check` for 2 seconds after click
   - Label: "Copy password"
   - On click: `navigator.clipboard.writeText(generatedPassword)` + toast: `"Password copied to clipboard"`
6. The password input becomes `readOnly` — admin cannot manually edit while generate mode is on.

**Behavior when switched OFF**:
1. Clear the password field: `form.setValue('password', '')`.
2. Switch `<Input>` back to `type="password"`.
3. Eye toggle reappears.
4. Copy button hides.
5. Focus moves to the password input.

**Implementation note**: The generated password string lives in local component state (`const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)`), separate from the form state. On toggle ON: generate → set state → set form value. On toggle OFF: clear state → clear form value.

---

### Interactions

| Action | Result |
|---|---|
| Open dialog | Form resets to empty defaults. Focus placed on Email field. |
| Submit valid form | Call `POST /api/employee`. Button shows spinner + "Creating...". All inputs disabled. |
| Submit success | Dialog closes. Toast: `"Employee created successfully"`. TanStack Query invalidates `['employees']`. |
| Submit error — email taken | `<Alert variant="destructive">` appears above footer with server `message` displayed verbatim. Fields re-enabled. |
| Submit error — other | Same alert with server `message` or fallback: `"Something went wrong. Please try again."` |
| Click Cancel (clean form) | Dialog closes immediately. |
| Click Cancel (dirty form) | `<AlertDialog>` appears: title "Discard changes?", message "Your unsaved changes will be lost.", buttons "Keep editing" / "Discard". Discard closes the main dialog. |
| Press Escape | Same dirty-check behavior as Cancel. |
| Toggle generate password ON | Password auto-filled, shown in plaintext, copy button appears, input becomes read-only. |
| Toggle generate password OFF | Password cleared, hidden, copy button disappears, manual entry re-enabled. |
| Click copy button | Password copied. Button icon changes to `Check` for 2 seconds. Toast shown. |

---

### States

**Idle (open, clean)**: Form fields empty, submit button labeled "Create Employee", Cancel enabled.

**Submitting**: All inputs `disabled`. Submit button: `<Loader2 className="animate-spin h-4 w-4 mr-2" /> "Creating..."`. Cancel button disabled.

**Submit error**: Alert above footer. Inputs re-enabled. Submit re-enabled. Alert clears when any field value changes.

**Dialog closed**: `<Dialog open={false}>` — shadcn unmounts content by default, nothing rendered in DOM.

---

### Dev Notes

1. **Dialog open state**: Managed in the parent (`EmployeeListPage`) via `const [createOpen, setCreateOpen] = useState(false)`. Pass `open` and `onOpenChange` as props to the dialog component.
2. **Form reset on open**: `useEffect(() => { if (open) form.reset(); }, [open])` ensures a clean form each time the dialog opens.
3. **Dirty check**: Use `form.formState.isDirty` from React Hook Form to gate the discard confirmation.
4. **Toast**: Use shadcn `useToast` hook imported from `src/components/ui/use-toast`.
5. **Null field handling on submit**: Strip empty strings before sending. Use `.transform` in the Zod schema or manually: `if (!firstName) delete payload.firstName`.
6. **Password generation utility** — place in `src/features/employees/utils/generate-password.ts`:
   ```ts
   export function generateSecurePassword(length = 16): string {
     const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
     const lower = 'abcdefghijklmnopqrstuvwxyz';
     const digits = '0123456789';
     const special = '!@#$%^&*';
     const all = upper + lower + digits + special;
     const array = new Uint32Array(length);
     window.crypto.getRandomValues(array);
     const chars = Array.from(array).map(n => all[n % all.length]);
     // Guarantee at least one of each required class
     chars[0] = upper[array[0] % upper.length];
     chars[1] = digits[array[1] % digits.length];
     chars[2] = special[array[2] % special.length];
     return chars.sort(() => Math.random() - 0.5).join('');
   }
   ```
7. **`basicSalary` precision**: Send as a string-formatted decimal: `basicSalary: value ? value.toFixed(2) : undefined` to avoid floating point serialization issues.
8. **First + last name layout**: Render side-by-side in `<div className="grid grid-cols-2 gap-3">`.
9. **shadcn components needed**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `Switch`, `Separator`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
10. **lucide-react icons**: `Eye`, `EyeOff`, `Copy`, `Check`, `Loader2`.

---

## Screen 3 — Employee Detail / Edit (`/admin/employees/$employeeId`)

### Purpose
A full-page edit form for a single employee, organized into logical sections, allowing the admin to update any profile field, employment configuration, or per-employee policy override.

---

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN NAVBAR (fixed, h-14)  →  title: "Employees"                  │
├─────────────────────────────────────────────────────────────────────┤
│  bg-neutral-50, pt-14                                               │
│                                                                     │
│  px-6 py-6                                                          │
│  ← Employees  (breadcrumb link back to list)                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  [Employee hero card]                                       │    │
│  │  Avatar (h-16)  Full name / employeeCode  Type badge        │    │
│  │                 Email  ·  Department  ·  Position           │    │
│  │                                           [Save Changes]    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐     │
│  │  Section 1               │  │  Section 2                   │     │
│  │  Basic Info              │  │  Employment Details          │     │
│  │  ─────────────────────   │  │  ─────────────────────────   │     │
│  │  First Name  Last Name   │  │  Employee Type               │     │
│  │  Date of Birth           │  │  Department  Position        │     │
│  │  Phone Number            │  │  Hire Date                   │     │
│  │  Address (textarea)      │  │  Manager                     │     │
│  └──────────────────────────┘  └──────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Section 3: Compensation  (full width)                       │   │
│  │  Basic Salary (note shown if part-time)                      │   │
│  │  Hourly Rate  (note shown if full-time)                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Section 4: Policy Overrides  [collapsible ▼]  (full width) │   │
│  │  (collapsed by default)                                      │   │
│  │  Normal OT Rate    Special OT Rate                           │   │
│  │  Standard Hours    Working Day Start Time                    │   │
│  │  Late Balance Limit  Leave Balance Limit                     │   │
│  │  [info callout]                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Sticky bottom bar: Save Changes button, right-aligned]            │
└─────────────────────────────────────────────────────────────────────┘
```

Section grid: `<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">` for Sections 1 & 2. Sections 3 & 4 are `col-span-full` (full width).

---

### Components

| Component | shadcn name | Usage |
|---|---|---|
| Breadcrumb | TanStack `<Link>` with `ChevronLeft` icon | Back to `/admin/employees` |
| Hero card | `<Card>` | Employee identity summary at top of page |
| Hero avatar | `<Avatar className="h-16 w-16">` | Large avatar with initials fallback |
| Hero name | `<h1 className="text-xl font-semibold text-neutral-900">` | Full name or "—" |
| Hero code | `<span className="text-sm text-neutral-500 font-mono">` | `employeeCode` |
| Hero badge | `<Badge>` | Employee type (same styles as Screen 1) |
| Hero metadata | `<p className="text-sm text-neutral-500">` | Email · Department · Position |
| Section cards | `<Card>` + `<CardHeader>` + `<CardContent>` | One card per section |
| Section title | `<CardTitle className="text-base font-semibold text-neutral-900">` | Section heading |
| Section subtitle | `<CardDescription>` | Brief description of section purpose |
| Form | `<Form>` (React Hook Form + Zod) | Entire page form |
| All inputs | `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<Input>`, `<FormMessage>` | Text, number, date inputs |
| Address | `<Textarea rows={3}>` | Multi-line address |
| Date inputs | `<Input type="date">` | Date of birth, hire date |
| Manager select | `<Select>` | All employees as options (excluding self) |
| Employee type select | `<Select>` | FULL_TIME / PART_TIME |
| Time input | `<Input type="time" step="60">` | Working day start time |
| Policy overrides section | `<Collapsible>` | Collapsed by default |
| Collapsible trigger | `<CollapsibleTrigger asChild>` | Section header row is the trigger |
| Collapsible chevron icon | `ChevronDown` / `ChevronRight` | Rotates on expand/collapse via `transition-transform` |
| Info callout | `<Alert>` (default variant) | "Blank fields use system defaults" |
| Part-time policy warning | `<Alert>` with amber styling | Shown inside policy section when employeeType is PART_TIME |
| Loading skeleton | `<Skeleton>` | Hero + form fields while loading |
| Not found state | Custom `<div>` | See States section |
| Error alert | `<Alert variant="destructive">` | Save API errors, inline above sticky footer |
| Save button (hero) | `<Button className="bg-violet-600 hover:bg-violet-700">` | Top save — type="submit" inside `<form>` |
| Save button (sticky) | Same | Bottom sticky bar — type="submit" inside same `<form>` |
| Unsaved changes guard | `<AlertDialog>` | Triggered on dirty navigation away |

---

### Data Loading Strategy

There is no `GET /api/employee/{id}` endpoint. The page sources data from the list cache:

```ts
const employees = queryClient.getQueryData<Employee[]>(['employees']);
const employee = employees?.find(e => String(e.employeeId) === params.employeeId);
```

If the cache is cold (direct URL navigation to `$employeeId`):
1. The route triggers `GET /api/employee` via `useQuery({ queryKey: ['employees'], ... })`.
2. Once loaded, filter by `employeeId`.
3. If still not found after loading (invalid ID), render the Not Found state.

**Recommended route loader** — add to the `$employeeId` route definition:
```ts
loader: ({ context: { queryClient } }) =>
  queryClient.ensureQueryData({
    queryKey: ['employees'],
    queryFn: () => apiClient.get('/api/employee').then(r => r.data.data),
  })
```
This guarantees the cache is warm before the component mounts, so there is no loading spinner for navigations arriving from Screen 1.

---

### Sections & Fields

#### Section 1 — Basic Info

`<CardTitle>`: "Basic Info" | `<CardDescription>`: "Personal details for this employee"

| Field | API field | Input type | Label | Validation |
|---|---|---|---|---|
| First Name | `firstName` | `text` | First Name | Max 100 chars |
| Last Name | `lastName` | `text` | Last Name | Max 100 chars |
| Date of Birth | `dateOfBirth` | `date` | Date of Birth | ISO date, must be in the past, age >= 16 |
| Phone Number | `phoneNumber` | `tel` | Phone Number | Max 30 chars |
| Address | `address` | `textarea` | Address | Max 500 chars |

Layout: First Name + Last Name in `<div className="grid grid-cols-2 gap-3">`. All other fields full-width.

#### Section 2 — Employment Details

`<CardTitle>`: "Employment Details" | `<CardDescription>`: "Role and organizational information"

| Field | API field | Input type | Label | Validation |
|---|---|---|---|---|
| Employee Type | `employeeType` | `<Select>` | Employee Type | Enum: FULL_TIME / PART_TIME |
| Department | `department` | `text` | Department | Max 100 chars |
| Position | `position` | `text` | Position | Max 100 chars |
| Hire Date | `hireDate` | `date` | Hire Date | ISO date |
| Manager | `managerId` | `<Select>` | Manager | Options from employees cache, excluding self |

**Manager select**: Options: one "No manager" option (value `""`) at top, then all other employees as `{ value: String(emp.employeeId), label: fullName(emp) || emp.employeeCode }`. On submit: `managerId: selectedId ? Number(selectedId) : null`.

Department + Position in `<div className="grid grid-cols-2 gap-3">`.

#### Section 3 — Compensation

`<CardTitle>`: "Compensation" | `<CardDescription>`: "Salary and rate configuration"

| Field | API field | Input type | Label | Always shown? |
|---|---|---|---|---|
| Basic Salary | `basicSalary` | `number` | Basic Salary (EGP) | Yes |
| Hourly Rate | `hourlyRate` | `number` | Hourly Rate (EGP/hr) | Yes |

Both fields always editable. Contextual hint text shown below the non-primary field:
- `employeeType === 'PART_TIME'`: under Basic Salary show `<p className="text-xs text-amber-600 mt-1">Not used for part-time payroll calculation</p>`
- `employeeType === 'FULL_TIME'`: under Hourly Rate show `<p className="text-xs text-amber-600 mt-1">Not used for full-time payroll calculation</p>`
- `employeeType` is null: no hint shown.

Both fields side-by-side: `<div className="grid grid-cols-2 gap-3">`.

Currency prefix: `<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 pointer-events-none">EGP</span>` inside a `relative` wrapper. Input has `pl-12`.

#### Section 4 — Policy Overrides

`<Collapsible>` wrapping a `<Card>`. The card header row is the `<CollapsibleTrigger>`.

**Trigger header row** (`flex items-center justify-between cursor-pointer select-none`):
- Left: `<CardTitle>` "Policy Overrides" + `<Badge variant="outline" className="ml-2 text-xs">Advanced</Badge>`
- Right: `ChevronDown` (expanded) / `ChevronRight` (collapsed), `h-4 w-4 text-neutral-500 transition-transform duration-200`

Collapsed by default (`const [policyOpen, setPolicyOpen] = useState(false)`).

When expanded, `<CollapsibleContent>` renders inside `<CardContent>`:

| Field | API field | Input type | Label | Placeholder |
|---|---|---|---|---|
| Normal Overtime Rate | `configurationException.normalOvertimeRate` | `number` | Normal Overtime Rate (×) | "System default" |
| Special Overtime Rate | `configurationException.specialOvertimeRate` | `number` | Special Overtime Rate (×) | "System default" |
| Standard Working Hours | `configurationException.standardWorkingHours` | `number` | Standard Working Hours (hrs/day) | "System default" |
| Working Day Start Time | `configurationException.workingDayStartTime` | `time` (step=60) | Working Day Start Time | — |
| Late Balance Limit | `configurationException.lateBalanceLimit` | `number` | Late Balance Limit (hrs/month) | "System default" |
| Leave Balance Limit | `configurationException.leaveBalanceLimit` | `number` | Leave Balance Limit (days/year) | "System default" |

Layout: `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">`.

**Info callout** (always visible when section is expanded):
```tsx
<Alert className="mt-4 border-violet-200 bg-violet-50">
  <Info className="h-4 w-4 text-violet-600" />
  <AlertDescription className="text-violet-800 text-sm">
    Blank fields inherit the system default from Payroll Settings.
    Set a value only to override for this specific employee.
  </AlertDescription>
</Alert>
```

**Part-time warning** (shown above the grid when `employeeType === 'PART_TIME'`):
```tsx
<Alert className="mb-4 border-amber-200 bg-amber-50">
  <AlertTriangle className="h-4 w-4 text-amber-600" />
  <AlertDescription className="text-amber-800 text-sm">
    Policy overrides have no effect for part-time employees. Part-time
    payroll uses only hours worked × hourly rate.
  </AlertDescription>
</Alert>
```

**Null handling**: When `employee.configurationException` is null, all override fields initialize as empty strings. On submit: if all override fields are empty strings / null, send `configurationException: null` (or omit key). If any field has a value, send the full `configurationException` object with `null` for unfilled fields.

---

### Fields & Validation

Schema lives in `src/features/employees/schemas/update-employee.schema.ts`.

```ts
const configurationExceptionSchema = z.object({
  normalOvertimeRate:   z.coerce.number().min(0).optional().nullable(),
  specialOvertimeRate:  z.coerce.number().min(0).optional().nullable(),
  standardWorkingHours: z.coerce.number().min(0).max(24).optional().nullable(),
  lateBalanceLimit:     z.coerce.number().min(0).optional().nullable(),
  leaveBalanceLimit:    z.coerce.number().min(0).optional().nullable(),
  workingDayStartTime:  z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
}).optional().nullable();

const updateEmployeeSchema = z.object({
  firstName:             z.string().max(100).optional().or(z.literal('')),
  lastName:              z.string().max(100).optional().or(z.literal('')),
  phoneNumber:           z.string().max(30).optional().or(z.literal('')),
  address:               z.string().max(500).optional().or(z.literal('')),
  department:            z.string().max(100).optional().or(z.literal('')),
  position:              z.string().max(100).optional().or(z.literal('')),
  basicSalary:           z.coerce.number().min(0).optional().nullable(),
  hourlyRate:            z.coerce.number().min(0).optional().nullable(),
  dateOfBirth:           z.string().optional().nullable(),  // YYYY-MM-DD
  hireDate:              z.string().optional().nullable(),  // YYYY-MM-DD
  employeeType:          z.enum(['FULL_TIME', 'PART_TIME']).optional().nullable(),
  managerId:             z.coerce.number().int().positive().optional().nullable(),
  configurationException: configurationExceptionSchema,
});
```

**Client-side hints** (non-blocking, shown as `<FormMessage>` in warning style):
- `dateOfBirth`: if set, must be before today and age >= 16.
- `hireDate`: if set and in the future, show: "This date is in the future — are you sure?"
- `standardWorkingHours`: if set and > 12, show: "This exceeds a standard full day."

---

### Interactions

| Action | Result |
|---|---|
| Page loads from list click | Data pre-loaded from cache. Form initializes with current values. No spinner in typical flow. |
| Page loads via direct URL | Fetch runs. Loading skeleton shown. Form initializes on data arrival. |
| Expand Policy Overrides | Section opens with animation. |
| Edit any field | Form becomes dirty (`form.formState.isDirty === true`). |
| Change Employee Type | Compensation notes update in real time. Policy override warning updates. |
| Click Save Changes (top or bottom) | Validate all fields. Call `PUT /api/employee/admin/{id}`. Button shows spinner + "Saving...". |
| Save success | Toast: `"Changes saved successfully"`. Invalidate `['employees']`. Form `reset()` to saved values. `isDirty` clears. |
| Save error | `<Alert variant="destructive">` above sticky footer. Inputs re-enabled. |
| Navigate away with dirty form | TanStack Router `beforeNavigate` guard triggers `<AlertDialog>`: "Unsaved changes — Leave anyway?" |
| Click breadcrumb with dirty form | Same `<AlertDialog>` guard. |
| Click breadcrumb with clean form | `router.navigate({ to: '/admin/employees' })` immediately. |

---

### States

**Loading** (cold fetch):
- Hero card: `<Skeleton className="h-16 w-16 rounded-full" />` + two `<Skeleton>` lines for name and code.
- Each section card: field labels replaced with `<Skeleton className="h-4 w-24 mb-1" />`, inputs replaced with `<Skeleton className="h-9 w-full rounded-md" />`.

**Employee not found** (invalid ID or stale link):
```tsx
<div className="flex flex-col items-center justify-center py-24">
  <UserX className="h-12 w-12 text-neutral-300 mb-4" />
  <p className="text-base font-medium text-neutral-600">Employee not found</p>
  <p className="text-sm text-neutral-400 mt-1">This employee may have been removed or the link is invalid.</p>
  <Button variant="outline" className="mt-6"
          onClick={() => router.navigate({ to: '/admin/employees' })}>
    Back to Employees
  </Button>
</div>
```

**Saving** (submit in progress):
- Both Save buttons: `<Loader2 className="animate-spin" /> "Saving..."`, disabled.
- All form inputs `disabled`.
- No overlay — inputs disable in place.

**Saved** (success):
- Form re-initializes: `form.reset(savedData)`. `isDirty` clears.
- Navigation guard deactivated.
- Toast appears bottom-right.

**API save error**:
- `<Alert variant="destructive">` with `AlertCircle` + server `message` or fallback text, rendered above the sticky bottom bar.
- All inputs re-enabled.
- No toast on error — inline alert is sufficient.

---

### Dev Notes

1. **Route title**: Set `context: { title: 'Employees' }` in the `$employeeId` route definition — same title as the list. The breadcrumb provides page-level distinction.
2. **Route loader**: Add `loader: ({ context: { queryClient } }) => queryClient.ensureQueryData({ queryKey: ['employees'], queryFn: fetchEmployees })` in the route file. This pre-warms the cache.
3. **Form initialization**: `useEffect(() => { if (employee) form.reset(mapEmployeeToFormValues(employee)); }, [employee?.employeeId])`. Write a pure `mapEmployeeToFormValues(e: Employee): UpdateEmployeeFormValues` utility that converts API nulls to empty strings for text fields and retains numbers for numeric fields.
4. **`configurationException` null handling**: If `employee.configurationException` is null, default all override fields to `''` in the form. Before sending the API payload, convert empty strings to `null` and check whether all override fields are null — if so, send `configurationException: null`.
5. **`workingDayStartTime` format**: Backend returns `HH:mm:ss`. `<Input type="time">` expects `HH:mm`. On load: `value.slice(0, 5)`. On submit: append `:00` → `"${formValue}:00"`.
6. **Manager select**: Exclude `employee.employeeId === currentEmployee.employeeId` from the options list to prevent an employee being their own manager.
7. **Two save buttons, one form**: Both buttons are `type="submit"` inside the same `<form>` element that wraps the entire page content. This is valid HTML and works correctly with React Hook Form's `handleSubmit`.
8. **Sticky bottom save bar**: `<div className="sticky bottom-0 bg-neutral-50/95 backdrop-blur-sm border-t border-neutral-200 py-3 px-6 flex justify-end mt-6">`. The `bg-neutral-50/95 backdrop-blur-sm` gives a frosted glass effect over scrolling content.
9. **Dirty navigation guard**: TanStack Router v1 — use `router.subscribe` or the `useBlocker` pattern (if available in the installed version) to intercept navigation when `form.formState.isDirty`. Fallback: attach `window.onbeforeunload` as a safety net for tab close.
10. **No email/username/password fields**: `PUT /api/employee/admin/{id}` does not accept these fields. Credentials are managed separately. Render `employee.email` as read-only text in the hero card only — do not include it in the form.
11. **`<Textarea>` import**: `import { Textarea } from '@/components/ui/textarea'`. Install via `npx shadcn@latest add textarea` if not present.
12. **`<Collapsible>` import**: Install via `npx shadcn@latest add collapsible`.
13. **lucide-react icons needed**: `ChevronLeft`, `ChevronDown`, `ChevronRight`, `Info`, `AlertTriangle`, `UserX`, `Loader2`, `AlertCircle`.
14. **shadcn components needed**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `Textarea`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.

---

## Feature Folder Structure

```
src/features/employees/
├── api/
│   └── employees.api.ts            # fetchEmployees, createEmployee, updateEmployee
├── components/
│   ├── employee-columns.tsx         # TanStack Table column definitions
│   ├── employee-table.tsx           # DataTable wrapper with search + filter
│   ├── create-employee-dialog.tsx   # Screen 2: Dialog + form
│   └── employee-form-sections/
│       ├── basic-info-section.tsx
│       ├── employment-details-section.tsx
│       ├── compensation-section.tsx
│       └── policy-overrides-section.tsx
├── hooks/
│   ├── use-employees.ts             # useQuery(['employees'])
│   ├── use-create-employee.ts       # useMutation → POST /api/employee
│   └── use-update-employee.ts       # useMutation → PUT /api/employee/admin/{id}
├── schemas/
│   ├── create-employee.schema.ts
│   └── update-employee.schema.ts
├── types/
│   └── employee.types.ts            # Employee, ConfigurationException interfaces
├── utils/
│   └── generate-password.ts
└── index.ts                         # Public exports only
```

---

## shadcn Components Summary

| Component | Screen(s) |
|---|---|
| `DataTable` (TanStack Table pattern) | Screen 1 |
| `Input` | All |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` | Screen 1 (filter), Screen 2, Screen 3 |
| `Badge` | Screen 1, Screen 3 (hero) |
| `Avatar`, `AvatarFallback` | Screen 1, Screen 3 |
| `Button` | All |
| `Skeleton` | Screen 1 (loading), Screen 3 (loading) |
| `Alert`, `AlertDescription` | All |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | Screen 2 |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | Screen 2, Screen 3 |
| `Switch` | Screen 2 (generate password) |
| `Separator` | Screen 2 |
| `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` | Screen 2 (discard), Screen 3 (navigate away) |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | Screen 3 |
| `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | Screen 3 |
| `Textarea` | Screen 3 |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | Screen 1 (optional — truncated cell hover tooltips) |

## lucide-react Icons Summary

| Icon | Used in |
|---|---|
| `Plus` | Screen 1 (new employee button + empty state button) |
| `ChevronRight` | Screen 1 (row action), Screen 3 (collapsible closed) |
| `ChevronLeft` | Screen 3 (breadcrumb) |
| `ChevronDown` | Screen 3 (collapsible open) |
| `Users` | Screen 1 (empty state illustration) |
| `SearchX` | Screen 1 (no-results illustration) |
| `AlertCircle` | Screen 1 (fetch error), Screen 2 (submit error), Screen 3 (save error) |
| `Eye`, `EyeOff` | Screen 2 (password visibility toggle) |
| `Copy`, `Check` | Screen 2 (copy generated password) |
| `Loader2` | Screen 2 (creating), Screen 3 (saving) |
| `Info` | Screen 3 (policy override info callout) |
| `AlertTriangle` | Screen 3 (part-time policy warning) |
| `UserX` | Screen 3 (employee not found) |
