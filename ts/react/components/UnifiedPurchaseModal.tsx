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
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  sellerName: string;
  onAction: () => void;
  onCancel?: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
  open?: boolean;
  titleText: string;
  actionButtonText: string;
};

const UnifiedPurchaseModalComponent: React.FC<UnifiedPurchaseModalProps> = ({
  translate,
  titleText,
  actionButtonText,
  expectedPrice,
  thumbnail,
  assetName,
  assetType,
  assetTypeDisplayName,
  sellerName,
  onAction,
  onCancel,
  loading = false,
  currentRobuxBalance,
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
      <DialogContent className='relative width-full'>
        <DialogBody className='gap-xlarge flex flex-col'>
          <UnifiedPurchaseHeading
            translate={translate}
            titleText={titleText}
            currentRobuxBalance={currentRobuxBalance}
          />
          <UnifiedProductDetails
            translate={translate}
            thumbnail={thumbnail}
            assetName={assetName}
            expectedPrice={expectedPrice}
          />
        </DialogBody>

        <DialogFooter className='gap-small flex flex-col mt-[40px]'>
          <div className='flex flex-row-reverse'>
            <Button
              variant='Emphasis'
              className='fill basis-0'
              onClick={onAction}
              isDisabled={loading}>
              {actionButtonText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default withTranslations(
  UnifiedPurchaseModalComponent,
  translationConfig.purchasingResources
);
