# Security Audit — Authentication / Login
**Date**: 2026-03-02
**Phase**: Pre-build review
**Auditor**: Security Agent

---

## Findings Addressed in This Sprint

| ID | Severity | Finding | Resolution |
|---|---|---|---|
| CRITICAL-1 | Critical | Both tokens persisted to localStorage | `accessToken` removed from `partialize` — memory only. `refreshToken` stays with documented risk. |
| CRITICAL-3 | Critical | Role not in `/session` response | Backend commit `f509656` added role. `SessionUser` type updated. |
| HIGH-2 | High | Admin guard used blocklist logic | Fixed to allowlist: `!== "sub_admin" && !== "super_admin"` |
| HIGH-3 | High | Logout does not call server endpoint | `useLogout` mutation calls `POST /api/auth/logout` — must be used wherever logout is triggered |
| HIGH-4 | High | VITE_API_BASE_URL not asserted | Deferred — low risk for current dev phase |
| MEDIUM-3 | Medium | `isActive` not enforced post-login | Checked in `use-login.ts` step 4: inactive users are blocked and shown a message |
| MEDIUM-4 | Medium | `window.location.replace` needs comment | Comment added in `lib/axios.ts` |

---

## Open — Requires Backend Action

| ID | Severity | Finding | Status |
|---|---|---|---|
| CRITICAL-2 | Critical | Refresh token never rotates | Backend must implement. Tracked separately. |
| HIGH-1 | High | Cold-load rehydration not server-validated | Resolved by `bootstrapSession` in `__root.tsx` `beforeLoad` |

---

## Open — Deferred

| ID | Severity | Finding |
|---|---|---|
| MEDIUM-1 | Medium | No confirmed server-side rate limiting on login endpoint |
| MEDIUM-2 | Medium | Error message enumeration — frontend only maps to 2 generic strings (OK) |
| LOW-1 | Low | No idle session timeout |
| LOW-2 | Low | Autocomplete attributes — addressed in implementation |
| LOW-3 | Low | CSRF assumption undocumented |
| LOW-4 | Low | Orphaned user accounts from removed endpoint (backend removed the endpoint in this batch) |

---

## Known Accepted Risk

**refreshToken in localStorage**: The refresh token is stored in `localStorage` under `trusst-auth`. This is XSS-accessible. The risk is accepted for the current development phase pending backend implementation of `HttpOnly; Secure; SameSite=Strict` cookie delivery. Tracked as `DEV-backend-cookies`. Access token is memory-only and is NOT affected by this risk.
