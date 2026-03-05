import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Create Project Schema
// ---------------------------------------------------------------------------

export const createProjectSchema = z
  .object({
    projectName: z
      .string()
      .min(1, "Project name is required")
      .max(200, "Project name must be at most 200 characters"),
    projectCode: z
      .string()
      .min(1, "Project code is required")
      .max(50, "Project code must be at most 50 characters")
      .regex(/^\S+$/, "Code cannot contain spaces"),
    description: z.string().max(2000).optional().or(z.literal("")),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    { message: "End date must be on or after start date", path: ["endDate"] },
  );

// ---------------------------------------------------------------------------
// Update Project Schema
// ---------------------------------------------------------------------------

export const updateProjectSchema = z
  .object({
    projectName: z
      .string()
      .min(1, "Project name is required")
      .max(200, "Project name must be at most 200 characters"),
    projectCode: z
      .string()
      .min(1, "Project code is required")
      .max(50, "Project code must be at most 50 characters")
      .regex(/^\S+$/, "Code cannot contain spaces"),
    description: z.string().max(2000).optional().or(z.literal("")),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    { message: "End date must be on or after start date", path: ["endDate"] },
  );

// ---------------------------------------------------------------------------
// Assign Employee Schema
// ---------------------------------------------------------------------------

export const assignEmployeeSchema = z.object({
  employeeId: z.coerce.number().int().positive("Please select an employee"),
  roleInProject: z.string().max(100).optional().or(z.literal("")),
});
