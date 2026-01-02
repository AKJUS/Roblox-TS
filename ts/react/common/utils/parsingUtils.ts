import { EventContext } from '@rbx/unified-logging';
import { Intl, Presence } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import { abbreviateNumber, numberFormat, urlService } from 'core-utilities';
import { EventStreamMetadata, SessionInfoType } from '../constants/eventStreamConstants';
import { common } from '../constants/configConstants';
import {
  TFriendVisits,
  TGameData,
  TGetFriendsResponse,
  TLayoutMetadata,
  TMediaLayoutData
} from '../types/bedev1Types';
import { TComponentType, TWideTileComponentType } from '../types/bedev2Types';
import { PageContext } from '../types/pageContext';
import { getGameLayoutData } from '../hooks/useGetGameLayoutData';

export const GAME_STATS_PLACEHOLDER_STRING = '--';

export const dateTimeFormatter = new Intl().getDateTimeFormatter();

/**
 * Type guard function to check whether a component type is a wide tile component type.
 */
export const isWideTileComponentType = (
  componentType: TComponentType | undefined
): componentType is TWideTileComponentType => {
  return (
    componentType === TComponentType.GridTile ||
    componentType === TComponentType.EventTile ||
    componentType === TComponentType.InterestTile ||
    componentType === TComponentType.ExperienceEventsTile
  );
};

export const getInGameFriends = (
  friendData: TGetFriendsResponse[],
  universeId: number
): TGetFriendsResponse[] => {
  return friendData.filter(
    friend =>
      friend.presence?.universeId === universeId &&
      friend.presence?.userPresenceType === Presence.PresenceTypes.InGame
  );
};

export const getFriendVisits = (
  friendData: TGetFriendsResponse[],
  friendVisits: TFriendVisits[] | undefined
): TGetFriendsResponse[] => {
  if (!friendVisits) {
    return [];
  }

  const friendIdMap = new Map<number, TGetFriendsResponse>(
    friendData.map(friend => [friend.id, friend])
  );

  const friendVisitData = friendVisits.map(friendVisit => friendIdMap.get(friendVisit.userId));

  return friendVisitData.filter(
    (friendVisit: TGetFriendsResponse | undefined): friendVisit is TGetFriendsResponse =>
      friendVisit !== undefined
  );
};

export const getVotePercentageValue = (
  upvotes: number | undefined,
  downvotes: number | undefined
): number | undefined => {
  let percentUp = 0;
  if (upvotes === undefined || downvotes === undefined) {
    return undefined;
  }
  if (!Number.isNaN(upvotes) && !Number.isNaN(downvotes)) {
    if (upvotes === 0 && downvotes === 0) {
      return undefined;
    }
    if (upvotes === 0 && downvotes !== 0) {
      percentUp = 0;
    } else if (upvotes !== 0 && downvotes === 0) {
      percentUp = 100;
    } else {
      percentUp = Math.floor((upvotes / (upvotes + downvotes)) * 100);
      percentUp = percentUp > 100 ? 100 : percentUp;
    }
  }
  return percentUp;
};

export const getVotePercentage = (
  upvotes: number | undefined,
  downvotes: number | undefined
): string | undefined => {
  const votePercentageValue = getVotePercentageValue(upvotes, downvotes);

  return votePercentageValue !== undefined ? `${votePercentageValue}%` : undefined;
};

export const getPlayerCount = (playerCount: number): string => {
  return playerCount === -1
    ? GAME_STATS_PLACEHOLDER_STRING
    : abbreviateNumber.getAbbreviatedValue(playerCount);
};

export const capitalize = (args: string): string => {
  return args.charAt(0).toUpperCase() + args.slice(1);
};

export const parseEventParams = (params: Record<string, any>): Record<string, string | number> => {
  return Object.keys(params).reduce<Record<string, string | number>>((acc, key) => {
    if (typeof params[key] === 'object' && params[key]) {
      acc[key] = JSON.stringify(params[key]);
    }

    if (typeof params[key] === 'number') {
      acc[key] = params[key] as number;
    }

    if (typeof params[key] === 'string') {
      acc[key] = encodeURIComponent(params[key]);
    }

    if (typeof params[key] === 'boolean') {
      acc[key] = params[key] ? 1 : 0;
    }

    return acc;
  }, {});
};

export const composeQueryString = (queryParams: Record<string, unknown>): string => {
  const parsedQueryParams = urlService.composeQueryString(queryParams);
  if (!parsedQueryParams) {
    return '';
  }

  return `?${parsedQueryParams}`;
};

