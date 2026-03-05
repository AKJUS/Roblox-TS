import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { Icon } from '@rbx/foundation-ui';

import AssetName from '../../../js/react/itemPurchase/components/AssetName';
import PriceLabel from '../../../js/react/itemPurchase/components/PriceLabel';
import itemPurchaseConstants from '../../../js/react/itemPurchase/constants/itemPurchaseConstants';

const { resources } = itemPurchaseConstants;

export type UnifiedProductDetailsProps = {
  translate: TranslateFunction;
  thumbnail: React.ReactNode;
  assetName: string;
  expectedPrice: number;
  thumbnailSizePx?: number;
  rentalOptionDays?: number | null;
};

const UnifiedProductDetails: React.FC<UnifiedProductDetailsProps> = ({
  translate,
  thumbnail,
  assetName,
  expectedPrice,
  thumbnailSizePx = 150,
  rentalOptionDays = null
}) => {
  return (
    <div className='flex flex-row items-center gap-large'>
      <div
        className='relative shrink-0'
        style={{ width: thumbnailSizePx, height: thumbnailSizePx }}>
        <div
          className='rounded'
          style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.06)' }}
        />
        <div
          className='absolute'
          style={{
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {thumbnail}
        </div>
      </div>

      <div className='min-w-0 flex flex-col gap-small'>
        <span className='text-body-large break-words'>
          <AssetName name={assetName} />
        </span>
        {rentalOptionDays != null && (
          <div className='flex flex-row items-center gap-small'>
            <Icon name='icon-regular-clock' />
            <span>
              {translate(resources.timedOptionDaysTimerStartsWhenYouBuy, {
                days: rentalOptionDays
              }) || `${rentalOptionDays} days (Timer starts when you buy)`}
            </span>
          </div>
        )}
        <div className='flex flex-row items-center'>
          <PriceLabel translate={translate} price={expectedPrice} color='' useFreeText={false} />
        </div>
      </div>
    </div>
  );
};

export default UnifiedProductDetails;
