import { TValidHttpUrl } from 'core-utilities';
import React, { useMemo } from 'react';
import { Loading } from 'react-style-guide';
import { PlayButton as RobloxPlayButton } from 'Roblox';
import { ValueOf } from '../utils/typeUtils';
import useGetAppPolicyData from '../hooks/useGetAppPolicyData';

export const GameTilePlayButtonV2 = ({
  universeId,
  placeId,
  playButtonEventProperties,
  disableLoadingState,
  redirectPurchaseUrl
}: {
  universeId: string;
  placeId: string;
  playButtonEventProperties?: Record<string, string | number | undefined>;
  disableLoadingState?: boolean;
  redirectPurchaseUrl?: TValidHttpUrl;
}): JSX.Element => {
  const { usePlayabilityStatus, PlayabilityStatuses, DefaultPlayButton } = RobloxPlayButton;
  const [playabilityStatus, refetchPlayabilityStatus] = usePlayabilityStatus(universeId);

  const { shouldShowVpcPlayButtonUpsells, isFetchingPolicy } = useGetAppPolicyData();

  const isPurchaseRequired = useMemo((): boolean => {
    if (!playabilityStatus) {
      return false;
    }
    const allowedList = [
      PlayabilityStatuses.PurchaseRequired,
      PlayabilityStatuses.FiatPurchaseRequired
    ] as ValueOf<typeof PlayabilityStatuses>[];

    return allowedList.includes(playabilityStatus);
  }, [playabilityStatus, PlayabilityStatuses]);

  if (isFetchingPolicy) {
    if (!disableLoadingState) {
      return <Loading />;
    }

    return (
      <DefaultPlayButton
        placeId={placeId}
        universeId={universeId}
        refetchPlayabilityStatus={refetchPlayabilityStatus}
        playabilityStatus={PlayabilityStatuses.Playable}
        eventProperties={playButtonEventProperties}
        hideButtonText
        disableLoadingState={disableLoadingState}
      />
    );
  }

  return (
    <DefaultPlayButton
      placeId={placeId}
      universeId={universeId}
      refetchPlayabilityStatus={refetchPlayabilityStatus}
      playabilityStatus={playabilityStatus}
      eventProperties={playButtonEventProperties}
      disableLoadingState={disableLoadingState}
      buttonClassName={
        isPurchaseRequired ? 'btn-economy-robux-white-lg purchase-button' : undefined
      }
      hideButtonText={!isPurchaseRequired}
      redirectPurchaseUrl={isPurchaseRequired ? redirectPurchaseUrl : undefined}
      showDefaultPurchaseText={playabilityStatus === PlayabilityStatuses.FiatPurchaseRequired}
      shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
    />
  );
};

GameTilePlayButtonV2.defaultProps = {
  playButtonEventProperties: {},
  disableLoadingState: false,
  redirectPurchaseUrl: undefined
};

export default GameTilePlayButtonV2;