export type TGameImpressionsEventSponsoredAdData = {
  [EventStreamMetadata.AdsPositions]: number[];
  [EventStreamMetadata.AdFlags]: number[];
  [EventStreamMetadata.AdIds]: string[];
};

export const getSponsoredAdImpressionsData = (
  gameData: TGameData[],
  impressedIndexes: number[]
): TGameImpressionsEventSponsoredAdData | {} => {
  const hasSponsoredGame = impressedIndexes.some(index => gameData[index]?.isSponsored);

  if (hasSponsoredGame) {
    return {
      [EventStreamMetadata.AdsPositions]: impressedIndexes.map(index =>
        gameData[index].isSponsored ? 1 : 0
      ),
      [EventStreamMetadata.AdFlags]: impressedIndexes.map(index =>
        gameData[index].isSponsored ? 1 : 0
      ),
      [EventStreamMetadata.AdIds]: impressedIndexes.map(
        index => gameData[index]?.nativeAdData || '0'
      )
    };
  }

  return {};
};

export const getThumbnailOverrideAssetId = (
  gameData: TGameData,
  topicId: string | undefined
): number | null => {
  const getAssetIdFromMediaLayoutData = (layoutData: TMediaLayoutData) => {
    const assetId = layoutData?.primaryMediaAsset?.wideImageAssetId;
    if (assetId && assetId !== '0') {
      return parseInt(assetId, 10);
    }

    return null;
  };

  let assetId;

  // If a layout data exists for this sort, use that set
  // If it doesn't, fall back to defaultLayoutData if it exists
  if (gameData.layoutDataBySort && topicId && gameData.layoutDataBySort[topicId]) {
    assetId = getAssetIdFromMediaLayoutData(gameData.layoutDataBySort[topicId]);
  } else if (gameData.defaultLayoutData) {
    assetId = getAssetIdFromMediaLayoutData(gameData.defaultLayoutData);
  }

  // If there wasn't already a thumbnail override, check the root game data for an asset id
  return assetId || getAssetIdFromMediaLayoutData(gameData);
};

const getThumbnailOverrideListId = (
  gameData: TGameData,
  topicId: string | undefined
): string | undefined => {
  if (gameData.layoutDataBySort && topicId && gameData.layoutDataBySort[topicId]) {
    return gameData.layoutDataBySort[topicId].primaryMediaAsset?.wideImageListId;
  }

  if (gameData.defaultLayoutData) {
    return gameData.defaultLayoutData.primaryMediaAsset?.wideImageListId;
  }

  return gameData.primaryMediaAsset?.wideImageListId;
};

export type TGameImpressionsEventThumbnailIdData = {
  [EventStreamMetadata.ThumbnailAssetIds]: string[];
  [EventStreamMetadata.ThumbnailListIds]: string[];
};

export const getThumbnailAssetIdImpressionsData = (
  gameData: TGameData[],
  topicId: number | string,
  impressedIndexes: number[],
  componentType?: TComponentType
): TGameImpressionsEventThumbnailIdData | {} => {
  if (isWideTileComponentType(componentType)) {
    return {
      [EventStreamMetadata.ThumbnailAssetIds]: impressedIndexes.map(
        index => getThumbnailOverrideAssetId(gameData[index], topicId.toString()) ?? '0'
      ),
      [EventStreamMetadata.ThumbnailListIds]: impressedIndexes.map(
        index => getThumbnailOverrideListId(gameData[index], topicId.toString()) ?? '0'
      )
    };
  }

  return {};
};

const extractFooterAnalytics = (
  layoutData: TLayoutMetadata | undefined
): {
  textLiteral: string;
  localizationKey: string;
} => {
  return {
    textLiteral: layoutData?.footer?.analytics?.textLiteral ?? '0',
    localizationKey: layoutData?.footer?.analytics?.locKey ?? '0'
  };
};

export type TGameImpressionsTileFooterData = {
  [EventStreamMetadata.FooterTextLiterals]: string[];
  [EventStreamMetadata.FooterLocalizationKeys]: string[];
};

