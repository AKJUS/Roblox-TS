import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslations, TranslateFunction } from 'react-utilities';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter } from '@rbx/foundation-ui';
import type { SubscriptionProductInfo, SubscriptionOffer } from '@rbx/client-subscriptions-api/v1';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import translationConfig from '../../../js/react/itemPurchase/translation.config';
import SubscriptionUpsellBanner from './Subscriptions/SubscriptionUpsellBanner';
import RobloxSubscriptionSheet from './Subscriptions/RobloxSubscriptionSheet';
import UnifiedProductDetails from './UnifiedProductDetails';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import useModalShownTracking from '../hooks/useModalShownTracking';
import useUpsellTracking from '../hooks/useUpsellTracking';
import DiscountPriceDetail from './DiscountPriceDetail';
import { normalizeDiscountInformation } from './discountInformation';
import type { DiscountInformation } from './discountInformation';
import isPlusBenefitDiscount from '../utils/isPlusBenefitDiscount';
import isPlusSubscriptionRolloutEnabled from '../utils/subscriptionRolloutMeta';
import guacService from '../services/guacService';
// Reuse the legacy paymentSession hook from Roblox.Payments.WebApp so we share
// the same `paymentSession-${userId}` localStorage cache + single-flight as
// Buy Robux and other Plus surfaces. Cross-WebApp relative import mirrors
// Roblox.Membership.WebApp/.../robuxUpsellItem/App.tsx.
import usePaymentSession from '../../../../../Roblox.Payments.WebApp/Roblox.Payments.WebApp/ts/core/hooks/usePaymentSession';

export type UnifiedPurchaseModalProps = {
  translate: TranslateFunction;
  expectedPrice: number;
  displayPrice?: string;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  sellerName: string;
  onAction: () => void;
  onSecondaryAction?: () => void;
  secondaryActionButtonText?: string;
  footerDisclaimerText?: React.ReactNode;
  priceSuffix?: string;
  onCancel?: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
  rentalOptionDays?: number | null;
  open?: boolean;
  titleText: string;
  actionButtonText: string;
  subscriptionProductInfo?: SubscriptionProductInfo;
  discountInformation?: DiscountInformation | null;
};

