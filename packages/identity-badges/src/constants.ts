/**
 * a11y label for the Roblox Plus icon. Final localized copy is confirmed in
 * the SUBS-5048 ADR; this constant exists so every surface uses the same
 * string without stringly-typed duplication.
 */
export const PLUS_BADGE_ARIA_LABEL = "Roblox Plus subscriber" as const;

/**
 * Field token requested in `user-profile-api/v1/user/get-profiles` to surface
 * the Plus signal. Mapped to the `isRobloxPlus` UI prop at the client
 * boundary.
 */
export const PLUS_PROFILE_FIELD = "hasRobloxSubscription" as const;
