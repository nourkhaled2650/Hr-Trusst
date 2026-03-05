import { z } from "zod";

const nullableDatetime = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Must be a valid date and time")
    .nullable(),
);

export const configSchema = z
  .object({
    normalOvertimeRate: z.coerce
      .number()
      .min(0.1, "Must be at least 0.1")
      .max(10, "Must be at most 10"),
    specialOvertimeRate: z.coerce
      .number()
      .min(0.1, "Must be at least 0.1")
      .max(10, "Must be at most 10"),
    standardWorkingHours: z.coerce
      .number()
      .min(1, "Must be at least 1")
      .max(24, "Must be at most 24"),
    lateBalanceLimit: z.coerce
      .number()
      .min(0, "Must be 0 or greater")
      .max(24, "Must be at most 24"),
    leaveBalanceLimit: z.coerce
      .number()
      .int("Must be a whole number")
      .min(0, "Must be 0 or greater")
      .max(365, "Must be at most 365"),
    workingDayStartTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Must be a valid time (HH:mm)"),
    validFrom: nullableDatetime,
    validUntil: nullableDatetime,
  })
  .refine((data) => data.specialOvertimeRate >= data.normalOvertimeRate, {
    message:
      "Special overtime rate must be at least equal to the normal overtime rate",
    path: ["specialOvertimeRate"],
  })
  .refine(
    (data) => {
      if (data.validFrom && data.validUntil) {
        return new Date(data.validFrom) < new Date(data.validUntil);
      }
      return true;
    },
    {
      message: "Inactivation date must be after activation date",
      path: ["validUntil"],
    },
  );

export type ConfigFormValues = z.infer<typeof configSchema>;
