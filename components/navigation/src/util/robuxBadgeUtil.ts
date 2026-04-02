import { localStorageService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import RobuxBadgeType from "../constants/robuxBadgeConstants";

export const mapRobuxBadgeTypeToLocalStorageKey = (robuxBadgeType: string): string => {
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      return `prevLocalVirtualItemStartTimeSeconds${CurrentUser?.userId ?? ""}`;
    case RobuxBadgeType.UPDATE:
      return "hasSeenRobuxUpdate";
    case RobuxBadgeType.PERSONALIZED_BONUS_ITEMS:
      return "hasSeenRobuxPersonalizedBonusItems";
    case RobuxBadgeType.BONUS_AVATAR_ITEM:
      return "hasSeenRobuxBonusAvatarItem";
    default:
      return "";
  }
};

export const mapRobuxBadgeTypeToStr = (robuxBadgeType: string): string => {
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
    case RobuxBadgeType.PERSONALIZED_BONUS_ITEMS:
    case RobuxBadgeType.BONUS_AVATAR_ITEM:
      return "Labels.NewItem";
    case RobuxBadgeType.UPDATE:
      return "Labels.NewUpdate";
    default:
      return "";
  }
};

export const setRobuxBadgeLocalStorage = (robuxBadgeType: string): void => {
  const localStorageKey = mapRobuxBadgeTypeToLocalStorageKey(robuxBadgeType);
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      // Set local storage to hide robux badge for current virtual item when badge is acknowledged.
      localStorageService.setLocalStorage(localStorageKey, Math.floor(Date.now() / 1000));
      break;
    case RobuxBadgeType.UPDATE:
    case RobuxBadgeType.PERSONALIZED_BONUS_ITEMS:
    case RobuxBadgeType.BONUS_AVATAR_ITEM:
      localStorageService.setLocalStorage(localStorageKey, "true");
      break;
    default:
  }
};

// getLocalStorage is typed to return any, so override the warning
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRobuxBadgeLocalStorage = (robuxBadgeType: string): any => {
  const localStorageKey = mapRobuxBadgeTypeToLocalStorageKey(robuxBadgeType);
  return localStorageService.getLocalStorage(localStorageKey);
};

export const shouldShowRobuxUpdateBadge = (): string => {
  if (getRobuxBadgeLocalStorage(RobuxBadgeType.BONUS_AVATAR_ITEM) !== "true") {
    return RobuxBadgeType.BONUS_AVATAR_ITEM;
  }

  if (getRobuxBadgeLocalStorage(RobuxBadgeType.PERSONALIZED_BONUS_ITEMS) !== "true") {
    return RobuxBadgeType.PERSONALIZED_BONUS_ITEMS;
  }

  return "";
};
