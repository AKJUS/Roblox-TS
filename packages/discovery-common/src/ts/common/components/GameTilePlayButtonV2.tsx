import { ValidHttpUrl } from "@rbx/core-scripts/util/url";
import React, { useMemo } from "react";
import { Loading } from "@rbx/core-ui";
import { usePlayabilityStatus, PlayabilityStatus, DefaultPlayButton } from "@rbx/game-play-button";
import { ValueOf } from "../utils/typeUtils";
import useGetAppPolicyData from "../hooks/useGetAppPolicyData";

export const GameTilePlayButtonV2 = ({
  universeId,
  placeId,
  playButtonEventProperties,
  disableLoadingState,
  redirectPurchaseUrl,
}: {
  universeId: string;
  placeId: string;
  playButtonEventProperties?: Record<string, string | number | undefined>;
  disableLoadingState?: boolean;
  redirectPurchaseUrl?: ValidHttpUrl;
}): JSX.Element => {
  const { playabilityStatus, refetchPlayabilityData } = usePlayabilityStatus(universeId);

  const { shouldShowVpcPlayButtonUpsells, isFetchingPolicy } = useGetAppPolicyData();

  const isPurchaseRequired = useMemo((): boolean => {
    if (!playabilityStatus) {
      return false;
    }
    const allowedList = [
      PlayabilityStatus.PurchaseRequired,
      PlayabilityStatus.FiatPurchaseRequired,
    ] as ValueOf<typeof PlayabilityStatus>[];

    return allowedList.includes(playabilityStatus);
  }, [playabilityStatus]);

  if (isFetchingPolicy) {
    if (!disableLoadingState) {
      return <Loading />;
    }

    return (
      <DefaultPlayButton
        placeId={placeId}
        universeId={universeId}
        refetchPlayabilityStatus={refetchPlayabilityData}
        playabilityStatus={PlayabilityStatus.Playable}
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
      refetchPlayabilityStatus={refetchPlayabilityData}
      playabilityStatus={playabilityStatus}
      eventProperties={playButtonEventProperties}
      disableLoadingState={disableLoadingState}
      buttonClassName={
        isPurchaseRequired ? "btn-economy-robux-white-lg purchase-button" : undefined
      }
      hideButtonText={!isPurchaseRequired}
      redirectPurchaseUrl={isPurchaseRequired ? redirectPurchaseUrl : undefined}
      showDefaultPurchaseText={playabilityStatus === PlayabilityStatus.FiatPurchaseRequired}
      shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
    />
  );
};

GameTilePlayButtonV2.defaultProps = {
  playButtonEventProperties: {},
  disableLoadingState: false,
  redirectPurchaseUrl: undefined,
};

export default GameTilePlayButtonV2;