export const getTileFooterImpressionsData = (
  gameData: TGameData[],
  topicId: number | string,
  impressedIndexes: number[],
  componentType: TComponentType | undefined
): TGameImpressionsTileFooterData | {} => {
  if (!isWideTileComponentType(componentType)) {
    return {};
  }

  const textLiterals: string[] = [];
  const localizationKeys: string[] = [];

  let hasTextLiteral = false;
  let hasLocalizationKey = false;

  impressedIndexes.forEach(index => {
    if (gameData[index]) {
      const topicIdString = topicId ? topicId.toString() : undefined;

      const layoutData = getGameLayoutData(gameData[index], topicIdString);

      const { textLiteral, localizationKey } = extractFooterAnalytics(layoutData);

      textLiterals.push(textLiteral);
      localizationKeys.push(localizationKey);

      // Only add the fields to the event if there is at least one non-zero value
      if (textLiteral !== '0') {
        hasTextLiteral = true;
      }
      if (localizationKey !== '0') {
        hasLocalizationKey = true;
      }
    }
  });

  return {
    ...(hasTextLiteral
      ? {
          [EventStreamMetadata.FooterTextLiterals]: textLiterals
        }
      : {}),
    ...(hasLocalizationKey
      ? {
          [EventStreamMetadata.FooterLocalizationKeys]: localizationKeys
        }
      : {})
  };
};

export type TGameImpressionsEventTileBadgeContextsData = {
  [EventStreamMetadata.TileBadgeContexts]: string[];
};

const getAnalyticsIdFromLayoutData = ({
  tileBadgesByPosition
}: TLayoutMetadata): string | undefined => {
  const analyticsIds: string[] = [];
  if (tileBadgesByPosition) {
    if (tileBadgesByPosition.ImageTopLeft) {
      const badgeContexts = tileBadgesByPosition.ImageTopLeft.map(item => item.analyticsId);
      if (badgeContexts && badgeContexts.length > 0) {
        analyticsIds.push(`ImageTopLeft=${badgeContexts.join('+')}`);
      }
    }
    return analyticsIds.length > 0 ? analyticsIds.join('&') : undefined;
  }
  return undefined;
};

export const getTileBadgeContext = (
  gameData: TGameData,
  topicId: string | undefined
): string | undefined => {
  let tileBadgeContext: string | undefined;

  if (gameData.layoutDataBySort && topicId && gameData.layoutDataBySort[topicId]) {
    tileBadgeContext = getAnalyticsIdFromLayoutData(gameData.layoutDataBySort[topicId]);
  } else if (gameData.defaultLayoutData) {
    tileBadgeContext = getAnalyticsIdFromLayoutData(gameData.defaultLayoutData);
  }

  return tileBadgeContext;
};

export const getTileBadgeContextsImpressionsData = (
  gameData: TGameData[],
  topicId: number | string,
  impressedIndexes: number[],
  componentType?: TComponentType
): TGameImpressionsEventTileBadgeContextsData | {} => {
  if (isWideTileComponentType(componentType)) {
    return {
      [EventStreamMetadata.TileBadgeContexts]: impressedIndexes.map(
        index => getTileBadgeContext(gameData[index], topicId.toString()) ?? '0'
      )
    };
  }
  return {};
};

const calculateAbsoluteRowData = (
  startingRow: number,
  itemsPerRow: number,
  index: number
): {
  positionInRow: number;
  rowOnPage: number;
} => {
  const rowOnPage = startingRow + Math.floor(index / itemsPerRow);
  const positionInRow = index % itemsPerRow;

  return {
    positionInRow,
    rowOnPage
  };
};

type TGameDetailReferralEventAbsoluteRowData = {
  [EventStreamMetadata.RowOnPage]: number;
  [EventStreamMetadata.PositionInRow]: number;
};

export const getAbsoluteRowClickData = (
  startingRow: number | undefined,
  itemsPerRow: number | undefined,
  clickedIndex: number
): TGameDetailReferralEventAbsoluteRowData | {} => {
  if (startingRow !== undefined && itemsPerRow !== undefined) {
    const { positionInRow, rowOnPage } = calculateAbsoluteRowData(
      startingRow,
      itemsPerRow,
      clickedIndex
    );

    return {
      [EventStreamMetadata.RowOnPage]: rowOnPage,
      [EventStreamMetadata.PositionInRow]: positionInRow
    };
  }

  return {};
};

type TGameImpressionsEventAbsoluteRowData = {
  [EventStreamMetadata.RowsOnPage]: number[];
  [EventStreamMetadata.PositionsInRow]: number[];
};

export const getAbsoluteRowImpressionsData = (
  startingRow: number | undefined,
  itemsPerRow: number | undefined,
  totalItems: number | undefined,
  impressedIndexes: number[]
): TGameImpressionsEventAbsoluteRowData | {} => {
  if (startingRow !== undefined && itemsPerRow !== undefined && totalItems !== undefined) {
    const rowsOnPage: number[] = [];
    const positionsInRow: number[] = [];
    impressedIndexes.forEach(impressedIndex => {
      const { positionInRow, rowOnPage } = calculateAbsoluteRowData(
        startingRow,
        itemsPerRow,
        impressedIndex
      );

      positionsInRow.push(positionInRow);
      rowsOnPage.push(rowOnPage);
    });

    return {
      [EventStreamMetadata.RowsOnPage]: rowsOnPage,
      [EventStreamMetadata.PositionsInRow]: positionsInRow
    };
  }

  return {};
};

