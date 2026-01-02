/* eslint-disable import/prefer-default-export */
import { localStorageService } from 'core-roblox-utilities';
import itemDetailsService from '../../../js/react/itemPurchase/services/itemDetailsService';
import itemPurchaseConstants from '../../../js/react/itemPurchase/constants/itemPurchaseConstants';

const { CacheKey } = itemPurchaseConstants;

const CACHE_KEY = CacheKey.shouldShowUnifiedPurchaseModal;

type EligibilityCache = {
  isEligible: boolean;
  expiry: number;
};

interface UnifiedPurchaseFlowMetadata {
  isUserEligibleForUnifiedPurchaseFlow: boolean;
  expiresInSeconds: number;
}

interface SubscriptionsMetadataResponse {
  unifiedPurchaseFlowMetadata: UnifiedPurchaseFlowMetadata;
}

export const getIsUserEligibleForUnifiedPurchaseFlow = async () => {
  const cached = localStorageService.getLocalStorage(CACHE_KEY) as string | undefined;

  if (cached) {
    try {
      const parsed: EligibilityCache = JSON.parse(cached) as EligibilityCache;
      const { isEligible, expiry } = parsed;
      const now = Date.now();

      if (now < expiry) {
        return isEligible;
      }

      localStorageService.removeLocalStorage(CACHE_KEY);
    } catch {
      localStorageService.removeLocalStorage(CACHE_KEY);
    }
  }

  // No valid cache, fetch fresh data
  try {
    const response = (await itemDetailsService.getSubscriptionsMetadata()) as {
      data: SubscriptionsMetadataResponse;
    };
    const {
      isUserEligibleForUnifiedPurchaseFlow,
      expiresInSeconds
    } = response.data?.unifiedPurchaseFlowMetadata;

    // compute expiry timestamp
    const expiry = Date.now() + expiresInSeconds * 1000;
    const cacheData: EligibilityCache = {
      isEligible: isUserEligibleForUnifiedPurchaseFlow,
      expiry
    };
    localStorageService.setLocalStorage(CACHE_KEY, JSON.stringify(cacheData));

    return isUserEligibleForUnifiedPurchaseFlow;
  } catch (err) {
    // Fallback to default (not eligible)
    return false;
  }
};
