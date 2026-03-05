# Design Spec — Admin Project Management
**Date**: 2026-03-05
**Designer**: UI/UX Designer Agent
**Status**: Ready for implementation

---

## Navigation Flow

```
/admin/projects  (Screen 1 — Project List)
    │
    ├── [+ New Project] button  →  Create Project Dialog (Screen 2)
    │                                    │
    │                                    └── on success → dismiss dialog,
    │                                        invalidate query, row appears in list
    │
    └── Click any project row  →  /admin/projects/$projectId  (Screen 3)
                                        │
                                        ├── [Close Project] button → confirmation dialog
                                        │       └── PUT /api/projects/close/{id}
                                        │
                                        └── [← Back] breadcrumb  →  /admin/projects
```

Data strategy: `GET /api/projects` is fetched on Screen 1. Result is cached via TanStack Query with key `['projects']`. Screen 3 also calls `GET /api/projects/{id}` directly — this endpoint exists and returns a single project, so no cache-filtering hack is needed. The list cache is still used to pre-populate the form fields on quick navigation.

---

## Screen 1 — Project List (`/admin/projects`)

### Purpose
Gives admins a scannable, searchable table of all projects with quick access to create a new project or drill into any project's detail page.

---

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN NAVBAR (fixed, h-14)  →  title: "Projects"                   │
├──────────────────────────────────────────────────────────────────── │
│  bg-neutral-50, pt-14, px-6, py-6                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  [Page header row]                                            │  │
│  │  "Projects"  text-2xl font-semibold      [+ New Project btn]  │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  [Filter / search bar row]                                    │  │
│  │  [Search input]           [Status filter Select]              │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  [DataTable]                                                  │  │
│  │  Name/Code   Description   Start    End    Status   Action    │  │
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
| Page header container | `<div>` | `flex items-center justify-between` |
| Page heading | `<h1>` | `text-2xl font-semibold text-neutral-900` |
| New project button | `<Button>` | `variant="default"`, `className="bg-violet-600 hover:bg-violet-700"`, `Plus` icon prefix |
| Search field | `<Input>` | `type="search"`, `placeholder="Search by name or code..."` |
| Status filter | `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>` | Filter by status or All |
| Project table | shadcn `DataTable` pattern | TanStack Table v8, columns defined separately |
| Status badge | `<Badge>` | Color per status — see badge spec below |
| Row action button | `<Button variant="ghost" size="icon">` | `ChevronRight` icon, triggers navigation |
| Empty state | Custom `<div>` | Centered icon + text (see States) |
| Loading skeleton | `<Skeleton>` | Table rows placeholder |
| Error state | `<Alert>` | `variant="destructive"` |
| Pagination | shadcn DataTable pagination controls | Rows per page selector + prev/next |

---

### Table Columns

| Column | Source field | Display | Width |
|---|---|---|---|
| Project | `projectName` + `projectCode` | Name bold + code below in `text-xs text-neutral-500 font-mono` | auto, flex-grow |
| Description | `description` | Truncated to 1 line, `text-sm text-neutral-500`, `—` when null | auto |
| Start | `startDate` | Formatted `dd MMM yyyy`, `—` when null | `w-28` |
| End | `endDate` | Formatted `dd MMM yyyy`, `—` when null | `w-28` |
| Status | `status` | `<Badge>` — see badge spec | `w-32` |
| Action | — | `<Button variant="ghost" size="icon">` with `ChevronRight` | `w-12` |

**Name + code cell**:
```tsx
<div className="min-w-0">
  <p className="text-sm font-medium text-neutral-900 truncate">{projectName}</p>
  <p className="text-xs text-neutral-500 font-mono">{projectCode}</p>
</div>
```

**Status badge styles**:
- `ACTIVE`: `<Badge className="bg-green-50 text-green-700 border border-green-200 font-medium">Active</Badge>`
- `COMPLETED`: `<Badge className="bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium">Completed</Badge>`
- `ON_HOLD`: `<Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium">On Hold</Badge>`
- `CANCELLED`: `<Badge className="bg-red-50 text-red-700 border border-red-200 font-medium">Cancelled</Badge>`

All badges use `variant="outline"` as the base, with className overrides for color. Avoid using shadcn's built-in color variants — apply explicit Tailwind classes so the colors match the design system exactly.

---

### Search & Filter Behavior

- Search input: client-side filter on the in-memory project list. Matches `projectName` and `projectCode` — case-insensitive, substring match.
- Status filter `<Select>`:
  - Options: "All statuses" (default, value `""`), "Active" (`"ACTIVE"`), "Completed" (`"COMPLETED"`), "On Hold" (`"ON_HOLD"`), "Cancelled" (`"CANCELLED"`)
  - Client-side — no additional API call.