// NOTE(jcountryman, 10/25/21): Assumes a comparision of two non-negative
// numeric ranges with the structure of [min, max] and generates a sorted impressed range of
// indexes based off baseline range.
export const calculateImpressedIndexes = (
  baseline: [number, number] | undefined,
  compared: [number, number]
): number[] => {
  if (baseline === undefined) {
    return Array.from(new Array(compared[1] - compared[0] + 1), (_, index) => index + compared[0]);
  }

  // NOTE(jcountryman, 10/25/21): Left intersect is not inclusive of max value
  // in range and right intersect is not inclusive of min value.
  const leftIntersect =
    compared[0] < baseline[0] ? ([compared[0], baseline[0]] as [number, number]) : undefined;
  const rightIntersect =
    compared[1] > baseline[1] ? ([baseline[1], compared[1]] as [number, number]) : undefined;
  const leftIntersectIndexes = leftIntersect
    ? new Array(leftIntersect[1] - leftIntersect[0])
        .fill(0)
        .map((_, index) => index + leftIntersect[0])
    : [];
  const rightIntersectIndexes = rightIntersect
    ? new Array(rightIntersect[1] - rightIntersect[0])
        .fill(0)
        .map((_, index) => index + rightIntersect[0] + 1)
    : [];

  return [...leftIntersectIndexes, ...rightIntersectIndexes];
};

export const splitArray = <T>(input: T[], maxSize: number): T[][] => {
  if (input.length === 0 || maxSize === 0) {
    return [input];
  }

  const numberOfSubArrays = Math.ceil(input.length / maxSize);
  return new Array(numberOfSubArrays)
    .fill(0)
    .map((_, index) => input.slice(index * maxSize, (index + 1) * maxSize));
};

export const { parseQueryString } = urlService;
export const { getNumberFormat } = numberFormat;

export const getQueryParamIfString = (key: string): string | undefined => {
  const queryParam = urlService.getQueryParam(key);

  if (queryParam && typeof queryParam === 'string') {
    return queryParam;
  }

  return undefined;
};

type TInputUniverseIdsRequestParameter =
  | {
      inputUniverseIds: {
        interestCatcher: number[];
      };
    }
  | {};

export const getInputUniverseIdsRequestParam = (
  interestedUniverses: number[] | undefined
): TInputUniverseIdsRequestParameter => {
  if (interestedUniverses !== undefined) {
    // Passes empty array for interestCatcher param if user has no interested universes
    return {
      inputUniverseIds: {
        interestCatcher: interestedUniverses.map(universeId => universeId.toString())
      }
    };
  }

  return {};
};

// converts a PageContext to an EventContext to get a ctx that matches app ctx
export const getEventContext = (pageContext?: PageContext): EventContext | string => {
  switch (pageContext) {
    case PageContext.HomePage:
      return EventContext.Home;
    case PageContext.GamesPage:
      return EventContext.Games;
    case PageContext.SpotlightPage:
      return EventContext.Spotlight;
    default:
      fireEvent(common.NoMatchingEventContextFoundCounterEvent);
      return 'UNKNOWN';
  }
};

export const getSessionInfoTypeFromPageContext = (
  pageContext?: PageContext
): SessionInfoType | null => {
  switch (pageContext) {
    case PageContext.HomePage:
      return SessionInfoType.HomePageSessionInfo;
    case PageContext.SearchPage:
      return SessionInfoType.GameSearchSessionInfo;
    case PageContext.GamesPage:
      return SessionInfoType.DiscoverPageSessionInfo;
    case PageContext.SearchLandingPage:
      return SessionInfoType.SearchLandingPageSessionInfo;
    case PageContext.SpotlightPage:
      return SessionInfoType.SpotlightPageSessionInfo;
    default:
      fireEvent(common.NoMatchingSessionInfoTypeFoundCounterEvent);
      return null;
  }
};

export default {
  capitalize,
  parseEventParams,
  getInGameFriends,
  getVotePercentageValue,
  getVotePercentage,
  getPlayerCount,
  getNumberFormat,
  dateTimeFormatter,
  parseQueryString,
  composeQueryString,
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData,
  getTileFooterImpressionsData,
  getAbsoluteRowClickData,
  calculateImpressedIndexes,
  splitArray,
  GAME_STATS_PLACEHOLDER_STRING,
  getQueryParamIfString,
  getInputUniverseIdsRequestParam,
  isWideTileComponentType
};
