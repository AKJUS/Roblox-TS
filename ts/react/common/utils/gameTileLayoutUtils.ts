import { TileBadgePositionEnum } from '../constants/genericTileConstants';
import {
  TGameTileBadgeType,
  TGameTilePillData,
  TGameTileTextFooter,
  TLayoutComponentType,
  TLayoutMetadata,
  TTileBadge,
  TTileBadgesByPosition
} from '../types/bedev1Types';

export const getGameTilePillsIconClass = (icon: string): string | null => {
  switch (icon) {
    case 'icons/menu/gem_small':
      return 'icon-gem-dark-stroke';
    default:
      return null;
  }
};

export const getGameTilePillsAnimationClass = (tileBadge: TTileBadge): string | null => {
  return tileBadge.isShimmerEnabled ? 'shimmer-animation' : null;
};

export const getGameTilePillsPositionClass = (position: TileBadgePositionEnum): string => {
  switch (position) {
    case TileBadgePositionEnum.IMAGE_TOP_LEFT:
      return 'game-card-pill-top-left';
    case TileBadgePositionEnum.IMAGE_TOP_RIGHT:
      return 'game-card-pill-top-right';
    case TileBadgePositionEnum.IMAGE_BOTTOM_LEFT:
      return 'game-card-pill-bottom-left';
    case TileBadgePositionEnum.IMAGE_BOTTOM_RIGHT:
      return 'game-card-pill-bottom-right';
    default:
      return '';
  }
};

export type TGameTilesPillsByPosition = Partial<Record<TileBadgePositionEnum, TGameTilePillData[]>>;

const processBadges = (badges: TTileBadge[] | undefined): TGameTilePillData[] => {
  if (!badges || !badges.length) {
    return [];
  }
  return badges.map(tileBadge => {
    const badgeData: TGameTilePillData = {
      id: tileBadge.analyticsId
    };
    if (tileBadge.tileBadgeType === TGameTileBadgeType.Text && tileBadge.text) {
      badgeData.text = tileBadge.text;
      badgeData.animationClass = getGameTilePillsAnimationClass(tileBadge);
    } else if (tileBadge.tileBadgeType === TGameTileBadgeType.Icon && tileBadge.icons) {
      const icons = tileBadge.icons
        .map(icon => getGameTilePillsIconClass(icon))
        .filter(icon => !!icon) as string[];
      badgeData.icons = icons;
      badgeData.animationClass = getGameTilePillsAnimationClass(tileBadge);
    }
    badgeData.componentType = tileBadge.tileBadgeComponentType;
    return badgeData;
  });
};

export const getGameTilePillsData = (
  gameLayoutData: TLayoutMetadata | undefined
): TGameTilesPillsByPosition | null => {
  const validPillPositions = Object.values(TileBadgePositionEnum).filter(
    position => position !== TileBadgePositionEnum.INVALID
  );

  const pillsByPosition: TGameTilesPillsByPosition = {};

  validPillPositions.forEach(position => {
    const badges = gameLayoutData?.tileBadgesByPosition?.[position as keyof TTileBadgesByPosition];
    const pillsData = processBadges(badges);
    if (pillsData.length) {
      pillsByPosition[position] = pillsData;
    }
  });

  return Object.keys(pillsByPosition).length > 0 ? pillsByPosition : null;
};

export const getGameTileTextFooterData = (
  gameLayoutData: TLayoutMetadata | undefined
): TGameTileTextFooter | null => {
  return gameLayoutData?.footer?.type === TLayoutComponentType.TextLabel
    ? gameLayoutData.footer
    : null;
};

export default {
  getGameTilePillsData,
  getGameTilePillsIconClass,
  getGameTilePillsAnimationClass,
  getGameTilePillsPositionClass,
  getGameTileTextFooterData
};