- Both filters compose with AND logic.
- Debounce the search input: 200ms with `useState` + `useMemo`.
- Filter row layout: `<div className="flex items-center gap-3">` — search input is `flex-1 max-w-xs`, status select is `w-44`.

---

### Fields & Validation

No form fields on this screen. Inputs are filters only — no validation required.

---

### Interactions

| Action | Result |
|---|---|
| Type in search | List filters in real time (200ms debounce) |
| Change status filter | List filters immediately |
| Click [+ New Project] | Opens Create Project Dialog (Screen 2) |
| Click any row or `ChevronRight` | `router.navigate({ to: '/admin/projects/$projectId', params: { projectId: String(project.projectId) } })` |
| Entire row is clickable | Row has `cursor-pointer hover:bg-neutral-50` — row body click navigates; chevron also serves keyboard users |

---

### States

**Loading** (initial fetch):
- Replace table body with 6 `<Skeleton className="h-12 w-full rounded-md" />` rows inside a `space-y-2` container.
- Filter controls and header render immediately.

**Empty — no projects exist**:
```tsx
<div className="flex flex-col items-center justify-center py-24 text-center">
  <FolderKanban className="h-12 w-12 text-neutral-300 mb-4" />
  <p className="text-base font-medium text-neutral-600">No projects yet</p>
  <p className="text-sm text-neutral-400 mt-1">Create your first project to get started.</p>
  <Button className="mt-6 bg-violet-600 hover:bg-violet-700" onClick={openCreateDialog}>
    <Plus className="h-4 w-4 mr-2" /> New Project
  </Button>
</div>
```

**Empty — filters produce no results**:
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <SearchX className="h-10 w-10 text-neutral-300 mb-3" />
  <p className="text-sm font-medium text-neutral-600">No projects match your search</p>
  <p className="text-xs text-neutral-400 mt-1">Try adjusting your search or filter.</p>
</div>
```

**Error** (fetch failed):
```tsx
<Alert variant="destructive" className="max-w-lg mx-auto mt-8">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Failed to load projects. Please refresh the page.</AlertDescription>
</Alert>
```

---

### Dev Notes

1. **Route title**: Set `context: { title: 'Projects' }` in the route definition so the admin navbar picks up the page title automatically.
2. **Query key**: Use `['projects']` as the TanStack Query key for `GET /api/projects`. This is the shared list cache.
3. **TanStack Table**: Column definitions in `src/features/projects/components/project-columns.tsx`. Table component in `src/features/projects/components/project-table.tsx`.
4. **Row click navigation**: Attach `onClick` to the `<tr>` element via TanStack Table row meta callback pattern. Do not put a `<Link>` inside a `<td>`.
5. **Pagination**: Default page size 10. Provide rows-per-page selector: 10, 25, 50.
6. **Date formatting**: Use a shared `formatDate(dateString: string | null): string` utility in `src/lib/utils.ts`. When null, return `"—"`. Format as `dd MMM yyyy` (e.g. "01 Jan 2026").
7. **No extra permission gates**: The `/admin/projects` route is protected by the admin guard already.
8. **lucide-react icons needed**: `Plus`, `ChevronRight`, `FolderKanban`, `SearchX`, `AlertCircle`.
9. **shadcn components to install if not present**: `Skeleton`, `Select`, `Badge`.

---

## Screen 2 — Create Project (Dialog)

### Purpose
A focused modal form for creating a new project. Minimal — collects only what is needed to establish the project record. Admins can fill in start/end dates and set status immediately, or leave them for later via the edit form on Screen 3.

---

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Dialog Header                                          │
│  "New Project"                                          │
│  "Add a new project. You can assign employees after     │
│   creation."                                            │
├─────────────────────────────────────────────────────────┤
│  Project Name *    [input]                              │
│  Project Code *    [input]  ← unique identifier         │
│  Description       [textarea]                           │
│  Start Date        [date input]                         │
│  End Date          [date input]                         │
│  Status            [Select]                             │
│                                                         │
│  [Error alert — conditional]                            │
├─────────────────────────────────────────────────────────┤
│  [Cancel]                        [Create Project]       │
└─────────────────────────────────────────────────────────┘
```

Dialog dimensions: `<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">`

---

### Components

