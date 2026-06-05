import { Icon } from "@rbx/foundation-ui";
import { PLUS_BADGE_ARIA_LABEL } from "../constants";

export type DisplayNameBadgesSize = "XSmall" | "Small" | "Medium" | "Large";

export type DisplayNameBadgesProps = {
  isVerified?: boolean;
  isRobloxPlus?: boolean;
  isPremium?: boolean;
  isRobloxAdmin?: boolean;
  /**
   * Icon size. Defaults to `"Large"` to preserve the profile-header rendering.
   * List/tile surfaces (friend tiles, player search, DM rows) should pass
   * `"Small"` so the badge matches the display-name text scale.
   */
  size?: DisplayNameBadgesSize;
};

/**
 * Renders the verified / Roblox Plus / premium / admin identity badges next
 * to a user's display name. Mirrors the lua-apps `NameBadge.lua` rule:
 *
 *   - order: verified -> plus -> premium -> admin
 *   - mutual exclusion: when `isRobloxPlus` is true the premium icon is
 *     suppressed (`isPremium and not showSubscriberBadge` in lua-apps).
 *
 * SUBS-5048. Promoted from `@rbx/profile-platform` so every web surface
 * (chat, party-adjacent, friend tiles, search rows, group/VIP server
 * members, top-nav own-user, legacy chat) can render the same component.
 */
const DisplayNameBadges = ({
  isVerified,
  isRobloxPlus,
  isPremium,
  isRobloxAdmin,
  size = "Large",
}: DisplayNameBadgesProps) => {
  const showPlus = isRobloxPlus === true;
  const showPremium = isPremium === true && !showPlus;
  const showVerified = isVerified === true;
  const showAdmin = isRobloxAdmin === true;

  if (!showVerified && !showPlus && !showPremium && !showAdmin) {
    return null;
  }

  return (
    <span className="items-center gap-xxsmall inline-flex shrink-0 [--icon-size-small:1em]">
      {showVerified && (
        <span className="relative flex items-center justify-center">
          <Icon
            name="icon-filled-verified-backplate"
            className="content-system-emphasis"
            size={size}
          />
          <Icon
            name="icon-filled-verified-check"
            className="absolute"
            style={{ color: "white" }}
            size={size}
          />
        </span>
      )}
      {showPlus && (
        <Icon
          name="icon-regular-roblox-plus"
          className="content-system-contrast"
          size={size}
          aria-label={PLUS_BADGE_ARIA_LABEL}
        />
      )}
      {showPremium && (
        <Icon name="icon-filled-premium" className="content-system-contrast" size={size} />
      )}
      {showAdmin && (
        <Icon name="icon-filled-tilt" className="content-system-contrast" size={size} />
      )}
    </span>
  );
};

export default DisplayNameBadges;
