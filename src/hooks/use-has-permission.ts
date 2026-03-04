import { useAuthStore } from "@/stores/auth.store";
import { ROLE_PERMISSIONS, type Permission } from "@/constants/permissions";
import { UserRole } from "@/types";

export function useHasPermission(permission: Permission): boolean {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  if (user.roles.includes(UserRole.SUPER_ADMIN)) return true;
  return user.roles.some((r) => ROLE_PERMISSIONS[r]?.includes(permission));
}
