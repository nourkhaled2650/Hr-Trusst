import { createFileRoute, Outlet } from "@tanstack/react-router";

// ---------------------------------------------------------------------------
// Payslips layout route
// Route: /_employee/payslips
// Thin parent so that payslips/ and payslips/$year/$month share the same
// parent route. All content lives in payslips.index.tsx and
// payslips.$year.$month.tsx
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/_employee/payslips")({
  component: Outlet,
});
