import { RobloxIntlInstance } from 'Roblox';
import React, { useMemo } from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter } from '@rbx/foundation-ui';
import { TranslateFunction } from 'react-utilities';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import UnifiedProductDetails from './UnifiedProductDetails';
import DiscountPriceDetail from './DiscountPriceDetail';
import RobuxUpsellPackageDetails from '../../../js/react/itemPurchase/components/RobuxUpsellPackageDetails';
import { LANG_KEYS } from '../../../js/core/services/itemPurchaseUpsellService/constants/upsellConstants';
import useTermsOfUseText from '../hooks/useTermsOfUseText';
import useModalShownTracking from '../hooks/useModalShownTracking';
import { normalizeDiscountInformation } from './discountInformation';
import type { DiscountInformation } from './discountInformation';

export type UnifiedRobuxUpsellModalProps = {
  translate: TranslateFunction;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  onAction: () => void;
  onCancel?: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
  open?: boolean;
  robuxPackageAmount?: number;
  robuxPackagePrice?: string;
  intl: RobloxIntlInstance;
  priceSuffix?: string;
  title?: string;
  discountInformation?: DiscountInformation | null;
};
const UnifiedRobuxUpsellModal: React.FC<UnifiedRobuxUpsellModalProps> = ({
  translate,
  expectedPrice,
  thumbnail,
  assetName,
  onAction,
  onCancel,
  loading = false,
  currentRobuxBalance,
  open = false,
  robuxPackageAmount,
  robuxPackagePrice,
  intl,
  priceSuffix,
  title,
  discountInformation
}) => {
  const normalizedDiscount = useMemo(
    () => (discountInformation ? normalizeDiscountInformation(discountInformation) : null),
    [discountInformation]
  );

  useModalShownTracking('UnifiedRobuxUpsellModal', open);
  const titleText = title ?? translate(LANG_KEYS.buyRobuxAndItemAction);
  const actionButtonText = translate(LANG_KEYS.buy);
  const termsOfUseText = useTermsOfUseText(translate, intl);

  return (
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
      <DialogContent className='relative width-full'>
        <DialogBody className='gap-large flex flex-col'>
          <div className='margin-bottom-xsmall'>
            <UnifiedPurchaseHeading
              translate={translate}
              titleText={titleText}
              currentRobuxBalance={currentRobuxBalance}
            />
          </div>
          <UnifiedProductDetails
            translate={translate}
            thumbnail={thumbnail}
            assetName={assetName}
            expectedPrice={expectedPrice}
            priceSuffix={priceSuffix}
            discountInformation={discountInformation}
          />
          {normalizedDiscount && normalizedDiscount.savedAmount > 0 && (
            <DiscountPriceDetail translate={translate} normalizedDiscount={normalizedDiscount} />
          )}
          {robuxPackageAmount != null && robuxPackagePrice != null && (
            <RobuxUpsellPackageDetails robuxAmount={robuxPackageAmount} price={robuxPackagePrice} />
          )}
        </DialogBody>

        <DialogFooter className='gap-small flex flex-col mt-[40px]'>
          <div className='flex flex-col items-center text-center width-full gap-medium'>
            <Button
              variant='Emphasis'
              className='width-full shrink-0'
              onClick={onAction}
              isDisabled={loading}
              data-testid='purchase-confirm-button'>
              {actionButtonText}
            </Button>
            <div className='text-body-small'>{termsOfUseText}</div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedRobuxUpsellModal;
