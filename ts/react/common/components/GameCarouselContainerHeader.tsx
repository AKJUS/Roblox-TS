import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-style-guide';
import { Link as RouterLink } from 'react-router-dom';
import { TranslateFunction } from 'react-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import GamesInfoTooltip from './GamesInfoTooltip';
import {
  CommonGameSorts,
  FeatureGameDetails,
  FeaturePlacesList
} from '../constants/translationConstants';
import eventStreamConstants, {
  TBuildNavigateToSortLinkEventProperties
} from '../constants/eventStreamConstants';
import GameCarouselSubtitle from './GameCarouselSubtitle';
import HomeSortHeader from './HomeSortHeader';

type TGameCarouselContainerHeaderProps = {
  sortTitle: string;
  sortSubtitle?: string;
  seeAllLink: string | undefined;
  subtitleLink: string | undefined;
  shouldShowSeparateSubtitleLink: boolean;
  isSortLinkOverrideEnabled: boolean;
  buildNavigateToSortLinkEventProperties?: TBuildNavigateToSortLinkEventProperties;
  shouldShowSponsoredTooltip: boolean | undefined;
  tooltipInfoText?: string;
  titleContainerClassName: string;
  hideSeeAll?: boolean;
  endTimestamp?: string;
  countdownString?: string;
  backgroundImageAssetId?: number;
  isNewSortHeaderEnabled?: boolean;
  useRouterLink?: boolean;
  translate: TranslateFunction;
};

const GameCarouselContainerHeader = ({
  sortTitle,
  sortSubtitle,
  seeAllLink,
  subtitleLink,
  shouldShowSeparateSubtitleLink,
  isSortLinkOverrideEnabled,
  buildNavigateToSortLinkEventProperties,
  shouldShowSponsoredTooltip,
  tooltipInfoText,
  titleContainerClassName,
  hideSeeAll,
  endTimestamp,
  countdownString,
  backgroundImageAssetId,
  isNewSortHeaderEnabled,
  useRouterLink,
  translate
}: TGameCarouselContainerHeaderProps): JSX.Element => {
  const tooltipText = useMemo(() => {
    if (tooltipInfoText) {
      return tooltipInfoText;
    }

    if (shouldShowSponsoredTooltip) {
      return (
        translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
        'Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics.'
      );
    }

    return undefined;
  }, [shouldShowSponsoredTooltip, tooltipInfoText, translate]);

  const seeAllButtonText = useMemo(() => {
    if (isSortLinkOverrideEnabled) {
      return translate(FeatureGameDetails.LabelLearnMore);
    }

    return translate(FeaturePlacesList.ActionSeeAll);
  }, [isSortLinkOverrideEnabled, translate]);

  const handleSeeAllLinkClick = useCallback(() => {
    if (isSortLinkOverrideEnabled && buildNavigateToSortLinkEventProperties) {
      const params = buildNavigateToSortLinkEventProperties();
      const eventStreamParams = eventStreamConstants.navigateToSortLink(params);
      eventStreamService.sendEvent(...eventStreamParams);
    }
  }, [isSortLinkOverrideEnabled, buildNavigateToSortLinkEventProperties]);

  const sortTitleComponent = useMemo(() => {
    if (hideSeeAll || !seeAllLink) {
      return <span>{sortTitle}</span>;
    }
    if (useRouterLink) {
      return <RouterLink to={seeAllLink}>{sortTitle}</RouterLink>;
    }
    return <Link url={seeAllLink}>{sortTitle}</Link>;
  }, [hideSeeAll, seeAllLink, useRouterLink, sortTitle]);

  const seeAllLinkComponent = useMemo(() => {
    if (hideSeeAll || !seeAllLink) {
      return null;
    }
    return useRouterLink ? (
      <RouterLink
        to={seeAllLink}
        onClick={handleSeeAllLinkClick}
        className='btn-secondary-xs see-all-link-icon btn-more'>
        {seeAllButtonText}
      </RouterLink>
    ) : (
      <Link
        url={seeAllLink}
        onClick={handleSeeAllLinkClick}
        className='btn-secondary-xs see-all-link-icon btn-more'>
        {seeAllButtonText}
      </Link>
    );
  }, [hideSeeAll, seeAllLink, useRouterLink, seeAllButtonText, handleSeeAllLinkClick]);

  if (isNewSortHeaderEnabled) {
    return (
      <HomeSortHeader
        titleText={sortTitle}
        sendNavigateToSortLinkEvent={handleSeeAllLinkClick}
        titleLink={seeAllLink}
        isSortLinkOverrideEnabled={isSortLinkOverrideEnabled}
        subtitleText={sortSubtitle}
        subtitleLink={subtitleLink}
        shouldShowSeparateSubtitleLink={shouldShowSeparateSubtitleLink}
        hasBackgroundMural={!!backgroundImageAssetId}
        tooltipText={tooltipText}
        hideSeeAll={hideSeeAll}
      />
    );
  }

  return (
    <div className='game-sort-header-container'>
      <div className={titleContainerClassName}>
        <h2 className='sort-header'>
          {sortTitleComponent}
          {tooltipText && <GamesInfoTooltip tooltipText={tooltipText} placement='right' />}
        </h2>
        {seeAllLinkComponent}
      </div>
      <GameCarouselSubtitle
        defaultSubtitle={sortSubtitle}
        endTimestamp={endTimestamp}
        countdownString={countdownString}
        formatSubtitleLink={isSortLinkOverrideEnabled || shouldShowSeparateSubtitleLink}
        subtitleLink={subtitleLink}
        handleSeeAllLinkClick={handleSeeAllLinkClick}
        backgroundImageAssetId={backgroundImageAssetId}
      />
    </div>
  );
};

GameCarouselContainerHeader.defaultProps = {
  sortSubtitle: undefined,
  tooltipInfoText: undefined,
  hideSeeAll: undefined,
  endTimestamp: undefined,
  countdownString: undefined,
  buildNavigateToSortLinkEventProperties: undefined,
  backgroundImageAssetId: undefined,
  isNewSortHeaderEnabled: undefined,
  useRouterLink: false
};

export default GameCarouselContainerHeader;
