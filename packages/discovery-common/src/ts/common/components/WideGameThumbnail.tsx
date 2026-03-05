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
  const thumbnailAssetId: number | null = useMemo(() => {
    return getThumbnailOverrideAssetId(gameData, topicId);
  }, [gameData, topicId]);

  const thumbnailSize: string = useMemo(() => {
    if (sizeOverride) {
      return sizeOverride;
    }
    if (wideTileType === TComponentType.EventTile) {
      return ThumbnailGameThumbnailSize.width576;
    }
    return ThumbnailGameThumbnailSize.width384;
  }, [sizeOverride, wideTileType]);

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
