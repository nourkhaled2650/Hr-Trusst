import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Create Employee Schema
// ---------------------------------------------------------------------------

export const createEmployeeSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username may only contain letters, numbers, underscores, and hyphens",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Password must contain at least one uppercase letter, one digit, and one special character (!@#$%^&*)",
    ),
  firstName: z.string().max(100).optional().or(z.literal("")),
  lastName: z.string().max(100).optional().or(z.literal("")),
  position: z.string().max(100).optional().or(z.literal("")),
  employeeType: z.enum(["FULL_TIME", "PART_TIME"]).optional(),
  basicSalary: z.coerce.number().min(0).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
});

// ---------------------------------------------------------------------------
// Update Employee Schemas
// ---------------------------------------------------------------------------

export const configurationExceptionSchema = z
  .object({
    normalOvertimeRate: z.coerce.number().min(0).optional().nullable(),
    specialOvertimeRate: z.coerce.number().min(0).optional().nullable(),
    standardWorkingHours: z.coerce.number().min(0).max(24).optional().nullable(),
    lateBalanceLimit: z.coerce.number().min(0).optional().nullable(),
    leaveBalanceLimit: z.coerce.number().min(0).optional().nullable(),
    workingDayStartTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Invalid time format")
      .optional()
      .nullable(),
  })
  .optional()
  .nullable();

export const updateEmployeeSchema = z.object({
  firstName: z.string().max(100).optional().or(z.literal("")),
  lastName: z.string().max(100).optional().or(z.literal("")),
  phoneNumber: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  position: z.string().max(100).optional().or(z.literal("")),
  basicSalary: z.coerce.number().min(0).optional().nullable(),
  hourlyRate: z.coerce.number().min(0).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  hireDate: z.string().optional().nullable(),
  employeeType: z.enum(["FULL_TIME", "PART_TIME"]).optional().nullable(),
  configurationException: configurationExceptionSchema,
});
