import { createFileRoute, Outlet } from "@tanstack/react-router";

// ---------------------------------------------------------------------------
// Attendance layout route
// Route: /_employee/attendance
// Acts as a thin parent so that attendance/ and attendance/log share the same
// parent route. All content lives in attendance.index.tsx and attendance.log.tsx
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/_employee/attendance")({
  component: Outlet,
});
