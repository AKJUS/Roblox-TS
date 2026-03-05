import { useMemo } from "react";
import { isVideoPlayerSupportedByBrowser } from "@rbx/video-player";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { usePlayabilityStatus, PlayabilityStatus } from "@rbx/game-play-button";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import experimentConstants from "../../common/constants/experimentConstants";

const { layerNames, defaultValues } = experimentConstants;

/**
 * Verify that the user:
 * - is authenticated
 * - is enrolled in the IXP experiment for Game Preview Video (unless bypassed)
 * - can play this experience (experience is playable or the unplayable reason is not in the ineligible list)
 *
 * All of these conditions must be true for the user to see the Video Preview.
 *
 * @param universeId - The universe ID of the experience
 * @param shouldBypassIxpCheck - If true, skip the IXP experiment check (used for tile video
 *   previews, where the backend gates the feature through sending wideVideoAssetId to enrolled users)
 */
const useIsEligibleForVideoPreview = (
  universeId: string,
  shouldBypassIxpCheck = false,
): {
  isEligibleForVideoPreview: boolean;
  isLoadingEligibility: boolean;
} => {
  const browserCompatibilityResult = useMemo(() => {
    return isVideoPlayerSupportedByBrowser();
  }, []);

  const ineligibleVideoPlayabilityStatuses: Set<string> = useMemo(() => {
    return new Set([
      PlayabilityStatus.UnderReview,
      PlayabilityStatus.UniverseRootPlaceIsPrivate,
      PlayabilityStatus.InsufficientPermissionFriendsOnly,
      PlayabilityStatus.InsufficientPermissionGroupOnly,
      PlayabilityStatus.GameUnapproved,
      PlayabilityStatus.AccountRestricted,
      PlayabilityStatus.ComplianceBlocked,
      PlayabilityStatus.ContextualPlayabilityRegionalCompliance,
      PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls,
      PlayabilityStatus.ContextualPlayabilityAgeGated,
      PlayabilityStatus.ContextualPlayabilityUnrated,
      PlayabilityStatus.ContextualPlayabilityAgeGatedByDescriptor,
      PlayabilityStatus.ContextualPlayabilityExperienceBlockedParentalControls,
    ]);
  }, []);

  const { playabilityStatus, isPlayable, isFetchingPlayability } = usePlayabilityStatus(universeId);

  const { ixpData, isLoading } = useExperimentValues(
    layerNames.gameDetails,
    defaultValues.gameDetails,
  );
  const isLoadingIxp = shouldBypassIxpCheck ? false : isLoading;
  const isGamePreviewVideoEnabledIxp = shouldBypassIxpCheck || ixpData.IsGamePreviewVideoEnabled;

  return useMemo(() => {
    if (isLoadingIxp || isFetchingPlayability) {
      return {
        isEligibleForVideoPreview: false,
        isLoadingEligibility: true,
      };
    }

    // Experience is eligible if playable, or if not playable but the reason is not in the ineligible list
    const isEligibleFromPlayabilityStatus =
      isPlayable === true ||
      (playabilityStatus !== undefined &&
        !ineligibleVideoPlayabilityStatuses.has(playabilityStatus));

    const isEligible =
      Boolean(authenticatedUser()?.isAuthenticated) &&
      isGamePreviewVideoEnabledIxp &&
      isEligibleFromPlayabilityStatus &&
      browserCompatibilityResult.isSupported;

    return {
      isEligibleForVideoPreview: isEligible,
      isLoadingEligibility: false,
    };
  }, [
    isGamePreviewVideoEnabledIxp,
    isLoadingIxp,
    playabilityStatus,
    isPlayable,
    isFetchingPlayability,
    ineligibleVideoPlayabilityStatuses,
    browserCompatibilityResult.isSupported,
  ]);
};

export default useIsEligibleForVideoPreview;
