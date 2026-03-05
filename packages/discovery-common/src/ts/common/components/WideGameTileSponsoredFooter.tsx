import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { CommonGameSorts, FeatureGamePage } from "../constants/translationConstants";
import GamesInfoTooltip from "./GamesInfoTooltip";

// WideGameTileSponsoredFooter variants
// - enableSponsoredFeedback: false > shows "Sponsored" + info icon ad
//   disclosure tooltip, true > shows "Ad" with no icon/tooltip
// - trailingContent: optional element that appears after the ad label,
//   separated by a bullet and hidden when game tile width is below 225px
const WideGameTileSponsoredFooter = ({
  enableSponsoredFeedback = false,
  trailingContent,
  translate,
}: {
  enableSponsoredFeedback?: boolean;
  trailingContent?: JSX.Element;
  translate: TranslateFunction;
}): JSX.Element => {
  const adLabel = enableSponsoredFeedback
    ? FeatureGamePage.LabelAd
    : FeatureGamePage.LabelSponsoredAd;

  return (
    <div className="game-card-info sponsored-footer" data-testid="wide-game-tile-sponsored-footer">
      <span className="info-label sponsored-ad-label">{translate(adLabel)}</span>
      {trailingContent && (
        <React.Fragment>
          <span className="bullet inline-rating">•</span>
          <span className="inline-rating">{trailingContent}</span>
        </React.Fragment>
      )}
      {!enableSponsoredFeedback && (
        <GamesInfoTooltip
          tooltipText={
            translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
            "Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics."
          }
          placement="right"
          sizeInPx={16}
        />
      )}
    </div>
  );
};

export default WideGameTileSponsoredFooter;