| Component | shadcn name | Usage |
|---|---|---|
| Modal container | `<Dialog>`, `<DialogContent>` | Focus trap, close on Escape (with dirty check) |
| Header | `<DialogHeader>`, `<DialogTitle>`, `<DialogDescription>` | Title + subtitle |
| Form wrapper | `<form>` via React Hook Form `handleSubmit` | All fields |
| Project Name field | `Field`, `FieldGroup`, `FieldLabel`, `FieldError` from `@/components/ui/field` + `<Input>` | Required |
| Project Code field | `Field`, `FieldGroup`, `FieldLabel`, `FieldError` + `<Input>` | Required, unique |
| Description field | `Field`, `FieldGroup`, `FieldLabel`, `FieldError` + `<Textarea rows={3}>` | Optional |
| Start Date field | `Field`, `FieldGroup`, `FieldLabel`, `FieldError` + `<Input type="date">` | Optional |
| End Date field | `Field`, `FieldGroup`, `FieldLabel`, `FieldError` + `<Input type="date">` | Optional |
| Status field | `Field`, `FieldGroup`, `FieldLabel`, `FieldError` + `<Select>` | Optional, defaults ACTIVE |
| Error alert | `<Alert variant="destructive">` | API-level errors (e.g., duplicate code) |
| Footer | `<DialogFooter>` | Cancel + submit buttons |
| Cancel | `<Button variant="outline">` | Closes dialog (dirty check first) |
| Submit | `<Button className="bg-violet-600 hover:bg-violet-700">` | Spinner when pending |
| Discard confirm | `<AlertDialog>` | "Discard changes?" when cancelling a dirty form |

**Important**: Use `Field`, `FieldGroup`, `FieldLabel`, `FieldError` from `@/components/ui/field` for all form fields — NOT the deprecated `FormField` / `FormItem` / `FormLabel` / `FormMessage` shadcn Form components.

---

### Fields & Validation

Schema lives in `src/features/projects/schemas/create-project.schema.ts`.

| Field | Input type | Label | Required | Validation |
|---|---|---|---|---|
| `projectName` | `text` | Project Name | Yes | Min 1 char. Max 200 chars. |
| `projectCode` | `text` | Project Code | Yes | Min 1 char. Max 50 chars. No spaces: `/^\S+$/`. Uppercase on blur (UX hint — not enforced by Zod). |
| `description` | `textarea` | Description | No | Max 2000 chars. |
| `startDate` | `date` | Start Date | No | Valid ISO date. If endDate is set, startDate must be <= endDate. |
| `endDate` | `date` | End Date | No | Valid ISO date. If startDate is set, endDate must be >= startDate. |
| `status` | `select` | Status | No | Enum: `ACTIVE \| COMPLETED \| ON_HOLD \| CANCELLED`. Defaults to `ACTIVE` when not selected. |

**Zod schema shape**:
```ts
const createProjectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(200),
  projectCode: z.string().min(1, 'Project code is required').max(50).regex(/^\S+$/, 'Code cannot contain spaces'),
  description: z.string().max(2000).optional().or(z.literal('')),
  startDate:   z.string().optional().or(z.literal('')),
  endDate:     z.string().optional().or(z.literal('')),
  status:      z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
}).refine(
  data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'End date must be on or after start date', path: ['endDate'] }
);
```

**Status Select options**:
- Placeholder: "Select status (defaults to Active)"
- Options: Active (`ACTIVE`), Completed (`COMPLETED`), On Hold (`ON_HOLD`), Cancelled (`CANCELLED`)
- When no status selected, send `"ACTIVE"` in the payload.

**Project Code UX**: Show a `<p className="text-xs text-neutral-400 mt-1">Unique identifier for this project. Cannot be changed later.</p>` hint below the code field. This is a UX note only — the backend does allow updates via PUT, but the UX hint discourages casual edits since code is used as a reference ID.

---

### Interactions

| Action | Result |
|---|---|
| Open dialog | Form resets to empty defaults. Focus placed on Project Name field. |
| Submit valid form | Call `POST /api/projects`. Button shows spinner + "Creating...". All inputs disabled. |
| Submit success | Dialog closes. Toast: `"Project created successfully"`. Invalidate `['projects']` query. |
| Submit error — duplicate code | `<Alert variant="destructive">` appears above footer with server `message` verbatim. Fields re-enabled. |
| Submit error — other | Same alert with server `message` or fallback: `"Something went wrong. Please try again."` |
| Click Cancel (clean form) | Dialog closes immediately. |
| Click Cancel (dirty form) | `<AlertDialog>` appears: title "Discard changes?", message "Your unsaved changes will be lost.", buttons "Keep editing" / "Discard". Discard closes the main dialog. |
| Press Escape | Same dirty-check behavior as Cancel. |

---

### States

**Idle (open, clean)**: Fields empty (Status placeholder shown), Submit button labeled "Create Project".

**Submitting**: All inputs `disabled`. Submit button: `<Loader2 className="animate-spin h-4 w-4 mr-2" /> "Creating..."`. Cancel disabled.

