import React from 'react';
import { TranslateFunction } from 'react-utilities';

import AssetName from '../../../js/react/itemPurchase/components/AssetName';
import PriceLabel from '../../../js/react/itemPurchase/components/PriceLabel';

export type UnifiedProductDetailsProps = {
  translate: TranslateFunction;
  thumbnail: React.ReactNode;
  assetName: string;
  expectedPrice: number;
  thumbnailSizePx?: number;
};

const UnifiedProductDetails: React.FC<UnifiedProductDetailsProps> = ({
  translate,
  thumbnail,
  assetName,
  expectedPrice,
  thumbnailSizePx = 150
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
        <div className='flex flex-row items-center'>
          <PriceLabel translate={translate} price={expectedPrice} color='' useFreeText={false} />
        </div>
      </div>
    </div>
  );
};

export default UnifiedProductDetails;
