import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import "@rbx/core-scripts/global";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { SearchLandingService } from "@rbx/legacy-webapp-types/Roblox";
import bedev2Services from "../common/services/bedev2Services";
import { translationConfig } from "./app.config";
import { mapExploreApiSortsResponse } from "../omniFeed/utils/gameSortUtils";
import { TExploreApiSorts, TTreatmentType } from "../common/types/bedev2Types";
import {
  ModalEvent,
  UpdateSearchSessionInfoEventParams,
  ShowSearchLandingEventParams,
} from "./service/modalConstants";
import SearchLandingPageSessionContext from "./SearchLandingPageSessionContext";
import { searchLandingPage } from "../common/constants/configConstants";
import OmniFeedItem from "../omniFeed/OmniFeedItem";
import { PageContext } from "../common/types/pageContext";
import useFriendsPresence from "../common/hooks/useFriendsPresence";
import useExperimentValues from "../common/hooks/useExperimentValues";
import experimentConstants from "../common/constants/experimentConstants";

function SearchLandingPageOmniFeed({ translate }: WithTranslationsProps): JSX.Element | null {
  const [showSearchLanding, setShowSearchLanding] = useState<boolean>(false);
  const [sessionInfo, setSessionInfo] = useState<string>();
  const [recommendations, setRecommendations] = useState<TExploreApiSorts | undefined>(undefined);
  const [prevHasRecommendations, setPrevHasRecommendations] = useState(false);
  const shouldNotifyHasContentRef = useRef(false);

  const friendsPresenceData = useFriendsPresence();
  const { ixpData, isLoading: ixpLoading } = useExperimentValues(
    experimentConstants.layerNames.searchLandingPage,
    experimentConstants.defaultValues.searchLandingPage,
  );
  const isSearchQueryPillsEnabled = ixpData.IsSearchQueryPillsEnabled;
  const isMigrateToNewSlpEndpointEnabled = ixpData.IsMigrateToNewSlpEndpointEnabled;

  useEffect(() => {
    const isValidUpdateSessionInfoEvent = (
      event: Event,
    ): event is CustomEvent<UpdateSearchSessionInfoEventParams> => {
      return event instanceof CustomEvent && event.type === ModalEvent.UpdateSearchSessionInfo;
    };
    const onUpdateSessionInfo = (event: Event) => {
      if (isValidUpdateSessionInfoEvent(event)) {
        const { sessionInfo: updatedSessionInfo } = event.detail;
        setSessionInfo(updatedSessionInfo);
      }
    };

    const isValidShowSlpEvent = (
      event: Event,
    ): event is CustomEvent<ShowSearchLandingEventParams> => {
      return event instanceof CustomEvent && event.type === ModalEvent.ShowSearchLanding;
    };
    const onShowSearchLanding = (event: Event) => {
      if (isValidShowSlpEvent(event)) {
        const { sessionInfo: updatedSessionInfo } = event.detail;
        setSessionInfo(updatedSessionInfo);
        setShowSearchLanding(true);
      }
    };

    window.addEventListener(ModalEvent.UpdateSearchSessionInfo, onUpdateSessionInfo);
    window.addEventListener(ModalEvent.ShowSearchLanding, onShowSearchLanding);
    return () => {
      window.removeEventListener(ModalEvent.UpdateSearchSessionInfo, onUpdateSessionInfo);
      window.removeEventListener(ModalEvent.ShowSearchLanding, onShowSearchLanding);
    };
  }, []);

  const fetchLandingRecommendations = useCallback(() => {
    if (!sessionInfo) {
      window.EventTracker?.fireEvent(searchLandingPage.searchLandingPageMissingSessionInfoError);
      return;
    }
    bedev2Services
      .getSearchLandingRecommendations(sessionInfo, isMigrateToNewSlpEndpointEnabled)
      .then(data => {
        window.EventTracker?.fireEvent(
          searchLandingPage.searchLandingPageFetchRecommendationsSuccess,
        );
        const recs = mapExploreApiSortsResponse(data, isSearchQueryPillsEnabled);
        recs.sorts.forEach(sort => {
          if (
            sort.treatmentType !== TTreatmentType.Carousel &&
            sort.treatmentType !== TTreatmentType.SearchPillCarousel
          ) {
            window.EventTracker?.fireEvent(
              searchLandingPage.searchLandingPageUnexpectedTreatmentTypeError,
            );
          }
        });
        setRecommendations(recs);
        setPrevHasRecommendations((currValue: boolean) => {
          const hasRecommendations =
            recs?.sorts.some(
              sort =>
                (sort.treatmentType === TTreatmentType.Carousel && sort.games.length > 0) ||
                (sort.treatmentType === TTreatmentType.SearchPillCarousel &&
                  sort.queries.length > 0),
            ) ?? false;
          // Needed for users who have no experiences in the recently visited section
          if (currValue !== hasRecommendations && hasRecommendations) {
            shouldNotifyHasContentRef.current = true;
            return true;
          }
          return currValue;
        });
      })
      .catch(() => {
        window.EventTracker?.fireEvent(
          searchLandingPage.searchLandingPageFetchRecommendationsError,
        );
        setRecommendations(undefined);
      });
  }, [sessionInfo, isSearchQueryPillsEnabled, isMigrateToNewSlpEndpointEnabled]);

  useEffect(() => {
    if (!showSearchLanding || ixpLoading) return;
    fetchLandingRecommendations();
  }, [fetchLandingRecommendations, showSearchLanding, ixpLoading]);

  useEffect(() => {
    if (shouldNotifyHasContentRef.current) {
      SearchLandingService.setSearchLandingHasContent();
      shouldNotifyHasContentRef.current = false;
    }
  }, [prevHasRecommendations]);

  // If the SLP is disabled or the recommendations are empty, don't render the SLP
  if (ixpLoading || !showSearchLanding || !prevHasRecommendations || !recommendations) return null;

  return (
    <SearchLandingPageSessionContext.Provider value={sessionInfo}>
      <section
        data-testid="SearchLandingPageOmniFeedTestId"
        className="search-landing-container"
        role="presentation"
        onMouseDown={e => {
          // Prevent onBlur from SearchInput component from hiding the search landing
          // if the click occurs within the search landing UI
          e.preventDefault();
        }}
      >
        {recommendations.sorts.map((sort, positionId) => (
          <OmniFeedItem
            // eslint-disable-next-line react/no-array-index-key
            key={positionId}
            translate={translate}
            sort={sort}
            positionId={positionId}
            // TODO CLIGROW-2277 write hook to get the starting row
            startingRow={undefined}
            friendsPresenceData={friendsPresenceData}
            currentPage={PageContext.SearchLandingPage}
            itemsPerRow={searchLandingPage.numberOfTilesPerCarousel}
            isCarouselHorizontalScrollEnabled
          />
        ))}
      </section>
    </SearchLandingPageSessionContext.Provider>
  );
}

export default withTranslations(SearchLandingPageOmniFeed, translationConfig);