**Submit error**: Alert above footer. Inputs re-enabled. Alert clears when any field changes.

**Closed**: `<Dialog open={false}>` — shadcn unmounts content, nothing rendered.

---

### Dev Notes

1. **Dialog open state**: Managed in parent (`ProjectListPage`) via `const [createOpen, setCreateOpen] = useState(false)`. Pass `open` and `onOpenChange` as props.
2. **Form reset on open**: `useEffect(() => { if (open) form.reset(defaultValues); }, [open])`.
3. **Default values**: `{ projectName: '', projectCode: '', description: '', startDate: '', endDate: '', status: undefined }`.
4. **Dirty check**: Use `form.formState.isDirty`.
5. **Null field handling**: Strip empty strings before sending. Convert `''` to `undefined`/omit from payload. Status: if `undefined`, send `'ACTIVE'`.
6. **Toast**: Use shadcn `useToast` from `src/components/ui/use-toast`.
7. **Field from `@/components/ui/field`**: This is the project-standard field wrapper. The dev must import `Field`, `FieldGroup`, `FieldLabel`, `FieldError` from `@/components/ui/field` and wire them to `react-hook-form` using `register` or `Controller` pattern — not the shadcn Form adapter.
8. **lucide-react icons**: `Loader2`.
9. **shadcn components needed**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `Textarea`, `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.

---

## Screen 3 — Project Detail (`/admin/projects/$projectId`)

### Purpose
A full-page view for a single project with two distinct sections: an editable project info form and an employee assignments panel. The assignments panel is a forward-compatible placeholder — it renders a clear "no data available" state because the backend has no GET assignments endpoint yet.

---

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ADMIN NAVBAR (fixed, h-14)  →  title: "Projects"                   │
├─────────────────────────────────────────────────────────────────────┤
│  bg-neutral-50, pt-14, px-6, py-6                                   │
│                                                                     │
│  ← Projects  (breadcrumb)                                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  [Project hero card]                                        │    │
│  │  Project Name (h1)          [Status Badge]                  │    │
│  │  projectCode (mono)                                         │    │
│  │  Start: dd MMM yyyy  →  End: dd MMM yyyy  (or "—")          │    │
│  │                                           [Save Changes]    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Section 1: Project Info  (Card, full width)                 │   │
│  │  ──────────────────────────────────────────────────────────  │   │
│  │  Project Name *      [input]                                 │   │
│  │  Project Code *      [input]                                 │   │
│  │  Description         [textarea]                              │   │
│  │  Start Date    [date]    End Date    [date]                   │   │
│  │  Status              [Select]                                │   │
│  │                                                              │   │
│  │  ─────────────────  Danger Zone  ──────────────────          │   │
│  │  [Close Project button] — only when status != COMPLETED      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Section 2: Assigned Employees  (Card, full width)           │   │
│  │  [+ Assign Employee]  (top right of card header)             │   │
│  │  ──────────────────────────────────────────────────          │   │
│  │  [Placeholder panel — no data available yet]                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Sticky bottom bar: Save Changes, right-aligned]                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Components

| Component | shadcn name | Usage |
|---|---|---|
| Breadcrumb | TanStack `<Link>` with `ChevronLeft` icon | Back to `/admin/projects` |
| Hero card | `<Card>` | Project identity summary at top of page |
| Hero name | `<h1 className="text-xl font-semibold text-neutral-900">` | projectName |
| Hero code | `<span className="text-sm text-neutral-400 font-mono">` | projectCode |
| Hero status badge | `<Badge>` | Same styles as Screen 1 |
| Hero date range | `<p className="text-sm text-neutral-500">` | "12 Jan 2026 → 30 Jun 2026" or "—" per field |
| Project info card | `<Card>` + `<CardHeader>` + `<CardContent>` | Section 1 |
| Card title | `<CardTitle className="text-base font-semibold text-neutral-900">` | "Project Info" |
| Card description | `<CardDescription>` | "Update project details and status." |
| All form fields | `Field`, `FieldGroup`, `FieldLabel`, `FieldError` from `@/components/ui/field` | All text, date, select inputs |
| Name input | `<Input>` | Required text field |
| Code input | `<Input>` | Required text field |
| Description | `<Textarea rows={4}>` | Optional |
| Start / End date | `<Input type="date">` | Optional, in a 2-col grid |
| Status select | `<Select>` | ACTIVE / COMPLETED / ON_HOLD / CANCELLED |
| Danger zone separator | `<Separator />` + label | `<p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Danger Zone</p>` |
| Close Project button | `<Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">` | Only shown when status !== 'COMPLETED' |
| Close confirmation | `<AlertDialog>` | Separate from save flow — uses close endpoint |
| Assignments card | `<Card>` + `<CardHeader>` + `<CardContent>` | Section 2 |
| Assign employee button | `<Button variant="outline" size="sm">` with `UserPlus` icon | Opens Assign Employee Dialog |
| Assign dialog | `<Dialog>` | See Assign Employee Dialog below |
| Assignments placeholder | Custom `<div>` | Backend limitation placeholder (see States) |
| Save error alert | `<Alert variant="destructive">` | API errors, above sticky footer |
| Loading skeleton | `<Skeleton>` | Hero + form fields while loading |
| Not found state | Custom `<div>` | Invalid or deleted project ID |
| Sticky save bar | `<div>` | Fixed to bottom with backdrop blur |
| Save button (hero) | `<Button className="bg-violet-600 hover:bg-violet-700">` | `type="submit"` |
| Save button (sticky) | Same | `type="submit"`, same form |
| Discard confirm | `<AlertDialog>` | Dirty navigation guard |

