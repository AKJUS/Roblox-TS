import { useState, useCallback, useEffect, useRef } from "react";
import ClassNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Link, ScrollBar } from "@rbx/core-ui/legacy/react-style-guide";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import {
  BadgeSizes,
  VerifiedBadgeIconContainer,
  currentUserHasVerifiedBadge,
} from "@rbx/roblox-badges";
import links from "../../constants/linkConstants";
import ScrollListContainer from "./ScrollListContainer";
import userUtil from "../../util/userUtil";
import layoutConstant from "../../constants/layoutConstants";

const { headerMenuIconClickEvent } = layoutConstant;

function LeftNavigation({ ...props }) {
  const { translate } = useTranslation();
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);

  const onClickMenuIcon = useCallback(() => {
    setIsLeftNavOpen(!isLeftNavOpen);
  }, [isLeftNavOpen]);

  useEffect(() => {
    document.addEventListener(headerMenuIconClickEvent.name, onClickMenuIcon);
    return () => {
      document.removeEventListener(headerMenuIconClickEvent.name, onClickMenuIcon);
    };
  }, [onClickMenuIcon]);

  const showBadge = currentUserHasVerifiedBadge();
  const renderEl = useRef(null);
  const badgeToRender =
    showBadge && VerifiedBadgeIconContainer ? (
      <section
        ref={el => {
          renderEl.current = el;
        }}
      >
        <VerifiedBadgeIconContainer
          overrideImgClass="verified-badge-icon-header"
          size={BadgeSizes.CAPTIONHEADER}
        />
      </section>
    ) : null;

  const classNames = ClassNames("rbx-left-col", {
    "nav-show": isLeftNavOpen,
  });

  const displayNameDivClasses = ClassNames("font-header-2 dynamic-ellipsis-item", {
    "verified-badge-left-nav": showBadge,
  });

  return (
    <div id="navigation" className={classNames}>
      <ul>
        <li key="username">
          <Link
            className="dynamic-overflow-container text-nav"
            role="link"
            url={links.scrollListItems.profile.url}
          >
            <span className="avatar avatar-headshot-xs">
              <Thumbnail2d
                containerClass="avatar-card-image"
                targetId={authenticatedUser.id}
                type={ThumbnailTypes.avatarHeadshot}
                altName={authenticatedUser.name}
              />
            </span>
            <div className={displayNameDivClasses}>{userUtil.nameForDisplay}</div>
            {badgeToRender}
          </Link>
        </li>
        <li key="divider" className="rbx-divider" />
      </ul>
      <ScrollBar className="rbx-scrollbar">
        <ScrollListContainer translate={translate} {...props} />
      </ScrollBar>
    </div>
  );
}

export default LeftNavigation;
