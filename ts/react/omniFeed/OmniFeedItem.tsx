import React from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { TOmniRecommendationGame, TSort, TTreatmentType } from '../common/types/bedev2Types';
import GameCarouselFeedItem from './GameCarouselFeedItem';
import AvatarCarouselFeedItem from './AvatarCarouselFeedItem';
import GameGridFeedItem from './GameGridFeedItem';
import { PageContext } from '../common/types/pageContext';
import FriendCarouselFeedItem from './FriendCarouselFeedItem';
import FiltersFeedItem from './FiltersFeedItem';
import SduiFeedItem from './SduiFeedItem';
import SongCarouselFeedItem from './SongCarouselFeedItem';
import { TOmniRecommendationSduiTree, TSduiPageContextType } from '../sdui/system/SduiTypes';
import { logSduiError, SduiErrorNames } from '../sdui/utils/logSduiError';
import { isSupportedSduiPage } from '../sdui/utils/sduiValidationUtils';

type TOmniFeedItemProps = {
  translate: WithTranslationsProps['translate'];
  sort: TSort;
  positionId: number;
  currentPage: PageContext.HomePage | PageContext.GamesPage | PageContext.SearchLandingPage;
  itemsPerRow: number | undefined;
  startingRow: number | undefined;
  gridRecommendations?: TOmniRecommendationGame[];
  loadMoreGames?: () => void;
  isLoadingMoreGames?: boolean;
  isExpandHomeContentEnabled?: boolean;
  isMusicChartsCarouselEnabled?: boolean;
  isCarouselHorizontalScrollEnabled?: boolean;
  isNewScrollArrowsEnabled?: boolean;
  isNewSortHeaderEnabled?: boolean;
  sduiRoot?: TOmniRecommendationSduiTree;
  fetchGamesPageData?: (filters: Map<string, string>) => void;
};

export const OmniFeedItem = ({
  translate,
  sort,
  positionId,
  currentPage,
  itemsPerRow,
  startingRow,
  gridRecommendations,
  loadMoreGames,
  isLoadingMoreGames,
  isExpandHomeContentEnabled,
  isMusicChartsCarouselEnabled,
  isCarouselHorizontalScrollEnabled,
  isNewScrollArrowsEnabled,
  isNewSortHeaderEnabled,
  sduiRoot,
  fetchGamesPageData
}: TOmniFeedItemProps): JSX.Element | null => {
  switch (sort.treatmentType) {
    case TTreatmentType.Carousel:
      return (
        <GameCarouselFeedItem
          translate={translate}
          sort={sort}
          positionId={positionId}
          page={currentPage}
          itemsPerRow={itemsPerRow}
          startingRow={startingRow}
          loadMoreGames={loadMoreGames}
          isLoadingMoreGames={isLoadingMoreGames}
          isExpandHomeContentEnabled={isExpandHomeContentEnabled}
          isCarouselHorizontalScrollEnabled={isCarouselHorizontalScrollEnabled}
          isNewSortHeaderEnabled={isNewSortHeaderEnabled}
          isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
        />
      );
    case TTreatmentType.AvatarCarousel:
      return <AvatarCarouselFeedItem sort={sort} />;
    case TTreatmentType.SortlessGrid:
      return (
        <GameGridFeedItem
          translate={translate}
          sort={sort}
          positionId={positionId}
          itemsPerRow={itemsPerRow}
          startingRow={startingRow}
          recommendations={gridRecommendations ?? []}
          isExpandHomeContentEnabled={isExpandHomeContentEnabled}
          isNewSortHeaderEnabled={isNewSortHeaderEnabled}
        />
      );
    case TTreatmentType.FriendCarousel:
      return <FriendCarouselFeedItem sortId={sort.topicId} sortPosition={positionId} />;
    case TTreatmentType.SongCarousel:
      // MUS-2078 TODO: Remove this condition once the Music surfaces are ready
      // for launch
      if (!isMusicChartsCarouselEnabled) {
        return <React.Fragment />;
      }

      if (!isSupportedSduiPage(currentPage)) {
        logSduiError(
          SduiErrorNames.UnsupportedSduiPage,
          `${currentPage} is not supported for SongCarouselFeedItem`,
          {
            pageName: currentPage as TSduiPageContextType
          }
        );
        return <React.Fragment />;
      }

      return <SongCarouselFeedItem sort={sort} positionId={positionId} currentPage={currentPage} />;
    case TTreatmentType.Pills:
      return (
        <FiltersFeedItem
          sort={sort}
          positionId={positionId}
          translate={translate}
          fetchGamesPageData={fetchGamesPageData}
        />
      );
    case TTreatmentType.Sdui:
      if (!isSupportedSduiPage(currentPage)) {
        logSduiError(
          SduiErrorNames.UnsupportedSduiPage,
          `${currentPage} is not supported for SduiFeedItem`,
          {
            pageName: currentPage as TSduiPageContextType
          }
        );
        return <React.Fragment />;
      }
      return <SduiFeedItem sort={sort} sduiRoot={sduiRoot} currentPage={currentPage} />;
    default:
      return null;
  }
};

OmniFeedItem.defaultProps = {
  loadMoreGames: undefined,
  isLoadingMoreGames: undefined,
  gridRecommendations: [],
  isExpandHomeContentEnabled: undefined,
  isMusicChartsCarouselEnabled: undefined,
  isCarouselHorizontalScrollEnabled: undefined,
  fetchGamesPageData: undefined,
  isNewScrollArrowsEnabled: undefined,
  isNewSortHeaderEnabled: undefined
};

export default OmniFeedItem;
