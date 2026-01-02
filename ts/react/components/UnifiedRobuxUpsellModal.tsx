import { RobloxIntlInstance } from 'Roblox';
import React from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter } from '@rbx/foundation-ui';
import { TranslateFunction } from 'react-utilities';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import UnifiedProductDetails from './UnifiedProductDetails';
import RobuxUpsellPackageDetails from '../../../js/react/itemPurchase/components/RobuxUpsellPackageDetails';
import { LANG_KEYS } from '../../../js/core/services/itemPurchaseUpsellService/constants/upsellConstants';
import useTermsOfUseText from '../hooks/useTermsOfUseText';

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
};
const UnifiedRobuxUpsellModal: React.FC<UnifiedRobuxUpsellModalProps> = ({
  translate,
  expectedPrice,
  thumbnail,
  assetName,
  assetType,
  assetTypeDisplayName,
  onAction,
  onCancel,
  loading = false,
  currentRobuxBalance,
  open = false,
  robuxPackageAmount,
  robuxPackagePrice,
  intl
}) => {
  const titleText = translate(LANG_KEYS.buyRobuxAndItemAction);
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
      ariaLabel={titleText}
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
          />
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
              isDisabled={loading}>
              {actionButtonText}
            </Button>
            <div className='text-body-small' dangerouslySetInnerHTML={{ __html: termsOfUseText }} />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedRobuxUpsellModal;
