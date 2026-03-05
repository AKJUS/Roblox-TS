import React, { useMemo } from "react";
import { useTokens } from "@rbx/core-scripts/react";
import { TSongSort } from "../common/types/bedev2Types";
import useSduiContext from "../sdui/hooks/useSduiContext";
import { TSduiPageContextType, TServerDrivenComponentConfig } from "../sdui/system/SduiTypes";
import { SduiRegisteredComponents } from "../sdui/system/SduiComponentRegistry";
import SduiComponent from "../sdui/system/SduiComponent";
import { buildSessionAnalyticsData } from "../sdui/utils/analyticsParsingUtils";
import { usePageSession } from "../common/utils/PageSessionContext";
import { SduiActionType } from "../sdui/system/SduiActionParserRegistry";

type TSongCarouselFeedItemProps = {
  sort: TSongSort;
  positionId: number;
  currentPage: TSduiPageContextType;
};

export const SongCarouselFeedItem = ({
  sort,
  positionId,
  currentPage,
}: TSongCarouselFeedItemProps): JSX.Element | null => {
  const tokens = useTokens();
  const sduiContext = useSduiContext(undefined, currentPage);
  const pageSessionInfo = usePageSession();

  const localAnalyticsData = useMemo(() => {
    return buildSessionAnalyticsData(pageSessionInfo, sduiContext);
  }, [pageSessionInfo, sduiContext]);

  const items: TServerDrivenComponentConfig[] = useMemo(() => {
    return sort.songs.map(song => ({
      componentType: SduiRegisteredComponents.Tile,
      analyticsData: {
        id: song.assetId,
      },
      props: {
        imageAspectRatio: 1,
        titleText: song.title,
        image: `rbxthumb://type=Asset&id=${song.albumArtAssetId}&w=150&h=150`,
        footerComponent: {
          componentType: SduiRegisteredComponents.TileFooter,
          props: {
            leftText: song.artist,
          },
        },
      },
    }));
  }, [sort.songs]);

  const componentConfig = useMemo(
    () => ({
      componentType: SduiRegisteredComponents.CollectionCarousel,
      props: {
        items,
        layoutOverrides: {
          sideMargin: tokens.Gap.XLarge,
        },
        scrollingEnabledOverride: true,
        collectionItemSize: "Small",
        headerComponent: {
          componentType: SduiRegisteredComponents.SectionHeader,
          props: {
            titleText: sort.topic,
            titleGap: tokens.Gap.XSmall,
            subtitleText: sort.subtitle,
            titleIcon: "icons/navigation/pushRight_small",
            infoText: sort.topicLayoutData?.infoText,
            onTitleActivated: {
              actionType: SduiActionType.OpenSeeAll,
              actionParams: {
                // MUS-1979 TODO: Validate analytics
                collectionId: sort.topicId,
                collectionName: sort.sortId,
                // positionId is 0-indexed but an actual BE response will send
                // 1-indexed values, so we increment 1 to ensure
                // collectionPosition matches what SDUI would send
                collectionPosition: positionId + 1,
              },
            },
          },
        },
      },
    }),
    [
      items,
      positionId,
      sort.sortId,
      sort.subtitle,
      sort.topic,
      sort.topicId,
      sort.topicLayoutData?.infoText,
      tokens.Gap.XLarge,
      tokens.Gap.XSmall,
    ],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <SduiComponent
      componentConfig={componentConfig}
      parentAnalyticsContext={{}}
      // MUS-1979 TODO: Validate analytics
      localAnalyticsData={localAnalyticsData}
      sduiContext={sduiContext}
    />
  );
};

export default SongCarouselFeedItem;
