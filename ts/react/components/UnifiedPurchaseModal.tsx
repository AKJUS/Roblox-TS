import React from 'react';
import { withTranslations, TranslateFunction } from 'react-utilities';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter } from '@rbx/foundation-ui';

import translationConfig from '../../../js/react/itemPurchase/translation.config';
import UnifiedProductDetails from './UnifiedProductDetails';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import useModalShownTracking from '../hooks/useModalShownTracking';

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
};

const UnifiedPurchaseModalComponent: React.FC<UnifiedPurchaseModalProps> = ({
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
  open = false
}) => {
  useModalShownTracking('UnifiedPurchaseModal', open);
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
      ariaLabel={titleText}
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
          />
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
          {footerDisclaimerText && (
            <p className='text-body-small content-default' style={{ marginTop: 12 }}>
              {footerDisclaimerText}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default withTranslations(
  UnifiedPurchaseModalComponent,
  translationConfig.purchasingResources
);
