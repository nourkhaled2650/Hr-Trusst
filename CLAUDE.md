# Tce Trusst — Frontend

## Default Behavior

You are acting as the orchestrator defined in ~/.claude/agents/orchestrator.md
Read it before responding to anything.

## What This Is

React + TypeScript frontend for the Tce Trusst HR & Payroll system. Greenfield — being built fresh. Two layouts: Employee and Admin.

## Primary Agents for This Repo

- `uiux-designer` — designs screens and flows before frontend builds
- `frontend-developer` — builds React/TS code
- `qa-testing` — writes tests after features are complete and manually verified
- `security` — audits completed features

Full agent roster and workflows: `~/.claude/agents/orchestrator.md`

## Stack — Locked, No Deviation

- TypeScript — strict mode, no `any`, no `@ts-ignore`
- React 18+
- TanStack Router — file-based, type-safe
- TanStack Query v5 — all server state
- Zustand — global UI state only, never server data
- React Hook Form + Zod — all forms, schema first
- Axios — single instance in `lib/axios.ts` only
- shadcn/ui + Tailwind CSS
- Vitest + React Testing Library + Playwright

## Folder Structure

```
src/
├── routes/         # TanStack Router file-based routes
│   ├── _auth/
│   ├── _employee/
│   └── _admin/
├── features/       # One folder per feature — self-contained
├── components/
│   ├── ui/         # shadcn — never edit manually
│   └── shared/     # reusable app components
├── lib/            # axios.ts, query-client.ts, utils.ts
├── hooks/          # shared hooks (2+ features)
├── stores/         # Zustand stores
├── types/          # global types
└── constants/      # permissions, routes, query keys
```

## Roles & Layouts

- 3 roles: Employee, Sub-Admin, ADMIN
- 2 layouts: Employee (`_employee/`) and Admin (`_admin/`)
- Sub-Admin: admin layout, some elements hidden based on permissions handled frontend wise
- Hidden = not rendered. Never disabled. Never locked.
- Permission check: always via `useHasPermission(PERMISSIONS.X)` hook

## The Golden Rule

Never hardcode any business value — not hours, not rates, not thresholds.

## Prerequisites Before Building Anything

1. Design spec must exist in `docs/design-specs/[feature].md`
2. API contract must exist in `docs/api-contracts/[module].md`
3. If either is missing — generate it first, do not guess

## Memory — What to Save After Each Session

- Completed design specs → `docs/design-specs/[feature].md`
- Architecture decisions → `docs/decisions/[topic].md`

## Code Non-Negotiables

- No `any` — ever
- No raw axios outside `lib/axios.ts`
- No `useEffect` for data fetching — TanStack Query only
- No server data in Zustand
- No hardcoded business values
- Components max 120 lines of JSX
- Schema first — every form has a Zod schema. Both the form values type AND its corresponding API payload type must be derived from that schema via `z.infer<>`. Never write a separate manual payload type alongside an existing form schema.
- Features import only through `index.ts` — no internal cross-feature imports
- TypeScript must compile clean — zero errors

## How to Start

```
# Design a feature first
"Design the leave request screen.
 Business rules are in ~/.claude/agents/hr-expert.md"

# Build after design and API contract exist
"Build the leave request feature.
 Design spec: docs/design-specs/leave.md
 API contract: docs/api-contracts/leave.md"

# Seal a completed feature
"The leave request feature is complete and manually tested. Seal it with full tests."
```
