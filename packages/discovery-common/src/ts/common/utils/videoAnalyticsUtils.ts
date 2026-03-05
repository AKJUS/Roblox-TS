import { VideoEventPageContext } from "@rbx/video-player";
import { PageContext } from "../types/pageContext";
import { common } from "../constants/configConstants";

/**
 * Converts a PageContext to a VideoEventPageContext for video telemetry.
 *
 * VideoEventPageContext values are designed to match the page context values used by
 * video engagement event reporting on mobile/desktop App.
 *
 * The App values are derived from AppPage.lua with the addition of "GameDetails",
 * which unifies AppPage.GameDetail and AppPage.ExperienceDetail.
 */
export const getVideoEventPageContext = (
  pageContext?: PageContext,
): VideoEventPageContext | undefined => {
  switch (pageContext) {
    case PageContext.HomePage:
      return VideoEventPageContext.Home;
    case PageContext.GameDetailPage:
      return VideoEventPageContext.GameDetails;
    default:
      window.EventTracker?.fireEvent(common.NoMatchingVideoEventPageContextFoundCounterEvent);
      return undefined;
  }
};