export const UnifiedPurchaseModalComponent: React.FC<UnifiedPurchaseModalProps> = ({
  translate,
  titleText,
  actionButtonText,
  expectedPrice,
  displayPrice,
  thumbnail,
  assetName,
  assetType,
  assetTypeDisplayName,
  sellerName,
  onAction,
  onSecondaryAction,
  secondaryActionButtonText,
  footerDisclaimerText,
  priceSuffix,
  onCancel,
  loading = false,
  currentRobuxBalance,
  rentalOptionDays = null,
  open = false,
  subscriptionProductInfo,
  discountInformation
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [upsellUuid, setUpsellUuid] = useState<string>();
  const [redirectUrl, setRedirectUrl] = useState<string>();
  /**
   * GUAC `app-policy` kill switch: when true, hide Plus entrypoints (in addition to
   * `isPlusSubscriptionRolloutEnabled` from page meta).
   */
  const [plusEntrypointsDisabledByPolicy, setPlusEntrypointsDisabledByPolicy] = useState(false);

  // Eagerly resolve a paymentSession on modal open so the analytics events and
  // the Subscribe redirect URL all carry the same id. `false` means: prefer a
  // cached, non-expired session; otherwise the hook creates one in the
  // background. By the time the user clicks the upsell banner the session is
  // almost always already available.
  const paymentSession = usePaymentSession(false);
  const paymentSessionId = paymentSession?.id;
  const flowMetadata = useMemo((): Record<string, string> => {
    return paymentSessionId ? { paymentSessionId } : {};
  }, [paymentSessionId]);

  useEffect(() => {
    let cancelled = false;
    guacService
      .getDisableRobloxPlusEntrypoints()
      .then(disabled => {
        if (!cancelled && disabled) {
          setPlusEntrypointsDisabledByPolicy(true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const hideRobloxPlusEntrypoints =
    plusEntrypointsDisabledByPolicy || !isPlusSubscriptionRolloutEnabled();

  const isFreeTrial =
    subscriptionProductInfo?.eligibleOffers?.some(
      (o: SubscriptionOffer) => o.offerType === 'FreeTrial'
    ) ?? false;

  const normalizedDiscount = useMemo(
    () =>
      discountInformation &&
      discountInformation.originalPrice &&
      discountInformation.originalPrice > expectedPrice
        ? normalizeDiscountInformation(discountInformation)
        : null,
    [discountInformation, expectedPrice]
  );

  // Defer `startRobloxPlusUpsellFlow` + VIEW_SHOWN until both the sheet is open
  // and `paymentSession` has resolved, so the event carries the same
  // `paymentSessionId` as the downstream USER_INPUT (subscribe click) and
  // checkout events. A ref guarantees fire-once across open/close cycles even
  // if `flowMetadata` identity changes; reset on close so a re-open emits a
  // fresh VIEW_SHOWN.
  const hasFiredViewShown = useRef(false);
  useEffect(() => {
    if (!sheetOpen) {
      hasFiredViewShown.current = false;
      return;
    }
    if (hasFiredViewShown.current || !paymentSessionId) {
      return;
    }
    hasFiredViewShown.current = true;
    paymentFlowAnalyticsService.startRobloxPlusUpsellFlow({
      assetType,
      isReseller: false,
      isPrivateServer: false,
      isPlace: false
    });
    const viewMessage = isFreeTrial
      ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
      : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE;
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_SINGLE_ITEM_PLUS_UPSELL,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_UPSELL_BANNER,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      viewMessage,
      flowMetadata
    );
  }, [sheetOpen, paymentSessionId, assetType, isFreeTrial, flowMetadata]);

  const sendAnalyticsEvent = useCallback(
    (isFreeTrialParam: boolean) => {
      const viewMessage = isFreeTrialParam
        ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
        : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE;
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_SINGLE_ITEM_PLUS_UPSELL,
        false,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_UPSELL_BANNER,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        viewMessage,
        flowMetadata
      );
    },
    [flowMetadata]
  );

  const { trackUpsellClick: trackSheetUpsellClick } = useUpsellTracking(
    'UnifiedPurchaseModalUpsellSheet',
    assetType,
    sheetOpen
  );

  const trackSubscriptionButtonClick = useCallback(() => {
    trackSheetUpsellClick();
    sendAnalyticsEvent(isFreeTrial);
  }, [trackSheetUpsellClick, sendAnalyticsEvent, isFreeTrial]);

  const onBannerClick = useCallback(() => {
    setUpsellUuid(paymentFlowAnalyticsService.purchaseFlowUuid);
    setRedirectUrl(window.location.pathname + window.location.hash);
    setSheetOpen(true);
    onCancel?.();
  }, [onCancel]);

  const onSheetClose = useCallback(() => setSheetOpen(false), []);

  useModalShownTracking('UnifiedPurchaseModal', open);

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onOpenChange={(nextOpen: boolean) => {
          if (!nextOpen && onCancel) {
            onCancel();
          }
        }}
        isModal
        size='Large'
        type='Default'
        closeLabel={translate('Action.Close') || 'Close'}
        hasCloseAffordance>
        <DialogContent className='relative unified-purchase-dialog-content'>
          <DialogBody className='gap-xlarge flex flex-col'>
            <div style={{ marginTop: 2 }}>
              <UnifiedPurchaseHeading
                translate={translate}
                titleText={titleText}
                currentRobuxBalance={displayPrice ? undefined : currentRobuxBalance}
              />
            </div>
            <UnifiedProductDetails
              translate={translate}
              thumbnail={thumbnail}
              assetName={assetName}
              expectedPrice={expectedPrice}
              displayPrice={displayPrice}
              priceSuffix={priceSuffix}
              rentalOptionDays={rentalOptionDays}
              discountInformation={discountInformation}
            />
            {normalizedDiscount && normalizedDiscount.savedAmount > 0 && (
              <DiscountPriceDetail translate={translate} normalizedDiscount={normalizedDiscount} />
            )}
          </DialogBody>

          <DialogFooter className='flex flex-col mt-[40px]'>
            <div className='gap-small flex flex-col'>
              <div className='flex flex-row-reverse'>
                <Button
                  variant='Emphasis'
                  className='fill basis-0'
                  onClick={onAction}
                  isDisabled={loading}
                  data-testid='purchase-confirm-button'>
                  {actionButtonText}
                </Button>
              </div>
              {onSecondaryAction && secondaryActionButtonText && (
                <div className='flex flex-row-reverse'>
                  <Button
                    variant='Standard'
                    className='fill basis-0'
                    onClick={onSecondaryAction}
                    isDisabled={loading}
                    data-testid='purchase-secondary-button'>
                    {secondaryActionButtonText}
                  </Button>
                </div>
              )}
            </div>
            {!isPlusBenefitDiscount(normalizedDiscount?.discountLines ?? null) &&
              !hideRobloxPlusEntrypoints && (
                <SubscriptionUpsellBanner
                  translate={translate}
                  assetType={assetType}
                  subscriptionProductInfo={subscriptionProductInfo}
                  onBannerClick={onBannerClick}
                />
              )}
            {footerDisclaimerText && (
              <p className='text-body-small content-default' style={{ marginTop: 12 }}>
                {footerDisclaimerText}
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {subscriptionProductInfo && !hideRobloxPlusEntrypoints && (
        <RobloxSubscriptionSheet
          translate={translate}
          open={sheetOpen}
          onClose={onSheetClose}
          subscriptionProductInfo={subscriptionProductInfo}
          isFreeTrial={isFreeTrial}
          upsellUuid={upsellUuid}
          paymentSessionId={paymentSessionId}
          redirectUrl={redirectUrl}
          trackSubscriptionButtonClick={trackSubscriptionButtonClick}
        />
      )}
    </React.Fragment>
  );
};

export default withTranslations(
  UnifiedPurchaseModalComponent,
  translationConfig.purchasingResources
);
