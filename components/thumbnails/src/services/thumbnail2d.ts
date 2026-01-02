import { QueueItem } from "@rbx/core-scripts/util/batch-request";
import { defaultThumbnailRequester } from "../util/thumbnailRequester";
import { batchRequestHandler, universeThumbnailHandler } from "../util/thumbnailHandler";
import {
  ThumbnailTypes,
  ThumbnailStates,
  ThumbnailAssetsSize,
  ThumbnailGameIconSize,
  ThumbnailGamePassIconSize,
  ThumbnailGameThumbnailSize,
  ThumbnailUniverseThumbnailSize,
  ThumbnailGroupIconSize,
  ThumbnailBadgeIconSize,
  ThumbnailDeveloperProductIconSize,
  ThumbnailAvatarsSize,
  ThumbnailFormat,
  ThumbnailAvatarHeadshotSize,
  ThumbnailQueueItem,
} from "../constants/thumbnail2dConstant";

const loadThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string,
  clearCachedValue?: boolean,
  version?: number,
) => {
  if (!targetId && !token) {
    return new Promise((_resolve, reject) => {
      reject(new Error("TargetId or token can not be empty."));
    });
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!thumbnailType) {
    return new Promise((_resolve, reject) => {
      reject(new Error("ThumbnailType can not be empty."));
    });
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-param-reassign
  format ??= ThumbnailFormat.webp;

  // Temp solution to override game icon request format for security purpose
  let formatOverride = format;
  if (
    thumbnailType === ThumbnailTypes.gameIcon ||
    thumbnailType === ThumbnailTypes.gameThumbnail ||
    thumbnailType === ThumbnailTypes.placeGameIcon ||
    thumbnailType === ThumbnailTypes.universeThumbnail
  ) {
    formatOverride = ThumbnailFormat.webp;
  }

  const item = {
    targetId,
    token,
    type: thumbnailType,
    format: formatOverride,
    size,
    version,
  };

  const customHandler = [ThumbnailTypes.universeThumbnails, ThumbnailTypes.universeThumbnail];
  // null requesterKey creates new batch request processor.
  const requesterKey = !customHandler.includes(thumbnailType)
    ? "thumbnail2dProcessor"
    : "universeThumbnailProcessor";
  return defaultThumbnailRequester.processThumbnailBatchRequest(
    item,
    (items: QueueItem<ThumbnailQueueItem>[]) => {
      if (thumbnailType === ThumbnailTypes.universeThumbnail) {
        return universeThumbnailHandler.handle(items, 1);
      }

      if (thumbnailType === ThumbnailTypes.universeThumbnails) {
        return universeThumbnailHandler.handle(items, 10);
      }

      return batchRequestHandler.handle(items);
    },
    requesterKey,
    clearCachedValue,
  );
};

const getThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string,
  version?: number,
) => loadThumbnailImage(thumbnailType, size, format, targetId, token, false, version);

const reloadThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string,
) => loadThumbnailImage(thumbnailType, size, format, targetId, token, true);

const getCssClass = (thumbnailState: ThumbnailStates) => ({
  "icon-broken": thumbnailState === ThumbnailStates.error,
  "icon-in-review": thumbnailState === ThumbnailStates.inReview,
  "icon-blocked": thumbnailState === ThumbnailStates.blocked,
  "icon-pending": thumbnailState === ThumbnailStates.pending,
});

export { getThumbnailImage, getCssClass, reloadThumbnailImage };