---

### Data Loading Strategy

Screen 3 uses a direct fetch for the single project — `GET /api/projects/{id}` — because that endpoint exists and is reliable. This avoids the cache-filtering complexity used in the employee feature.

```ts
// Route loader — add to $projectId route definition
loader: ({ params, context: { queryClient } }) =>
  queryClient.ensureQueryData({
    queryKey: ['projects', params.projectId],
    queryFn: () => apiClient.get(`/api/projects/${params.projectId}`).then(r => r.data.data),
  })
```

Query key: `['projects', projectId]` (string). The list uses `['projects']`. Both are invalidated on successful save, close, or delete.

If the route loader throws a 404 (server returns `status: "error"`), catch it in the component and render the Not Found state instead of crashing.

---

### Section 1 — Project Info

**CardTitle**: "Project Info" | **CardDescription**: "Update project details and status."

#### Fields

| Field | API field | Input type | Label | Required | Validation |
|---|---|---|---|---|---|
| Project Name | `projectName` | `text` | Project Name | Yes | Min 1, max 200 |
| Project Code | `projectCode` | `text` | Project Code | Yes | Min 1, max 50, no spaces |
| Description | `description` | `textarea` | Description | No | Max 2000 chars |
| Start Date | `startDate` | `date` | Start Date | No | ISO date, <= endDate if both set |
| End Date | `endDate` | `date` | End Date | No | ISO date, >= startDate if both set |
| Status | `status` | `select` | Status | Yes | Enum — same 4 values |

Layout: Name and Code are full-width, stacked. Start + End in `<div className="grid grid-cols-2 gap-3">`. Description and Status full-width.

**Status Select options** (with small inline badge preview — optional UX touch):
- Active (value `ACTIVE`)
- On Hold (value `ON_HOLD`)
- Cancelled (value `CANCELLED`)
- Completed (value `COMPLETED`) — note: prefer using the Close Project button for completion; setting status directly via this select is also valid.

#### Danger Zone — Close Project

Rendered below a `<Separator />` inside the project info card. Only visible when `project.status !== 'COMPLETED'`.

```tsx
<div className="pt-4">
  <Separator className="mb-4" />
  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
    Danger Zone
  </p>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-neutral-700">Close this project</p>
      <p className="text-xs text-neutral-500 mt-0.5">
        Marks the project as Completed. Employees will no longer be able to log hours.
      </p>
    </div>
    <Button
      type="button"
      variant="outline"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 ml-6 shrink-0"
      onClick={() => setCloseDialogOpen(true)}
    >
      <XCircle className="h-4 w-4 mr-2" />
      Close Project
    </Button>
  </div>
</div>
```

**Close Project Confirmation Dialog** (`<AlertDialog>`):

```
┌─────────────────────────────────────────────────┐
│  Close this project?                            │
│                                                 │
│  This will mark "{projectName}" as Completed.   │
│  Employees will no longer be able to log hours  │
│  against it. This action cannot be undone via   │
│  the UI.                                        │
│                                                 │
│  [Cancel]              [Close Project]          │
└─────────────────────────────────────────────────┘
```

- "Close Project" button: `className="bg-red-600 hover:bg-red-700 text-white"`, shows spinner when pending.
- On confirm: call `PUT /api/projects/close/{id}` (no request body).
- On success: toast `"Project closed successfully"`. Invalidate `['projects']` and `['projects', projectId]`. Navigate to `/admin/projects` (or stay on page with updated data — navigate is cleaner UX).
- On error: close the AlertDialog, show `<Alert variant="destructive">` on the page.

---

### Section 2 — Assigned Employees (Placeholder)

