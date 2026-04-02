import React, { useMemo } from "react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailGameThumbnailSize,
  ThumbnailFormat,
} from "@rbx/thumbnails";
import { getThumbnailOverrideAssetId } from "../utils/parsingUtils";
import { TGameData } from "../types/bedev1Types";
import { TComponentType } from "../types/bedev2Types";
import useIsHigherResolutionWideGameTileThumbnailEnabled from "../hooks/useIsHigherResolutionWideGameTileThumbnailEnabled";

type TWideGameThumbnailProps = {
  gameData: TGameData;
  topicId: string | undefined;
  wideTileType: TComponentType;
  sizeOverride?: ThumbnailGameThumbnailSize;
};

const WideGameThumbnail = ({
  gameData,
  topicId,
  wideTileType,
  sizeOverride,
}: TWideGameThumbnailProps): JSX.Element => {
  const { isHigherResolutionWideThumbnailEnabled, isIxpLoading } =
    useIsHigherResolutionWideGameTileThumbnailEnabled();

  const thumbnailAssetId: number | null = useMemo(() => {
    return getThumbnailOverrideAssetId(gameData, topicId);
  }, [gameData, topicId]);

  const thumbnailSize = useMemo<ThumbnailGameThumbnailSize | undefined>(() => {
    if (sizeOverride) {
      return sizeOverride;
    }
    if (wideTileType === TComponentType.EventTile) {
      return ThumbnailGameThumbnailSize.width576;
    }
    // Only GridTile without a sizeOverride is affected by IXP; other tile types
    // and overridden sizes are independent of the experiment and render immediately.
    if (wideTileType === TComponentType.GridTile) {
      // Defer until the IXP size is known to prevent a fetch at the wrong size
      // followed by an immediate re-fetch once the flag resolves.
      if (isIxpLoading) {
        return undefined;
      }
      if (isHigherResolutionWideThumbnailEnabled) {
        return ThumbnailGameThumbnailSize.width480;
      }
    }
    return ThumbnailGameThumbnailSize.width384;
  }, [sizeOverride, wideTileType, isIxpLoading, isHigherResolutionWideThumbnailEnabled]);

  if (thumbnailSize === undefined) {
    return (
      <span
        data-testid="wide-game-thumbnail-shimmer"
        className="thumbnail-2d-container brief-game-icon shimmer"
      />
    );
  }

  if (thumbnailAssetId !== null) {
    return (
      <Thumbnail2d
        type={ThumbnailTypes.assetThumbnail}
        size={thumbnailSize}
        targetId={thumbnailAssetId}
        containerClass="brief-game-icon"
        format={ThumbnailFormat.jpeg}
        altName={gameData.name}
      />
    );
  }

  return (
    <Thumbnail2d
      type={ThumbnailTypes.gameThumbnail}
      size={thumbnailSize}
      targetId={gameData.placeId}
      containerClass="brief-game-icon"
      format={ThumbnailFormat.jpeg}
      altName={gameData.name}
    />
  );
};

export default WideGameThumbnail;
