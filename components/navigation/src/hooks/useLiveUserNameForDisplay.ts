import { useMemo } from "react";
import { UserProfileField, useUserProfiles } from "@rbx/user-profiles";
import type { AuthenticatedUser } from "@rbx/core-scripts/meta/user";

/**
 * Resolves the same label as legacy userUtil: display name when Display Names are enabled, else username.
 * Prefers User Profile API data so the chrome updates after rename without a full page reload. This fixes the legacy
 * issue where the display name is not updated after a rename until a reload.
 */
const useLiveUserNameForDisplay = (user: AuthenticatedUser | null): string => {
  const userId = user?.id ?? 0;
  const { data } = useUserProfiles(userId ? [userId] : [], [
    UserProfileField.Names.DisplayName,
    UserProfileField.Names.Username,
  ]);

  return useMemo(() => {
    if (!user) {
      return "";
    }
    const profile = data?.[userId]?.names;
    return profile?.displayName ?? user.displayName ?? "";
  }, [data, user, userId]);
};

export default useLiveUserNameForDisplay;
