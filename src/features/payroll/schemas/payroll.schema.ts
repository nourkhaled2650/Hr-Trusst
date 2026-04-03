import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Adjustment form schema (Phase 3)
// ---------------------------------------------------------------------------

export const adjustmentSchema = z.object({
  type: z.enum(["DEDUCTION", "ADDITION"]),
  label: z.string().min(1, "Label is required").max(100),
  amount: z.coerce.number().positive("Must be greater than 0"),
  note: z.string().max(500).optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Trigger payroll form schema (Phase 1 — no inputs, just confirmation)
// Defined for completeness; the AlertDialog uses no form fields.
// ---------------------------------------------------------------------------

export const triggerPayrollSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});
