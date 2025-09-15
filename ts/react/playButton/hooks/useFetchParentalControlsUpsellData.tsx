import { useState, useEffect } from 'react';
import playButtonService from '../services/playButtonService';
import { TContentMaturityRating, TSettingResponse } from '../types/playButtonTypes';
import { getContentMaturityRatingFromAgeRecommendationResponse } from '../utils/playButtonUtils';

type TParentalControlsUpsellData = {
  contentAgeRestriction: TSettingResponse | undefined;
  contentMaturityRating: TContentMaturityRating | undefined;
  isFetching: boolean;
  hasError: boolean;
};

/**
 * Fetches the experience's contentMaturityRating and the user's contentAgeRestriction setting,
 * which will be used to determine which upsell modal to display.
 */
const useFetchParentalControlsUpsellData = (universeId: string): TParentalControlsUpsellData => {
  const [contentAgeRestriction, setContentAgeRestrictionResponse] = useState<
    TSettingResponse | undefined
  >(undefined);
  const [isFetchingSettings, setIsFetchingSettings] = useState<boolean>(false);

  const [contentMaturityRating, setContentMaturityRating] = useState<
    TContentMaturityRating | undefined
  >(undefined);
  const [isFetchingAgeRecommendation, setIsFetchingAgeRecommendation] = useState<boolean>(false);

  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setIsFetchingSettings(true);
    playButtonService
      .getUserSettingsAndOptions()
      .then(response => {
        setContentAgeRestrictionResponse(response?.contentAgeRestriction);
      })
      .catch(() => setHasError(true))
      .finally(() => setIsFetchingSettings(false));
  }, []);

  useEffect(() => {
    setIsFetchingAgeRecommendation(true);
    playButtonService
      .getAgeRecommendation(universeId)
      .then(response => {
        setContentMaturityRating(getContentMaturityRatingFromAgeRecommendationResponse(response));
      })
      .catch(() => setHasError(true))
      .finally(() => setIsFetchingAgeRecommendation(false));
  }, [universeId]);

  return {
    contentAgeRestriction,
    contentMaturityRating,
    isFetching: isFetchingSettings || isFetchingAgeRecommendation,
    hasError
  };
};

export default useFetchParentalControlsUpsellData;
