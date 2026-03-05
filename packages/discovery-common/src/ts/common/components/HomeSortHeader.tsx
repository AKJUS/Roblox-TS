import React, { useMemo } from "react";
import { useTokens } from "@rbx/core-scripts/react";
import { SectionHeader } from "@rbx/discovery-sdui-components";
import GamesInfoTooltip from "./GamesInfoTooltip";
import "../../sdui/style/_sduiIcons.scss";

type THomeSortHeaderProps = {
  // Text to display in the title
  titleText: string;

  // Function to send telemetry for a navigateToSortLink event
  // If there is not a See All link override, the function is a no-op
  sendNavigateToSortLinkEvent: (() => void) | undefined;

  // Link to navigate to when the title is clicked
  titleLink: string | undefined;

  // Whether the titleLink is overridden with an arbitrary link (not a See All page navigation link)
  isSortLinkOverrideEnabled: boolean;

  // Text to display in the subtitle
  subtitleText: string | undefined;

  // Link to navigate to when the subtitle is clicked (or titleLink, if shouldShowSeparateSubtitleLink is false)
  subtitleLink: string | undefined;

  // Whether the subtitle link is separate from the title link
  shouldShowSeparateSubtitleLink: boolean;

  // Whether there is a background mural on the sort
  hasBackgroundMural: boolean;

  // Text to display in the tooltip
  tooltipText: string | undefined;

  // Whether to hide the See All button and seeAllLink
  hideSeeAll: boolean | undefined;
};

/**
 * Experimental version of sort header for Home page.
 * Uses the presentational SectionHeader component, but hardcodes the values
 * to match the values expected from backend with the SduiSectionHeader.
 */
const HomeSortHeader = ({
  titleText,
  sendNavigateToSortLinkEvent,
  titleLink,
  isSortLinkOverrideEnabled,
  subtitleText,
  subtitleLink,
  shouldShowSeparateSubtitleLink,
  hasBackgroundMural,
  tooltipText,
  hideSeeAll,
}: THomeSortHeaderProps): JSX.Element => {
  const tokens = useTokens();

  const hasSubtitleLink =
    (isSortLinkOverrideEnabled || shouldShowSeparateSubtitleLink) && subtitleLink && subtitleText;

  const subtitleTextColor = useMemo(() => {
    if (subtitleText) {
      return hasBackgroundMural
        ? tokens.Color.Extended.Gray.Gray_100
        : tokens.Color.Content.Emphasis;
    }

    return undefined;
  }, [
    subtitleText,
    hasBackgroundMural,
    tokens.Color.Extended.Gray.Gray_100,
    tokens.Color.Content.Emphasis,
  ]);

  const subtitleIconClassName = useMemo(() => {
    if (hasSubtitleLink) {
      // Force icon to dark mode if there is a background mural
      return hasBackgroundMural ? "icon-chevron-right-dark" : "icon-chevron-right";
    }

    return undefined;
  }, [hasSubtitleLink, hasBackgroundMural]);

  return (
    <div className="home-sort-header-container" style={{ marginBottom: tokens.Gap.Large }}>
      <SectionHeader
        titleText={titleText}
        onTitleActivated={hideSeeAll ? undefined : sendNavigateToSortLinkEvent}
        titleLinkPath={hideSeeAll ? undefined : titleLink}
        // Force text color to dark mode token (white) if there is a background mural
        titleTextColor={
          hasBackgroundMural ? tokens.Color.Extended.Gray.Gray_100 : tokens.Color.Content.Emphasis
        }
        titleFontStyle={tokens.Typography.HeadingSmall}
        titleGap={hideSeeAll ? undefined : tokens.Gap.XSmall}
        titleIconClassName={hideSeeAll ? undefined : "sdui-icon icon-push-right-16x16"}
        titleIconWidth={hideSeeAll ? undefined : 16}
        titleIconFirst={false}
        subtitleText={subtitleText || undefined}
        // Force text color to dark mode token (white) if there is a background mural
        subtitleTextColor={subtitleTextColor}
        subtitleFontStyle={subtitleText ? tokens.Typography.BodyMedium : undefined}
        subtitleGap={hasSubtitleLink ? tokens.Gap.XXSmall : undefined}
        onSubtitleActivated={hasSubtitleLink ? sendNavigateToSortLinkEvent : undefined}
        subtitleLinkPath={hasSubtitleLink ? subtitleLink : undefined}
        subtitleIconClassName={hasSubtitleLink ? subtitleIconClassName : undefined}
        subtitleIconWidth={hasSubtitleLink ? 22 : undefined}
        subtitleIconFirst={false}
        verticalGap={tokens.Gap.XXSmall}
        iconComponent={
          tooltipText ? (
            <GamesInfoTooltip tooltipText={tooltipText} placement="left" centerIcon />
          ) : undefined
        }
        containerOverrides={
          hasBackgroundMural
            ? {
                // Ensure that the sort header appears above the background mural
                zIndex: 1,
              }
            : undefined
        }
      />
    </div>
  );
};

export default HomeSortHeader;
