import { z } from "zod";

export const submitLeaveSchema = z
  .object({
    leaveType: z.enum(["Annual Leave", "Sick Leave", "Unpaid Leave"], {
      required_error: "Please select a leave type.",
    }),
    startDate: z
      .string()
      .min(1, "Start date is required.")
      .refine(
        (val) => val >= new Date().toISOString().split("T")[0],
        "Start date cannot be in the past."
      ),
    endDate: z.string().min(1, "End date is required."),
    reason: z
      .string()
      .min(5, "Please provide a reason (at least 5 characters).")
      .max(500, "Reason must not exceed 500 characters."),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export type SubmitLeaveFormValues = z.infer<typeof submitLeaveSchema>;
