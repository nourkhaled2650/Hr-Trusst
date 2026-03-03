import { useAuthStore } from "@/stores/auth.store";
import { ROLE_PERMISSIONS, type Permission } from "@/constants/permissions";

export function useHasPermission(permission: Permission): boolean {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}
