import { createFileRoute } from "@tanstack/react-router";

const AdminAttendancePage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold">Attendance</h1>
  </div>
);

export const Route = createFileRoute("/_admin/admin/attendance")({
  component: AdminAttendancePage,
});
