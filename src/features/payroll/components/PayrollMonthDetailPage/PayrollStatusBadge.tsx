import { Badge } from "@/components/ui/badge";
import type { PayrollStatus } from "../../types/payroll.types";

const STATUS_VARIANT: Record<
  PayrollStatus,
  "secondary" | "warning" | "default" | "success"
> = {
  PENDING: "secondary",
  DRAFT: "warning",
  APPROVED: "default",
  PAID: "success",
};

interface PayrollStatusBadgeProps {
  status: PayrollStatus;
}

export function PayrollStatusBadge({ status }: PayrollStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}
