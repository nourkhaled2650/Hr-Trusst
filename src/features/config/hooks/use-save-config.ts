import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { configApi } from "../api/config.api";

// ---------------------------------------------------------------------------
// UTC helpers for datetime fields (validFrom / validUntil)
// ---------------------------------------------------------------------------

/**
 * Backend UTC ISO string → "YYYY-MM-DDTHH:mm" in the user's local time.
 * Backend sends e.g. "2026-01-01T07:00:00" (no Z suffix, but it is UTC).
 */
function utcToLocalInput(utcStr: string): string {
  const d = new Date(utcStr.endsWith("Z") ? utcStr : utcStr + "Z");
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${Y}-${M}-${D}T${h}:${m}`;
}

/**
 * "YYYY-MM-DDTHH:mm" local time from the form → UTC "YYYY-MM-DDTHH:mm:ss" for the API.
 * new Date(localStr) interprets the string as local time; getUTC* methods read back UTC.
 */
function localInputToUtc(localStr: string): string {
  const d = new Date(localStr);
  const Y = d.getUTCFullYear();
  const M = String(d.getUTCMonth() + 1).padStart(2, "0");
  const D = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${Y}-${M}-${D}T${h}:${mi}:00`;
}
import { LATEST_CONFIG_QUERY_KEY } from "./use-latest-config";
import { ALL_CONFIGS_QUERY_KEY } from "./use-all-configs";
import type { PayrollSettings, PayrollSettingsRequest } from "../types/config.types";
import type { ConfigFormValues } from "../schemas/config.schema";

/**
 * Maps the 6 form fields onto the full backend request body.
 * Merges form values over the existing config so all backend-managed fields
 * (gracePeriod, validFrom, validUntil, isExpired) are preserved on PUT.
 */
export function buildRequestPayload(
  formValues: ConfigFormValues,
  existing: PayrollSettings | null,
): PayrollSettingsRequest {
  return {
    normalOvertimeRate: formValues.normalOvertimeRate,
    specialOvertimeRate: formValues.specialOvertimeRate,
    standardWorkingHours: formValues.standardWorkingHours,
    lateBalanceLimit: formValues.lateBalanceLimit,
    leaveBalanceLimit: formValues.leaveBalanceLimit,
    workingDayStartTime: `${formValues.workingDayStartTime}:00`,
    validFrom: formValues.validFrom ? localInputToUtc(formValues.validFrom) : null,
    validUntil: formValues.validUntil ? localInputToUtc(formValues.validUntil) : null,
    gracePeriod: existing?.gracePeriod ?? 0,
    isExpired: existing?.isExpired ?? false,
  };
}

/**
 * Maps the API response back to form values.
 * Strips seconds from workingDayStartTime (backend: "HH:mm:ss" → form: "HH:mm").
 */
export function mapApiToFormValues(config: PayrollSettings): ConfigFormValues {
  return {
    normalOvertimeRate: config.normalOvertimeRate,
    specialOvertimeRate: config.specialOvertimeRate,
    standardWorkingHours: config.standardWorkingHours,
    lateBalanceLimit: config.lateBalanceLimit,
    leaveBalanceLimit: config.leaveBalanceLimit,
    workingDayStartTime: config.workingDayStartTime.slice(0, 5),
    validFrom: config.validFrom ? utcToLocalInput(config.validFrom) : null,
    validUntil: config.validUntil ? utcToLocalInput(config.validUntil) : null,
  };
}

type SaveConfigArgs = {
  formValues: ConfigFormValues;
  existing: PayrollSettings | null;
};

export function useSaveConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formValues,
      existing,
    }: SaveConfigArgs): Promise<PayrollSettings> => {
      const payload = buildRequestPayload(formValues, existing);

      if (existing !== null) {
        return configApi.update(existing.settingId, payload);
      }
      return configApi.create(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LATEST_CONFIG_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ALL_CONFIGS_QUERY_KEY }),
      ]);
      toast.success("Configuration saved successfully");
    },
  });
}

/**
 * Extracts a human-readable error message from a mutation error.
 */
export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message as string | undefined;
    return message || "Failed to save configuration. Please try again.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to save configuration. Please try again.";
}
