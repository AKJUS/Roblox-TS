import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import {
  authenticatedUser as authenticatedUserMeta,
  isBlackbirdUser,
} from "@rbx/core-scripts/meta/user";
import { Link } from "@rbx/core-ui/legacy/react-style-guide";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import {
  BadgeSizes,
  VerifiedBadgeIconContainer,
  currentUserHasVerifiedBadge,
} from "@rbx/roblox-badges";
import { DisplayNameBadges, useIsPlusBadgeEnabled } from "@rbx/identity-badges";
import links from "../constants/linkConstants";
import useLiveUserNameForDisplay from "../hooks/useLiveUserNameForDisplay";

function AgeBracketDisplay() {
  const metaUser = authenticatedUserMeta();
  const nameForDisplay = useLiveUserNameForDisplay(metaUser);

  const badgeToRender = currentUserHasVerifiedBadge() ? (
    <section>
      <VerifiedBadgeIconContainer
        overrideImgClass="verified-badge-icon-header"
        size={BadgeSizes.CAPTIONHEADER}
      />
    </section>
  ) : null;

  const showPlusBadge = useIsPlusBadgeEnabled() && isBlackbirdUser();

  return (
    <div className="age-bracket-label text-header">
      <Link
        className="text-link dynamic-overflow-container"
        url={links.scrollListItems.profile.url}
      >
        <span className="avatar avatar-headshot-xs">
          <Thumbnail2d
            containerClass="avatar-card-image"
            targetId={authenticatedUser.id ?? 0}
            type={ThumbnailTypes.avatarHeadshot}
            altName={authenticatedUser.name ?? undefined}
          />
        </span>
        <span className="text-overflow age-bracket-label-username font-caption-header">
          {nameForDisplay}
        </span>
        {badgeToRender}
        {showPlusBadge ? (
          <section className="age-bracket-label-plus-badge">
            <DisplayNameBadges isRobloxPlus size="Small" />
          </section>
        ) : null}
      </Link>
    </div>
  );
}

export default AgeBracketDisplay;