**CardTitle**: "Assigned Employees" | **CardDescription**: "Employees currently assigned to this project."

The card header row is `flex items-center justify-between`:
- Left: `<CardTitle>` + `<CardDescription>` stacked
- Right: `<Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-2" /> Assign Employee</Button>`

#### Placeholder Panel (No GET assignments endpoint)

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
  <Users className="h-10 w-10 text-neutral-300 mb-3" />
  <p className="text-sm font-medium text-neutral-500">Assignment list coming soon</p>
  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
    Viewing existing assignments is not yet supported. You can still assign new employees
    using the button above.
  </p>
</div>
```

This placeholder is permanent until a `GET /api/projects/{id}/assignments` endpoint is added to the backend. When that endpoint is ready, replace this panel with a table using the same column pattern as Screen 1. No removal endpoint exists yet either, so the assignment table would initially be read-only.

#### Assign Employee Dialog

Triggered by the "Assign Employee" button. A `<Dialog>` (not AlertDialog).

```
┌──────────────────────────────────────────────────────┐
│  Assign Employee                                     │
│  "Assign an employee to this project."               │
├──────────────────────────────────────────────────────┤
│  Employee *        [Select — search employees]       │
│  Role in Project   [input, free text]                │
│  Allocation %      [number input, 0–100]             │
│  Assigned Date     [date input]                      │
│  End Date          [date input]                      │
│                                                      │
│  [Error alert — conditional]                         │
├──────────────────────────────────────────────────────┤
│  [Cancel]                      [Assign]              │
└──────────────────────────────────────────────────────┘
```

The dialog requires the employees list (`GET /api/employee`) to populate the employee select. Use TanStack Query with key `['employees']` — this is the same cache key used by the employee feature, so it will often already be warm.

**Employee select**: `<Select>` with searchable pattern. Options: `{ value: String(emp.employeeId), label: [fullName || employeeCode] }`. If employees list is loading, show a disabled select with "Loading employees..." placeholder.

**Fields & Validation** (schema in `src/features/projects/schemas/assign-employee.schema.ts`):

| Field | API field | Label | Required | Validation |
|---|---|---|---|---|
| Employee | `employeeId` | Employee | Yes | Must select from list |
| Role in Project | `roleInProject` | Role in Project | No | Max 100 chars |
| Allocation % | `allocationPercentage` | Allocation % | No | Integer 0–100 |
| Assigned Date | `assignedDate` | Assigned Date | No | ISO date |
| End Date | `endDate` | End Date | No | ISO date, >= assignedDate if both set |

`projectId` is injected from the route param — not shown in the form.

```ts
const assignEmployeeSchema = z.object({
  employeeId:           z.coerce.number().int().positive('Please select an employee'),
  roleInProject:        z.string().max(100).optional().or(z.literal('')),
  allocationPercentage: z.coerce.number().int().min(0).max(100).optional(),
  assignedDate:         z.string().optional().or(z.literal('')),
  endDate:              z.string().optional().or(z.literal('')),
}).refine(
  data => {
    if (data.assignedDate && data.endDate) {
      return new Date(data.assignedDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'End date must be on or after assigned date', path: ['endDate'] }
);
```

**Interactions**:
- Submit: `POST /api/admin/projects/assignments` with `{ projectId, employeeId, roleInProject, allocationPercentage, assignedDate, endDate }`.
- On success: toast `"Employee assigned successfully"`. Dialog closes. Since there is no assignments list to refresh, no cache invalidation is needed beyond the assignment itself.
- On error (e.g., already assigned): alert inside dialog with server message.
- On Cancel (dirty): `<AlertDialog>` discard confirmation.

---

### Fields & Validation

Schema for the project edit form lives in `src/features/projects/schemas/update-project.schema.ts`.

```ts
const updateProjectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(200),
  projectCode: z.string().min(1, 'Project code is required').max(50).regex(/^\S+$/, 'Code cannot contain spaces'),
  description: z.string().max(2000).optional().or(z.literal('')),
  startDate:   z.string().optional().or(z.literal('')),
  endDate:     z.string().optional().or(z.literal('')),
  status:      z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
}).refine(
  data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'End date must be on or after start date', path: ['endDate'] }
);
```

---

### Interactions

| Action | Result |
|---|---|
| Page loads from list click | Data pre-loaded by loader. Form initializes. No spinner in typical flow. |
| Page loads via direct URL | Loader triggers fetch. Skeleton shown. Form initializes on arrival. |
| Edit any field | Form becomes dirty (`form.formState.isDirty === true`). |
| Click Save (top or bottom) | Validate all fields. Call `PUT /api/projects/{id}`. Button shows spinner + "Saving...". |
| Save success | Toast: `"Changes saved successfully"`. Invalidate `['projects']` and `['projects', projectId]`. `form.reset(savedData)`. |
| Save error | `<Alert variant="destructive">` above sticky footer. |
| Click Close Project | Opens close confirmation AlertDialog. |
| Close Project confirmed | `PUT /api/projects/close/{id}`. On success: toast + navigate to `/admin/projects`. |
| Click Assign Employee | Opens Assign Employee Dialog. |
| Navigate away with dirty form | TanStack Router `useBlocker` guard triggers AlertDialog. |
| Click breadcrumb with dirty form | Same AlertDialog guard. |
| Click breadcrumb clean | Navigate immediately. |

---

### States

**Loading** (cold fetch / direct URL):
- Hero card: `<Skeleton className="h-7 w-48 mb-2" />` for name, `<Skeleton className="h-4 w-24" />` for code, `<Skeleton className="h-5 w-20" />` for badge.
- Project info card: field labels replaced with `<Skeleton className="h-4 w-24 mb-1" />`, inputs replaced with `<Skeleton className="h-9 w-full rounded-md" />`.
- Assignments card shows placeholder immediately (no data to load).

**Project not found** (404 from server or invalid ID):
```tsx
<div className="flex flex-col items-center justify-center py-24 text-center">
  <FolderX className="h-12 w-12 text-neutral-300 mb-4" />
  <p className="text-base font-medium text-neutral-600">Project not found</p>
  <p className="text-sm text-neutral-400 mt-1">
    This project may have been deleted or the link is invalid.
  </p>
  <Button
    variant="outline"
    className="mt-6"
    onClick={() => router.navigate({ to: '/admin/projects' })}
  >
    Back to Projects
  </Button>
