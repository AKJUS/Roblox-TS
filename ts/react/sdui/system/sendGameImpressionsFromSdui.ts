import { eventStreamService } from 'core-roblox-utilities';
import eventStreamConstants, {
  EventStreamMetadata,
  TCarouselGameImpressions
} from '../../common/constants/eventStreamConstants';
import {
  buildSessionAnalyticsData,
  getSessionInfoKey,
  isStringNumberOrBooleanValue,
  parseBooleanField,
  parseMaybeStringNumberField,
  parseStringField
} from '../utils/analyticsParsingUtils';
import { SduiRegisteredComponents } from './SduiComponentRegistry';
import {
  TCollectionAnalyticsData,
  TItemAnalyticsData,
  TSduiContext,
  TServerDrivenComponentConfig
} from './SduiTypes';
import {
  TGameImpressionsEventSponsoredAdData,
  TGameImpressionsEventTileBadgeContextsData,
  TGameImpressionsEventThumbnailIdData
} from '../../common/utils/parsingUtils';
import { DUMMY_ITEM_DATA } from './buildAnalyticsData';

// Returns true if the first item exists and is a 16:9 tile
const getUseGridTiles = (items: TServerDrivenComponentConfig[]): boolean => {
  const firstItem = items?.[0];

  if (
    firstItem?.componentType === SduiRegisteredComponents.Tile ||
    firstItem?.componentType === SduiRegisteredComponents.GameTile
  ) {
    const aspectRatio = firstItem.props?.imageAspectRatio;

    if (isStringNumberOrBooleanValue(aspectRatio)) {
      const parsedAspectRatio = parseMaybeStringNumberField(aspectRatio, 0);
      if (parsedAspectRatio > 1) {
        return true;
      }
    }
  }

  return false;
};

const getThumbnailPersonalizationData = (
  useGridTiles: boolean,
  indexesToSend: number[],
  itemAnalyticsDatas: TItemAnalyticsData[]
): TGameImpressionsEventThumbnailIdData | {} => {
  if (useGridTiles) {
    return {
      [EventStreamMetadata.ThumbnailAssetIds]: indexesToSend.map(index =>
        parseStringField(itemAnalyticsDatas[index]?.thumbnailAssetId, '0')
      ),
      [EventStreamMetadata.ThumbnailListIds]: indexesToSend.map(index =>
        parseStringField(itemAnalyticsDatas[index]?.thumbnailListId, '0')
      )
    };
  }

  return {};
};

const getTileBadgeData = (
  useGridTiles: boolean,
  indexesToSend: number[],
  itemAnalyticsDatas: TItemAnalyticsData[]
): TGameImpressionsEventTileBadgeContextsData | {} => {
  if (useGridTiles) {
    return {
      [EventStreamMetadata.TileBadgeContexts]: indexesToSend.map(index =>
        parseStringField(itemAnalyticsDatas[index]?.tileBadgeIds, '0')
      )
    };
  }

  return {};
};

const getSponsoredAdData = (
  indexesToSend: number[],
  itemAnalyticsDatas: TItemAnalyticsData[],
  sduiContext: TSduiContext
): TGameImpressionsEventSponsoredAdData | {} => {
  const adFlags = indexesToSend.map(index =>
    parseBooleanField(itemAnalyticsDatas[index]?.adFlag, false, sduiContext.pageContext) === true
      ? 1
      : 0
  );

  if (adFlags.some(adFlag => adFlag === 1)) {
    return {
      [EventStreamMetadata.AdsPositions]: adFlags,
      [EventStreamMetadata.AdFlags]: adFlags,
      [EventStreamMetadata.AdIds]: indexesToSend.map(index =>
        parseStringField(itemAnalyticsDatas[index]?.adId, '0')
      )
    };
  }

  return {};
};

const sendGameImpressionsFromSdui = (
  indexesToSend: number[],
  itemAnalyticsDatas: TItemAnalyticsData[],
  items: TServerDrivenComponentConfig[],
  collectionAnalyticsData: TCollectionAnalyticsData,
  sduiContext: TSduiContext
): void => {
  const useGridTiles = getUseGridTiles(items);

  const sessionInfoKey = getSessionInfoKey(sduiContext.pageContext) ?? '';
  const pageSessionInfo = parseStringField(collectionAnalyticsData?.[sessionInfoKey], '');

  const itemComponentType =
    indexesToSend.length > 0
      ? parseStringField(
          itemAnalyticsDatas[indexesToSend[0]]?.itemComponentType,
          DUMMY_ITEM_DATA.itemComponentType
        )
      : DUMMY_ITEM_DATA.itemComponentType;

  const gameImpressionParams: TCarouselGameImpressions = {
    [EventStreamMetadata.RootPlaceIds]: indexesToSend.map(index =>
      parseMaybeStringNumberField(itemAnalyticsDatas[index]?.placeId, -1)
    ),
    [EventStreamMetadata.UniverseIds]: indexesToSend.map(index =>
      parseMaybeStringNumberField(itemAnalyticsDatas[index]?.universeId, -1)
    ),

    ...getThumbnailPersonalizationData(useGridTiles, indexesToSend, itemAnalyticsDatas),
    ...getTileBadgeData(useGridTiles, indexesToSend, itemAnalyticsDatas),

    ...getSponsoredAdData(indexesToSend, itemAnalyticsDatas, sduiContext),

    [EventStreamMetadata.NavigationUids]: indexesToSend.map(index =>
      parseStringField(itemAnalyticsDatas[index]?.navigationUniverseId, '0')
    ),

    [EventStreamMetadata.AbsPositions]: indexesToSend,
    [EventStreamMetadata.SortPos]:
      // Decremented since server collectionPosition will be 1-indexed for Lua
      collectionAnalyticsData?.collectionPosition >= 0
        ? collectionAnalyticsData.collectionPosition - 1
        : -1,
    [EventStreamMetadata.ComponentType]: itemComponentType,
    [EventStreamMetadata.GameSetTypeId]: collectionAnalyticsData?.collectionId ?? -1,
    [EventStreamMetadata.Page]: sduiContext.pageContext.pageName,
    ...buildSessionAnalyticsData(pageSessionInfo, sduiContext)
  };

  const eventStreamParams = eventStreamConstants.gameImpressions(gameImpressionParams);
  eventStreamService.sendEvent(...eventStreamParams);
};

export default sendGameImpressionsFromSdui;
