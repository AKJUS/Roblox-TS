import {
  EventStreamMetadata,
  TCommonReferralParams,
  TGameDetailReferral
} from '../../../common/constants/eventStreamConstants';
import { buildGameDetailUrl } from '../../../common/utils/browserUtils';
import {
  buildSessionAnalyticsData,
  filterInvalidEventParams,
  findAnalyticsFieldInAncestors,
  getSessionInfoKey,
  parseBooleanField,
  parseMaybeStringNumberField,
  parseStringField
} from '../../utils/analyticsParsingUtils';
import logSduiError, { SduiErrorNames } from '../../utils/logSduiError';
import { TSduiActionConfig, TSduiParsedActionConfig } from '../SduiActionParserRegistry';
import { TAnalyticsContext, TSduiContext, TSduiPageContextType } from '../SduiTypes';
import { getAppsFlyerReferralParams } from '../../../common/utils/appsFlyerReferralUtils';

/**
 * Builds common referral params for use in both gameDetailReferral and playGameClicked events.
 */
export const buildCommonReferralParams = (
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): TCommonReferralParams => {
  const isAd = parseBooleanField(
    findAnalyticsFieldInAncestors('adFlag', analyticsContext, false),
    false,
    sduiContext.pageContext
  );
  const adId = parseStringField(findAnalyticsFieldInAncestors('adId', analyticsContext, ''), '');
  const position = parseMaybeStringNumberField(
    findAnalyticsFieldInAncestors('itemPosition', analyticsContext, -1),
    -1
  );

  const collectionAnalyticsData = analyticsContext.getCollectionData
    ? analyticsContext.getCollectionData()
    : undefined;

  const sortPosition =
    collectionAnalyticsData?.collectionPosition ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors('collectionPosition', analyticsContext, -1),
      -1
    );
  const numberOfLoadedTiles =
    collectionAnalyticsData?.totalNumberOfItems ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors('totalNumberOfItems', analyticsContext, -1),
      -1
    );
  const gameSetTypeId =
    collectionAnalyticsData?.collectionId ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors('collectionId', analyticsContext, -1),
      -1
    );

  const pageSessionInfo = parseStringField(
    findAnalyticsFieldInAncestors(
      getSessionInfoKey(sduiContext.pageContext) ?? '',
      analyticsContext,
      ''
    ),
    ''
  );

  return {
    [EventStreamMetadata.IsAd]: isAd,
    ...(adId !== '' && {
      [EventStreamMetadata.NativeAdData]: adId
    }),
    [EventStreamMetadata.Position]: position,
    [EventStreamMetadata.SortPos]: sortPosition,
    [EventStreamMetadata.NumberOfLoadedTiles]: numberOfLoadedTiles,
    [EventStreamMetadata.GameSetTypeId]: gameSetTypeId,
    [EventStreamMetadata.Page]: sduiContext.pageContext.pageName,
    ...buildSessionAnalyticsData(pageSessionInfo, sduiContext)
  };
};

/**
 * Build gameDetailReferral event params for compatability with existing pipelines.
 *
 * These params will be attached to the URL params of the resulting game details page,
 * and also used to create the playGameClicked event properties from EDP for play attribution.
 */
const buildGameDetailReferralParams = (
  actionConfig: TSduiActionConfig,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): TGameDetailReferral => {
  const filteredActionParams = filterInvalidEventParams(
    actionConfig.actionParams ?? {},
    sduiContext.pageContext
  );

  const analyticsPlaceId = parseMaybeStringNumberField(
    filteredActionParams.placeId ?? findAnalyticsFieldInAncestors('placeId', analyticsContext, -1),
    -1
  );
  const analyticsUniverseId = parseMaybeStringNumberField(
    filteredActionParams.universeId ??
      findAnalyticsFieldInAncestors('universeId', analyticsContext, -1),
    -1
  );

  const commonReferralParams = buildCommonReferralParams(analyticsContext, sduiContext);

  const appsFlyerMarketingReferralParams = getAppsFlyerReferralParams();

  const gameDetailReferralEventProperties: TGameDetailReferral = {
    ...commonReferralParams,
    ...appsFlyerMarketingReferralParams,
    [EventStreamMetadata.PlaceId]: analyticsPlaceId,
    [EventStreamMetadata.UniverseId]: analyticsUniverseId
  };

  return gameDetailReferralEventProperties;
};

const openGameDetailsParser = (
  actionConfig: TSduiActionConfig,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): TSduiParsedActionConfig => {
  const navigationPlaceId = actionConfig.actionParams?.placeId;

  const parsedNavigationPlaceId = parseMaybeStringNumberField(navigationPlaceId as number, -1);
  if (parsedNavigationPlaceId && parsedNavigationPlaceId !== -1) {
    // Build and send gameDetailReferral event params for compatability with existing pipelines.
    const referralParams = buildGameDetailReferralParams(
      actionConfig,
      analyticsContext,
      sduiContext
    );

    const referralUrl = buildGameDetailUrl(
      parsedNavigationPlaceId,
      '', // game.name (optional and not provided)
      referralParams
    );

    return {
      callback: undefined,
      linkPath: referralUrl
    };
  }

  logSduiError(
    SduiErrorNames.SduiActionOpenGameDetailsInvalidId,
    `Invalid id ${JSON.stringify(navigationPlaceId)} to open game details`,
    sduiContext.pageContext
  );

  return {
    callback: undefined,
    linkPath: undefined
  };
};

export default openGameDetailsParser;