</div>
```

**Saving**:
- Both Save buttons: `<Loader2 className="animate-spin" /> "Saving..."`, disabled.
- All form inputs `disabled`.

**Saved** (success):
- Form re-initializes: `form.reset(savedData)`. `isDirty` clears.
- Navigation guard deactivates.
- Toast bottom-right.

**Save error**:
- `<Alert variant="destructive">` above sticky bottom bar.
- All inputs re-enabled.

**Close Project — in progress**:
- AlertDialog "Close Project" button shows `<Loader2 className="animate-spin h-4 w-4 mr-2" />`, disabled.
- AlertDialog Cancel disabled.

**COMPLETED project**:
- Danger Zone section is hidden entirely (not rendered).
- Status select still shows "Completed" but the admin can change it back via the normal Save flow if needed.
- No special read-only lock on the form — admins may reopen a completed project by changing status to ACTIVE and saving.

---

### Dev Notes

1. **Route title**: `context: { title: 'Projects' }` in the `$projectId` route definition.
2. **Route loader**:
   ```ts
   loader: ({ params, context: { queryClient } }) =>
     queryClient.ensureQueryData({
       queryKey: ['projects', params.projectId],
       queryFn: () =>
         apiClient.get<ApiResponse<Project>>(`/api/projects/${params.projectId}`)
           .then(r => {
             if (r.data.status === 'error') throw new Error('Not found');
             return r.data.data;
           }),
     })
   ```
3. **Form initialization**: `useEffect(() => { if (project) form.reset(mapProjectToFormValues(project)); }, [project?.projectId])`. Write a pure `mapProjectToFormValues(p: Project): UpdateProjectFormValues` utility.
4. **Null field handling on submit**: Convert `''` to `undefined`/`null` as needed. The PUT is a full replacement — always send all fields. Send `null` for startDate/endDate when empty, not `undefined`.
5. **`Field` component wiring**: Use `react-hook-form`'s `register` for text inputs and `Controller` for `Select` and `Textarea`. Example pattern:
   ```tsx
   <Field>
     <FieldGroup>
       <FieldLabel htmlFor="projectName">Project Name <span className="text-red-500">*</span></FieldLabel>
       <Input id="projectName" {...register('projectName')} />
       {errors.projectName && <FieldError>{errors.projectName.message}</FieldError>}
     </FieldGroup>
   </Field>
   ```
6. **Two save buttons, one form**: Both `type="submit"` inside the same `<form>`. Valid HTML, works with React Hook Form.
7. **Sticky bottom save bar**:
   ```tsx
   <div className="sticky bottom-0 bg-neutral-50/95 backdrop-blur-sm border-t border-neutral-200 py-3 px-6 flex justify-end mt-6">
     <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={isSubmitting}>
       {isSubmitting ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Saving...</> : 'Save Changes'}
     </Button>
   </div>
   ```
8. **Dirty navigation guard**: Use TanStack Router v1's `useBlocker` (if available) or subscribe to router events when `form.formState.isDirty`. Also attach `window.onbeforeunload` as tab-close safety net.
9. **Close Project is NOT a form submit**: The Close button is `type="button"` — it opens an AlertDialog, which has its own mutation (`useCloseProject`). The save form mutation and the close mutation are completely independent.
10. **Assign Employee dialog employees**: Fetch with `useQuery({ queryKey: ['employees'], queryFn: fetchEmployees })`. This is the same key as the employee feature — no double fetch if cache is warm.
11. **Query invalidation on save**: Invalidate both `['projects']` (list) and `['projects', projectId]` (detail) after any mutation.
12. **`workingDayStartTime` does not apply here**: No time inputs on this screen — only date inputs.
13. **lucide-react icons needed**: `ChevronLeft`, `XCircle`, `UserPlus`, `Users`, `FolderX`, `Loader2`, `AlertCircle`.
14. **shadcn components needed**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Separator`, `Textarea`, `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.

---

## Feature Folder Structure

```
src/features/projects/
├── api/
│   └── projects.api.ts              # fetchProjects, fetchProject, createProject,
│                                    # updateProject, closeProject, deleteProject,
│                                    # assignEmployee
├── components/
│   ├── project-columns.tsx          # TanStack Table column definitions
│   ├── project-table.tsx            # DataTable wrapper with search + filter
│   ├── create-project-dialog.tsx    # Screen 2: Dialog + form
│   ├── assign-employee-dialog.tsx   # Assign Employee dialog (Screen 3)
│   └── project-form.tsx             # Screen 3: Project info form sections
├── hooks/
│   ├── use-projects.ts              # useQuery(['projects'])
│   ├── use-project.ts               # useQuery(['projects', id])
│   ├── use-create-project.ts        # useMutation → POST /api/projects
│   ├── use-update-project.ts        # useMutation → PUT /api/projects/{id}
│   ├── use-close-project.ts         # useMutation → PUT /api/projects/close/{id}
│   └── use-assign-employee.ts       # useMutation → POST /api/admin/projects/assignments
├── schemas/
│   ├── create-project.schema.ts
│   ├── update-project.schema.ts
│   └── assign-employee.schema.ts
├── types/
│   └── project.types.ts             # Project, Assignment, HourLog interfaces
└── index.ts                         # Public exports only
```

---

## Status Badge Reference

| Status | Badge classes |
|---|---|
| `ACTIVE` | `bg-green-50 text-green-700 border border-green-200 font-medium` |
| `COMPLETED` | `bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium` |
| `ON_HOLD` | `bg-amber-50 text-amber-700 border border-amber-200 font-medium` |
| `CANCELLED` | `bg-red-50 text-red-700 border border-red-200 font-medium` |

Display labels: ACTIVE → "Active", COMPLETED → "Completed", ON_HOLD → "On Hold", CANCELLED → "Cancelled".

Extract as a reusable `<ProjectStatusBadge status={status} />` component in `src/features/projects/components/project-status-badge.tsx` — used in Screen 1 (table), Screen 3 (hero card), and potentially the assign dialog.

---

## shadcn Components Summary

| Component | Screen(s) |
|---|---|
| `DataTable` (TanStack Table pattern) | Screen 1 |
| `Input` | All |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` | Screen 1 (filter), Screen 2, Screen 3 |
| `Badge` | Screen 1, Screen 3 (hero) |
| `Button` | All |
| `Skeleton` | Screen 1 (loading), Screen 3 (loading) |
| `Alert`, `AlertDescription` | All |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | Screen 2, Screen 3 (assign dialog) |
| `Textarea` | Screen 2, Screen 3 |
| `Separator` | Screen 3 (danger zone) |
| `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` | Screen 2 (discard), Screen 3 (discard + close confirm) |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | Screen 3 |

## lucide-react Icons Summary

| Icon | Used in |
|---|---|
| `Plus` | Screen 1 (new project button + empty state button) |
| `ChevronRight` | Screen 1 (row action) |
| `ChevronLeft` | Screen 3 (breadcrumb) |
| `FolderKanban` | Screen 1 (empty state illustration) |
| `FolderX` | Screen 3 (project not found) |
| `SearchX` | Screen 1 (no-results illustration) |
| `AlertCircle` | Screen 1 (fetch error), Screen 2 (submit error), Screen 3 (save error) |
| `XCircle` | Screen 3 (close project button) |
| `UserPlus` | Screen 3 (assign employee button) |
| `Users` | Screen 3 (assignments placeholder) |
| `Loader2` | Screen 2 (creating), Screen 3 (saving, closing, assigning) |
